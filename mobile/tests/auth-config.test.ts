import {describe,expect,it} from 'vitest';
import {authConfigReady,isPublicClientKey} from '../lib/auth-config';
const token=(role:string)=>`e30.${btoa(JSON.stringify({role})).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}.signature`;
describe('public authentication configuration',()=>{
  it('accepts a publishable key or legacy anon key',()=>{expect(isPublicClientKey('sb_publishable_example_key')).toBe(true);expect(isPublicClientKey(token('anon'))).toBe(true);});
  it.each(['','sb_secret_private_key',token('service_role'),token('authenticated'),'not.a.jwt'])('rejects absent, secret, or non-anonymous keys: %s',key=>{expect(isPublicClientKey(key)).toBe(false);expect(authConfigReady('https://project.supabase.co',key)).toBe(false);});
  it.each(['http://project.supabase.co','https://user:password@project.supabase.co','https://project.supabase.co/path','https://project.supabase.co?key=value','https://project.supabase.co#secret','not-a-url'])('rejects invalid service URL %s',url=>{expect(authConfigReady(url,'sb_publishable_example_key')).toBe(false);});
  it('accepts an HTTPS service origin with an optional trailing slash',()=>{expect(authConfigReady('https://project.supabase.co/','sb_publishable_example_key')).toBe(true);});
});
