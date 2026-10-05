import React,{useEffect,useRef,useState} from 'react';
import {BleClient,numberToUUID,type BleDevice} from '@capacitor-community/bluetooth-le';
import {Activity,Battery,Bell,Bluetooth,CheckCircle2,Heart,Scale,Watch,WifiOff} from 'lucide-react';
import {requestNotifications,showNotification} from '../services/notifications';
import type {TranslationDictionary} from '../services/i18n';

const HR_SERVICE=numberToUUID(0x180d), HR_MEASUREMENT=numberToUUID(0x2a37);
const WEIGHT_SERVICE=numberToUUID(0x181d), WEIGHT_MEASUREMENT=numberToUUID(0x2a9d);
const BATTERY_SERVICE=numberToUUID(0x180f), BATTERY_LEVEL=numberToUUID(0x2a19);
type DeviceKind='heart-rate'|'weight-scale';
interface Props {t?:TranslationDictionary;onSyncWeight?:(weightKg:number)=>void}
const storedDeviceId='auraslim_ble_device_id',storedDeviceName='auraslim_ble_device_name',storedDeviceKind='auraslim_ble_device_kind';

export function WatchConnection({t,onSyncWeight}:Props){
 const [device,setDevice]=useState<BleDevice|null>(null),[deviceName,setDeviceName]=useState('');
 const [kind,setKind]=useState<DeviceKind>('heart-rate'),[heartRate,setHeartRate]=useState<number|null>(null),[weight,setWeight]=useState<number|null>(null),[battery,setBattery]=useState<number|null>(null);
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[isConnected,setIsConnected]=useState(false);
 const connectedId=useRef('');
 const s=(key:keyof TranslationDictionary,fr:string,en:string)=>t?.[key]||fr;
 const disconnect=(id:string)=>{if(connectedId.current!==id)return;connectedId.current='';setIsConnected(false);setStatus(s('bleDisconnected','Appareil déconnecté.','Device disconnected.'));};

 const subscribe=async(d:BleDevice,deviceKind:DeviceKind)=>{
  const id=d.deviceId;
  if(deviceKind==='heart-rate'){
   try{await BleClient.startNotifications(id,HR_SERVICE,HR_MEASUREMENT,value=>{if(value.byteLength<2)return;const flags=value.getUint8(0);const bpm=flags&1?value.getUint16(1,true):value.getUint8(1);setHeartRate(bpm);setStatus(s('bleLiveData','Données cardiaques reçues en direct.','Live heart-rate data received.'));});}catch{setStatus(s('bleNoHeartRate','Connecté, mais ce capteur ne fournit pas le profil cardio standard.','Connected, but this sensor does not expose the standard heart-rate profile.'));}
  }else{
   try{await BleClient.startNotifications(id,WEIGHT_SERVICE,WEIGHT_MEASUREMENT,value=>{if(value.byteLength<3)return;const pounds=(value.getUint8(0)&1)!==0;const raw=value.getUint16(1,true);const kg=+(pounds?raw*0.01*0.45359237:raw*0.005).toFixed(2);setWeight(kg);onSyncWeight?.(kg);setStatus(s('bleLiveWeight','Pesée Bluetooth reçue.','Bluetooth weigh-in received.'));});}catch{setStatus(s('bleNoWeight','Connecté, mais cette balance ne transmet pas ses pesées avec le profil standard.','Connected, but this scale does not send readings with the standard profile.'));}
  }
  try{const level=await BleClient.read(id,BATTERY_SERVICE,BATTERY_LEVEL);if(level.byteLength)setBattery(level.getUint8(0));}catch{/* Battery service is optional. */}
 };

 const pair=async(deviceKind:DeviceKind)=>{
  setBusy(true);setStatus('');setKind(deviceKind);
  try{
   await BleClient.initialize({androidNeverForLocation:true});
   const service=deviceKind==='heart-rate'?HR_SERVICE:WEIGHT_SERVICE;
   const selected=await BleClient.requestDevice({services:[service],optionalServices:[BATTERY_SERVICE,HR_SERVICE,WEIGHT_SERVICE]});
   await BleClient.connect(selected.deviceId,()=>disconnect(selected.deviceId));
   connectedId.current=selected.deviceId;setDevice(selected);setDeviceName(selected.name||s('bleUnnamed','Appareil Bluetooth','Bluetooth device'));setIsConnected(true);
   localStorage.setItem(storedDeviceId,selected.deviceId);localStorage.setItem(storedDeviceName,selected.name||'');localStorage.setItem(storedDeviceKind,deviceKind);
   await subscribe(selected,deviceKind);
   setStatus(s('bleConnected','Connexion Bluetooth établie. Les données affichées viennent de l’appareil.','Bluetooth connected. Displayed data comes from the device.'));
  }catch(error){
   const name=(error as {name?:string})?.name;
   setStatus(name==='NotFoundError'?s('bleCancelled','Aucun appareil sélectionné.','No device selected.'):s('bleConnectError','Connexion impossible. Activez le Bluetooth, rapprochez l’appareil et réessayez. Seuls les appareils BLE compatibles sont pris en charge.','Could not connect. Turn on Bluetooth, bring the device closer and try again. Only compatible BLE devices are supported.'));
  }finally{setBusy(false);}
 };

 useEffect(()=>{
  const id=localStorage.getItem(storedDeviceId);if(!id)return;
  const savedKind=(localStorage.getItem(storedDeviceKind)||'heart-rate') as DeviceKind;
  let cancelled=false;
  void (async()=>{try{await BleClient.initialize({androidNeverForLocation:true});const known=await BleClient.getDevices([id]);if(cancelled||!known[0])return;await BleClient.connect(id,()=>disconnect(id));if(cancelled)return;connectedId.current=id;setDevice(known[0]);setDeviceName(localStorage.getItem(storedDeviceName)||known[0].name||'');setKind(savedKind);setIsConnected(true);await subscribe(known[0],savedKind);}catch{/* Ask the user to reconnect if the OS no longer grants access. */}})();
  return()=>{cancelled=true;};
 },[]);

 const unlink=async()=>{const id=device?.deviceId||connectedId.current;try{if(id)await BleClient.disconnect(id);}catch{/* The OS may already have dropped the link. */}connectedId.current='';setDevice(null);setIsConnected(false);setDeviceName('');setHeartRate(null);setWeight(null);setBattery(null);localStorage.removeItem(storedDeviceId);localStorage.removeItem(storedDeviceName);localStorage.removeItem(storedDeviceKind);setStatus(s('bleDisconnected','Appareil déconnecté.','Device disconnected.'));};
 const sync=async()=>{if(!device||!isConnected)return;setBusy(true);try{const value=await BleClient.read(device.deviceId,BATTERY_SERVICE,BATTERY_LEVEL);if(value.byteLength)setBattery(value.getUint8(0));setStatus(s('bleSyncDone','Données disponibles actualisées. Les capteurs en direct restent à l’écoute.','Available data refreshed. Live sensors remain active.'));}catch{setStatus(s('bleNoBattery','Connexion active. Cet appareil ne fournit pas de niveau de batterie standard.','Connected. This device does not expose a standard battery level.'));}finally{setBusy(false);}};
 const testNotification=async()=>{try{if(!await requestNotifications()){setStatus(s('blePermission','Autorisez les notifications dans les réglages du téléphone.','Allow notifications in your phone settings.'));return;}await showNotification('AuraSlim',s('bleReminderBody','Votre rappel AuraSlim est prêt.','Your AuraSlim reminder is ready.'));setStatus(s('bleNotificationSent','Rappel envoyé au téléphone. Son affichage sur la montre dépend des réglages de notification du système.','Reminder sent to the phone. Watch mirroring depends on system notification settings.'));}catch{setStatus(s('bleNotificationError','Envoi du rappel impossible sur cet appareil.','Could not send a reminder on this device.'));}};

 return <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 text-slate-800 dark:text-slate-100">
  <header className="space-y-2"><h3 className="flex items-center gap-2 font-bold"><Bluetooth className="h-5 w-5 text-sky-500"/>{s('accountWatchTitle','Appareils Bluetooth','Bluetooth devices')}</h3><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s('bleDescription','Connectez un capteur cardio BLE ou une balance BLE utilisant un profil Bluetooth standard. Les montres Apple, Garmin et Fitbit demandent leurs intégrations officielles et ne sont pas toutes accessibles directement.','Connect a BLE heart-rate sensor or BLE scale using a standard Bluetooth profile. Apple, Garmin and Fitbit watches require their official integrations and may not be directly accessible.')}</p></header>
  {isConnected?<div className="space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500"/><strong className="break-words">{deviceName}</strong></div><span className="text-xs text-emerald-700 dark:text-emerald-300">{s('bleConnectedBadge','Connecté','Connected')}</span></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Metric icon={<Heart className="h-4 w-4"/>} label={s('bleHeartRateLabel','Fréquence cardiaque','Heart rate')} value={heartRate===null?'—':`${heartRate} bpm`}/><Metric icon={<Scale className="h-4 w-4"/>} label={s('bleWeightLabel','Dernière pesée reçue','Last weigh-in received')} value={weight===null?'—':`${weight} kg`}/><Metric icon={<Battery className="h-4 w-4"/>} label={s('bleBatteryLabel','Batterie','Battery')} value={battery===null?'—':`${battery} %`}/></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void sync()} className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50">{s('bleSync','Actualiser','Refresh')}</button><button type="button" onClick={()=>void unlink()} className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{s('disconnectBtn','Déconnecter','Disconnect')}</button></div></div>:<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><button type="button" disabled={busy} onClick={()=>void pair('heart-rate')} className="flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-900"><Watch className="h-5 w-5 shrink-0 text-sky-500"/><span className="min-w-0"><strong className="block break-words">{s('blePairHeartRate','Connecter un capteur cardio','Connect heart-rate sensor')}</strong><small className="block whitespace-normal text-slate-500">{s('bleHeartRateProfile','Profil BLE standard : fréquence cardiaque','Standard BLE heart-rate profile')}</small></span></button><button type="button" disabled={busy} onClick={()=>void pair('weight-scale')} className="flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-900"><Scale className="h-5 w-5 shrink-0 text-emerald-500"/><span className="min-w-0"><strong className="block break-words">{s('blePairScale','Connecter une balance','Connect a scale')}</strong><small className="block whitespace-normal text-slate-500">{s('bleWeightProfile','Profil BLE standard : poids','Standard BLE weight profile')}</small></span></button></div>}
  <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>void testNotification()} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><Bell className="h-4 w-4 text-amber-500"/>{s('accountWatchTestBtn','Tester une notification téléphone','Test a phone notification')}</button><span className="flex items-center gap-1 text-xs text-slate-500"><Activity className="h-3.5 w-3.5"/>{s('bleMirrorHint','La montre peut recopier les notifications du téléphone si son application compagnon l’autorise.','A watch may mirror phone notifications if its companion app allows it.')}</span></div>
  {status&&<p role="status" className="break-words rounded-xl bg-slate-50 p-3 text-sm leading-relaxed dark:bg-slate-900">{status}</p>}
  {!isConnected&&<p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500"><WifiOff className="mt-0.5 h-4 w-4 shrink-0"/>{s('bleBrowserHint','La connexion exige le Bluetooth activé, une application HTTPS ou native, et un appareil BLE compatible à proximité.','Connection requires Bluetooth enabled, an HTTPS or native app, and a compatible BLE device nearby.')}</p>}
 </section>;
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><span className="flex items-center gap-2 text-xs text-slate-500">{icon}<span className="break-words">{label}</span></span><strong className="mt-1 block break-words text-lg">{value}</strong></div>}
