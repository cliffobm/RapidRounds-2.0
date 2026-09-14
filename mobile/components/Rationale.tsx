import React,{useState} from 'react';
import {Linking,Text,TextInput,View} from 'react-native';
import {type StudyQuestion,type StudyResponse} from '../lib/learning';
import {useStyles} from '../styles';
import {ReadAloud} from './ReadAloud';
import {Button} from './ui';
import {TeachingDetails} from './TeachingDetails';
export function Rationale({question:q,response,onReport}:{question:StudyQuestion;response?:StudyResponse;onReport:(reason:string)=>void}){
  const s=useStyles();const [expanded,setExpanded]=useState(false);const [reporting,setReporting]=useState(false);const [reason,setReason]=useState('');const [sent,setSent]=useState(false);const [linkError,setLinkError]=useState('');
  const options=q.rubric.options;
  const answerText='rows' in q.rubric?q.rubric.rows.map(row=>`${row.label}: ${options.find(o=>o.id===row.correctOptionId)?.text}`).join('\n'):q.rubric.correctIds.map(id=>options.find(o=>o.id===id)?.text).join('; ');
  const yourAnswer=response?response.timedOut?'No response before the challenge deadline.':'rows' in q.rubric?q.rubric.rows.map(row=>`${row.label}: ${options.find(o=>o.id===response.value.rowAnswers[row.id])?.text??'No response'}`).join('\n'):response.value.selectedIds.map(id=>options.find(o=>o.id===id)?.text??'Previous option').join('; '):null;
  return <View style={s.stack}>
    <ReadAloud label="Read explanation" text={[q.rationale,'Correct response: '+answerText,...(q.cues??[]),q.mechanism??'',...q.optionRationales.map(o=>o.text+'. '+o.rationale)].join('\n')}/>
    <View style={s.feedback}><Text accessibilityRole="header" style={s.heading}>{response?.correct?'A sound choice.':response&&response.earned>0?'Partly there. Let’s connect the reasoning.':'Let’s work through the reasoning.'}</Text><Text style={s.body}>{q.rationale}</Text></View>
    {yourAnswer&&<View style={s.card}><Text style={s.tag}>YOUR RESPONSE</Text><Text style={s.body}>{yourAnswer}</Text></View>}
    <View style={s.card}><Text style={s.tag}>CORRECT RESPONSE{('rows' in q.rubric||q.rubric.correctIds.length>1)?'S':''}</Text><Text style={s.optionText}>{answerText}</Text>{q.cues?.length?<><Text style={s.heading}>The cues that matter</Text>{q.cues.map(c=><Text key={c} style={s.body}>• {c}</Text>)}</>:null}{q.mechanism&&<><Text style={s.heading}>Connect the mechanism</Text><Text style={s.body}>{q.mechanism}</Text></>}</View>
    <Button title={expanded?'Hide detailed explanations':'Why the other choices differ'} secondary onPress={()=>setExpanded(v=>!v)}/>
    {expanded&&q.optionRationales.map(o=><View key={o.id} style={s.card}><Text style={s.heading}>{o.correct?'✓ ':''}{o.text}</Text><Text style={s.body}>{o.rationale}</Text></View>)}
    {q.transferPrompt&&<View style={s.reflection}><Text style={s.tag}>TRY THE IDEA IN A NEW CONTEXT</Text><Text style={s.body}>{q.transferPrompt}</Text><Text style={s.caption}>A reflection prompt, not an assessed answer. Your review queue will revisit the concept.</Text></View>}
    <Text style={s.caption}>Content: {q.status.replace('_',' ')} · Version {q.version}</Text>
    <TeachingDetails metadata={q.metadata}/>
    {q.sources.map(source=>source.url?<Button key={source.url} title={`Source: ${source.title}`} secondary onPress={()=>{Linking.openURL(source.url!).catch(()=>setLinkError('The source could not be opened. Try again when connected.'));}}/>:<Text key={source.title} style={s.caption}>{source.title}</Text>)}
    {!!linkError&&<Text accessibilityRole="alert" style={s.notice}>{linkError}</Text>}
    {sent?<Text accessibilityRole="alert" style={s.notice}>Concern saved on this device with the question version. It has not been sent to an educator.</Text>:reporting?<View style={s.card}><Text style={s.heading}>Flag a content concern</Text><Text style={s.caption}>Describe the question issue. Do not include patient or personal information.</Text><TextInput accessibilityLabel="Content concern" value={reason} onChangeText={setReason} placeholder="What needs a closer look?" placeholderTextColor="#B9C3DC" maxLength={1000} multiline style={s.field}/><Button title="Save concern locally" disabled={!reason.trim()} onPress={()=>{onReport(reason);setSent(true);setReporting(false);}}/><Button title="Cancel report" secondary onPress={()=>setReporting(false)}/></View>:<Button title="Report a concern" secondary onPress={()=>setReporting(true)}/>}
  </View>;
}
