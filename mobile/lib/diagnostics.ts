import {useEffect,useSyncExternalStore} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Updates from 'expo-updates';
import {createDiagnosticsStore,type DiagnosticConsent,type IssueCode,type ScreenName,type UsageEventName,type UsageProperties} from './diagnostics-core';
import {getObservabilityConfig,sendDiagnosticIssue,sendUsageEvent,sendUserReport,type ObservabilityBuildInfo} from './observability';

export const diagnostics=createDiagnosticsStore(AsyncStorage,{id:()=>Crypto.randomUUID()});
export function useDiagnostics(){
  const state=useSyncExternalStore(diagnostics.subscribe,diagnostics.getSnapshot,diagnostics.getSnapshot);
  useEffect(()=>{void diagnostics.initialize();},[]);return state;
}
export function buildInformation():ObservabilityBuildInfo {
  const isGo=Constants.executionEnvironment==='storeClient';
  return {version:Constants.expoConfig?.version??'1.0.0',platform:Platform.OS==='ios'?'ios':Platform.OS==='android'?'android':'web',
    ...(!isGo&&Application.nativeBuildVersion?{build:Application.nativeBuildVersion}:{}),channel:Updates.channel||'local'};
}
export const installedUpdatesEnabled=()=>Platform.OS!=='web'&&!__DEV__&&Updates.isEnabled===true&&!!Updates.channel;
export function versionLabel(){const build=buildInformation();return `Version ${build.version} · ${build.platform}${build.build?` · Build ${build.build}`:''} · ${build.channel}`;}

let delivery:Promise<void>|null=null;
const automaticRequests=new Set<AbortController>();
const issueLastSent=new Map<string,number>();
let deliveryEpoch=0;
export async function setSharingConsent(consent:DiagnosticConsent){
  // Abort before waiting for persistence so an opt-out immediately stops new work.
  deliveryEpoch++;automaticRequests.forEach(request=>request.abort());automaticRequests.clear();
  await diagnostics.setConsent(consent);
  if(consent.analytics)void flushUsage().catch(()=>{});
}
export async function clearDiagnostics(){
  deliveryEpoch++;automaticRequests.forEach(request=>request.abort());automaticRequests.clear();issueLastSent.clear();
  await diagnostics.clear();
}
export function recordAppIssue(code:IssueCode,screen:ScreenName='unknown'){
  const epoch=deliveryEpoch;
  void diagnostics.recordIssue(code,screen).then(async issue=>{
    const state=diagnostics.getSnapshot();
    if(!issue||epoch!==deliveryEpoch||state.error||!state.consent.diagnostics||!getObservabilityConfig().diagnosticsConfigured)return;
    // Avoid flooding the owner if a failing save repeats on every interaction.
    if(Date.now()-(issueLastSent.get(issue.id)??0)<60_000)return;
    const controller=new AbortController();automaticRequests.add(controller);
    try{await sendDiagnosticIssue(issue,buildInformation(),controller.signal);issueLastSent.set(issue.id,Date.now());}
    finally{automaticRequests.delete(controller);}
  }).catch(()=>{/* A logger failure must never interrupt studying. Local status exposes failed persistence. */});
}
export function trackUsage(name:UsageEventName,properties?:UsageProperties){
  void diagnostics.track(name,properties).then(event=>{if(event)void flushUsage().catch(()=>{});}).catch(()=>{});
}
export function flushUsage():Promise<void>{
  if(delivery)return delivery;
  const epoch=deliveryEpoch;
  const pending=Promise.resolve().then(async()=>{
    await diagnostics.initialize();
    if(!getObservabilityConfig().usageConfigured)return;
    for(const event of [...diagnostics.getSnapshot().events]){
      const state=diagnostics.getSnapshot();
      if(epoch!==deliveryEpoch||!state.consent.analytics||!state.anonymousId||state.error)break;
      const controller=new AbortController();automaticRequests.add(controller);
      try{
        await sendUsageEvent(event,state.anonymousId,buildInformation(),controller.signal);
        if(epoch!==deliveryEpoch)break;
        await diagnostics.markEventsSent([event.id]);
      }finally{automaticRequests.delete(controller);}
    }
  }).finally(()=>{if(delivery===pending)delivery=null;});
  delivery=pending;return pending;
}
const reportsSending=new Map<string,Promise<void>>();
/** Call only after the learner reviews the outgoing report and presses Send. */
export function deliverReport(id:string):Promise<void>{
  if(reportsSending.has(id))return reportsSending.get(id)!;
  const pending=Promise.resolve().then(async()=>{
    await diagnostics.initialize();const state=diagnostics.getSnapshot();
    if(state.error)throw new Error('Save the report successfully before sending it.');
    const report=state.reports.find(item=>item.id===id);
    if(!report)throw new Error('This report is no longer saved. Please create a new report.');
    if(report.status==='sent')return;
    const receipt=await sendUserReport(report,buildInformation());
    await diagnostics.markReportSent(id,receipt.eventId);
  }).catch(error=>{recordAppIssue('report_send','support');throw error;}).finally(()=>{reportsSending.delete(id);});
  reportsSending.set(id,pending);return pending;
}
