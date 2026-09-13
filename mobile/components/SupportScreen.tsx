import React,{useState} from 'react';
import {Platform,Pressable,Share,Switch,Text,TextInput,View} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import {useStyles} from '../styles';
import {Button,SectionTitle} from './ui';
import {ISSUE_CATALOG,REPORT_CATEGORIES,type ReportCategory,type ScreenName} from '../lib/diagnostics-core';
import {buildInformation,clearDiagnostics,deliverReport,diagnostics,flushUsage,installedUpdatesEnabled,setSharingConsent,trackUsage,useDiagnostics,versionLabel} from '../lib/diagnostics';
import {formatReportForSharing,getObservabilityConfig} from '../lib/observability';
import {checkDeviceHealth} from '../lib/device-health';
import type {HealthResult} from '../lib/health-checks';

export function SupportScreen({onClose,context='support'}:{onClose:()=>void;context?:ScreenName}){
  const s=useStyles();const state=useDiagnostics();const config=getObservabilityConfig();
  const [checks,setChecks]=useState<HealthResult[]>([]);const [checkedAt,setCheckedAt]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [category,setCategory]=useState<ReportCategory>('bug');
  const [summary,setSummary]=useState('');const [steps,setSteps]=useState('');const [expected,setExpected]=useState('');
  const [includeDiagnostics,setIncludeDiagnostics]=useState(false);const [selected,setSelected]=useState<string|null>(null);const [erase,setErase]=useState(false);
  const report=state.reports.find(item=>item.id===selected);
  const run=async(work:()=>Promise<void>)=>{setBusy(true);setNotice('');try{await work();}catch(error){setNotice(error instanceof Error?error.message:'This action could not finish. Please try again.');}finally{setBusy(false);}};
  const field=(label:string,value:string,setValue:(value:string)=>void,limit:number)=><View style={s.stack}><Text style={s.heading}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={setValue} maxLength={limit} multiline editable={!busy} style={[s.field,{minHeight:90}]}/></View>;
  const shareText=report?formatReportForSharing(report,buildInformation()):'';
  return <View style={s.stack}>
    <SectionTitle eyebrow="HERE TO HELP" title="Help & app health" body="Check this device, describe a problem, and choose what you share."/>
    <Text style={s.caption}>{versionLabel()}{Updates.updateId?` · Update ${Updates.updateId}`:''}</Text>
    <Button title="Back to app" secondary disabled={busy} onPress={onClose}/>
    {!!(notice||state.error)&&<Text accessibilityRole="alert" style={s.notice}>{notice||state.error}</Text>}
    <View style={s.card}><Text style={s.heading}>Is the app ready on this device?</Text><Text style={s.body}>These checks explain common problems. They do not certify clinical accuracy or prove the app is bug-free.</Text>
      <Button title={busy?'Working…':'Run app health check'} disabled={busy} onPress={()=>void run(async()=>{setChecks(await checkDeviceHealth());setCheckedAt(new Date().toLocaleString());})}/>
      {checkedAt&&<Text style={s.caption}>Last checked: {checkedAt}</Text>}
      {checks.map(check=><View key={check.id} style={s.stack}><Text style={s.heading}>{check.status==='ok'?'✓':check.status==='attention'?'!':'○'} {check.title}</Text><Text style={s.caption}>{check.status==='ok'?'Check passed':check.status==='attention'?'Needs attention':'Not available here'}</Text><Text style={s.body}>{check.detail}</Text></View>)}
      <Button title="Check for an app update" secondary disabled={busy||!installedUpdatesEnabled()} onPress={()=>void run(async()=>{const result=await Updates.checkForUpdateAsync();setNotice(result.isAvailable?'An update is available. Close and reopen the app when you finish studying; it can download during startup.':'No newer update is available for this build.');})}/>
      <Text style={s.caption}>{installedUpdatesEnabled()?'Checking does not restart a study session.':'Remote updates become available after the owner connects Expo and creates an installed build.'}</Text>
    </View>
    <View style={s.card}><Text style={s.heading}>Report a problem</Text><Text style={s.body}>Describe what happened and how to repeat it. Do not include passwords, recovery links, patient information, or private student details. Review the report before sending.</Text>
      <View style={s.row}>{REPORT_CATEGORIES.map(value=><Pressable key={value} accessibilityRole="radio" accessibilityLabel={`Report category: ${value}`} aria-checked={category===value} accessibilityState={{checked:category===value,disabled:busy}} disabled={busy} style={[s.choice,category===value&&s.selected]} onPress={()=>setCategory(value)}><Text style={s.optionText}>{value==='bug'?'App problem':value==='content'?'Study content':value==='accessibility'?'Accessibility':'Other'}</Text></Pressable>)}</View>
      {field('What went wrong?',summary,setSummary,160)}{field('Steps to repeat the problem',steps,setSteps,2000)}{field('What did you expect to happen?',expected,setExpected,1000)}
      <View style={s.row}><Text style={[s.body,s.flex]}>Include recent app problem codes</Text><Switch accessibilityLabel="Include recent app problem codes" value={includeDiagnostics} disabled={busy} onValueChange={setIncludeDiagnostics}/></View>
      <Text style={s.caption}>Codes contain known problem types and screen names. Your profile, photos, and answers are not attached. App version and platform accompany a sent report.</Text>
      <Button title="Save report & review" disabled={busy||!state.ready||!summary.trim()} onPress={()=>void run(async()=>{const saved=await diagnostics.saveReport({category,summary,steps,expected,includeDiagnostics,context});setSelected(saved.id);setSummary('');setSteps('');setExpected('');setNotice('Report saved on this device. Nothing has been sent.');trackUsage('report_created');})}/>
    </View>
    {!!state.reports.length&&<View style={s.card}><Text style={s.heading}>Your saved reports</Text>{[...state.reports].reverse().map(item=><Button key={item.id} title={`${item.status==='sent'?'Sent':'Saved locally'} · ${item.summary}`} secondary disabled={busy} onPress={()=>setSelected(item.id)}/>)}<Text style={s.caption}>The latest 20 reports are kept on this device.</Text></View>}
    {report&&<View style={s.card}><Text style={s.heading}>Review your report</Text><Text style={s.caption}>{report.status==='sent'?`Sent · Receipt ${report.receipt}`:'Saved locally · Not sent'}</Text><Text selectable style={s.body}>{shareText}</Text><Text style={s.caption}>This is the text sent to the app owner’s Sentry reporting service. Obvious credentials and email addresses are removed, but check for personal details yourself.</Text>
      <Button title="Copy report text" secondary disabled={busy} onPress={()=>void run(async()=>{if(!await Clipboard.setStringAsync(shareText))throw new Error('Copy is unavailable. Select the report text to copy it.');setNotice('Report copied. Paste it into your chosen support message.');})}/>
      {Platform.OS!=='web'&&<Button title="Share report…" secondary disabled={busy} onPress={()=>void run(async()=>{await Share.share({message:shareText,title:'Rapid Rounds problem report'});})}/>}
      <Button title={report.status==='sent'?'Report sent':config.diagnosticsConfigured?'Send reviewed report':'Online reporting · Setup required'} disabled={busy||!!state.error||report.status==='sent'||!config.diagnosticsConfigured} onPress={()=>void run(async()=>{await deliverReport(report.id);setNotice('The reporting service accepted your report. This does not mean it has been reviewed yet.');})}/>
      <Text style={s.caption}>{config.diagnosticsMessage}</Text>
    </View>}
    <View style={s.card}><Text style={s.heading}>Recent app problems</Text><Text style={s.body}>A small log stays on this device to help explain failures. Known problems are listed in plain language; this does not capture every crash.</Text>
      {!state.issues.length&&<Text style={s.caption}>No known problems have been recorded on this device.</Text>}
      {[...state.issues].reverse().slice(0,10).map(issue=><View key={issue.id} style={s.feedback}><Text style={s.heading}>{ISSUE_CATALOG[issue.code].title}</Text><Text style={s.body}>{ISSUE_CATALOG[issue.code].explanation}</Text><Text style={s.body}>Try this: {ISSUE_CATALOG[issue.code].nextStep}</Text><Text style={s.caption}>{issue.context} · {issue.count} occurrence(s) · {new Date(issue.lastSeen).toLocaleString()}</Text></View>)}
    </View>
    <View style={s.card}><Text style={s.heading}>Help improve Rapid Rounds</Text><Text style={s.body}>Both options start off. You can study without sharing. Turning sharing off stops new automatic uploads; previously received data is not deleted from the owner’s services.</Text>
      <View style={s.row}><Text style={[s.heading,s.flex]}>Share app error codes</Text><Switch accessibilityLabel="Share app error codes" value={state.consent.diagnostics} disabled={busy||!state.ready} onValueChange={value=>void run(()=>setSharingConsent({...state.consent,diagnostics:value}))}/></View>
      <Text style={s.caption}>Sends newly recorded problem codes, screen, and app version to Sentry when configured. No raw error messages, answers, or profile fields are attached.</Text>
      <View style={s.row}><Text style={[s.heading,s.flex]}>Share anonymous usage</Text><Switch accessibilityLabel="Share anonymous usage" value={state.consent.analytics} disabled={busy||!state.ready} onValueChange={value=>void run(()=>setSharingConsent({...state.consent,analytics:value}))}/></View>
      <Text style={s.caption}>Sends app opens, screen visits, lesson opens, and round starts/completions to PostHog using a random app identifier. No advertising IDs, names, demographics, question answers, or session recordings. Service providers still receive network connection information.</Text>
      <Text style={s.caption}>{config.usageMessage} {state.events.length} usage events waiting on this device. At most 100 are retained; turning usage off removes that queue and resets its identifier.</Text>
      <Button title="Retry queued usage upload" secondary disabled={busy||!state.consent.analytics||!state.events.length||!config.usageConfigured} onPress={()=>void run(async()=>{await flushUsage();setNotice('Queued usage upload finished. Check the remaining count above.');})}/>
      {erase?<><Text style={s.notice}>Clear saved reports, the local problem log, pending usage, and sharing choices? This cannot be undone. Your study progress stays in place.</Text><Button title="Confirm clear diagnostics" disabled={busy} onPress={()=>void run(async()=>{await clearDiagnostics();setSelected(null);setErase(false);setNotice('Local diagnostics cleared. Sharing is off.');})}/><Button title="Keep diagnostics" secondary disabled={busy} onPress={()=>setErase(false)}/></>:<Button title="Clear local diagnostics…" secondary disabled={busy} onPress={()=>setErase(true)}/>}
    </View>
  </View>;
}
