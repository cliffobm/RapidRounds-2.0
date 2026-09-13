export function isPublicClientKey(key:string):boolean {
  if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return true;
  try{
    const parts=key.split('.');if(parts.length!==3)return false;
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let bits=0,value=0,payload='';
    for(const char of parts[1].replace(/-/g,'+').replace(/_/g,'/').replace(/=+$/,'')){
      const digit=alphabet.indexOf(char);if(digit<0)return false;
      value=(value<<6)|digit;bits+=6;if(bits>=8){bits-=8;payload+=String.fromCharCode((value>>bits)&255);}
    }
    return JSON.parse(payload).role==='anon';
  }catch{return false;}
}
export function authConfigReady(serviceUrl:string,key:string):boolean {
  try{const url=new URL(serviceUrl);return url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&(url.pathname==='/'||url.pathname==='')&&isPublicClientKey(key);}catch{return false;}
}
export const AUTH_UNAVAILABLE='Account sign-in has not been configured. Continue as a guest.';
