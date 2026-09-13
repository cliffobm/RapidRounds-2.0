export type HealthResult={id:string;title:string;status:'ok'|'attention'|'unavailable';detail:string};
export type HealthDependencies={
  storage:{setItem:(key:string,value:string)=>Promise<void>;getItem:(key:string)=>Promise<string|null>;removeItem:(key:string)=>Promise<void>};
  probeId:()=>string;
  checkConnection:()=>Promise<boolean|undefined>;
  checkSavedData:()=>Promise<{recovered:boolean}>;
  authConfigured:boolean;contentCount:number;contentPreview:boolean;updatesConfigured:boolean;
  reportsConfigured:boolean;usageConfigured:boolean;
};
/** The storage probe has its own namespace and never resets study information. */
export async function runHealthChecks(deps:HealthDependencies):Promise<HealthResult[]>{
  const results:HealthResult[]=[];
  const key=`rapidrounds.health.probe.${deps.probeId()}`;let storageOk=false;
  try{await deps.storage.setItem(key,'ok');storageOk=await deps.storage.getItem(key)==='ok';}catch{/* Summaries omit the raw storage error. */}
  finally{try{await deps.storage.removeItem(key);}catch{storageOk=false;}}
  results.push({id:'storage',title:'Saving on this device',status:storageOk?'ok':'attention',detail:storageOk?'A temporary test was saved, read, and removed. Your study history was not changed.':'The storage check could not finish. Check free space and try again; keep the app open if a recent save failed.'});
  try{const saved=await deps.checkSavedData();results.push({id:'saved',title:'Saved profile and study history',status:saved.recovered?'attention':'ok',detail:saved.recovered?'A recovery copy is readable; the latest action may need repeating.':'Saved information can be opened. This does not verify every answer or rule.'});}
  catch{results.push({id:'saved',title:'Saved profile and study history',status:'attention',detail:'Saved information could not be read. Keep it in place and report the problem before considering a reset.'});}
  try{const connected=await deps.checkConnection();results.push({id:'connection',title:'Device connection',status:connected===true?'ok':connected===false?'attention':'unavailable',detail:connected===true?'The device reports a connection. Account and reporting services have not been contacted by this check.':connected===false?'The device appears offline. Downloaded study content remains available.':'The device could not tell us whether a connection is available.'});}
  catch{results.push({id:'connection',title:'Device connection',status:'unavailable',detail:'Connection status is unavailable. Try again after checking Wi-Fi or cellular settings.'});}
  results.push(
    {id:'accounts',title:'Account setup',status:deps.authConfigured?'ok':'unavailable',detail:deps.authConfigured?'Public account settings are present. Use a real sign-in to verify the service.':'The owner has not connected accounts. Guest study is available.'},
    {id:'content',title:'Study content',status:deps.contentCount>0&&!deps.contentPreview?'ok':'attention',detail:deps.contentPreview?`${deps.contentCount} practice questions are available as teaching drafts. Educator approval is still required.`:deps.contentCount?`${deps.contentCount} published practice questions are available.`:'No published questions are available yet. Ask the owner to complete educator review.'},
    {id:'updates',title:'App updates',status:deps.updatesConfigured?'ok':'unavailable',detail:deps.updatesConfigured?'This installed build is connected to its update channel. Update availability is checked separately.':'Remote updates are not active in this build. Browser previews refresh from the development server.'},
    {id:'reports',title:'Online problem reports',status:deps.reportsConfigured?'ok':'unavailable',detail:deps.reportsConfigured?'The reporting destination is configured. Sending a reviewed report checks actual delivery.':'Reports can be saved and copied locally. The owner must connect the reporting service for online delivery.'},
    {id:'usage',title:'Optional usage reporting',status:deps.usageConfigured?'ok':'unavailable',detail:deps.usageConfigured?'The usage destination is configured. Sharing still requires your permission in Help & app health.':'No online usage destination is connected. Optional usage events, if enabled, wait on this device.'},
  );return results;
}
