import React,{useState} from 'react';
import {Image,Text,View} from 'react-native';
import {logoOptions,logoSource,useBrand} from '../lib/branding';
import {useStyles} from '../styles';
import {Button,SectionTitle} from './ui';
export function BrandGallery({onReplay}:{onReplay:()=>void}){
 const s=useStyles();const brand=useBrand();const [error,setError]=useState('');
 return <View style={s.stack}><SectionTitle eyebrow="IDENTITY STUDIO" title="Choose your RR." body="Compare these concept directions in the app. Your selection previews the header and opening reveal on this device."/>
 {logoOptions.map(option=><View key={option.id} style={s.card}><Image accessibilityLabel={option.title} source={option.image} style={s.logoMock}/><Text style={s.heading}>{option.title}</Text><Text style={s.body}>{option.note}</Text><View style={s.row}><Image accessibilityLabel={`${option.title} at small size`} source={option.image} style={{width:36,height:36,backgroundColor:'#0C1122',borderRadius:9}}/><Text style={s.brand}>rapid rounds.</Text></View><Button title={brand.choice===option.id?'Selected for preview':`Preview ${option.title}`} secondary={brand.choice!==option.id} onPress={()=>void brand.select(option.id).catch(()=>setError('Logo preference could not be saved.'))}/></View>)}
 <Button title="Replay opening animation" onPress={onReplay}/><Button title="Use original logo" secondary onPress={()=>void brand.select('original').catch(()=>setError('Logo preference could not be saved.'))}/>
 {!!error&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}<Text style={s.caption}>These are concept mockups. The installed app icon stays unchanged until a final design is selected, refined, and included in a new native build.</Text></View>;
}
