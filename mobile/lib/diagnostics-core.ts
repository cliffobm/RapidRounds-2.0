/** Local diagnostics deliberately store known codes, never exception messages or stacks. */
export const DIAGNOSTICS_KEY = 'rapidrounds.diagnostics.v1';
export const SCREEN_NAMES = ['today','library','review','progress','profile','lesson','round','results','case','welcome','auth','branding','support','unknown'] as const;
export const STUDY_MODES = ['learn','rapid','review','case'] as const;
export const REPORT_CATEGORIES = ['bug','content','accessibility','other'] as const;
export const USAGE_EVENT_NAMES = ['app_open','screen_view','round_started','round_completed','lesson_opened','report_created'] as const;
export const ISSUE_CATALOG = {
  storage_load: {title:'Saved information could not be opened',explanation:'The app could not read some information saved on this device.',nextStep:'Restart the app and try again. Keep a copy of your report before clearing saved information.'},
  storage_save: {title:'Some changes could not be saved',explanation:'The latest changes may only be available until the app closes.',nextStep:'Check that this device has free storage, then try saving again.'},
  profile_save: {title:'Profile changes were not saved',explanation:'The app could not finish saving your profile preferences.',nextStep:'Check the fields and available device storage, then save again.'},
  auth: {title:'Account connection needs attention',explanation:'A sign-in, sign-out, or account recovery step did not finish.',nextStep:'Check your connection and try again. Never include your password or recovery link in a report.'},
  photo: {title:'The profile photo could not be used',explanation:'The selected image could not be opened or saved.',nextStep:'Try a smaller JPEG, PNG, or WebP image and choose it again.'},
  speech: {title:'Read-aloud could not finish',explanation:'The device could not start or continue reading this text.',nextStep:'Check the volume and available device voices, then try read-aloud again.'},
  render: {title:'A screen could not open',explanation:'The app encountered a problem while showing a screen.',nextStep:'Return to the app and try again. Report which screen you were opening if this repeats.'},
  unexpected: {title:'Something interrupted the app',explanation:'An app action did not finish as expected.',nextStep:'Try the action again. If the problem repeats, describe what happened in a report.'},
  report_send: {title:'A report could not be sent',explanation:'The support service did not confirm receiving this report.',nextStep:'Keep the saved report and try sending it again when your connection is available.'},
} as const;

export type ScreenName = typeof SCREEN_NAMES[number];
export type StudyMode = typeof STUDY_MODES[number];
export type IssueCode = keyof typeof ISSUE_CATALOG;
export type ReportCategory = typeof REPORT_CATEGORIES[number];
export type UsageEventName = typeof USAGE_EVENT_NAMES[number];
export type DiagnosticConsent = {analytics:boolean;diagnostics:boolean};
export type DiagnosticIssue = {id:string;code:IssueCode;context:ScreenName;firstSeen:number;lastSeen:number;count:number};
export type UsageProperties = {screen?:ScreenName;mode?:StudyMode;count?:number};
export type UsageEvent = {id:string;name:UsageEventName;createdAt:number;properties:UsageProperties};
export type ReportInput = {category:ReportCategory;summary:string;steps:string;expected:string;includeDiagnostics:boolean;context?:ScreenName};
export type ProblemReport = Omit<ReportInput,'context'> & {id:string;createdAt:number;context:ScreenName;status:'saved'|'sent';diagnostics:DiagnosticIssue[];receipt?:string};
export type DiagnosticsSnapshot = {ready:boolean;error:string|null;issues:DiagnosticIssue[];reports:ProblemReport[];consent:DiagnosticConsent;anonymousId:string|null;events:UsageEvent[]};
export type DiagnosticsStorage = {getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem:(key:string)=>Promise<void>};
export type DiagnosticsStore = ReturnType<typeof createDiagnosticsStore>;

