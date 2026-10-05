import {auraSlimApi} from './apiClient';
import type {WeightGoalType} from '../types';
import {compressImage} from '../utils/imageCompressor';
export type GoalPhotoResult = {image:string; warning?:never}|{image?:never; warning:string};
export async function generateGoalPhoto(image:string,goal:WeightGoalType,targetWeight:number,startingWeight:number,heightCm:number):Promise<GoalPhotoResult> {
 const started=Date.now();
 try {
  // Re-encode even images already stored in the profile so the API payload remains small and predictable.
  let compactImage=await compressImage(image,768,1152,0.62);
  if(compactImage.length>2_800_000) compactImage=await compressImage(image,640,960,0.48);
  if(compactImage.length>2_800_000) throw new Error('Cette photo est trop volumineuse pour la projection IA. Choisissez une image plus légère.');
  const response=await auraSlimApi('goal-photo',{method:'POST',headers:{'Content-Type':'application/json','X-AuraSlim-Request':'1'},body:JSON.stringify({image:compactImage,goal,targetWeight,startingWeight,heightCm,consent:true}),signal:AbortSignal.timeout(180000)});
  const data=await response.json().catch(()=>({error:`Réponse serveur invalide (HTTP ${response.status}). Réessayez avec une photo plus légère.`}));if(!response.ok)throw new Error(data.error||'Génération indisponible.');
  if(data.fullBody!==true) return {warning:String(data.warning||'Pour générer une projection, choisissez une photo cadrée de la nuque aux pieds. Vous pouvez continuer sans projection.')};
  if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.image||''))throw new Error('Le service IA n’a pas renvoyé de photo. Vérifiez le modèle image et la clé Gemini sur le serveur.');
  return {image:data.image};
 } finally { const wait=3000-(Date.now()-started);if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait)); }
}
