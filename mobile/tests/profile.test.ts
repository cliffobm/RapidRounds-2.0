import {describe,expect,it} from 'vitest';
import {defaultProfile,loadProfile,MAX_AVATAR_BYTES,normalizeUsername,PROFILE_KEY,saveProfile,validAvatar,validateProfile,validUsername} from '../lib/profile';

function memory(initial?:string){const values=new Map<string,string>(initial===undefined?[]:[[PROFILE_KEY,initial]]);return {values,getItem:async(key:string)=>values.get(key)??null,setItem:async(key:string,value:string)=>{values.set(key,value);}};}
describe('local profile validation and persistence',()=>{
  it('returns independent default profiles when no profile exists',async()=>{const store=memory();const first=await loadProfile(store);first.displayName='Changed';expect((await loadProfile(store)).displayName).toBe('');expect(store.values.size).toBe(0);});
  it('round trips preferences and a data URI photo across reload',async()=>{const store=memory();const profile={...defaultProfile,displayName:'Jordan',username:'jordan_rn',school:'Example school',theme:'light' as const,fontScale:1.3 as const,avatarDataUri:'data:image/png;base64,iVBORw0KGgo=',onboardingComplete:true};await saveProfile(store,profile);expect(await loadProfile(store)).toEqual(profile);});
  it('persists removing a photo',async()=>{const store=memory();await saveProfile(store,{...defaultProfile,avatarDataUri:'data:image/jpeg;base64,/9j/AA=='});await saveProfile(store,{...defaultProfile,avatarDataUri:null});expect((await loadProfile(store)).avatarDataUri).toBeNull();});
  it('normalizes handles without changing the callers object',async()=>{const store=memory();const profile={...defaultProfile,username:' Jordan_RN '};await saveProfile(store,profile);expect((await loadProfile(store)).username).toBe('jordan_rn');expect(profile.username).toBe(' Jordan_RN ');expect(normalizeUsername('  User_01 ')).toBe('user_01');});
  it.each(['ab','a name','name@example.com','bad-handle','ééé','a'.repeat(25)])('rejects invalid handle %s',username=>{expect(validUsername(username)).toBe(false);expect(()=>validateProfile({...defaultProfile,username})).toThrow();});
  it('allows optional identity fields to remain empty',()=>{expect(validateProfile(defaultProfile)).toEqual(defaultProfile);expect(validUsername('')).toBe(true);});
  it('persists deliberately clearing previously populated optional fields',async()=>{
    const store=memory();
    const saved={...defaultProfile,displayName:'Preview student',username:'preview_student',ageBand:'25_34',pronouns:'they/them',country:'Example region',school:'Example school',program:'RN',studyStage:'Second year',goals:'Practice application',theme:'light' as const,onboardingComplete:true};
    await saveProfile(store,saved);
    const cleared={...await loadProfile(store),displayName:'',username:'',ageBand:'',pronouns:'',country:'',school:'',program:'',studyStage:'',goals:''};
    await saveProfile(store,cleared);
    expect(await loadProfile(store)).toEqual(cleared);
    expect((await loadProfile(store)).displayName).toBe('');
    expect(saved.displayName).toBe('Preview student');
  });
  it.each([{theme:'purple'},{difficulty:'expert'},{fontScale:10},{speechRate:3},{readAloud:'yes'},{onboardingComplete:1},{reducedMotion:undefined},{ageBand:'99_100'},{school:'a'.repeat(121)},{goals:'a'.repeat(501)},{version:2}])('rejects malformed preferences %j',change=>{expect(()=>validateProfile({...defaultProfile,...change})).toThrow();});
  it('strips unknown restored fields',()=>{expect(validateProfile({...defaultProfile,accessToken:'must-not-be-profile-data'})).toEqual(defaultProfile);});
  it.each(['https://example.com/photo.png','file:///temporary-photo.jpg','data:image/svg+xml;base64,AAAA','data:image/png;base64,@@@','data:image/png;base64,AAA'])('rejects unsafe or nonpersistent avatar %s',avatarDataUri=>{expect(validAvatar(avatarDataUri)).toBe(false);expect(()=>validateProfile({...defaultProfile,avatarDataUri})).toThrow();});
  it('enforces the decoded avatar size limit',()=>{expect(validAvatar(`data:image/jpeg;base64,${'AAAA'.repeat(Math.floor(MAX_AVATAR_BYTES/3)+1)}`)).toBe(false);});
  it('does not overwrite a saved profile when new validation fails',async()=>{const store=memory();await saveProfile(store,defaultProfile);const before=store.values.get(PROFILE_KEY);await expect(saveProfile(store,{...defaultProfile,fontScale:99} as never)).rejects.toThrow();expect(store.values.get(PROFILE_KEY)).toBe(before);});
  it('preserves malformed existing storage for recovery instead of silently resetting',async()=>{const store=memory('{bad JSON');await expect(loadProfile(store)).rejects.toThrow();expect(store.values.get(PROFILE_KEY)).toBe('{bad JSON');});
  it('surfaces read and write failures',async()=>{await expect(loadProfile({getItem:async()=>{throw new Error('read failed');},setItem:async()=>{}})).rejects.toThrow('read failed');await expect(saveProfile({getItem:async()=>null,setItem:async()=>{throw new Error('write failed');}},defaultProfile)).rejects.toThrow('write failed');});
});
