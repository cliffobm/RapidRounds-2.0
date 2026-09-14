import React,{useState} from 'react';
import {Text,View} from 'react-native';
import type {LearningState,StudyQuestion,StudySession} from '../lib/learning';
import {useStyles} from '../styles';
import {Button,Pill,SectionTitle} from './ui';
import {PatientChart} from './PatientChart';
import {Rationale} from './Rationale';
export function SessionResults({result,state,onReport,onReview,onAgain,onHome,onPageChange}:{result:StudySession;state:LearningState;onReport:(q:StudyQuestion,reason:string)=>void;onReview:()=>void;onAgain:()=>void;onHome:()=>void;onPageChange:()=>void}){
 const s=useStyles();const [index,setIndex]=useState<number|null>(null);const xp=Object.values(state.rewardLedger?.responses??{}).filter(r=>r.sessionId===result.id).reduce((n,r)=>n+r.xp,0)+(state.rewardLedger?.completions[result.id]?.xp??0);
 const page=(value:number|null)=>{setIndex(value);onPageChange();};
 return <View style={s.stack}><SectionTitle eyebrow={index===null?'SESSION COMPLETE':'EXPLANATION REVIEW'} title={index===null?'You made time to learn.':'Follow the reasoning.'}/>
 {index===null?<>
 <View style={s.hero}><Text style={s.score}>{result.mode==='challenge'?result.challengeScore?.finalScore:result.responses.reduce((a,r)=>a+r.earned,0)}<Text style={s.heading}> / {result.mode==='challenge'?100:result.responses.reduce((a,r)=>a+r.max,0)}</Text></Text><Text style={s.body}>{result.mode==='challenge'?'Game score — not an exam-readiness measure.':'Practice points — a snapshot of this session, not a pass prediction.'}</Text><Text style={s.caption}>{result.responses.filter(r=>r.exposure==='first').length} first encounters · {result.responses.filter(r=>r.exposure==='repeat').length} repeated items</Text>{result.challengeScore&&<Text style={s.caption}>{result.challengeScore.retryPenaltyLabel}</Text>}</View>
 <View style={s.feedback}><Text style={s.heading}>{xp>0?`+${xp} learning XP`:'You kept the ideas active.'}</Text><Text style={s.body}>Earn XP for new responses and qualifying learning sessions. Repeating the same item version does not add XP. Learning progress and game scores stay separate.</Text></View>
 {result.challengeScore&&<View style={s.card}>{[['Accuracy',result.challengeScore.accuracyPoints],['Consistency',result.challengeScore.streakBonus],['Speed',result.challengeScore.speedBonus],['Completion',result.challengeScore.completionBonus]].map(([label,value])=><View style={s.row} key={label}><Text style={s.body}>{label}</Text><Text style={s.heading}>{Number(value).toFixed(1)}</Text></View>)}<Text style={s.caption}>Subtotal {result.challengeScore.rawSubtotal.toFixed(1)} × {result.challengeScore.retryPenaltyMultiplier}, rounded.</Text></View>}
 <Button title="Review my explanations" onPress={()=>page(0)}/><Button title="Open my review queue" secondary onPress={onReview}/><Button title={result.mode==='case'?'Practice this case again':'Choose my next practice'} secondary onPress={onAgain}/>
 </>:<>
 <View style={s.row}><Pill text={`Question ${index+1} of ${result.questions.length}`}/><Text style={s.caption}>{result.responses[index].earned}/{result.responses[index].max} points</Text></View><PatientChart key={`chart-${index}`} question={result.questions[index]} stage={index+1} initialOpen={false}/><Text style={s.questionTitle}>{result.questions[index].prompt}</Text><Rationale key={index} question={result.questions[index]} response={result.responses[index]} onReport={reason=>onReport(result.questions[index],reason)}/>
 {index+1<result.questions.length&&<Button title="Next explanation" onPress={()=>page(index+1)}/>}
 {index>0&&<Button title="Previous explanation" secondary onPress={()=>page(index-1)}/>}
 <Button title="Back to results" secondary onPress={()=>page(null)}/>
 </>}<Button title="Back to Today" secondary onPress={onHome}/></View>;
}
