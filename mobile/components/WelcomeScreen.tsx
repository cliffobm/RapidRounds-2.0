import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {useStyles} from '../styles';
import {Button,SectionTitle} from './ui';

export interface WelcomeScreenProps {onStartGuest:()=>void;onSignIn:()=>void;onSkip?:()=>void}
export function WelcomeScreen({onStartGuest,onSignIn,onSkip}:WelcomeScreenProps){
  const s=useStyles();const [page,setPage]=useState(0);
  const pages=[
    {tag:'WELCOME TO RAPID ROUNDS',title:'Build confidence in your clinical thinking.',body:'Short learning sessions help you connect patient findings, priorities, and the reasons behind your answer.'},
    {tag:'LEARN AT YOUR PACE',title:'Understand first. Challenge yourself later.',body:'Learn without a timer, explore explanations, and revisit concepts through your review queue. Timed challenges are optional.'},
    {tag:'YOUR STUDY SPACE',title:'Make the experience work for you.',body:'Choose your learning level, adjust text and color settings, and enable read-aloud in your profile. Start as a guest whenever you are ready.'},
  ];const current=pages[page];
  return <View style={s.stack}>
    <SectionTitle eyebrow={current.tag} title={current.title} body={current.body}/>
    <View style={s.hero}><Text style={s.heading}>{page===0?'Understand. Apply. Remember.':page===1?'A useful next step, every day.':'Progress begins with one response.'}</Text><Text style={s.body}>{page===0?'Follow a changing patient, practice a difficult concept, or return to an idea that needs another look.':page===1?'Your confidence and responses guide a provisional review schedule. Practice scores are not exam predictions.':'Your profile and study history stay on this device. Connecting an account does not yet sync them.'}</Text></View>
    <Text accessibilityLabel={`Introduction page ${page+1} of ${pages.length}`} style={s.caption}>{page+1} / {pages.length}</Text>
    {page<pages.length-1?<Button title="Continue introduction" onPress={()=>setPage(p=>p+1)}/>:<Button title="Start studying as a guest" onPress={onStartGuest}/>}
    {page>0&&<Button title="Previous" secondary onPress={()=>setPage(p=>p-1)}/>}
    {page<pages.length-1&&<Button title="Skip introduction · Start as guest" secondary onPress={onSkip??onStartGuest}/>}
    <Button title="Account sign-in · View availability" secondary onPress={onSignIn}/>
    <Text style={s.caption}>Educational practice content. Independent educator review is pending. Use your school and clinical resources alongside this app.</Text>
  </View>;
}
