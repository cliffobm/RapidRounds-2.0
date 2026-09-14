import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {useStyles} from '../styles';
import {clinicalSkillLabels,isTeachingMetadata,type TeachingMetadata} from '../content/teaching-metadata';
import {Button} from './ui';

export function TeachingDetails({metadata}:{metadata?:TeachingMetadata}){
  const s=useStyles();const [open,setOpen]=useState(false);
  if(!isTeachingMetadata(metadata))return null;
  const review=metadata.review;
  return <View style={s.stack}>
    <Button title={open?'Hide teaching & review details':'Teaching & review details'} secondary onPress={()=>setOpen(v=>!v)}/>
    {open&&<View style={s.card}>
      <Text style={s.heading}>{metadata.courseTopic}</Text>
      <Text style={s.body}>{metadata.clientNeedsCategory}</Text>
      <Text style={s.body}>{metadata.clinicalJudgmentSkills.map(skill=>clinicalSkillLabels[skill]).join(' · ')}</Text>
      <Text style={s.caption}>Author: {review.author}</Text>
      <Text style={s.caption}>Reviewer: {review.reviewer??'Not yet recorded'}</Text>
      <Text style={s.caption}>Review date: {review.reviewDate??'Pending'}</Text>
      <Text style={s.caption}>Approval: {review.approvalStatus==='approved'?'Approved':'Educator review pending'} · Version {review.contentVersion}</Text>
    </View>}
  </View>;
}
