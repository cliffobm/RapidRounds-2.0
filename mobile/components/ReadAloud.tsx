import React,{useEffect,useId,useSyncExternalStore} from 'react';
import {Platform,Text,View} from 'react-native';
import {useAppearance,useStyles} from '../styles';
import {canReadAloud,reading} from '../lib/speech';
import {Button} from './ui';
import {recordAppIssue} from '../lib/diagnostics';
export {stopReading} from '../lib/speech';

export function ReadAloud({text,label='Read aloud'}:{text:string;label?:string}){
 const p=useAppearance();const s=useStyles();const owner=useId();
 const state=useSyncExternalStore(reading.subscribe,reading.getSnapshot,reading.getSnapshot);
 const speaking=state.owner===owner&&state.status==='reading';
 const error=state.owner===owner?state.error:null;
 useEffect(()=>{if(error)recordAppIssue('speech','unknown');},[error]);
 useEffect(()=>()=>{void reading.stop(owner);},[owner,text,p.readAloud,p.speechRate]);
 if(!p.readAloud)return null;
 return <View style={s.stack}>
  <Button title={speaking?'Stop reading':label} secondary disabled={!canReadAloud()} onPress={()=>{const current=reading.getSnapshot();void(current.owner===owner&&current.status==='reading'?reading.stop(owner):reading.read(owner,text,p.speechRate));}}/>
  {!canReadAloud()&&<Text style={s.caption}>This browser does not support read aloud.</Text>}
  {Platform.OS==='ios'&&<Text style={s.caption}>If you hear no speech, turn off silent mode and check your volume.</Text>}
  {!!error&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}
 </View>;
}
