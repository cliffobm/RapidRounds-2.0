import React,{useEffect,useRef,useState} from 'react';
import {Image,Platform,Pressable,Switch,Text,TextInput,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useStyles} from '../styles';
import {MAX_AVATAR_BYTES,normalizeUsername,validAvatar,validateProfile,type UserProfile} from '../lib/profile';
import {avatarFromPickerResult,nativeProfilePhotoOptions} from '../lib/profilePhoto';
import {Button,SectionTitle} from './ui';
import {recordAppIssue} from '../lib/diagnostics';

export interface ProfileScreenProps {
  profile:UserProfile;onSave:(profile:UserProfile)=>Promise<void>|void;
  onResetProgress:()=>Promise<void>|void;onEraseAll:()=>Promise<void>|void;
  onOpenAuth:()=>void;onReplayIntro:()=>void;accountLabel?:string;onCancel?:()=>void;
}
export function ProfileScreen({profile,onSave,onResetProgress,onEraseAll,onOpenAuth,onReplayIntro,accountLabel,onCancel}:ProfileScreenProps){
  const s=useStyles();const [draft,setDraft]=useState({...profile});const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [danger,setDanger]=useState<'reset'|'erase'|null>(null);const [confirmation,setConfirmation]=useState('');
  const photoInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{setDraft({...profile});},[profile]);
  useEffect(()=>{
    if(Platform.OS!=='android')return;
    let active=true;
    // Recover only an already user-initiated selection after Android recreates
    // the activity. This never opens a picker or saves the profile automatically.
    void ImagePicker.getPendingResultAsync().then(async result=>{
      const data=avatarFromPickerResult(result);
      if(data){await Image.getSize(data);if(active){setDraft(p=>({...p,avatarDataUri:data}));setNotice('Photo recovered. Save your profile to keep it on this device.');}}
    }).catch(error=>{if(active)setNotice(error instanceof Error?error.message:'The photo could not be recovered. Please try again.');});
    return ()=>{active=false;};
  },[]);
  const set=<K extends keyof UserProfile>(key:K,value:UserProfile[K])=>{setDraft(p=>({...p,[key]:value}));setNotice('');};
  const field=(label:string,key:'displayName'|'username'|'pronouns'|'country'|'school'|'program'|'studyStage'|'goals',max:number)=> <View key={key} style={s.stack}><Text style={s.heading}>{label}</Text><TextInput accessibilityLabel={label} value={draft[key]} onChangeText={value=>set(key,key==='username'?normalizeUsername(value):value)} editable={!busy} maxLength={max} autoCapitalize={key==='username'?'none':'sentences'} autoCorrect={key!=='username'} multiline={key==='goals'} style={[s.field,{minHeight:key==='goals'?100:52}]}/></View>;
  const choices=<K extends keyof UserProfile>(label:string,key:K,options:{value:UserProfile[K];label:string}[])=><View style={s.stack}><Text style={s.heading}>{label}</Text><View style={s.row}>{options.map(option=><Pressable key={String(option.value)} accessibilityRole="radio" accessibilityLabel={`${label}: ${option.label}`} aria-checked={draft[key]===option.value} accessibilityState={{checked:draft[key]===option.value,disabled:busy}} disabled={busy} onPress={()=>set(key,option.value)} style={[s.choice,draft[key]===option.value&&s.selected]}><Text style={s.optionText}>{option.label}</Text></Pressable>)}</View></View>;
  const toggle=(label:string,key:'readAloud'|'reducedMotion')=><View style={s.row}><Text style={[s.heading,{flex:1}]}>{label}</Text><Switch accessibilityLabel={label} value={draft[key]} disabled={busy} onValueChange={value=>set(key,value)}/></View>;
  async function readPhoto(file:File){setBusy(true);setNotice('');try{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size===0||file.size>MAX_AVATAR_BYTES)throw new Error('Choose a JPEG, PNG, or WebP photo no larger than 600 KB.');
    const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('The photo could not be read.'));reader.onabort=()=>reject(new Error('Photo reading was cancelled.'));reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('The photo could not be read.'));reader.readAsDataURL(file);});
    if(!validAvatar(data))throw new Error('This photo format is not supported.');
    await new Promise<void>((resolve,reject)=>{const preview=new window.Image();preview.onload=()=>resolve();preview.onerror=()=>reject(new Error('This file could not be decoded as an image.'));preview.src=data;});
    set('avatarDataUri',data);setNotice('Photo selected. Save your profile to keep it on this device.');
  }catch(error){recordAppIssue('photo','profile');setNotice(error instanceof Error?error.message:'The photo could not be selected.');}finally{setBusy(false);}}
  async function pickNativePhoto(){if(busy)return;setBusy(true);setNotice('');try{
    // Image-library selection on the supported iOS/Android versions does not
    // require a blanket media-library permission request. The system picker
    // grants access to the image the user selects.
    const result=await ImagePicker.launchImageLibraryAsync(nativeProfilePhotoOptions);
    const data=avatarFromPickerResult(result);if(data===null)return;
    try{await Image.getSize(data);}catch{throw new Error('This file could not be decoded as an image. Try another photo.');}
    set('avatarDataUri',data);setNotice('Photo selected. Save your profile to keep it on this device.');
  }catch(error){recordAppIssue('photo','profile');setNotice(error instanceof Error?error.message:'The photo could not be selected.');}finally{setBusy(false);}}
  async function save(){setBusy(true);setNotice('');try{const clean=validateProfile({...draft,username:normalizeUsername(draft.username)});await onSave(clean);setDraft(clean);setNotice('Profile and preferences saved on this device.');}catch(error){setNotice(error instanceof Error?error.message:'Your profile could not be saved. Please retry.');}finally{setBusy(false);}}
  async function destructive(){if(confirmation!==(danger==='reset'?'RESET':'ERASE'))return;setBusy(true);setNotice('');try{if(danger==='reset')await onResetProgress();else await onEraseAll();setDanger(null);setConfirmation('');setNotice(danger==='reset'?'Study progress reset.':'Local app data erased.');}catch(error){setNotice(error instanceof Error?error.message:'The change could not be completed. Please retry.');}finally{setBusy(false);}}
  return <View style={s.stack}>
    <SectionTitle eyebrow="YOUR STUDY SPACE" title="Profile & preferences" body="Personal details are optional. Your profile and photo stay on this device."/>
    <View style={s.card}><View style={s.row}>{draft.avatarDataUri?<Image accessibilityLabel="Your profile photo" source={{uri:draft.avatarDataUri}} style={{width:88,height:88,borderRadius:44}}/>:<View style={[s.pill,{width:88,height:88,borderRadius:44,alignItems:'center',justifyContent:'center'}]}><Text style={s.title}>{draft.displayName.trim().charAt(0).toUpperCase()||'R'}</Text></View>}<Text style={[s.body,{flex:1}]}>Choose a photo or keep your initial. Photos are not uploaded.</Text></View>{Platform.OS==='web'?<><input ref={photoInput} aria-label="Choose profile photo file" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void readPhoto(file);}}/><Button title="Choose profile photo" secondary disabled={busy} onPress={()=>photoInput.current?.click()}/><Text style={s.caption}>JPEG, PNG, or WebP · Up to 600 KB</Text></>:<><Button title="Choose profile photo" secondary disabled={busy} onPress={()=>void pickNativePhoto()}/><Text style={s.caption}>Crop a photo to fit · Up to 600 KB after compression</Text></>}{draft.avatarDataUri&&<Button title="Remove photo" secondary disabled={busy} onPress={()=>{set('avatarDataUri',null);setNotice('Photo removed from the draft. Save to keep this change.');}}/>}</View>
    <View style={s.card}>{field('Display name','displayName',60)}{field('Username / study handle','username',24)}<Text style={s.caption}>Optional, 3–24 lowercase letters, numbers, or underscores. This local handle is not a reserved account name or a sign-in credential.</Text>{choices('Age range','ageBand',[{value:'',label:'Not set'},{value:'under_18',label:'Under 18'},{value:'18_24',label:'18–24'},{value:'25_34',label:'25–34'},{value:'35_44',label:'35–44'},{value:'45_plus',label:'45+'},{value:'prefer_not_to_say',label:'Prefer not to say'}])}{field('Pronouns','pronouns',40)}{field('Country / region','country',60)}</View>
    <View style={s.card}>{field('School','school',120)}{field('Nursing program','program',80)}{field('Stage of study','studyStage',80)}{field('Study goals','goals',500)}<Text style={s.caption}>Details help describe your study context. They do not yet generate a personalized curriculum.</Text>{choices('Question difficulty','difficulty',[{value:'all',label:'All levels'},{value:'foundation',label:'Foundation'},{value:'application',label:'Application'},{value:'advanced',label:'Advanced'}])}<Text style={s.caption}>Applies to new learning and challenge rounds. Due review may revisit other levels; the unfolding case has its own sequence.</Text></View>
    <View style={s.card}>{choices('Appearance','theme',[{value:'system',label:'Use device setting'},{value:'light',label:'Light'},{value:'dark',label:'Dark'}])}{choices('Text size','fontScale',[{value:1,label:'Standard'},{value:1.15,label:'Larger'},{value:1.3,label:'Largest'}])}{toggle('Enable read-aloud controls','readAloud')}{choices('Reading speed','speechRate',[{value:0.8,label:'Slower'},{value:1,label:'Standard'},{value:1.15,label:'Faster'}])}{toggle('Reduce motion','reducedMotion')}<Text style={s.caption}>Save to apply display and reading preferences. Device accessibility settings may also affect the app.</Text></View>
    {!!notice&&<Text accessibilityRole="alert" style={s.notice}>{notice}</Text>}
    <Button title={busy?'Working…':'Save profile & preferences'} disabled={busy} onPress={()=>void save()}/><Button title="Cancel changes" secondary disabled={busy} onPress={()=>{setDraft({...profile});setNotice('Unsaved changes discarded.');onCancel?.();}}/>
    <View style={s.card}><Text style={s.heading}>Account</Text><Text style={s.body}>{accountLabel??'Guest · This device'}</Text><Button title="Manage sign-in" secondary disabled={busy} onPress={onOpenAuth}/><Button title="Replay introduction" secondary disabled={busy} onPress={onReplayIntro}/></View>
    <View style={s.card}><Text style={s.heading}>Manage local data</Text><Text style={s.body}>Reset progress removes study history, active sessions, review schedules, and content concerns. Erase local data also removes your profile, photo, and preferences and signs out on this device. It does not delete a remote account.</Text>{danger?<><Text style={s.notice}>This cannot be undone. Type {danger==='reset'?'RESET':'ERASE'} to confirm {danger==='reset'?'resetting study progress':'erasing local app data'}.</Text><TextInput accessibilityLabel="Type confirmation" autoCapitalize="characters" autoCorrect={false} value={confirmation} onChangeText={setConfirmation} editable={!busy} style={[s.field,{minHeight:52}]}/><Button title={danger==='reset'?'Confirm reset progress':'Confirm erase local data'} disabled={busy||confirmation!==(danger==='reset'?'RESET':'ERASE')} onPress={()=>void destructive()}/><Button title="Keep my data" secondary disabled={busy} onPress={()=>{setDanger(null);setConfirmation('');}}/></>:<><Button title="Reset study progress…" secondary disabled={busy} onPress={()=>{setDanger('reset');setConfirmation('');}}/><Button title="Erase local app data…" secondary disabled={busy} onPress={()=>{setDanger('erase');setConfirmation('');}}/></>}</View>
  </View>;
}
