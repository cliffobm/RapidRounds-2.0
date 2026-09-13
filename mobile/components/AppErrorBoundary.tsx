import React from 'react';
import {SafeAreaView,ScrollView,Text,View} from 'react-native';
import {recordAppIssue} from '../lib/diagnostics';
import {useStyles} from '../styles';
import {SupportScreen} from './SupportScreen';
import {Button} from './ui';
function Fallback({retry}:{retry:()=>void}){
  const s=useStyles();const [help,setHelp]=React.useState(false);
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>{help?<SupportScreen context="unknown" onClose={()=>setHelp(false)}/>:<View style={s.stack}><Text accessibilityRole="header" style={s.title}>Let’s get you back to studying.</Text><Text style={s.body}>A screen could not open. Your last successfully saved progress stays on this device. Unsaved changes may need repeating.</Text><Button title="Try opening the app again" onPress={retry}/><Button title="Help & report a problem" secondary onPress={()=>setHelp(true)}/></View>}</ScrollView></SafeAreaView>;
}
export class AppErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){recordAppIssue('render','unknown');}
  render(){return this.state.failed?<Fallback retry={()=>this.setState({failed:false})}/>:this.props.children;}
}
