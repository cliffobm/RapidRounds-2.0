import type {AuthChangeEvent,Session,SupabaseClient} from '@supabase/supabase-js';
import type {AuthStorage} from './auth-storage';
import {AUTH_UNAVAILABLE} from './auth-config';

export interface AuthState {session:Session|null;loading:boolean;error:string|null;recovery:boolean}
export type AuthApi=Pick<SupabaseClient['auth'],'getSession'|'onAuthStateChange'|'exchangeCodeForSession'|'signInWithPassword'|'signUp'|'resetPasswordForEmail'|'updateUser'|'signInWithOAuth'|'signOut'>;
export interface AuthDependencies {
  configured:boolean;
  getApi:()=>AuthApi|null;
  redirectUri:()=>string;
  initialUrl:()=>Promise<string|null>;
  listen:(onUrl:(url:string)=>void)=>()=>void;
  refreshLifecycle:()=>()=>void;
  storage:AuthStorage;
  recoveryKey:string;
  providers:{google:boolean;apple:boolean};
  openProvider:(url:string,redirect:string)=>Promise<{type:'success';url:string}|{type:'cancel'|'redirect'}>;
  clearCallback:()=>void;
  ensureCrypto:()=>void;
  now?:()=>number;
}
const message=(error:unknown)=>error instanceof Error?error.message:'Sign-in could not be completed. Please try again.';
const RECOVERY_LIFETIME=60*60*1000;

