import {Platform} from 'react-native';
import * as Speech from 'expo-speech';
import {createSpeechController,type SpeechDriver} from './speech-controller';

export const canReadAloud=()=>Platform.OS!=='web'||(typeof window!=='undefined'&&!!window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined');
const driver:SpeechDriver=Platform.OS==='web'?{
  stop:()=>{if(canReadAloud())window.speechSynthesis.cancel();},
  speak:(text,options)=>{
    if(!canReadAloud())throw new Error('Speech is unavailable.');
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='en-US';utterance.rate=options.rate;
    utterance.onend=options.onDone;
    utterance.onerror=event=>['canceled','interrupted'].includes(event.error)?options.onStopped():options.onError();
    window.speechSynthesis.speak(utterance);
  },
}:{
  maxInputLength:Speech.maxSpeechInputLength,
  stop:()=>Speech.stop(),
  speak:(text,options)=>Speech.speak(text,{...options,language:'en-US',useApplicationAudioSession:false}),
};
export const reading=createSpeechController(driver);
export function stopReading(){void reading.stop();}
