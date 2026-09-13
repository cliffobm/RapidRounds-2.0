import {createContext,useContext} from 'react';
export type LogoChoice='original'|'orbit'|'ribbon'|'spark';
export const BRAND_KEY='rapidrounds.brand-preview.v1';
export const logoOptions=[
 {id:'orbit' as const,title:'A · Orbit RR',note:'A clear circular silhouette that fits the opening reveal.',image:require('../assets/logo-orbit.png')},
 {id:'ribbon' as const,title:'B · Ribbon RR',note:'A flowing book-inspired form for a learning-focused identity.',image:require('../assets/logo-ribbon.png')},
 {id:'spark' as const,title:'C · Spark RR',note:'A warmer, playful direction with a small learning spark.',image:require('../assets/logo-spark.png')},
];
export function logoSource(choice:LogoChoice){return logoOptions.find(x=>x.id===choice)?.image??require('../assets/rapid-rounds-icon.png');}
export const BrandContext=createContext<{choice:LogoChoice;select:(choice:LogoChoice)=>Promise<void>}>({choice:'original',select:async()=>{}});
export const useBrand=()=>useContext(BrandContext);
