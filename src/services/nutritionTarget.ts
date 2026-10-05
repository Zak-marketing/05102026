import type {UserProfile} from '../types';
export function nutritionTarget(profile:UserProfile, suppliedBmr?:number) {
  let measuredBmr=suppliedBmr || 0;
  if (!measuredBmr) try { const scans=JSON.parse(localStorage.getItem(`auraslim_inbody_scans_${profile.id}`)||'[]'); measuredBmr=Number(scans[0]?.bmrKcal)||0; }catch{}
  const measured=measuredBmr>=500&&measuredBmr<=4000;
  const bmr=measured?measuredBmr:10*profile.currentWeight+6.25*profile.heightCm-5*profile.age+(profile.gender==='male'?5:profile.gender==='female'?-161:-78);
  return {bmr:Math.round(bmr),measured,calories:Math.round(Math.max(bmr,1500,bmr*1.35+(profile.weightGoal==='gain'?250:profile.weightGoal==='maintain'?0:-300)))};
}
