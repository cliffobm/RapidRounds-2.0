import React,{useState} from 'react';
import {Linking,Text,View} from 'react-native';
import {availableLessons} from '../lib/learning';
import {useStyles} from '../styles';
import {Button,SectionTitle} from './ui';
import {ReadAloud} from './ReadAloud';
export function LessonView({id,onBack,onPractice}:{id:string;onBack:()=>void;onPractice:()=>void}){
 const s=useStyles();const [error,setError]=useState('');const lesson=availableLessons().find(x=>x.id===id);
 if(!lesson)return <Button title="Back to library" onPress={onBack}/>;
 return <View style={s.stack}><SectionTitle eyebrow="CONCEPT LAB" title={lesson.title} body={lesson.summary}/><ReadAloud label="Read this lesson" text={[lesson.title,lesson.summary,...lesson.steps,lesson.workedExample,lesson.reflection].join('\n')}/>
 {lesson.steps.map((step,index)=><View style={s.card} key={index}><Text style={s.tag}>STEP {index+1}</Text><Text style={s.body}>{step}</Text></View>)}<View style={s.feedback}><Text style={s.heading}>Work through the reasoning</Text><Text style={s.body}>{lesson.workedExample}</Text></View><View style={s.reflection}><Text style={s.heading}>Pause & apply</Text><Text style={s.body}>{lesson.reflection}</Text><Text style={s.caption}>Reflection only. Your next practice question checks the idea in context.</Text></View>
 <Button title="Practice this concept" onPress={onPractice}/>{lesson.sources.map(source=><Button key={source.url} title={`Source: ${source.title}`} secondary onPress={()=>void Linking.openURL(source.url).catch(()=>setError('This source could not be opened.'))}/>)}{!!error&&<Text style={s.notice}>{error}</Text>}<Text style={s.caption}>Teaching draft · Educator review pending</Text><Button title="Back to library" secondary onPress={onBack}/></View>;
}
