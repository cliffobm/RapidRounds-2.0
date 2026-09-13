export type DifficultyPreference = 'all' | 'foundation' | 'application' | 'advanced';
export type ThemePreference = 'system' | 'light' | 'dark';
export interface UserProfile {
  version: 1;
  onboardingComplete: boolean;
  displayName: string;
  username: string;
  ageBand: string;
  pronouns: string;
  country: string;
  school: string;
  program: string;
  studyStage: string;
  goals: string;
  difficulty: DifficultyPreference;
  theme: ThemePreference;
  fontScale: 1 | 1.15 | 1.3;
  readAloud: boolean;
  speechRate: 0.8 | 1 | 1.15;
  reducedMotion: boolean;
  avatarDataUri: string | null;
}
export const PROFILE_KEY = 'rapidrounds.profile.v1';
export const MAX_AVATAR_BYTES = 600_000;
export const defaultProfile: UserProfile = {
  version: 1, onboardingComplete: false, displayName: '', username: '', ageBand: '', pronouns: '',
  country: '', school: '', program: '', studyStage: '', goals: '', difficulty: 'all', theme: 'system',
  fontScale: 1, readAloud: false, speechRate: 1, reducedMotion: false, avatarDataUri: null,
};
export type ProfileStorage = {getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export const normalizeUsername = (value:string) => value.trim().toLowerCase();
export function validUsername(value:string):boolean { return value === '' || /^[a-z0-9_]{3,24}$/.test(value); }
export function validAvatar(value:unknown):value is string|null {
  if(value===null)return true;
  if(typeof value!=='string'||value.length>Math.ceil(MAX_AVATAR_BYTES/3)*4+40)return false;
  const match=/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if(!match||match[1].length%4!==0)return false;
  const bytes=match[1].length*3/4-(match[1].endsWith('==')?2:match[1].endsWith('=')?1:0);
  return bytes>0&&bytes<=MAX_AVATAR_BYTES;
}
/** Reject corrupt data instead of replacing an existing profile with defaults. */
export function validateProfile(value:unknown):UserProfile {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Profile data could not be read.');
  const p=value as Record<string,unknown>;
  if(p.version!==1)throw new Error('This profile version is not supported.');
  const limits={displayName:60,username:24,ageBand:24,pronouns:40,country:60,school:120,program:80,studyStage:80,goals:500} as const;
  for(const [key,limit] of Object.entries(limits))if(typeof p[key]!=='string'||(p[key] as string).length>limit)throw new Error(`Check your ${key} field.`);
  if(!validUsername(p.username as string))throw new Error('Username must be 3–24 lowercase letters, numbers, or underscores, or left empty.');
  if(!['','under_18','18_24','25_34','35_44','45_plus','prefer_not_to_say'].includes(p.ageBand as string))throw new Error('Choose an available age range.');
  if(!['all','foundation','application','advanced'].includes(p.difficulty as string)||!['system','light','dark'].includes(p.theme as string)||![1,1.15,1.3].includes(p.fontScale as number)||![0.8,1,1.15].includes(p.speechRate as number))throw new Error('Choose available study and display settings.');
  if(['onboardingComplete','readAloud','reducedMotion'].some(key=>typeof p[key]!=='boolean'))throw new Error('Check your profile preferences.');
  if(!validAvatar(p.avatarDataUri))throw new Error('Choose a JPEG, PNG, or WebP photo smaller than 600 KB.');
  // Return only known properties, never arbitrary data from a restored JSON object.
  return Object.fromEntries(Object.keys(defaultProfile).map(key=>[key,p[key]])) as unknown as UserProfile;
}
export async function loadProfile(storage:ProfileStorage):Promise<UserProfile> {
  const raw=await storage.getItem(PROFILE_KEY);
  return raw===null?{...defaultProfile}:validateProfile(JSON.parse(raw));
}
export async function saveProfile(storage:ProfileStorage,profile:UserProfile):Promise<void> {
  const clean=validateProfile({...profile,username:normalizeUsername(profile.username)});
  await storage.setItem(PROFILE_KEY,JSON.stringify(clean));
}
