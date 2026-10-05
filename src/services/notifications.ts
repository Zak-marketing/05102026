import {Capacitor} from '@capacitor/core';
import {LocalNotifications,type LocalNotificationSchema} from '@capacitor/local-notifications';
import type {ReminderSetting} from '../types';
export const nativeNotifications=()=>Capacitor.isNativePlatform();
export async function requestNotifications():Promise<boolean>{
 if(nativeNotifications())return (await LocalNotifications.requestPermissions()).display==='granted';
 return 'Notification' in window && (Notification.permission==='granted'||await Notification.requestPermission()==='granted');
}
export async function showNotification(title:string,body:string){
 if(nativeNotifications()){
  if((await LocalNotifications.checkPermissions()).display!=='granted')return;
  await LocalNotifications.schedule({notifications:[{id:900001,title,body,schedule:{at:new Date(Date.now()+1500)},channelId:'auraslim-reminders'}]});return;
 }
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.getRegistration();if(registration){await registration.showNotification(title,{body,icon:'/auraslim-mark.svg'});return;}}
 new Notification(title,{body,icon:'/auraslim-mark.svg'});
}
let queue=Promise.resolve();
export function scheduleNativeReminders(reminders:ReminderSetting[],dictionary:Record<string,string>,language:string){
 queue=queue.catch(()=>{}).then(async()=>{
 if(!nativeNotifications()||(await LocalNotifications.checkPermissions()).display!=='granted')return;
 if(Capacitor.getPlatform()==='android')await LocalNotifications.createChannel({id:'auraslim-reminders',name:'AuraSlim',importance:4});
 const pending=await LocalNotifications.getPending();await LocalNotifications.cancel({notifications:pending.notifications.filter(n=>n.id>=10000&&n.id<11000).map(n=>({id:n.id}))});
 const notifications:LocalNotificationSchema[]=[];
 const body=language==='ar'?'حان وقت متابعة عاداتك الصحية.':language==='en'?'Time to track your healthy habits.':'C’est le moment de suivre vos habitudes.';
 const minutes=(clock:string)=>{const m=/^(\d{2}):(\d{2})$/.exec(clock);return m?Number(m[1])*60+Number(m[2]):NaN;};
 for(const reminder of reminders.filter(r=>r.enabled)){
  const start=minutes(reminder.time),end=minutes(reminder.endTime||'21:00');if(!Number.isFinite(start)||start<0||start>1439)continue;
  const slots=reminder.frequency==='hourly'?Array.from({length:Math.min(24,Math.max(0,Math.floor((end-start)/Math.max(60,reminder.intervalMinutes||120))+1))},(_,i)=>start+i*Math.max(60,reminder.intervalMinutes||120)):[start];
  for(const slot of slots){if(notifications.length>=60)break;notifications.push({id:10000+notifications.length,title:dictionary[reminder.titleKey]||'AuraSlim',body,channelId:'auraslim-reminders',schedule:{on:{hour:Math.floor(slot/60),minute:slot%60,...(reminder.frequency==='weekly'?{weekday:1 as const}:{})},repeats:true}});}
 }
 if(notifications.length)await LocalNotifications.schedule({notifications});
 });return queue;
}
