import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {useStyles} from '../styles';
export function Button({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
  const s=useStyles();return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,disabled&&s.disabled,pressed&&s.pressed]}><Text style={[s.buttonText,secondary&&s.secondaryButtonText]}>{title}</Text></Pressable>;
}
export function SectionTitle({eyebrow,title,body}:{eyebrow?:string;title:string;body?:string}){
  const s=useStyles();return <View style={s.stack}>{eyebrow&&<Text style={s.tag}>{eyebrow}</Text>}<Text accessibilityRole="header" style={s.title}>{title}</Text>{body&&<Text style={s.body}>{body}</Text>}</View>;
}
export function Pill({text}:{text:string}){const s=useStyles();return <View style={s.pill}><Text style={s.caption}>{text}</Text></View>;}
