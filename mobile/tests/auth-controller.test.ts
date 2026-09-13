import {describe,expect,it,vi} from 'vitest';
import type {AuthChangeEvent,Session} from '@supabase/supabase-js';
import {createAuthController,type AuthApi,type AuthDependencies} from '../lib/auth-controller';

const session=(id='student')=>({access_token:'test-token',refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,user:{id}} as Session);
function deferred<T>(){let resolve!:(value:T)=>void;let reject!:(reason:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const settle=async()=>{for(let n=0;n<12;n++)await Promise.resolve();};
function setup(changes:Partial<AuthDependencies>={}){
  const values=new Map<string,string>();let notify:(event:AuthChangeEvent,session:Session|null)=>void=()=>{};
  const unsubscribe=vi.fn(),unlisten=vi.fn(),stopRefresh=vi.fn();
  const api={
    getSession:vi.fn(async()=>({data:{session:null as Session|null},error:null as Error|null})),
    onAuthStateChange:vi.fn((callback:typeof notify)=>{notify=callback;return {data:{subscription:{unsubscribe}}};}),
    exchangeCodeForSession:vi.fn(async()=>({data:{session:session(),redirectType:null as string|null},error:null as Error|null})),
    signInWithPassword:vi.fn(async()=>({data:{session:session()},error:null as Error|null})),
    signUp:vi.fn(async()=>({data:{session:null as Session|null},error:null as Error|null})),
    resetPasswordForEmail:vi.fn(async()=>({error:null})),updateUser:vi.fn(async()=>({error:null})),
    signInWithOAuth:vi.fn(async()=>({data:{url:'https://provider.example.test/login'},error:null})),
    signOut:vi.fn(async()=>({error:null as Error|null})),
  };
  const deps:AuthDependencies={configured:true,getApi:()=>api as unknown as AuthApi,redirectUri:()=> 'rapidrounds://auth/callback',initialUrl:async()=>null,
    listen:vi.fn(()=>unlisten),refreshLifecycle:vi.fn(()=>stopRefresh),providers:{google:true,apple:false},recoveryKey:'recovery',now:()=>1000,
    storage:{getItem:vi.fn(async key=>values.get(key)??null),setItem:vi.fn(async(key,value)=>{values.set(key,value);}),removeItem:vi.fn(async key=>{values.delete(key);})},
    openProvider:vi.fn(async()=>({type:'cancel' as const})),clearCallback:vi.fn(),ensureCrypto:vi.fn(),...changes};
  const controller=createAuthController(deps);return {controller,api,deps,values,emit:(event:AuthChangeEvent,value:Session|null)=>notify(event,value),unsubscribe,unlisten,stopRefresh};
}

describe('authentication callback validation and recovery',()=>{
  it('deduplicates callbacks delivered by both the browser and Linking',async()=>{
    const test=setup(),exchange=deferred<Awaited<ReturnType<typeof test.api.exchangeCodeForSession>>>();test.api.exchangeCodeForSession.mockReturnValue(exchange.promise);
    const first=test.controller.handleAuthCallback('rapidrounds://auth/callback?code=once&sb_flow_id=flow_id_123');
    const second=test.controller.handleAuthCallback('rapidrounds://auth/callback?code=once');await settle();
    expect(test.api.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(test.api.exchangeCodeForSession).toHaveBeenCalledWith('once',{flowId:'flow_id_123'});
    exchange.resolve({data:{session:session(),redirectType:null},error:null});expect(await Promise.all([first,second])).toEqual([true,true]);
    expect(await test.controller.handleAuthCallback('rapidrounds://auth/callback?code=once')).toBe(true);
    expect(test.api.exchangeCodeForSession).toHaveBeenCalledTimes(1);
  });
  it('shares exchange failures and does not retry a spent code automatically',async()=>{
    const test=setup();test.api.exchangeCodeForSession.mockResolvedValue({data:{session:session(),redirectType:null},error:new Error('Expired code')});
    const results=await Promise.allSettled([test.controller.handleAuthCallback('rapidrounds://auth/callback?code=bad'),test.controller.handleAuthCallback('rapidrounds://auth/callback?code=bad')]);
    expect(results.every(result=>result.status==='rejected')).toBe(true);expect(test.api.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    await expect(test.controller.handleAuthCallback('rapidrounds://auth/callback?code=bad')).rejects.toThrow('already failed');
  });
  it.each(['https://other.example/auth/callback?code=x','rapidrounds://other/callback?code=x','rapidrounds://auth/other?code=x','rapidrounds://user@auth/callback?code=x'])('ignores another callback destination: %s',async url=>{
    const test=setup();expect(await test.controller.handleAuthCallback(url)).toBe(false);expect(test.api.exchangeCodeForSession).not.toHaveBeenCalled();expect(test.deps.clearCallback).not.toHaveBeenCalled();
  });
  it.each(['?code=a&code=b','?code=a&sb_flow_id=flow_id_1&sb_flow_id=flow_id_2','?code=a&sb_flow_id=bad','?error_description=declined','?refresh_token=unsafe','#access_token=unsafe&refresh_token=unsafe'])('rejects malformed, failed, or implicit callback %s',async query=>{
    const test=setup();await expect(test.controller.handleAuthCallback(`rapidrounds://auth/callback${query}`)).rejects.toThrow();expect(test.api.exchangeCodeForSession).not.toHaveBeenCalled();expect(test.deps.clearCallback).toHaveBeenCalledTimes(1);
  });
  it('does not authorize password recovery from a URL flag',async()=>{
    const test=setup();await test.controller.handleAuthCallback('rapidrounds://auth/callback?code=normal&type=recovery&flow=recovery');
    expect(test.controller.getSnapshot().recovery).toBe(false);await expect(test.controller.updatePassword('a-new-password')).rejects.toThrow('password-reset link');expect(test.api.updateUser).not.toHaveBeenCalled();
  });
  it('uses the SDK verified recovery flow, persists it, and clears it after updating',async()=>{
    const test=setup();test.api.exchangeCodeForSession.mockResolvedValue({data:{session:session(),redirectType:'recovery'},error:null});
    await test.controller.handleAuthCallback('rapidrounds://auth/callback?code=reset');expect(test.controller.getSnapshot().recovery).toBe(true);
    expect(JSON.parse(test.values.get('recovery')!)).toEqual({userId:'student',expiresAt:3601000});
    await test.controller.updatePassword('a-new-password');expect(test.api.updateUser).toHaveBeenCalledWith({password:'a-new-password'});
    expect(test.controller.getSnapshot().recovery).toBe(false);expect(test.values.has('recovery')).toBe(false);
  });
  it('surfaces a recovery storage failure instead of claiming a successful callback',async()=>{
    const test=setup();test.api.exchangeCodeForSession.mockResolvedValue({data:{session:session(),redirectType:'recovery'},error:null});
    vi.mocked(test.deps.storage.setItem).mockRejectedValue(new Error('Secure storage unavailable'));
    await expect(test.controller.handleAuthCallback('rapidrounds://auth/callback?code=reset')).rejects.toThrow('Secure storage unavailable');expect(test.controller.getSnapshot().error).toBe('Secure storage unavailable');
  });
});

describe('authentication restoration and lifecycle races',()=>{
  it('shares one initialization and subscription across multiple consumers, with idempotent release',async()=>{
    const test=setup();const releaseFirst=test.controller.retain(),releaseSecond=test.controller.retain();await settle();
    expect(test.api.getSession).toHaveBeenCalledTimes(1);expect(test.api.onAuthStateChange).toHaveBeenCalledTimes(1);
    releaseFirst();releaseFirst();expect(test.unsubscribe).not.toHaveBeenCalled();releaseSecond();
    expect(test.unsubscribe).toHaveBeenCalledTimes(1);expect(test.unlisten).toHaveBeenCalledTimes(1);expect(test.stopRefresh).toHaveBeenCalledTimes(1);
    const releaseThird=test.controller.retain();await settle();expect(test.api.onAuthStateChange).toHaveBeenCalledTimes(2);releaseThird();
  });
  it('does not overwrite a newer auth event with a delayed restored session',async()=>{
    const test=setup(),restored=deferred<Awaited<ReturnType<typeof test.api.getSession>>>();test.api.getSession.mockReturnValue(restored.promise);
    const initialized=test.controller.initialize();await settle();test.emit('SIGNED_IN',session('new'));
    restored.resolve({data:{session:session('old')},error:null});await initialized;expect(test.controller.getSnapshot().session?.user.id).toBe('new');
  });
  it('does not resurrect a callback from initialization after the user signs out',async()=>{
    const url=deferred<string|null>();const test=setup({initialUrl:()=>url.promise});const initialized=test.controller.initialize();await settle();
    await test.controller.signOut();url.resolve('rapidrounds://auth/callback?code=old');await initialized;
    expect(test.api.exchangeCodeForSession).not.toHaveBeenCalled();expect(test.controller.getSnapshot().session).toBeNull();
  });
  it('does not let a failed old initialization replace a new sign-in result',async()=>{
    const test=setup(),restored=deferred<Awaited<ReturnType<typeof test.api.getSession>>>();test.api.getSession.mockReturnValue(restored.promise);
    const initialized=test.controller.initialize();await settle();await test.controller.signInEmail('student@example.test','password');
    restored.reject(new Error('Old restoration failed'));await initialized;expect(test.controller.getSnapshot()).toMatchObject({session:session(),loading:false,error:null});
  });
  it('allows an explicit retry after restoration fails',async()=>{
    const test=setup();test.api.getSession.mockRejectedValueOnce(new Error('Storage unavailable'));await test.controller.initialize();expect(test.controller.getSnapshot().error).toBe('Storage unavailable');
    test.api.getSession.mockResolvedValue({data:{session:session()},error:null});await test.controller.initialize();expect(test.controller.getSnapshot()).toMatchObject({session:session(),loading:false,error:null});expect(test.api.onAuthStateChange).toHaveBeenCalledTimes(1);
  });
  it.each([{userId:'student',expiresAt:3601000},{userId:'other',expiresAt:3601000},{userId:'student',expiresAt:999},{userId:'student',expiresAt:3601001},null])('restores only an unexpired matching recovery marker: %j',async marker=>{
    const test=setup();test.api.getSession.mockResolvedValue({data:{session:session()},error:null});test.values.set('recovery',JSON.stringify(marker));await test.controller.initialize();
    expect(test.controller.getSnapshot().recovery).toBe(marker?.userId==='student'&&marker?.expiresAt===3601000);
  });
  it('waits for an exchange before clearing the SDK session and ignores its stale events',async()=>{
    const test=setup(),exchange=deferred<Awaited<ReturnType<typeof test.api.exchangeCodeForSession>>>();await test.controller.initialize();test.api.exchangeCodeForSession.mockReturnValue(exchange.promise);
    const callback=test.controller.handleAuthCallback('rapidrounds://auth/callback?code=late');const checked=expect(callback).rejects.toThrow('cancelled');await settle();
    const signedOut=test.controller.signOut();await settle();expect(test.api.signOut).not.toHaveBeenCalled();
    test.emit('PASSWORD_RECOVERY',session('late'));exchange.resolve({data:{session:session('late'),redirectType:'recovery'},error:null});await checked;await signedOut;
    expect(test.api.signOut).toHaveBeenCalledWith({scope:'local'});expect(test.controller.getSnapshot()).toMatchObject({session:null,recovery:false,error:null});expect(test.values.has('recovery')).toBe(false);
  });
  it('prevents an external SIGNED_OUT event from being overwritten by a late exchange',async()=>{
    const test=setup(),exchange=deferred<Awaited<ReturnType<typeof test.api.exchangeCodeForSession>>>();await test.controller.initialize();test.api.exchangeCodeForSession.mockReturnValue(exchange.promise);
    const callback=test.controller.handleAuthCallback('rapidrounds://auth/callback?code=late');const checked=expect(callback).rejects.toThrow('cancelled');await settle();
    test.emit('SIGNED_OUT',null);test.emit('SIGNED_IN',session('late'));exchange.resolve({data:{session:session('late'),redirectType:null},error:null});await checked;
    expect(test.controller.getSnapshot().session).toBeNull();expect(test.api.signOut).toHaveBeenCalledWith({scope:'local'});
  });
  it('cancels an in-flight password sign-in before completing sign-out',async()=>{
    const test=setup(),response=deferred<Awaited<ReturnType<typeof test.api.signInWithPassword>>>();await test.controller.initialize();test.api.signInWithPassword.mockReturnValue(response.promise);
    const signingIn=test.controller.signInEmail(' student@example.test ','password');const checked=expect(signingIn).rejects.toThrow('cancelled');await settle();
    const signedOut=test.controller.signOut();await settle();test.emit('SIGNED_IN',session());response.resolve({data:{session:session()},error:null});await checked;await signedOut;
    expect(test.controller.getSnapshot().session).toBeNull();expect(test.api.signInWithPassword).toHaveBeenCalledWith({email:'student@example.test',password:'password'});
  });
  it('does not accept an unrelated callback during another sign-in action',async()=>{
    const test=setup(),response=deferred<Awaited<ReturnType<typeof test.api.signInWithPassword>>>();test.api.signInWithPassword.mockReturnValue(response.promise);
    const signingIn=test.controller.signInEmail('student@example.test','password');await settle();await expect(test.controller.handleAuthCallback('rapidrounds://auth/callback?code=other')).rejects.toThrow('current sign-in');
    response.resolve({data:{session:session()},error:null});await signingIn;expect(test.api.exchangeCodeForSession).not.toHaveBeenCalled();
  });
  it('also clears a late SDK password session after an external sign-out',async()=>{
    const test=setup(),response=deferred<Awaited<ReturnType<typeof test.api.signInWithPassword>>>();await test.controller.initialize();test.api.signInWithPassword.mockReturnValue(response.promise);
    const signingIn=test.controller.signInEmail('student@example.test','password');const checked=expect(signingIn).rejects.toThrow('cancelled');await settle();
    test.emit('SIGNED_OUT',null);test.emit('SIGNED_IN',session());response.resolve({data:{session:session()},error:null});await checked;
    expect(test.api.signOut).toHaveBeenCalledWith({scope:'local'});expect(test.controller.getSnapshot().session).toBeNull();
  });
  it('allows the active provider callback and rejects providers that are not configured',async()=>{
    const test=setup({openProvider:vi.fn(async()=>({type:'success' as const,url:'rapidrounds://auth/callback?code=provider'}))});
    await expect(test.controller.signInProvider('apple')).rejects.toThrow('not been configured');expect(test.api.signInWithOAuth).not.toHaveBeenCalled();
    expect(await test.controller.signInProvider('google')).toEqual(session());expect(test.deps.ensureCrypto).toHaveBeenCalledTimes(1);
  });
  it('keeps guest access available when account configuration is absent',async()=>{
    const test=setup({configured:false,getApi:()=>null});await test.controller.initialize();expect(test.controller.getSnapshot()).toEqual({session:null,loading:false,error:null,recovery:false});
    await expect(test.controller.signInEmail('student@example.test','password')).rejects.toThrow('not been configured');expect(test.api.getSession).not.toHaveBeenCalled();
  });
});
