import {describe,expect,it,vi} from 'vitest';
import {createDiagnosticsStore,DIAGNOSTICS_KEY,ISSUE_CATALOG,SCREEN_NAMES,plainTextReport,sanitizeReportText,type DiagnosticsStorage,type IssueCode,type ReportInput,type UsageEventName,type UsageProperties} from '../lib/diagnostics-core';

function fixture(initial:string|null=null){
  const values=new Map<string,string>();if(initial!==null)values.set(DIAGNOSTICS_KEY,initial);
  const storage:DiagnosticsStorage={getItem:vi.fn(async key=>values.get(key)??null),setItem:vi.fn(async(key,value)=>{values.set(key,value);}),removeItem:vi.fn(async key=>{values.delete(key);})};
  let id=0,now=1_700_000_000_000;
  const store=createDiagnosticsStore(storage,{id:()=>`id-${++id}`,now:()=>now++});
  return {store,storage,values};
}
const reportInput:ReportInput={category:'bug',summary:'The screen did not open',steps:'Tap Library',expected:'Open the lesson list',includeDiagnostics:true,context:'library'};
const flush=()=>new Promise<void>(resolve=>setTimeout(resolve,0));

describe('local diagnosis without personal data',()=>{
  it('starts with both sharing switches off and no anonymous identifier',async()=>{
    const f=fixture();expect(f.store.getSnapshot().ready).toBe(false);await f.store.initialize();
    expect(f.store.getSnapshot()).toEqual({ready:true,error:null,issues:[],reports:[],consent:{analytics:false,diagnostics:false},anonymousId:null,events:[]});
    expect(await f.store.track('app_open')).toBeNull();expect(f.storage.setItem).not.toHaveBeenCalled();
  });
  it('deduplicates known issues by code and screen while retaining first and latest times',async()=>{
    const f=fixture();const first=await f.store.recordIssue('photo','profile');await f.store.recordIssue('photo','profile');await f.store.recordIssue('photo','support');
    const issues=f.store.getSnapshot().issues;expect(issues).toHaveLength(2);expect(issues[0]).toMatchObject({id:first!.id,code:'photo',context:'profile',count:2,firstSeen:first!.firstSeen});expect(issues[0].lastSeen).toBeGreaterThan(first!.firstSeen);
    expect(f.store.getSnapshot().consent.diagnostics).toBe(false);
  });
  it('never accepts arbitrary exception codes or context text',async()=>{
    const f=fixture();expect(await f.store.recordIssue('password=secret' as IssueCode)).toBeNull();
    await f.store.recordIssue('unexpected','patient@example.com' as never);
    expect(f.store.getSnapshot().issues[0].context).toBe('unknown');expect(f.values.get(DIAGNOSTICS_KEY)).not.toMatch(/secret|patient|example/);
  });
  it('bounds local issues to the 50 most recently observed combinations',async()=>{
    const f=fixture();for(const code of Object.keys(ISSUE_CATALOG) as IssueCode[])for(const screen of SCREEN_NAMES)await f.store.recordIssue(code,screen);
    expect(f.store.getSnapshot().issues).toHaveLength(50);expect(f.store.getSnapshot().issues.at(-1)).toMatchObject({code:'report_send',context:'unknown'});
  });
  it('exposes frozen snapshots and stable references between changes',async()=>{
    const f=fixture();await f.store.initialize();const initial=f.store.getSnapshot();expect(f.store.getSnapshot()).toBe(initial);
    const listener=vi.fn(),unsubscribe=f.store.subscribe(listener);await f.store.recordIssue('speech');expect(listener).toHaveBeenCalledTimes(1);
    const state=f.store.getSnapshot();expect(Object.isFrozen(state)).toBe(true);expect(Object.isFrozen(state.issues[0])).toBe(true);
    unsubscribe();await f.store.recordIssue('speech');expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('report drafting and acknowledgement',()=>{
  it('saves a trimmed, bounded report and strips arbitrary fields',async()=>{
    const f=fixture();const report=await f.store.saveReport({...reportInput,summary:'  Short summary  ',steps:'a'.repeat(3000),expected:'b'.repeat(2000),email:'private@example.com',photo:'data:image/png;base64,aGVsbG8=',rawError:'secret',answers:['A']} as ReportInput);
    expect(report.summary).toBe('Short summary');expect(report.steps).toHaveLength(2000);expect(report.expected).toHaveLength(1000);expect(report.status).toBe('saved');expect(report).not.toHaveProperty('email');expect(f.values.get(DIAGNOSTICS_KEY)).not.toMatch(/private@example|rawError|answers|data:image/);
  });
  it('removes obvious credentials, image data, and private URL parameters',()=>{
    const text='password=hunter2 access_token=abc authorization: Bearer xyz sb_secret_abc123 eyJabc.eyJdef.signature https://auth.example.com/callback?code=private data:image/png;base64,aGVsbG8= "password": "json-secret"\u0000';
    const cleaned=sanitizeReportText(text,2000);expect(cleaned).not.toMatch(/hunter2|abc123|code=private|aGVsbG8|eyJabc|json-secret|\u0000/);expect(cleaned).toContain('[credential removed]');expect(cleaned).toContain('[image removed]');
  });
  it('rejects empty summaries and invalid categories without writing',async()=>{
    const f=fixture();await expect(f.store.saveReport({...reportInput,summary:'  '})).rejects.toThrow('short description');await expect(f.store.saveReport({...reportInput,category:'password' as never})).rejects.toThrow('report fields');expect(f.store.getSnapshot().reports).toEqual([]);expect(f.storage.setItem).not.toHaveBeenCalled();
  });
  it('only attaches the explicitly requested known-code snapshot',async()=>{
    const f=fixture();await f.store.recordIssue('render','library');const without=await f.store.saveReport({...reportInput,includeDiagnostics:false});const withDetails=await f.store.saveReport(reportInput);await f.store.recordIssue('render','library');
    expect(without.diagnostics).toEqual([]);expect(plainTextReport(without)).not.toContain('render;');expect(withDetails.diagnostics[0].count).toBe(1);expect(f.store.getSnapshot().issues[0].count).toBe(2);
    const text=plainTextReport(withDetails);expect(text).toContain('A screen could not open');expect(text).toContain('Try this:');expect(text).toContain('Saved locally; not sent');expect(text).not.toContain('Error:');
  });
  it('keeps only the 20 newest reports',async()=>{
    const f=fixture();for(let i=0;i<25;i++)await f.store.saveReport({...reportInput,summary:`Problem ${i}`});
    expect(f.store.getSnapshot().reports).toHaveLength(20);expect(f.store.getSnapshot().reports[0].summary).toBe('Problem 5');
  });
  it('marks only the acknowledged report sent and keeps its support receipt',async()=>{
    const f=fixture();const one=await f.store.saveReport(reportInput),two=await f.store.saveReport(reportInput);await f.store.markReportSent(one.id,'abcdef0123456789');
    expect(f.store.getSnapshot().reports[0]).toMatchObject({status:'sent',receipt:'abcdef0123456789'});expect(f.store.getSnapshot().reports[1]).toMatchObject({id:two.id,status:'saved'});expect(plainTextReport(f.store.getSnapshot().reports[0])).toContain('Sent to support');
    await expect(f.store.markReportSent(two.id,'password=my-secret')).rejects.toThrow('receipt');await expect(f.store.markReportSent('missing','receipt-1')).rejects.toThrow('no longer');
  });
});

describe('manual usage collection and withdrawal',()=>{
  it('tracks only allowlisted names and properties after explicit consent',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:false});const id=f.store.getSnapshot().anonymousId;expect(id).toBeTruthy();
    const event=await f.store.track('round_completed',{screen:'round',mode:'learn',count:8,email:'nurse@example.com',questionId:'q1',correct:true} as UsageProperties);
    expect(event!.properties).toEqual({screen:'round',mode:'learn',count:8});expect(await f.store.track('password_entered' as UsageEventName)).toBeNull();expect(f.values.get(DIAGNOSTICS_KEY)).not.toMatch(/nurse@|questionId|correct/);expect(f.store.getSnapshot().anonymousId).toBe(id);
  });
  it('strips invalid mode, screen and count values',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:true});for(const count of [-1,101,0.1,NaN,Infinity]){const event=await f.store.track('round_started',{screen:'private name',mode:'diagnosis',count} as unknown as UsageProperties);expect(event!.properties).toEqual({});}
    expect((await f.store.track('round_started',{count:0}))!.properties.count).toBe(0);expect((await f.store.track('round_completed',{count:100}))!.properties.count).toBe(100);
  });
  it('keeps a bounded pending queue and removes only acknowledged IDs',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:false});for(let i=0;i<110;i++)await f.store.track('screen_view',{screen:'library'});
    const events=f.store.getSnapshot().events;expect(events).toHaveLength(100);await f.store.markEventsSent([events[0].id,events[2].id,'missing']);expect(f.store.getSnapshot().events).toHaveLength(98);expect(f.store.getSnapshot().events[0].id).toBe(events[1].id);expect(f.store.getSnapshot().events.at(-1)).toEqual(events.at(-1));
  });
  it('withdrawal deletes the pending queue and identifier; opting in creates a new identifier',async()=>{
    const f=fixture();await f.store.recordIssue('speech','lesson');await f.store.setConsent({analytics:true,diagnostics:true});const previous=f.store.getSnapshot().anonymousId;await f.store.track('app_open');await f.store.setConsent({analytics:false,diagnostics:false});
    expect(f.store.getSnapshot()).toMatchObject({consent:{analytics:false,diagnostics:false},anonymousId:null,events:[]});expect(f.store.getSnapshot().issues).toHaveLength(1);expect(await f.store.track('app_open')).toBeNull();
    await f.store.setConsent({analytics:true,diagnostics:false});expect(f.store.getSnapshot().anonymousId).not.toBe(previous);expect(f.store.getSnapshot().events).toEqual([]);
  });
  it('restores consent and queues without adding an automatic usage event',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:false});await f.store.track('app_open');const restored=fixture(f.values.get(DIAGNOSTICS_KEY)!);await restored.store.initialize();
    expect(restored.store.getSnapshot().events).toEqual(f.store.getSnapshot().events);expect(restored.store.getSnapshot().anonymousId).toBe(f.store.getSnapshot().anonymousId);expect(restored.storage.setItem).not.toHaveBeenCalled();
  });
});

