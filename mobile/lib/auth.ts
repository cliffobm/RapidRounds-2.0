import 'react-native-url-polyfill/auto';
import {useEffect,useSyncExternalStore} from 'react';
import {AppState,Linking,Platform} from 'react-native';
import {createClient,type Session,type SupabaseClient} from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import {AUTH_UNAVAILABLE,authConfigReady} from './auth-config';
import {createAuthController} from './auth-controller';
import {createChunkedAuthStorage,type AuthStorage} from './auth-storage';

export type {AuthState} from './auth-controller';
export type AuthSessionInfo=Session;
const serviceUrl=process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()??'';
const publicKey=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()??'';
export const isAuthConfigured=authConfigReady(serviceUrl,publicKey);
export const authUnavailableReason=AUTH_UNAVAILABLE;
export const authProviders={google:isAuthConfigured&&process.env.EXPO_PUBLIC_AUTH_GOOGLE_ENABLED==='true',apple:isAuthConfigured&&process.env.EXPO_PUBLIC_AUTH_APPLE_ENABLED==='true'};
export const getAuthRedirectUri=()=>AuthSession.makeRedirectUri({scheme:'rapidrounds',path:'auth/callback'});
const storageKey=isAuthConfigured?`rapidrounds.auth.${new URL(serviceUrl).hostname.replace(/[^a-zA-Z0-9._-]/g,'_')}`:'rapidrounds.auth.unconfigured';

const secureOptions={keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY};
const nativeStorage=createChunkedAuthStorage({
  getItem:key=>SecureStore.getItemAsync(key,secureOptions),
  setItem:(key,value)=>SecureStore.setItemAsync(key,value,secureOptions),
  removeItem:key=>SecureStore.deleteItemAsync(key,secureOptions),
},()=>Crypto.randomUUID());
const webStorage:AuthStorage={
  getItem:async key=>window.localStorage.getItem(key),
  setItem:async(key,value)=>{window.localStorage.setItem(key,value);},
  removeItem:async key=>{window.localStorage.removeItem(key);},
};
const storage=Platform.OS==='web'?webStorage:nativeStorage;

/** Supabase otherwise falls back to Math.random/plain PKCE in runtimes without
 * Web Crypto. Supply native secure randomness/SHA-256, and fail closed on web. */
function ensureSecurePkce(){
  if(Platform.OS!=='web'){
    const runtime=globalThis as unknown as {crypto?:CryptoLike};
    if(!runtime.crypto)runtime.crypto={};
    if(!runtime.crypto.getRandomValues)runtime.crypto.getRandomValues=array=>Crypto.getRandomValues(array);
    if(!runtime.crypto.subtle)runtime.crypto.subtle={digest:async(algorithm,data)=>{
      const name=typeof algorithm==='string'?algorithm:algorithm.name;
      if(name.toUpperCase()!=='SHA-256')throw new Error('This cryptographic algorithm is unavailable.');
      return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256,data);
    }};
  }
  if(typeof globalThis.crypto?.getRandomValues!=='function'||typeof globalThis.crypto?.subtle?.digest!=='function'||typeof TextEncoder==='undefined'||typeof btoa!=='function')throw new Error('Secure sign-in requires a supported app build or an HTTPS browser.');
}
type CryptoLike={getRandomValues?:<T extends Uint8Array|Uint32Array>(array:T)=>T;subtle?:{digest:(algorithm:string|{name:string},data:BufferSource)=>Promise<ArrayBuffer>}};

let client:SupabaseClient|null=null;
export function getAuthClient():SupabaseClient|null{
  if(!isAuthConfigured)return null;
  if(!client)client=createClient(serviceUrl,publicKey,{auth:{storage,storageKey,flowType:'pkce',autoRefreshToken:Platform.OS==='web',persistSession:true,detectSessionInUrl:false}});
  return client;
}
const controller=createAuthController({
  configured:isAuthConfigured,getApi:()=>getAuthClient()?.auth??null,redirectUri:getAuthRedirectUri,
  initialUrl:async()=>Platform.OS==='web'?(typeof window!=='undefined'?window.location.href:null):Linking.getInitialURL(),
  listen:callback=>{const listener=Linking.addEventListener('url',({url})=>callback(url));return()=>listener.remove();},
  refreshLifecycle:()=>{
    if(Platform.OS==='web')return()=>{};
    const auth=getAuthClient()!.auth;
    const refresh=(state:string)=>{void (state==='active'?auth.startAutoRefresh():auth.stopAutoRefresh()).catch(()=>{});};
    const listener=AppState.addEventListener('change',refresh);refresh(AppState.currentState);
    return()=>{listener.remove();void auth.stopAutoRefresh().catch(()=>{});};
  },
  storage,recoveryKey:`${storageKey}.recovery`,providers:authProviders,ensureCrypto:ensureSecurePkce,
  openProvider:async(url,redirect)=>{
    if(Platform.OS==='web'){
      // A same-tab redirect preserves PKCE storage without popup blocking races.
      window.location.assign(url);return {type:'redirect'};
    }
    try{
      const result=await WebBrowser.openAuthSessionAsync(url,redirect);
      return result.type==='success'?{type:'success',url:result.url}:{type:'cancel'};
    }finally{
      // Android's implementation removes its own Linking/AppState listeners.
      if(Platform.OS==='ios'){try{WebBrowser.dismissAuthSession();}catch{/* Browser already closed. */}}
    }
  },
  clearCallback:()=>{
    if(Platform.OS!=='web'||typeof window==='undefined')return;
    try{
      const current=new URL(window.location.href);const expected=new URL(getAuthRedirectUri());
      if(current.origin!==expected.origin||current.pathname!==expected.pathname)return;
      for(const key of ['code','sb_flow_id','error','error_code','error_description','access_token','refresh_token','flow'])current.searchParams.delete(key);
      current.hash='';window.history.replaceState(window.history.state,'',`${current.pathname}${current.search}`);
    }catch{/* A blocked history API must not invalidate a verified session. */}
  },
});
export function useAuthSession(){
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
  useEffect(()=>controller.retain(),[]);return state;
}
export const retryAuthInitialization=()=>controller.initialize();
export const signInEmail=controller.signInEmail;
export const signUpEmail=controller.signUpEmail;
export const requestPasswordReset=controller.requestPasswordReset;
export const updatePassword=controller.updatePassword;
export const signInProvider=controller.signInProvider;
export const handleAuthCallback=controller.handleAuthCallback;
export const signOut=()=>isAuthConfigured?controller.signOut():Promise.resolve();