const MAX_ISSUES=50, MAX_REPORTS=20, MAX_EVENTS=100, MAX_COUNT=9999;
const LOAD_ERROR='Saved diagnostics could not be read. They have been left untouched. New details are temporary until you export what you need and clear diagnostics.';
const SAVE_ERROR='Diagnostics could not be saved on this device. The latest details are only in memory; try again before closing the app.';
const CLEAR_ERROR='Diagnostics could not be erased. Your saved information has been kept; try again.';
const ID_PATTERN=/^[A-Za-z0-9_.:-]{1,128}$/;
type RecordValue=Record<string,unknown>;
const object=(v:unknown):v is RecordValue=>!!v&&typeof v==='object'&&!Array.isArray(v);
const member=<T extends string>(values:readonly T[],value:unknown):value is T=>typeof value==='string'&&(values as readonly string[]).includes(value);
const isCode=(v:unknown):v is IssueCode=>typeof v==='string'&&Object.prototype.hasOwnProperty.call(ISSUE_CATALOG,v);
const contextOf=(v:unknown):ScreenName=>member(SCREEN_NAMES,v)?v:'unknown';
const validId=(v:unknown):v is string=>typeof v==='string'&&ID_PATTERN.test(v);
const validTime=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=8_640_000_000_000_000;
const invalid=():never=>{throw new Error('Saved diagnostics are not valid.');};

