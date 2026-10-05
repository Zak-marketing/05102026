import type {CapacitorConfig} from '@capacitor/cli';
const url=process.env.APP_URL;
if(url && !url.startsWith('https://'))throw new Error('APP_URL doit utiliser HTTPS pour une application mobile.');
const config:CapacitorConfig={appId:'com.growfasterwithia.auraslim',appName:'AuraSlim',webDir:'dist',...(url?{server:{url,cleartext:false}}:{}),plugins:{LocalNotifications:{iconColor:'#F97316'}}};
export default config;