describe('storage resilience and erasure',()=>{
  it('loads once before concurrent mutations, preserving existing information',async()=>{
    const original=fixture();await original.store.saveReport(reportInput);const f=fixture(original.values.get(DIAGNOSTICS_KEY)!);await Promise.all([f.store.initialize(),f.store.recordIssue('photo'),f.store.recordIssue('speech')]);
    expect(f.storage.getItem).toHaveBeenCalledTimes(1);expect(f.store.getSnapshot().reports).toHaveLength(1);expect(f.store.getSnapshot().issues).toHaveLength(2);
  });
  it('serializes writes so a slow older write cannot replace newer information',async()=>{
    const f=fixture();let release!:()=>void,writing=0,maximum=0;f.storage.setItem=vi.fn(async(key,value)=>{maximum=Math.max(maximum,++writing);if(!release)await new Promise<void>(resolve=>{release=resolve;});f.values.set(key,value);writing--;});
    const first=f.store.recordIssue('photo'),second=f.store.recordIssue('speech');await flush();expect(f.storage.setItem).toHaveBeenCalledTimes(1);release();await Promise.all([first,second]);expect(maximum).toBe(1);expect(JSON.parse(f.values.get(DIAGNOSTICS_KEY)!).issues).toHaveLength(2);
  });
  it('retains failed changes in memory and reports a safe error without copying the exception',async()=>{
    const f=fixture();vi.mocked(f.storage.setItem).mockRejectedValueOnce(new Error('password=private-secret'));
    await expect(f.store.saveReport(reportInput)).rejects.toThrow('only in memory');expect(f.store.getSnapshot().reports).toHaveLength(1);expect(f.store.getSnapshot().issues[0].code).toBe('storage_save');expect(JSON.stringify(f.store.getSnapshot())).not.toContain('private-secret');
    await f.store.recordIssue('unexpected');expect(f.store.getSnapshot().error).toBeNull();expect(JSON.parse(f.values.get(DIAGNOSTICS_KEY)!).reports).toHaveLength(1);
  });
  it('does not overwrite corrupt stored records after later logging or report attempts',async()=>{
    const f=fixture('{broken');await f.store.initialize();expect(f.store.getSnapshot().ready).toBe(true);expect(f.store.getSnapshot().error).toContain('left untouched');
    await expect(f.store.recordIssue('unexpected')).rejects.toThrow('temporary');await expect(f.store.saveReport(reportInput)).rejects.toThrow('temporary');expect(f.store.getSnapshot().reports).toHaveLength(1);expect(f.storage.setItem).not.toHaveBeenCalled();expect(f.values.get(DIAGNOSTICS_KEY)).toBe('{broken');
  });
  it('does not overwrite information if the initial read failed',async()=>{
    const f=fixture();vi.mocked(f.storage.getItem).mockRejectedValueOnce(new Error('disk blocked'));
    await f.store.initialize();await expect(f.store.recordIssue('storage_load')).rejects.toThrow('left untouched');expect(f.storage.setItem).not.toHaveBeenCalled();
  });
  it('clears reports, issues, pending events and consent, and permits use after corruption',async()=>{
    const f=fixture('{broken');await f.store.initialize();await f.store.clear();expect(f.values.has(DIAGNOSTICS_KEY)).toBe(false);expect(f.store.getSnapshot()).toEqual({ready:true,error:null,issues:[],reports:[],consent:{analytics:false,diagnostics:false},anonymousId:null,events:[]});
    await f.store.setConsent({analytics:true,diagnostics:true});await f.store.track('app_open');await f.store.saveReport(reportInput);await f.store.recordIssue('photo');await f.store.clear();expect(f.store.getSnapshot().reports).toEqual([]);expect(f.store.getSnapshot().issues).toEqual([]);expect(f.store.getSnapshot().events).toEqual([]);expect(f.store.getSnapshot().anonymousId).toBeNull();expect(f.store.getSnapshot().consent).toEqual({analytics:false,diagnostics:false});
  });
  it('waits for an outstanding save before erasing, leaving nothing on disk',async()=>{
    const f=fixture();let release!:()=>void;f.storage.setItem=vi.fn(async(key,value)=>{await new Promise<void>(resolve=>{release=resolve;});f.values.set(key,value);});const save=f.store.saveReport(reportInput),clear=f.store.clear();await flush();expect(f.storage.removeItem).not.toHaveBeenCalled();release();await Promise.all([save,clear]);expect(f.values.has(DIAGNOSTICS_KEY)).toBe(false);expect(f.store.getSnapshot().reports).toEqual([]);
  });
  it('does not claim erasure succeeded when storage rejects removal',async()=>{
    const f=fixture();await f.store.saveReport(reportInput);vi.mocked(f.storage.removeItem).mockRejectedValueOnce(new Error('native secret detail'));await expect(f.store.clear()).rejects.toThrow('could not be erased');expect(f.store.getSnapshot().reports).toHaveLength(1);expect(f.values.has(DIAGNOSTICS_KEY)).toBe(true);expect(f.store.getSnapshot().error).not.toContain('native secret');
  });
  it('strips unknown restored fields and rejects malformed known records',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:false});await f.store.recordIssue('photo');await f.store.saveReport(reportInput);await f.store.track('app_open');const disk=JSON.parse(f.values.get(DIAGNOSTICS_KEY)!);disk.accountEmail='private@example.com';disk.issues[0].rawError='private exception';disk.events[0].properties.answers=['A'];disk.reports[0].profileName='private profile';const clean=fixture(JSON.stringify(disk));await clean.store.initialize();expect(clean.store.getSnapshot().error).toBeNull();expect(JSON.stringify(clean.store.getSnapshot())).not.toContain('private');
    disk.issues[0].count=-1;const bad=fixture(JSON.stringify(disk));await bad.store.initialize();expect(bad.store.getSnapshot().error).toContain('left untouched');expect(bad.storage.setItem).not.toHaveBeenCalled();
  });
  it('rejects unsupported versions and duplicate persisted identifiers',async()=>{
    const f=fixture();await f.store.saveReport(reportInput);const disk=JSON.parse(f.values.get(DIAGNOSTICS_KEY)!);disk.reports.push(disk.reports[0]);const duplicate=fixture(JSON.stringify(disk));await duplicate.store.initialize();expect(duplicate.store.getSnapshot().error).toBeTruthy();disk.version=999;const unsupported=fixture(JSON.stringify(disk));await unsupported.store.initialize();expect(unsupported.store.getSnapshot().error).toBeTruthy();
  });
  it('bounds valid restored queues and report lists',async()=>{
    const f=fixture();await f.store.setConsent({analytics:true,diagnostics:false});await f.store.saveReport(reportInput);await f.store.track('app_open');const disk=JSON.parse(f.values.get(DIAGNOSTICS_KEY)!);
    disk.reports=Array.from({length:30},(_,i)=>({...disk.reports[0],id:`report-${i}`}));disk.events=Array.from({length:120},(_,i)=>({...disk.events[0],id:`event-${i}`}));
    const restored=fixture(JSON.stringify(disk));await restored.store.initialize();expect(restored.store.getSnapshot().error).toBeNull();expect(restored.store.getSnapshot().reports).toHaveLength(20);expect(restored.store.getSnapshot().reports[0].id).toBe('report-10');expect(restored.store.getSnapshot().events).toHaveLength(100);expect(restored.store.getSnapshot().events[0].id).toBe('event-20');
  });
});
