import {describe,expect,it,vi} from 'vitest';
import {runHealthChecks,type HealthDependencies} from '../lib/health-checks';
function setup():HealthDependencies{
  const values=new Map([['rapidrounds.study.v2','original study history']]);
  return {storage:{setItem:vi.fn(async(k:string,v:string)=>{values.set(k,v);}),getItem:vi.fn(async(k:string)=>values.get(k)??null),removeItem:vi.fn(async(k:string)=>{values.delete(k);})},probeId:()=> 'test-probe',checkConnection:async()=>true,checkSavedData:async()=>({recovered:false}),authConfigured:false,contentCount:66,contentPreview:true,updatesConfigured:false,reportsConfigured:false,usageConfigured:false};
}
describe('device health checks',()=>{
  it('probes only its own storage key and cleans it up',async()=>{const deps=setup();const results=await runHealthChecks(deps);expect(results.find(r=>r.id==='storage')?.status).toBe('ok');expect(deps.storage.setItem).toHaveBeenCalledWith('rapidrounds.health.probe.test-probe','ok');expect(await deps.storage.getItem('rapidrounds.study.v2')).toBe('original study history');expect(await deps.storage.getItem('rapidrounds.health.probe.test-probe')).toBeNull();});
  it('continues other checks when storage fails and never emits raw errors',async()=>{const deps=setup();deps.storage.setItem=async()=>{throw new Error('password=private');};const results=await runHealthChecks(deps);expect(deps.storage.removeItem).toHaveBeenCalled();expect(results).toHaveLength(8);expect(results[0].status).toBe('attention');expect(JSON.stringify(results)).not.toContain('private');});
  it('reports failed cleanup as attention',async()=>{const deps=setup();deps.storage.removeItem=async()=>{throw new Error('failed');};expect((await runHealthChecks(deps))[0].status).toBe('attention');});
  it('does not claim an offline device is connected or services were tested',async()=>{const deps=setup();deps.checkConnection=async()=>false;const result=await runHealthChecks(deps);expect(result.find(r=>r.id==='connection')?.status).toBe('attention');expect(result.find(r=>r.id==='accounts')?.status).toBe('unavailable');});
  it('flags drafts and recovered history even when technically readable',async()=>{const deps=setup();deps.checkSavedData=async()=>({recovered:true});const results=await runHealthChecks(deps);expect(results.find(r=>r.id==='content')?.status).toBe('attention');expect(results.find(r=>r.id==='saved')?.status).toBe('attention');});
  it('does not claim release readiness when there is no published content',async()=>{const deps=setup();deps.contentPreview=false;deps.contentCount=0;expect((await runHealthChecks(deps)).find(r=>r.id==='content')?.status).toBe('attention');});
});
