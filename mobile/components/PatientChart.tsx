import React,{useState} from 'react';
import {Text,View} from 'react-native';
import type {StudyQuestion} from '../lib/learning';
import {useStyles} from '../styles';
import {ReadAloud} from './ReadAloud';
import {Button} from './ui';

export function PatientChart({question,stage,initialOpen=true}:{question:StudyQuestion;stage:number;initialOpen?:boolean}){
  const s=useStyles();const [open,setOpen]=useState(initialOpen);const [earlierOpen,setEarlierOpen]=useState(false);
  if(!question.chart)return null;
  return <View style={s.stack}>
    <View style={s.card}>
      <Text style={s.heading}>Patient chart · Stage {stage}</Text>
      <Button title={open?'Collapse patient chart':'Open patient chart'} secondary onPress={()=>setOpen(v=>!v)}/>
      {open&&<ReadAloud text={question.chart.join('\n')} label="Read current chart"/>}
      {open&&question.chart.map((entry,i)=><Text key={i} style={s.body}>{entry}</Text>)}
    </View>
    {!!question.previousChart?.length&&<View style={s.stack}>
      <Button title={earlierOpen?'Hide earlier chart entries':'Review earlier chart entries'} secondary onPress={()=>setEarlierOpen(v=>!v)}/>
      {earlierOpen&&question.previousChart.map((entry,i)=><Text key={i} style={s.body}>{entry}</Text>)}
    </View>}
  </View>;
}
