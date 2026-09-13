import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import * as Updates from 'expo-updates';
import {isAuthConfigured} from './auth';
import {isContentPreview,studyItems} from './learning';
import {loadStudy} from './study-storage';
import {loadProfile} from './profile';
import {getObservabilityConfig} from './observability';
import {runHealthChecks} from './health-checks';
import {installedUpdatesEnabled} from './diagnostics';
export const checkDeviceHealth=()=>{
  const config=getObservabilityConfig();
  return runHealthChecks({storage:AsyncStorage,probeId:()=>Crypto.randomUUID(),
    checkConnection:async()=>{const state=await Network.getNetworkStateAsync();return state.isConnected;},
    checkSavedData:async()=>{const [study]=await Promise.all([loadStudy(AsyncStorage),loadProfile(AsyncStorage)]);return {recovered:study.recovered};},
    authConfigured:isAuthConfigured,contentCount:studyItems().length,contentPreview:isContentPreview,
    updatesConfigured:installedUpdatesEnabled(),reportsConfigured:config.diagnosticsConfigured,usageConfigured:config.usageConfigured,
  });
};