/** Remove control characters and obvious credentials from manually entered report text. */
export function sanitizeReportText(value:unknown,limit:number):string {
  if(typeof value!=='string')return '';
  return value
    .replace(/data:[^\s;]+;base64,[A-Za-z0-9+/=]+/gi,'[image removed]')
    .replace(/\b(?:sb_secret_|sb_publishable_)[A-Za-z0-9_-]+/g,'[key removed]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,'[token removed]')
    .replace(/["']?\b(?:password|access_token|refresh_token|authorization|api[_ -]?key)["']?\s*[:=]\s*(?:["'](?:Bearer\s+)?[^"'\r\n]*["']|(?:Bearer\s+)?[^\s,;]+)/gi,'[credential removed]')
    .replace(/https?:\/\/[^\s<>]+[?#][^\s<>]*/gi,'[link with private parameters removed]')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'')
    .trim().slice(0,Math.max(0,limit));
}
function propertiesOf(value:unknown):UsageProperties {
  if(!object(value))return {};
  return {
    ...(member(SCREEN_NAMES,value.screen)?{screen:value.screen}:{}),
    ...(member(STUDY_MODES,value.mode)?{mode:value.mode}:{}),
    ...(typeof value.count==='number'&&Number.isInteger(value.count)&&value.count>=0&&value.count<=100?{count:value.count}:{}),
  };
}
function issueOf(value:unknown):DiagnosticIssue {
  if(!object(value)||!validId(value.id)||!isCode(value.code)||!member(SCREEN_NAMES,value.context)||!validTime(value.firstSeen)||!validTime(value.lastSeen)||value.lastSeen<value.firstSeen||typeof value.count!=='number'||!Number.isInteger(value.count)||value.count<1||value.count>MAX_COUNT)return invalid();
  return {id:value.id,code:value.code,context:value.context,firstSeen:value.firstSeen,lastSeen:value.lastSeen,count:value.count};
}
function reportInputOf(value:unknown):ReportInput & {context:ScreenName} {
  if(!object(value)||!member(REPORT_CATEGORIES,value.category)||typeof value.summary!=='string'||typeof value.steps!=='string'||typeof value.expected!=='string'||typeof value.includeDiagnostics!=='boolean')throw new Error('Check the report fields and try again.');
  const summary=sanitizeReportText(value.summary,160);
  if(!summary)throw new Error('Add a short description of the problem.');
  return {category:value.category,summary,steps:sanitizeReportText(value.steps,2000),expected:sanitizeReportText(value.expected,1000),includeDiagnostics:value.includeDiagnostics,context:contextOf(value.context)};
}
function reportOf(value:unknown):ProblemReport {
  if(!object(value)||!validId(value.id)||!validTime(value.createdAt)||!['saved','sent'].includes(value.status as string)||!member(SCREEN_NAMES,value.context)||!Array.isArray(value.diagnostics)||(value.receipt!==undefined&&!validId(value.receipt)))return invalid();
  const fields=reportInputOf(value);
  const diagnostics=value.diagnostics.map(issueOf).slice(-MAX_ISSUES);
  if(value.status==='sent'&&!validId(value.receipt))return invalid();
  return {...fields,id:value.id,createdAt:value.createdAt,status:value.status as 'saved'|'sent',diagnostics:fields.includeDiagnostics?diagnostics:[],...(value.status==='sent'?{receipt:value.receipt as string}:{})};
}
function eventOf(value:unknown):UsageEvent {
  if(!object(value)||!validId(value.id)||!member(USAGE_EVENT_NAMES,value.name)||!validTime(value.createdAt)||!object(value.properties))return invalid();
  return {id:value.id,name:value.name,createdAt:value.createdAt,properties:propertiesOf(value.properties)};
}
function emptySnapshot(ready=false):DiagnosticsSnapshot {return {ready,error:null,issues:[],reports:[],consent:{analytics:false,diagnostics:false},anonymousId:null,events:[]};}
function restore(raw:string):DiagnosticsSnapshot {
  if(raw.length>1_000_000)return invalid();
  const value:unknown=JSON.parse(raw);
  if(!object(value)||value.version!==1||!object(value.consent)||typeof value.consent.analytics!=='boolean'||typeof value.consent.diagnostics!=='boolean'||!Array.isArray(value.issues)||!Array.isArray(value.reports)||!Array.isArray(value.events)||(value.anonymousId!==null&&!validId(value.anonymousId)))return invalid();
  if(value.consent.analytics&&!validId(value.anonymousId))return invalid();
  const issues=value.issues.map(issueOf).slice(-MAX_ISSUES),reports=value.reports.map(reportOf).slice(-MAX_REPORTS),events=value.events.map(eventOf).slice(-MAX_EVENTS);
  for(const items of [issues,reports,events])if(new Set(items.map(item=>item.id)).size!==items.length)return invalid();
  if(new Set(issues.map(item=>`${item.code}:${item.context}`)).size!==issues.length)return invalid();
  return {ready:true,error:null,issues,reports,consent:{analytics:value.consent.analytics,diagnostics:value.consent.diagnostics},anonymousId:value.consent.analytics?value.anonymousId as string:null,events:value.consent.analytics?events:[]};
}
function freezeSnapshot(snapshot:DiagnosticsSnapshot):DiagnosticsSnapshot {
  snapshot.issues.forEach(Object.freeze);
  snapshot.reports.forEach(report=>{report.diagnostics.forEach(Object.freeze);Object.freeze(report.diagnostics);Object.freeze(report);});
  snapshot.events.forEach(event=>{Object.freeze(event.properties);Object.freeze(event);});
  Object.freeze(snapshot.issues);Object.freeze(snapshot.reports);Object.freeze(snapshot.events);Object.freeze(snapshot.consent);
  return Object.freeze(snapshot);
}

export function plainTextReport(report:ProblemReport):string {
  const r=reportOf(report);
  const lines=['Rapid Rounds problem report',`Report: ${r.id}`,`Created: ${new Date(r.createdAt).toISOString()}`,`Category: ${r.category}`,`Screen: ${r.context}`,`Status: ${r.status==='sent'?'Sent to support':'Saved locally; not sent'}`,'',r.summary,'','Steps to reproduce:',r.steps||'Not provided.','','Expected result:',r.expected||'Not provided.'];
  if(r.includeDiagnostics){lines.push('','App details (known problem codes only):');if(!r.diagnostics.length)lines.push('No local problems recorded.');for(const issue of r.diagnostics){const detail=ISSUE_CATALOG[issue.code];lines.push(`- ${detail.title} (${issue.code}; ${issue.context}; ${issue.count} occurrence${issue.count===1?'':'s'})`,detail.explanation,`Try this: ${detail.nextStep}`);}}
  if(r.receipt)lines.push('',`Support receipt: ${r.receipt}`);
  return lines.join('\n');
}

export function createDiagnosticsStore(storage:DiagnosticsStorage,options:{now?:()=>number;id?:()=>string}={}) {
  let snapshot=freezeSnapshot(emptySnapshot()),initialized=false,blocked=false;
  let queue:Promise<void>=Promise.resolve();
  let sequence=0;
  const listeners=new Set<()=>void>();
  const time=()=>{const value=options.now?.()??Date.now();return validTime(value)?value:Date.now();};
  const newId=()=>{const value=options.id?.();return validId(value)?value:`rr-${time().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2,12)}`;};
  const emit=(next:DiagnosticsSnapshot)=>{snapshot=freezeSnapshot(next);for(const listener of listeners){try{listener();}catch{/* A subscriber cannot interrupt persistence. */}}};
  function serial<T>(work:()=>Promise<T>):Promise<T>{const next=queue.then(work);queue=next.then(()=>undefined,()=>undefined);return next;}
  function withIssue(code:IssueCode,context:ScreenName,base=snapshot):DiagnosticsSnapshot {
    const previous=base.issues.find(issue=>issue.code===code&&issue.context===context),now=time();
    const issue:DiagnosticIssue=previous?{...previous,lastSeen:Math.max(previous.lastSeen,now),count:Math.min(MAX_COUNT,previous.count+1)}:{id:newId(),code,context,firstSeen:now,lastSeen:now,count:1};
    return {...base,issues:[...base.issues.filter(item=>item!==previous),issue].slice(-MAX_ISSUES)};
  }
  async function loadOnce():Promise<void>{
    if(initialized)return;
    initialized=true;
    try{const raw=await storage.getItem(DIAGNOSTICS_KEY);emit(raw===null?emptySnapshot(true):restore(raw));}
    catch{blocked=true;emit({...withIssue('storage_load','support',emptySnapshot(true)),error:LOAD_ERROR});}
  }
  async function persist():Promise<void>{
    if(blocked){emit({...snapshot,error:LOAD_ERROR});throw new Error(LOAD_ERROR);}
    const {issues,reports,consent,anonymousId,events}=snapshot;
    try{await storage.setItem(DIAGNOSTICS_KEY,JSON.stringify({version:1,issues,reports,consent,anonymousId,events}));if(snapshot.error)emit({...snapshot,error:null});}
    catch{emit({...withIssue('storage_save','support'),error:SAVE_ERROR});throw new Error(SAVE_ERROR);}
  }
  return {
    getSnapshot:():DiagnosticsSnapshot=>snapshot,
    subscribe:(listener:()=>void)=>{listeners.add(listener);return ()=>{listeners.delete(listener);};},
    initialize:()=>serial(loadOnce),
    recordIssue:(code:IssueCode,context?:ScreenName):Promise<DiagnosticIssue|null>=>serial(async()=>{
      await loadOnce();if(!isCode(code))return null;
      const screen=contextOf(context);emit(withIssue(code,screen));const issue=snapshot.issues.find(item=>item.code===code&&item.context===screen)!;
      await persist();return issue;
    }),
    saveReport:(input:ReportInput):Promise<ProblemReport>=>serial(async()=>{
      await loadOnce();const fields=reportInputOf(input);
      const report:ProblemReport={...fields,id:newId(),createdAt:time(),status:'saved',diagnostics:fields.includeDiagnostics?snapshot.issues.map(issue=>({...issue})):[]};
      emit({...snapshot,reports:[...snapshot.reports,report].slice(-MAX_REPORTS)});await persist();return report;
    }),
    setConsent:(consent:DiagnosticConsent):Promise<void>=>serial(async()=>{
      await loadOnce();if(!object(consent)||typeof consent.analytics!=='boolean'||typeof consent.diagnostics!=='boolean')throw new Error('Choose whether to share usage and app diagnostics.');
      emit({...snapshot,consent:{analytics:consent.analytics,diagnostics:consent.diagnostics},anonymousId:consent.analytics?snapshot.anonymousId??newId():null,events:consent.analytics?snapshot.events:[]});await persist();
    }),
    track:(name:UsageEventName,properties?:UsageProperties):Promise<UsageEvent|null>=>serial(async()=>{
      await loadOnce();if(!snapshot.consent.analytics||!member(USAGE_EVENT_NAMES,name))return null;
      const event:UsageEvent={id:newId(),name,createdAt:time(),properties:propertiesOf(properties)};
      emit({...snapshot,events:[...snapshot.events,event].slice(-MAX_EVENTS)});await persist();return event;
    }),
    markEventsSent:(ids:string[]):Promise<void>=>serial(async()=>{
      await loadOnce();const sent=new Set(Array.isArray(ids)?ids.filter(validId):[]);
      if(!snapshot.events.some(event=>sent.has(event.id)))return;
      emit({...snapshot,events:snapshot.events.filter(event=>!sent.has(event.id))});await persist();
    }),
    markReportSent:(id:string,receipt:string):Promise<void>=>serial(async()=>{
      await loadOnce();if(!validId(receipt))throw new Error('The support receipt was not valid. Keep this report and try again.');
      const report=snapshot.reports.find(item=>item.id===id);if(!report)throw new Error('This report is no longer saved on this device.');
      if(report.status==='sent'&&report.receipt===receipt)return;
      emit({...snapshot,reports:snapshot.reports.map(item=>item.id===id?{...item,status:'sent',receipt}:item)});await persist();
    }),
    clear:():Promise<void>=>serial(async()=>{
      try{await storage.removeItem(DIAGNOSTICS_KEY);initialized=true;blocked=false;emit(emptySnapshot(true));}
      catch{emit({...snapshot,error:CLEAR_ERROR});throw new Error(CLEAR_ERROR);}
    }),
    plainTextReport,
  };
}
