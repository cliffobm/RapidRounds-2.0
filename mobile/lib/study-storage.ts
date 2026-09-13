import { initialLearningState, isContentPreview, migrateLegacy, restoreLearning, type LearningState } from './learning';
export const STUDY_KEY='rapidrounds.study.v2';
export const BACKUP_KEY='rapidrounds.study.v2.backup';
export const LEGACY_KEY='rapidrounds.mobile.v1';
export type StorageAdapter={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export type ResetStorageAdapter=StorageAdapter&{removeItem:(key:string)=>Promise<void>};
export class StudyResetError extends Error {
  constructor(public readonly stage:'primary'|'backup'|'legacy',public readonly committedState:LearningState|null){
    super(stage==='primary'?'The reset could not be saved. Your previous progress may still be present.':
      stage==='backup'?'Study progress was reset, but the recovery copy could not be cleared. Retry the reset to finish clearing saved copies.':
      'Study progress and its recovery copy were reset, but older-format data could not be removed. Retry the reset to finish cleanup.');
    this.name='StudyResetError';
  }
}
export async function loadStudy(storage:StorageAdapter,preview=isContentPreview):Promise<{state:LearningState;recovered:boolean}>{
  const current=await storage.getItem(STUDY_KEY);
  if(current!==null){
    try{return {state:restoreLearning(current,preview),recovered:false};}
    catch{const backup=await storage.getItem(BACKUP_KEY);if(backup!==null)return {state:restoreLearning(backup,preview),recovered:true};throw new Error('Saved study data could not be read.');}
  }
  const survivingBackup=await storage.getItem(BACKUP_KEY);
  if(survivingBackup!==null)return {state:restoreLearning(survivingBackup,preview),recovered:true};
  const legacy=await storage.getItem(LEGACY_KEY);
  return {state:legacy?migrateLegacy(legacy,preview):initialLearningState,recovered:false};
}
export async function saveStudy(storage:StorageAdapter,state:LearningState):Promise<void>{
  const old=await storage.getItem(STUDY_KEY);
  // Preserve the last valid commit before replacing it. Failed writes retain a recovery copy.
  if(old!==null){let valid=false;try{restoreLearning(old,true);valid=true;}catch{/* Don't overwrite a good backup with corruption. */}if(valid)await storage.setItem(BACKUP_KEY,old);}
  await storage.setItem(STUDY_KEY,JSON.stringify({...state,lastSavedAt:Date.now()}));
}

/**
 * The caller must finish pending saves before invoking this and prevent stale
 * in-memory state from being saved afterward. This intentionally does not call
 * saveStudy: preserving the old primary as a backup would undo reset recovery.
 * On a cleanup failure, committedState tells the caller which empty state is
 * already authoritative; retrying this operation completes the same reset.
 */
export async function resetStudy(storage:ResetStorageAdapter):Promise<LearningState>{
  const state:LearningState={...initialLearningState,active:null,history:[],challengeAttempts:{},concepts:{},reports:[]};
  const raw=JSON.stringify(state);
  try{await storage.setItem(STUDY_KEY,raw);}catch{throw new StudyResetError('primary',null);}
  try{await storage.setItem(BACKUP_KEY,raw);}catch{throw new StudyResetError('backup',state);}
  try{await storage.removeItem(LEGACY_KEY);}catch{throw new StudyResetError('legacy',state);}
  return state;
}
