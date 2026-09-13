import {createContext,useContext,useMemo} from 'react';
import {StyleSheet,useColorScheme} from 'react-native';
import type {UserProfile} from './lib/profile';
export type Appearance=Pick<UserProfile,'theme'|'fontScale'|'readAloud'|'speechRate'|'reducedMotion'>;
export const AppearanceContext=createContext<Appearance>({theme:'dark',fontScale:1,readAloud:false,speechRate:1,reducedMotion:false});
export function useAppearance(){const p=useContext(AppearanceContext);const system=useColorScheme();return {...p,resolvedTheme:p.theme==='system'?(system==='light'?'light' as const:'dark' as const):p.theme};}
export function useStyles(){const p=useAppearance();return useMemo(()=>makeStyles(p.resolvedTheme,p.fontScale),[p.resolvedTheme,p.fontScale]);}
export const colors = { background: '#0C1122', aqua: '#53E5D0', violet: '#7950F2', text: '#F9FAFF', muted: '#B9C3DC', coral: '#FF998C' };
function makeStyles(theme:'light'|'dark',fontScale=1){
const raw={
  stack: { gap: 16 }, flex: { flex: 1 },
  previewNotice: { paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#342737', borderRadius: 10 },
  questionTitle: { color: colors.text, fontSize: 25, lineHeight: 34, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#273248', borderRadius: 10 },
  choice: { borderColor: '#455270', borderWidth: 2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, minHeight: 48 },
  modeCard: { flex: 1, minWidth: 140, borderColor: '#455270', borderWidth: 2, borderRadius: 18, padding: 16, gap: 8 },
  feedback: { backgroundColor: '#153A37', borderRadius: 20, padding: 20, gap: 12 },
  reflection: { padding: 20, gap: 12, borderColor: '#474368', borderWidth: 1, borderRadius: 20 },
  metrics: { flexDirection: 'row', gap: 12 }, metric: { flex: 1, backgroundColor: '#192137', borderRadius: 18, padding: 18, gap: 6 },
  metricNumber: { color: colors.text, fontSize: 32, fontWeight: '800' },
  tabBar: { flexDirection: 'row', flexWrap:'wrap', backgroundColor: '#131A2D', borderRadius: 15, padding: 4, gap: 2 },
  navTab: { flexGrow:1,flexBasis:fontScale>1?90:58, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  navText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  caseCard: { backgroundColor: '#182C3B', padding: 22, borderRadius: 22, gap: 14 },
  safe: { flex: 1, backgroundColor: colors.background }, page: { padding: 22, paddingBottom: 42, gap: 20, width: '100%', maxWidth: 660, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, logo: { width: 58, height: 58, borderRadius: 15 }, brand: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -1 }, eyebrow: { color: '#BEB2FA', fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginVertical: 6 },
  title: { color: colors.text, fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: -1 }, heading: { color: colors.text, fontSize: 19, fontWeight: '700' }, body: { color: colors.muted, fontSize: 16, lineHeight: 25 }, caption: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  hero: { backgroundColor: '#272043', padding: 24, borderRadius: 26, gap: 17 }, card: { backgroundColor: '#192137', padding: 20, borderRadius: 20, gap: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, tag: { color: colors.aqua, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  button: { padding: 17, backgroundColor: colors.violet, borderRadius: 16, alignItems: 'center', minHeight: 54 }, secondary: { backgroundColor: '#303A53' }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800',textAlign:'center' },secondaryButtonText:{color:colors.text}, pressed: { opacity: .7 }, disabled: { opacity: .45 },
  option: { padding: 18, minHeight: 58, backgroundColor: '#192137', borderWidth: 2, borderColor: '#36415C', borderRadius: 17 }, selected: { borderColor: colors.aqua }, optionText: { color: colors.text, fontSize: 16, lineHeight: 24 },
  tab: { padding: 14, borderRadius: 14, flex: 1, alignItems: 'center' }, activeTab: { backgroundColor: '#35284F' }, track: { height: 7, backgroundColor: '#33384F', borderRadius: 7, overflow: 'hidden' }, fill: { height: 7, backgroundColor: colors.aqua }, score: { color: colors.aqua, fontSize: 64, fontWeight: '900' }, notice: { color: colors.coral, fontSize: 13, lineHeight: 21 }, timer: { color: colors.aqua, fontSize: 24, fontWeight: '800' }, warning: { color: colors.coral }, field: { backgroundColor: '#0C1122', color: colors.text, padding: 14, borderRadius: 12, borderColor: '#65718F', borderWidth: 1, minHeight: 80 }, footer: { color: colors.muted, textAlign: 'center', fontSize: 12, lineHeight: 19 },
  splash:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.background,gap:24,padding:32},logoMock:{width:180,height:180,borderRadius:30,backgroundColor:'#0C1122',alignSelf:'center'},
} satisfies Record<string,import('react-native').ViewStyle|import('react-native').TextStyle|import('react-native').ImageStyle>;
const lightColors:Record<string,string>={'#0C1122':'#F4F6FA','#53E5D0':'#087667','#7950F2':'#6940D5','#F9FAFF':'#18253A','#B9C3DC':'#4D5B72','#FF998C':'#AB402E','#342737':'#F8E8DF','#273248':'#E8EDF4','#455270':'#B7C1D0','#153A37':'#E1F2E9','#474368':'#C4BDD8','#192137':'#FFFFFF','#131A2D':'#FFFFFF','#182C3B':'#E0F0F2','#BEB2FA':'#61429F','#272043':'#EDE7FE','#303A53':'#E3E8F0','#36415C':'#B7C1D0','#35284F':'#E6DFF7','#33384F':'#DDE3EE','#65718F':'#8998AC'};
for(const [name,style] of Object.entries(raw)){
 const v=style as {fontSize?:number;lineHeight?:number;color?:string;backgroundColor?:string;borderColor?:string};
 if(v.fontSize)v.fontSize=Math.round(v.fontSize*fontScale);if(v.lineHeight)v.lineHeight=Math.round(v.lineHeight*fontScale);
 if(theme==='light'&&name!=='logoMock')for(const key of ['color','backgroundColor','borderColor'] as const)if(v[key]&&lightColors[v[key]])v[key]=lightColors[v[key]];
}
return StyleSheet.create(raw);
}
export const styles=makeStyles('dark');
