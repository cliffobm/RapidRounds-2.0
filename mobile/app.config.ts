import type {ConfigContext,ExpoConfig} from 'expo/config';

/** EAS init may persist extra.eas.projectId in app.json. Environment-based
 * project IDs are also supported, but must be present for builds AND updates. */
export default ({config}:ConfigContext):ExpoConfig=>{
  const projectId=process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim()||config.extra?.eas?.projectId;
  if(projectId&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))throw new Error('Use the project UUID from the owner’s Expo project settings.');
  return {
    ...config,name:config.name??'Rapid Rounds',slug:config.slug??'rapid-rounds',
    extra:{...config.extra,...(projectId?{eas:{...config.extra?.eas,projectId}}:{})},
    ...(projectId?{
      runtimeVersion:{policy:'fingerprint'},
      updates:{...config.updates,enabled:true,url:`https://u.expo.dev/${projectId}`,checkAutomatically:'ON_LOAD',fallbackToCacheTimeout:0},
    }:{updates:{...config.updates,enabled:false}}),
  };
};
