import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,Image,Platform,Text,View} from 'react-native';
import {useAppearance,useStyles} from '../styles';
import {logoSource,useBrand} from '../lib/branding';
export function LaunchScreen({onFinish,loading}:{onFinish:()=>void;loading:boolean}){
 const s=useStyles();const p=useAppearance();const brand=useBrand();const motion=useRef(new Animated.Value(0)).current;const [reduce,setReduce]=useState<boolean|null>(null);
 useEffect(()=>{let mounted=true;void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduce(value);}).catch(()=>{if(mounted)setReduce(true);});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);return()=>{mounted=false;sub.remove();};},[]);
 useEffect(()=>{if(reduce===null)return;if(reduce||p.reducedMotion){motion.setValue(1);onFinish();return;}const animation=Animated.timing(motion,{toValue:1,duration:950,useNativeDriver:Platform.OS!=='web'});animation.start(({finished})=>{if(finished)onFinish();});return()=>animation.stop();},[reduce,p.reducedMotion,motion,onFinish]);
 const staticMotion=reduce===null||reduce||p.reducedMotion;
 return <View style={s.splash} accessibilityLabel="Opening Rapid Rounds"><View style={{width:200,height:200,alignItems:'center',justifyContent:'center'}}>
 {!staticMotion&&<><Animated.View style={{position:'absolute',width:190,height:190,borderWidth:3,borderColor:'#7950F2',borderTopColor:'#53E5D0',borderRightColor:'transparent',borderRadius:95,opacity:motion.interpolate({inputRange:[0,.75,1],outputRange:[0,1,0]}),transform:[{rotate:motion.interpolate({inputRange:[0,1],outputRange:['-150deg','150deg']})}]}}/><Animated.Text style={[s.score,{position:'absolute',opacity:motion.interpolate({inputRange:[0,.25,.65,1],outputRange:[0,1,0,0]}),transform:[{scale:motion.interpolate({inputRange:[0,1],outputRange:[.65,1.15]})},{rotate:motion.interpolate({inputRange:[0,1],outputRange:['-35deg','10deg']})}]}]}>RR</Animated.Text></>}
 <Animated.View style={{opacity:staticMotion?1:motion.interpolate({inputRange:[0,.5,1],outputRange:[0,0,1]}),transform:[{scale:staticMotion?1:motion.interpolate({inputRange:[0,.5,1],outputRange:[.7,.7,1]})}]}}><Image accessibilityLabel="Rapid Rounds logo" source={logoSource(brand.choice)} style={{width:160,height:160,borderRadius:34,backgroundColor:'#0C1122'}}/></Animated.View>
 </View><Text style={s.brand}>rapid rounds.</Text><Text style={[s.body,{textAlign:'center'}]}>Understand. Apply. Remember.</Text><Text style={s.caption}>{loading?'Opening your study space…':'Ready for your next small win.'}</Text></View>;
}
