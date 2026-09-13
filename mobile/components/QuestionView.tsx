import React,{useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import type {StudySession,Confidence} from '../lib/learning';
import {scoreNgn,type NgnResponse} from '../lib/ngn';
import {useStyles} from '../styles';
import {Button,Pill} from './ui';
import {Rationale} from './Rationale';
import {PatientChart} from './PatientChart';
import {ReadAloud} from './ReadAloud';
export function QuestionView({session,now,onSubmit,onNext,onReport}:{session:StudySession;now:number;onSubmit:(value:NgnResponse,confidence:Confidence)=>void;onNext:()=>void;onReport:(reason:string)=>void}){
  const s=useStyles();const q=session.questions[session.index];const recorded=session.responses[session.index];
  const [draft,setDraft]=useState<NgnResponse>({selectedIds:[],rowAnswers:{}});const [confidence,setConfidence]=useState<Confidence|null>(null);const [hiddenTimer,setHiddenTimer]=useState(false);
  const value=recorded?.value??draft;const checked=scoreNgn(q.rubric,draft);const isLearn=session.mode==='learn'||session.mode==='review';
  const remaining=session.deadline===null?null:Math.max(0,Math.ceil((session.deadline-now)/1000));
  function choose(optionId:string){
    if(recorded)return;
    setDraft(v=>({selectedIds:q.rubric.format==='single'?[optionId]:v.selectedIds.includes(optionId)?v.selectedIds.filter(id=>id!==optionId):[...v.selectedIds,optionId],rowAnswers:{}}));
  }
  return <View style={s.stack}>
    <View style={s.row}><Text style={s.tag}>{session.mode.toUpperCase()} · {session.index+1} / {session.questions.length}</Text>{remaining!==null&&!recorded?<Text style={[s.timer,remaining<=10&&s.warning]}>{hiddenTimer?'Timed':`${remaining}s`}</Text>:<Pill text={recorded?'Response saved':'Take your time'}/>}</View>
    <View style={s.track}><View style={[s.fill,{width:`${session.responses.length/session.questions.length*100}%`}]}/></View>
    {remaining!==null&&remaining<=10&&!recorded&&<Text accessibilityRole="alert" style={s.notice}>10 seconds or less remaining.</Text>}
    <PatientChart question={q} stage={session.index+1}/>
    <Text style={s.tag}>{q.step??q.conceptLabel}</Text><Text accessibilityRole="header" style={s.questionTitle}>{q.prompt}</Text>
    <ReadAloud text={[q.prompt,...('rows' in q.rubric?q.rubric.rows.map(r=>r.label):[]),...q.rubric.options.map((o,i)=>`${String.fromCharCode(65+i)}. ${o.text}`)].join('\n')} label="Read question & choices"/>
    <Text style={s.caption}>{q.rubric.format==='single'?'Choose one answer.':q.rubric.format==='multiple'?'Select every response you think is correct.':q.rubric.format==='selectN'?`Select exactly ${q.rubric.selectCount} responses.`:'Choose one response in each row.'} · {q.status.replace('_',' ')}</Text>
    {'rows' in q.rubric?q.rubric.rows.map(row=><View key={row.id} style={s.card}><Text style={s.heading}>{row.label}</Text>{q.rubric.options.map(o=><Pressable key={o.id} accessibilityRole="radio" accessibilityLabel={`${row.label}: ${o.text}`} aria-checked={value.rowAnswers[row.id]===o.id} accessibilityState={{checked:value.rowAnswers[row.id]===o.id,disabled:!!recorded}} disabled={!!recorded} onPress={()=>setDraft(v=>({selectedIds:[],rowAnswers:{...v.rowAnswers,[row.id]:o.id}}))} style={[s.option,value.rowAnswers[row.id]===o.id&&s.selected]}><Text style={s.optionText}>{value.rowAnswers[row.id]===o.id?'● ':'○ '}{o.text}</Text></Pressable>)}</View>):q.rubric.options.map((o,i)=><Pressable key={o.id} accessibilityRole={q.rubric.format==='single'?'radio':'checkbox'} aria-checked={value.selectedIds.includes(o.id)} accessibilityState={{checked:value.selectedIds.includes(o.id),disabled:!!recorded}} disabled={!!recorded} onPress={()=>choose(o.id)} style={[s.option,value.selectedIds.includes(o.id)&&s.selected]}><Text style={s.optionText}>{value.selectedIds.includes(o.id)?'Selected · ':`${String.fromCharCode(65+i)}. `}{o.text}</Text></Pressable>)}
    {!recorded?<>
      <Text style={s.heading}>How confident are you?</Text><Text style={s.caption}>This helps schedule your review. It does not change your score.</Text><View style={s.row}>{(['unsure','somewhat','sure'] as Confidence[]).map(c=><Pressable key={c} accessibilityRole="radio" aria-checked={confidence===c} accessibilityState={{checked:confidence===c}} onPress={()=>setConfidence(c)} style={[s.choice,confidence===c&&s.selected]}><Text style={s.optionText}>{c==='unsure'?'Unsure':c==='somewhat'?'Somewhat sure':'Sure'}</Text></Pressable>)}</View>
      {!checked.valid&&(draft.selectedIds.length>0||Object.keys(draft.rowAnswers).length>0)&&<Text style={s.caption}>{checked.error}</Text>}
      <Button title={isLearn?'Check my reasoning':'Submit response'} disabled={!checked.valid||!confidence} onPress={()=>onSubmit(draft,confidence!)}/>
    </>:isLearn?<><Text accessibilityRole="alert" style={s.tag}>{recorded.earned}/{recorded.max} practice points · {recorded.exposure==='first'?'First encounter':'Repeated item'}</Text><Rationale question={q} response={recorded} onReport={onReport}/><Button title={session.index+1===session.questions.length?'Finish learning session':'Continue learning'} onPress={onNext}/></>:<View style={s.card}><Text accessibilityRole="alert" style={s.heading}>{recorded.timedOut?'Time expired.':'Response recorded.'}</Text><Text style={s.body}>Explanations appear after the {session.mode==='case'?'case':'challenge'} so you can reason independently.</Text><Button title={session.index+1===session.questions.length?'See my results':session.mode==='case'?'Next stage':'Next question'} onPress={onNext}/></View>}
    {remaining!==null&&!recorded&&<Button title={hiddenTimer?'Show countdown':'Hide countdown'} secondary onPress={()=>setHiddenTimer(v=>!v)}/>}
  </View>;
}
