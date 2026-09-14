import React,{useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import type {DocumentationExercise} from '../content/teaching-metadata';
import {useStyles} from '../styles';
import {Button} from './ui';
import {ReadAloud} from './ReadAloud';

export function DocumentationPractice({exercise}:{exercise:DocumentationExercise}){
  const s=useStyles();const [draft,setDraft]=useState('');const [showModel,setShowModel]=useState(false);
  return <View style={s.reflection}>
    <Text accessibilityRole="header" style={s.heading}>Rewrite the note</Text>
    <Text style={s.body}>Original: {exercise.original}</Text>
    <Text style={s.body}>Use these observations: {exercise.observations}</Text>
    <ReadAloud label="Read documentation exercise" text={`${exercise.original}\n${exercise.observations}`}/>
    <TextInput accessibilityLabel={`Your revised note: ${exercise.original}`} value={draft} onChangeText={setDraft} multiline maxLength={2500} style={[s.field,{minHeight:120}]}/>
    <Text style={s.caption}>Practice text stays on this screen and clears when you leave the lesson. It is not submitted or automatically graded.</Text>
    <Button title={showModel?'Hide model note':'Compare with a model note'} secondary onPress={()=>setShowModel(value=>!value)}/>
    {showModel&&<View style={s.stack}>
      <Text style={s.heading}>One possible revision</Text>
      <Text selectable style={s.body}>{exercise.modelNote}</Text>
      <ReadAloud label="Read model note & self-check" text={[exercise.modelNote,...exercise.selfCheck].join('\n')}/>
      {exercise.selfCheck.map(item=><Text key={item} style={s.body}>• {item}</Text>)}
      <Text style={s.caption}>Different wording can be appropriate. Compare accuracy, specificity, and what was actually observed.</Text>
    </View>}
  </View>;
}