export function createAuthController(deps:AuthDependencies){
  let snapshot:AuthState={session:null,loading:deps.configured,error:null,recovery:false};
  const listeners=new Set<()=>void>();let revision=0;let epoch=0;let users=0;let cleanups:(()=>void)[]=[];
  let initialization:Promise<void>|null=null;let busy=false;let recoveryWrites=Promise.resolve();
  let flow=0;let activeFlow:number|null=null;let exchangeFlow:number|null=null;let providerPending=false;
  let activeAction:Promise<unknown>|null=null;let signOutPromise:Promise<void>|null=null;
  const exchanges=new Map<string,Promise<boolean>>();const consumed=new Map<string,boolean>();
  const now=deps.now??Date.now;
  const update=(change:Partial<AuthState>)=>{snapshot={...snapshot,...change};revision++;listeners.forEach(listener=>listener());};
  const recordError=(error:unknown)=>update({error:message(error),loading:false});
  const requireApi=()=>{const api=deps.getApi();if(!api)throw new Error(AUTH_UNAVAILABLE);return api;};
  const current=(operation:number)=>operation===flow&&!signOutPromise;
  const assertCurrent=(operation:number)=>{if(!current(operation))throw new Error('This sign-in action was cancelled. Please try again.');};
  function saveRecovery(session:Session|null){
    const value=session?JSON.stringify({userId:session.user.id,expiresAt:now()+RECOVERY_LIFETIME}):null;
    recoveryWrites=recoveryWrites.catch(()=>{}).then(()=>value===null?deps.storage.removeItem(deps.recoveryKey):deps.storage.setItem(deps.recoveryKey,value));
    void recoveryWrites.catch(recordError);return recoveryWrites;
  }
  async function discardStaleSession(operation:number){
    if(current(operation)||signOutPromise)return;
    // An external sign-out can precede a late SDK request that persists its
    // result. Clear that result as well so reopening cannot restore it.
    try{const {error}=await requireApi().signOut({scope:'local'});if(error)throw error;await saveRecovery(null);}
    catch(error){recordError(error);throw error;}
  }
  function authEvent(event:AuthChangeEvent,session:Session|null){
    // getSession owns initial restoration, including the durable recovery marker.
    if(event==='INITIAL_SESSION')return;
    if(event==='SIGNED_OUT')flow++;
    else if(signOutPromise||activeFlow!==null&&activeFlow!==flow||exchangeFlow!==null&&exchangeFlow!==flow)return;
    const recovery=event==='PASSWORD_RECOVERY'?!!session:event==='SIGNED_OUT'?false:snapshot.recovery&&snapshot.session?.user.id===session?.user.id;
    update({session,recovery,loading:false,error:null});
    if(event==='PASSWORD_RECOVERY')void saveRecovery(session);
    else if(event==='SIGNED_OUT'||event==='SIGNED_IN'&&!recovery)void saveRecovery(null);
  }
  function parseCallback(raw:string):{url:URL;code:string|null;flowId:string|null}|null {
    let url:URL;try{url=new URL(raw);}catch{return null;}
    const expected=new URL(deps.redirectUri());
    if(url.protocol!==expected.protocol||url.host!==expected.host||url.pathname!==expected.pathname||url.username||url.password)return null;
    const fragment=new URLSearchParams(url.hash.slice(1));
    if(url.searchParams.has('error')||url.searchParams.has('error_description')||fragment.has('error')||fragment.has('error_description'))throw new Error('Sign-in was not completed. The link may have expired or access was declined. Please try again.');
    if(fragment.has('access_token')||fragment.has('refresh_token')||url.searchParams.has('access_token')||url.searchParams.has('refresh_token'))throw new Error('This sign-in link uses an unsupported flow. Request a new link from this app.');
    const code=url.searchParams.get('code');const flowId=url.searchParams.get('sb_flow_id');
    if(url.searchParams.getAll('code').length>1||url.searchParams.getAll('sb_flow_id').length>1||code&&code.length>4096||flowId&&!/^[a-zA-Z0-9_-]{8,64}$/.test(flowId))throw new Error('This sign-in link is invalid. Request a new link from this app.');
    return {url,code,flowId};
  }
  async function handleAuthCallback(raw:string):Promise<boolean>{
    if(!deps.configured)return false;
    let parsed:ReturnType<typeof parseCallback>;
    try{parsed=parseCallback(raw);}catch(error){deps.clearCallback();recordError(error);throw error;}
    if(!parsed?.code)return false;
    const {code,flowId}=parsed;const key=code;
    if(exchanges.has(key))return exchanges.get(key)!;
    if(consumed.has(key)){if(consumed.get(key))return true;throw new Error('This sign-in link has already failed. Request a new link from this app.');}
    if(signOutPromise||exchanges.size||busy&&!providerPending)throw new Error('Please finish the current sign-in action first.');
    const operation=flow;exchangeFlow=operation;
    // One code can arrive from both Linking and the native browser result.
    // All deliveries await the same exchange, including failures.
    const pending=Promise.resolve().then(async()=>{
      let completed=false;
      try{
        assertCurrent(operation);
        const {data,error}=await requireApi().exchangeCodeForSession(code,flowId?{flowId}:undefined);
        assertCurrent(operation);
        if(error)throw error;if(!data.session)throw new Error('The sign-in service did not return a session. Please try again.');
        // Recovery is identified by the verified SDK exchange, never a URL flag.
        const recovery='redirectType' in data&&data.redirectType==='recovery';
        update({session:data.session,recovery,loading:false,error:null});
        await saveRecovery(recovery?data.session:null);
        assertCurrent(operation);
        completed=true;
        return true;
      }catch(error){if(current(operation))recordError(error);else await discardStaleSession(operation);throw error;}
      finally{
        consumed.set(key,completed);if(consumed.size>32)consumed.delete(consumed.keys().next().value!);
        exchanges.delete(key);exchangeFlow=null;deps.clearCallback();
      }
    });
    exchanges.set(key,pending);return pending;
  }
  function attach(){
    if(cleanups.length||!deps.configured)return;
    try{
      const api=requireApi();
      const {data}=api.onAuthStateChange(authEvent);cleanups.push(()=>data.subscription.unsubscribe());
      cleanups.push(deps.listen(url=>{void handleAuthCallback(url).catch(()=>{});}));
      cleanups.push(deps.refreshLifecycle());
    }catch(error){detach();throw error;}
  }
  function detach(){for(const cleanup of cleanups.splice(0)){try{cleanup();}catch{/* Each remaining listener still needs cleanup. */}}}
  function initialize():Promise<void>{
    if(initialization)return initialization;
    const runEpoch=epoch;const runFlow=flow;
    const pending=Promise.resolve().then(async()=>{
      if(runEpoch!==epoch)return;
      if(!deps.configured){update({loading:false});return;}
      try{
        attach();const api=requireApi();update({loading:true,error:null});const startingRevision=revision;
        const {data,error}=await api.getSession();if(error)throw error;
        if(runEpoch!==epoch)return;
        const recoveryRaw=await deps.storage.getItem(deps.recoveryKey);
        if(runEpoch!==epoch)return;
        if(revision===startingRevision&&runFlow===flow){
          let recovery=false;
          try{const saved=recoveryRaw?JSON.parse(recoveryRaw):null;recovery=!!data.session&&saved?.userId===data.session.user.id&&typeof saved.expiresAt==='number'&&saved.expiresAt>now()&&saved.expiresAt<=now()+RECOVERY_LIFETIME;}catch{/* An invalid marker never enables recovery. */}
          update({session:data.session,recovery});
        }
        const url=await deps.initialUrl();if(runEpoch!==epoch||runFlow!==flow)return;
        if(url)await handleAuthCallback(url);
        if(runEpoch===epoch&&runFlow===flow)update({loading:false});
      }catch(error){if(runEpoch===epoch&&runFlow===flow)recordError(error);}
    }).finally(()=>{if(initialization===pending)initialization=null;});
    initialization=pending;return pending;
  }
  function retain(){users++;if(users===1)void initialize();let retained=true;return()=>{if(!retained)return;retained=false;users--;if(users===0){epoch++;detach();initialization=null;}};}
  function action<T>(work:(api:AuthApi,check:()=>void)=>Promise<T>):Promise<T>{
    if(busy||exchanges.size||signOutPromise)return Promise.reject(new Error('Please finish the current sign-in action first.'));
    busy=true;const operation=++flow;activeFlow=operation;
    const result=Promise.resolve().then(async()=>{
      assertCurrent(operation);const api=requireApi();update({error:null,loading:false});return work(api,()=>assertCurrent(operation));
    }).catch(async error=>{if(current(operation))recordError(error);else await discardStaleSession(operation);throw error;}).finally(()=>{busy=false;activeFlow=null;activeAction=null;providerPending=false;});
    activeAction=result;return result;
  }
  function signOut():Promise<void>{
    if(signOutPromise)return signOutPromise;
    flow++;
    // Wait for SDK requests already in flight before clearing its persisted
    // session. Their events/results are ignored while sign-out is pending.
    const pending=Promise.resolve().then(async()=>{
      await Promise.allSettled([...exchanges.values(),...(activeAction?[activeAction]:[])]);
      const {error}=await requireApi().signOut({scope:'local'});if(error)throw error;
      update({session:null,recovery:false,loading:false,error:null});await saveRecovery(null);
    }).catch(error=>{recordError(error);throw error;}).finally(()=>{signOutPromise=null;});
    signOutPromise=pending;return pending;
  }
  return {
    getSnapshot:()=>snapshot,
    subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
    retain,initialize,handleAuthCallback,
    signInEmail:(email:string,password:string)=>action(async(api,check)=>{
      const {data,error}=await api.signInWithPassword({email:email.trim(),password});check();if(error)throw error;
      if(!data.session)throw new Error('The sign-in service did not return a session.');
      update({session:data.session,recovery:false,loading:false});await saveRecovery(null);check();return data.session;
    }),
    signUpEmail:(email:string,password:string,username:string)=>action(async(api,check)=>{
      deps.ensureCrypto();
      const {data,error}=await api.signUp({email:email.trim(),password,options:{emailRedirectTo:deps.redirectUri(),data:username?{username}:undefined}});check();if(error)throw error;
      if(data.session){update({session:data.session,recovery:false,loading:false});await saveRecovery(null);}check();return data.session;
    }),
    requestPasswordReset:(email:string)=>action(async api=>{
      deps.ensureCrypto();const {error}=await api.resetPasswordForEmail(email.trim(),{redirectTo:deps.redirectUri()});if(error)throw error;
    }),
    updatePassword:(password:string)=>action(async(api,check)=>{
      if(!snapshot.recovery||!snapshot.session)throw new Error('Open the password-reset link before choosing a new password.');
      const {error}=await api.updateUser({password});check();if(error)throw error;
      await saveRecovery(null);check();update({recovery:false});
    }),
    signInProvider:(provider:'google'|'apple')=>action(async(api,check)=>{
      if(!deps.providers[provider])throw new Error(`${provider==='google'?'Google':'Apple'} sign-in has not been configured.`);
      deps.ensureCrypto();const redirect=deps.redirectUri();
      const {data,error}=await api.signInWithOAuth({provider,options:{redirectTo:redirect,skipBrowserRedirect:true}});check();if(error)throw error;
      if(!data.url)throw new Error('The sign-in provider did not return a sign-in page.');
      providerPending=true;
      const result=await deps.openProvider(data.url,redirect);check();
      if(result.type==='redirect')return null;
      if(result.type!=='success')throw new Error('Sign-in was cancelled. You can continue as a guest.');
      if(!await handleAuthCallback(result.url))throw new Error('The provider returned an unexpected sign-in link.');
      check();return snapshot.session;
    }),
    signOut,
  };
}
