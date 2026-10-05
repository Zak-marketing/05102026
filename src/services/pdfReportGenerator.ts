import { jsPDF } from 'jspdf';
import brandMark from '../assets/auraslim-mark.png?inline';
import fontRegular from '../assets/DejaVuSans.ttf?inline';
import fontBold from '../assets/DejaVuSans-Bold.ttf?inline';
import type { UserProfile, WeightEntry, NutritionEntry, SmartwatchData, WeeklyPhoto } from '../types';
import type { TranslationDictionary } from './i18n';
import { chronologicalWeights, currentWeight } from './weightHistory';
import { getStoredWaterLogs } from './storage';
import { localDate } from './dates';
import { compressImage } from '../utils/imageCompressor';

export interface PDFGenerationResult { success: boolean; filename: string; blob?: Blob; blobUrl?: string; error?: string; }
interface ReportDataOptions { profile: UserProfile; weightEntries: WeightEntry[]; weeklyPhotos?: WeeklyPhoto[]; nutritionEntries: NutritionEntry[]; smartwatch: SmartwatchData; t: TranslationDictionary; }

export async function generateNutritionistPDF({ profile, weightEntries, weeklyPhotos = [], nutritionEntries, t }: ReportDataOptions): Promise<PDFGenerationResult> {
  const filename = `AuraSlim_bilan_${localDate()}.pdf`;
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.addFileToVFS('DejaVuSans.ttf', fontRegular.split(',')[1]);
    doc.addFileToVFS('DejaVuSans-Bold.ttf', fontBold.split(',')[1]);
    doc.addFont('DejaVuSans.ttf', 'Aura', 'normal');
    doc.addFont('DejaVuSans-Bold.ttf', 'Aura', 'bold');
    doc.setFont('Aura', 'normal');
    const weights = chronologicalWeights(weightEntries);
    const progressPhotos: {source:string;date:string;weight:number;label:string}[] = [];
    const seenPhotos = new Set<string>();
    if(profile.initialPhotoUrl){progressPhotos.push({source:profile.initialPhotoUrl,date:profile.initialPhotoDate||weights[0]?.date||localDate(),weight:profile.startingWeight,label:'Photo · Jour 1'});seenPhotos.add(profile.initialPhotoUrl);}
    for(const entry of weights){if(entry.photoUrl&&!seenPhotos.has(entry.photoUrl)){progressPhotos.push({source:entry.photoUrl,date:entry.date,weight:entry.weight,label:'Pesée'});seenPhotos.add(entry.photoUrl);}}
    for(const photo of [...weeklyPhotos].filter(item=>item.id!=='goal_ia').sort((a,b)=>a.date.localeCompare(b.date))){if(photo.imageUrl&&!seenPhotos.has(photo.imageUrl)){progressPhotos.push({source:photo.imageUrl,date:photo.date,weight:photo.weightAtTime,label:photo.weekNumber===0?'Photo · Jour 1':`Photo · Semaine ${photo.weekNumber}`});seenPhotos.add(photo.imageUrl);}}
    const pdfPhotoBySource = new Map<string,string>();
    for(const photo of progressPhotos){
      if(!/^data:image\/(?:jpeg|png|webp);base64,/.test(photo.source))continue;
      try{pdfPhotoBySource.set(photo.source,await compressImage(photo.source,256,360,0.5));}catch{pdfPhotoBySource.set(photo.source,photo.source);}
    }
    const latest = currentWeight(weightEntries, profile);
    const delta = +(latest - profile.startingWeight).toFixed(1);
    const orange = [255, 123, 40] as const, green = [0, 178, 131] as const;
    const dark = [16, 30, 50] as const, muted = [91, 109, 133] as const;
    let y = 62;
    const heading = (title: string) => {
      if (y > 249) nextPage();
      doc.setFillColor(...orange); doc.roundedRect(15, y - 3.5, 3, 7, 1, 1, 'F');
      doc.setFont('Aura','bold'); doc.setFontSize(12); doc.setTextColor(...dark);
      doc.text(title, 22, y + 1.4); y += 10;
    };
    const nextPage = () => { doc.addPage(); y = 22; };
    const bodyText = (value: string, x = 18, width = 172) => {
      const lines: string[] = doc.splitTextToSize(value, width);
      if (y + lines.length * 5 > 267) nextPage();
      doc.setFont('Aura','normal'); doc.setFontSize(9); doc.setTextColor(...dark);
      doc.text(lines, x, y); y += Math.max(6, lines.length * 5 + 2);
    };
    // Cover header carries the same mark and brand colors as the application.
    doc.setFillColor(...dark); doc.rect(0, 0, 210, 48, 'F');
    doc.setFillColor(...orange); doc.rect(0, 46, 92, 2, 'F');
    doc.setFillColor(255, 197, 53); doc.rect(92, 46, 58, 2, 'F');
    doc.setFillColor(...green); doc.rect(150, 46, 60, 2, 'F');
    doc.addImage(brandMark, 'PNG', 15, 10, 29, 29);
    doc.setFont('Aura', 'bold'); doc.setFontSize(27); doc.setTextColor(255,255,255); doc.text(t?.appName || 'AuraSlim', 51, 23);
    doc.setFont('Aura','normal'); doc.setFontSize(10); doc.setTextColor(225,235,246); doc.text(t?.pdfReportSubtitle || 'Votre bilan personnel de progression', 51, 31);
    doc.setFontSize(8); doc.text('sales@auraslim.com  |  auraslim.com', 51, 38);

    doc.setFont('Aura','bold'); doc.setFontSize(18); doc.setTextColor(...dark); doc.text(t?.pdfReportTitle || 'Suivi de votre parcours', 16, y);
    y += 7; doc.setFont('Aura','normal'); doc.setFontSize(9); doc.setTextColor(...muted);
    const dateFormatted = new Date().toLocaleDateString(profile.preferredLanguage === 'fr' ? 'fr-FR' : 'en-US');
    doc.text(`${dateFormatted}  |  ${profile.name || 'Utilisateur'}`, 16, y);
    y += 7;
    const cards: [string, string, readonly [number, number, number]][] = [
      [t?.pdfStart || 'Au depart', `${profile.startingWeight} kg`, orange],
      [t?.pdfLatest || 'Derniere pesee', `${latest} kg`, green],
      [t?.pdfChange || 'Evolution', `${delta > 0 ? '+' : ''}${delta} kg`, dark],
      [t?.pdfGoal || 'Votre objectif', `${profile.targetWeight} kg`, [240, 164, 27]]
    ];
    cards.forEach(([label, value, color], index) => {
      const x = 15 + index * 46;
      doc.setFillColor(245,248,252); doc.roundedRect(x, y, 43, 25, 3, 3, 'F');
      doc.setDrawColor(228,235,243); doc.roundedRect(x, y, 43, 25, 3, 3, 'S');
      doc.setTextColor(...muted); doc.setFontSize(8); doc.setFont('Aura','normal'); doc.text(label, x+3, y+8);
      doc.setTextColor(...color); doc.setFontSize(13); doc.setFont('Aura','bold'); doc.text(value, x+3, y+18);
    });
    y += 32;

    // Weight progress chart with every weigh-in number clearly printed
    heading(t?.pdfWeightTrend || 'Evolution des pesees');
    if (weights.length >= 1) {
      const chart = weights.slice(-10);
      const values = chart.map(entry => entry.weight);
      const rawMin = Math.min(...values), rawMax = Math.max(...values);
      const span = rawMax - rawMin;
      const pad = span < 1 ? 1.5 : Math.max(1, span * 0.25);
      const min = Math.max(0, +(rawMin - pad).toFixed(1));
      const max = +(rawMax + pad).toFixed(1);

      const boxX = 15, boxY = y - 4, boxW = 180, boxH = 58;
      doc.setFillColor(247, 250, 252);
      doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'F');
      doc.setDrawColor(228, 235, 243);
      doc.setLineWidth(0.3);
      doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'S');

      // Grid boundaries
      const graphTop = y + 7;
      const graphBottom = y + 32;
      const graphHeight = graphBottom - graphTop;
      const innerLeft = boxX + 16;
      const innerRight = boxX + boxW - 14;
      const innerWidth = innerRight - innerLeft;

      // Draw 3 horizontal guide lines with weight levels
      [0, 0.5, 1].forEach(ratio => {
        const gridY = graphBottom - ratio * graphHeight;
        const gridVal = +(min + ratio * (max - min)).toFixed(1);
        doc.setDrawColor(233, 239, 246);
        doc.setLineWidth(0.2);
        doc.line(innerLeft, gridY, innerRight, gridY);
        doc.setFont('Aura', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...muted);
        doc.text(`${gridVal} kg`, boxX + 2.5, gridY + 1);
      });

      // Calculate coordinates for every weigh-in
      const coords = chart.map((entry, index) => {
        const x = chart.length === 1
          ? innerLeft + innerWidth / 2
          : innerLeft + (index / (chart.length - 1)) * innerWidth;
        const yCoord = graphBottom - ((entry.weight - min) / (max - min || 1)) * graphHeight;
        return { x, y: yCoord, entry };
      });

      // Connecting line across points
      if (coords.length > 1) {
        doc.setDrawColor(...green);
        doc.setLineWidth(0.9);
        coords.slice(1).forEach((point, index) => {
          doc.line(coords[index].x, coords[index].y, point.x, point.y);
        });
      }

      // Draw point circle and print the exact numeric weight value on every point
      coords.forEach((point, index) => {
        // Outer dot
        doc.setFillColor(...orange);
        doc.circle(point.x, point.y, 2.0, 'F');
        // Inner dot
        doc.setFillColor(255, 255, 255);
        doc.circle(point.x, point.y, 0.9, 'F');

        // Numeric weight value on the graph for this weigh-in
        const weightText = `${point.entry.weight.toFixed(1)} kg`;
        doc.setFont('Aura', 'bold');
        doc.setFontSize(7.5);
        const textWidth = doc.getTextWidth(weightText);

        // Stagger badge height if points are dense
        const stagger = (coords.length > 6 && index % 2 === 1) ? -6.8 : -3.5;
        const labelY = point.y + stagger;

        // Pill background behind number for clean legibility
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(point.x - textWidth / 2 - 1.2, labelY - 2.9, textWidth + 2.4, 4.3, 1, 1, 'F');
        doc.setDrawColor(...orange);
        doc.setLineWidth(0.25);
        doc.roundedRect(point.x - textWidth / 2 - 1.2, labelY - 2.9, textWidth + 2.4, 4.3, 1, 1, 'S');

        // Exact number printed cleanly
        doc.setTextColor(...dark);
        doc.text(weightText, point.x, labelY, { align: 'center' });

        // Date and photo thumbnail below the graph
        doc.setFont('Aura', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...muted);
        const shortDate = point.entry.date.length >= 10 ? point.entry.date.slice(5) : point.entry.date;
        doc.text(shortDate, point.x, boxY + 38, { align: 'center' });
        const source = point.entry.photoUrl || (point.entry.id === weights[0]?.id ? profile.initialPhotoUrl : undefined);
        const thumb = source ? pdfPhotoBySource.get(source) : undefined;
        if(thumb){
          const kind = thumb.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          doc.setDrawColor(210,220,232);doc.roundedRect(point.x-4,boxY+42,8,11,1,1,'S');
          try{doc.addImage(thumb,kind,point.x-3.5,boxY+42.5,7,10,undefined,'FAST');}catch{/* omit an unsupported image; keep the chart readable */}
        }
      });

      y += boxH + 8;
    } else {
      bodyText('Une nouvelle pesee ajoutera une courbe de progression a ce bilan.');
    }

    if(progressPhotos.length){
      heading('Photos de progression');
      for(let index=0;index<progressPhotos.length;index++){
        const photo=progressPhotos[index], col=index%3;
        if(col===0&&y+58>270)nextPage();
        const cardX=15+col*60,cardY=y-2;
        doc.setFillColor(247,250,252);doc.roundedRect(cardX,cardY,58,56,2,2,'F');doc.setDrawColor(228,235,243);doc.roundedRect(cardX,cardY,58,56,2,2,'S');
        const src=pdfPhotoBySource.get(photo.source);
        if(src){
          try{
            const kind=src.startsWith('data:image/png')?'PNG':'JPEG';
            const props=doc.getImageProperties(src);
            const scale=Math.min(52/props.width,38/props.height),w=props.width*scale,h=props.height*scale;
            doc.addImage(src,kind,cardX+(58-w)/2,cardY+2+(38-h)/2,w,h,undefined,'FAST');
          }catch{/* keep the caption when a stored photo cannot be decoded */}
        }
        doc.setFont('Aura','bold');doc.setFontSize(6.2);doc.setTextColor(...dark);
        doc.text(doc.splitTextToSize(photo.label,54).slice(0,1),cardX+2,cardY+44);
        doc.setFont('Aura','normal');doc.setFontSize(6.2);doc.setTextColor(...muted);
        doc.text(`${photo.date} · ${photo.weight} kg`,cardX+2,cardY+51);
        if(col===2||index===progressPhotos.length-1)y+=61;
      }
    }

    heading(t?.pdfMeasurements || 'Mesures et objectifs');
    bodyText(`Objectif choisi : ${profile.weightGoal === 'gain' || (!profile.weightGoal && profile.targetWeight > profile.startingWeight) ? 'prise' : 'perte'} de poids. Taille : ${profile.heightCm} cm. Tour de taille le plus recent : ${weights.at(-1)?.waistCm ?? 'non renseigne'} cm.`);
    const water = getStoredWaterLogs().filter(entry => entry.date === localDate()).reduce((sum, entry) => sum + entry.amountMl, 0);
    bodyText(`Eau enregistree aujourd'hui : ${(water / 1000).toFixed(2)} L. Objectif calorique indicatif : ${profile.dailyCalorieTarget} kcal/jour.`);
    
    heading(t?.pdfWeightLog || 'Journal des pesees');
    if (!weights.length) bodyText('Aucune pesee enregistree.');
    weights.forEach((entry,index) => {
      if (y > 260) nextPage();
      doc.setFillColor(index % 2 ? 248 : 241, 246, 249); doc.roundedRect(15,y-3,180,8,1,1,'F');
      bodyText(`${entry.date}     ${entry.weight} kg${entry.waistCm != null ? `     Tour de taille : ${entry.waistCm} cm` : ''}`);
    });
    y += 3;
    
    heading(t?.pdfMealLog || 'Repas enregistres');
    const meals = [...nutritionEntries].sort((a,b) => a.date.localeCompare(b.date));
    if (!meals.length) bodyText('Aucun repas enregistre.');
    meals.forEach(meal => bodyText(`${meal.date}  |  ${meal.name}  |  ${meal.portion}  |  ${meal.calories} kcal${meal.scannedWithAI ? ' (estimation IA)' : ''}`));
    y += 2;
    bodyText("Bilan informatif construit a partir de vos releves. Les estimations caloriques et l'analyse des photos ne constituent ni un diagnostic ni une prescription. Consultez un professionnel de sante pour un avis personnel.");
    for (let page = 1; page <= doc.getNumberOfPages(); page++) {
      doc.setPage(page);
      doc.setDrawColor(220,230,240); doc.line(15,278,195,278);
      doc.setFont('Aura','normal'); doc.setFontSize(8); doc.setTextColor(...muted);
      doc.text('AuraSlim  |  sales@auraslim.com  |  Document personnel',15,285);
      doc.text(`${page} / ${doc.getNumberOfPages()}`,194,285,{align:'right'});
    }
    const blob = doc.output('blob');
    return { success: true, filename, blob, blobUrl: URL.createObjectURL(blob) };
  } catch (error) { return { success: false, filename, error: error instanceof Error ? error.message : 'Creation du PDF impossible' }; }
}
