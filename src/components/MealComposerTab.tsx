import {nutritionTarget} from '../services/nutritionTarget';
import {parseLocalizedNumber} from '../services/numberInput';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, 
  Plus, 
  Flame, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Calendar
} from 'lucide-react';
import { UserProfile, NutritionEntry, MealType, FoodItem, WeightGoalType } from '../types';
import { ThemeColors } from '../services/theme';
import { TranslationDictionary } from '../services/i18n';
import { localDate } from '../services/dates';
import { foodPhoto } from '../services/foodPhotos';

interface MealComposerTabProps {
  profile: UserProfile;
  nutritionEntries: NutritionEntry[];
  theme: ThemeColors;
  t: TranslationDictionary;
  onAddNutrition: (entry: NutritionEntry) => void;
  onDeleteNutrition: (id: string) => void;
}

// 15 general, high-quality foods for each meal time calibrated according to the 3 weight goals
const GOAL_FOOD_CATALOG: Record<WeightGoalType, Record<MealType, FoodItem[]>> = {
  // OBJECTIF : PERDRE DU POIDS (Faible densité calorique, haute satiété, riches en fibres et protéines)
  lose: {
    breakfast: [
      { id: 'lb-1', name: "Flocons d'avoine & graines de chia au lait végétal", portion: '50g', calories: 195, proteins: 8, carbs: 32, fats: 4, category: 'breakfast' },
      { id: 'lb-2', name: "2 Œufs pochés sur tranche de pain complet au levain", portion: '120g', calories: 190, proteins: 16, carbs: 14, fats: 8, category: 'breakfast' },
      { id: 'lb-3', name: "Skyr islandais 0% & baies fraîches (framboises, myrtilles)", portion: '200g', calories: 125, proteins: 22, carbs: 9, fats: 0.2, category: 'breakfast' },
      { id: 'lb-4', name: "Omelette 3 blancs d'œufs, épinards & tomates cerises", portion: '160g', calories: 110, proteins: 18, carbs: 3, fats: 2, category: 'breakfast' },
      { id: 'lb-5', name: "Fromage blanc 0% à la cannelle & 10 amandes brutes", portion: '170g', calories: 145, proteins: 15, carbs: 7, fats: 6, category: 'breakfast' },
      { id: 'lb-6', name: "Tartine de seigle noir, ricotta légère & concombre", portion: '110g', calories: 135, proteins: 7, carbs: 18, fats: 4, category: 'breakfast' },
      { id: 'lb-7', name: "Bowl de smoothie vert (épinards, concombre, pomme verte)", portion: '250ml', calories: 95, proteins: 2.5, carbs: 20, fats: 0.5, category: 'breakfast' },
      { id: 'lb-8', name: "Porridge de son d'avoine & graines de lin moulues", portion: '180g', calories: 160, proteins: 7, carbs: 24, fats: 4, category: 'breakfast' },
      { id: 'lb-9', name: "Tofu soyeux brouillé au curcuma & fines herbes", portion: '150g', calories: 115, proteins: 13, carbs: 3, fats: 5, category: 'breakfast' },
      { id: 'lb-10', name: "Tranche de saumon fumé sauvage & demi-avocat mûr", portion: '100g', calories: 185, proteins: 14, carbs: 3, fats: 13, category: 'breakfast' },
      { id: 'lb-11', name: "Galette de sarrasin nature & jambon de dinde blanc", portion: '130g', calories: 170, proteins: 16, carbs: 20, fats: 3, category: 'breakfast' },
      { id: 'lb-12', name: "Demi-pamplemousse frais & yaourt grec sans matières grasses", portion: '200g', calories: 115, proteins: 12, carbs: 16, fats: 0.5, category: 'breakfast' },
      { id: 'lb-13', name: "Pudding de chia au lait d'amande sans sucre", portion: '150g', calories: 130, proteins: 5, carbs: 10, fats: 8, category: 'breakfast' },
      { id: 'lb-14', name: "Tranche de pain essène bio & purée de sésame (tahini)", portion: '60g', calories: 155, proteins: 6, carbs: 16, fats: 7, category: 'breakfast' },
      { id: 'lb-15', name: "Café vert ou thé Matcha japonais sans sucre", portion: '200ml', calories: 4, proteins: 0.5, carbs: 0.5, fats: 0, category: 'breakfast' }
    ],
    lunch: [
      { id: 'll-1', name: "Blanc de poulet grillé aux herbes & haricots verts vapeur", portion: '260g', calories: 250, proteins: 44, carbs: 8, fats: 4, category: 'lunch' },
      { id: 'll-2', name: "Pavé de cabillaud rôti, quinoa royal & courgettes sautées", portion: '250g', calories: 260, proteins: 34, carbs: 24, fats: 3, category: 'lunch' },
      { id: 'll-3', name: "Salade complète au thon blanc, œuf dur & pousses d'épinards", portion: '240g', calories: 240, proteins: 32, carbs: 6, fats: 9, category: 'lunch' },
      { id: 'll-4', name: "Steak haché pur bœuf 5% & purée légère de patate douce", portion: '230g', calories: 285, proteins: 35, carbs: 25, fats: 4.5, category: 'lunch' },
      { id: 'll-5', name: "Filet de saumon atlantique vapeur & brocolis croquants", portion: '230g', calories: 310, proteins: 32, carbs: 6, fats: 17, category: 'lunch' },
      { id: 'll-6', name: "Bowl de lentilles corail, carottes fondantes & cumin doux", portion: '250g', calories: 260, proteins: 17, carbs: 42, fats: 3, category: 'lunch' },
      { id: 'll-7', name: "Wok de crevettes sauvages, poivrons rouges & germes de soja", portion: '250g', calories: 210, proteins: 30, carbs: 12, fats: 3, category: 'lunch' },
      { id: 'll-8', name: "Émincé de dinde fermière & riz basmati complet al dente", portion: '220g', calories: 275, proteins: 38, carbs: 28, fats: 3.5, category: 'lunch' },
      { id: 'll-9', name: "Salade de pois chiches, tomates anciennes, persil & citron", portion: '220g', calories: 235, proteins: 11, carbs: 36, fats: 5, category: 'lunch' },
      { id: 'll-10', name: "Filet de daurade royale au four & fenouil braisé au thym", portion: '230g', calories: 220, proteins: 32, carbs: 7, fats: 6, category: 'lunch' },
      { id: 'll-11', name: "Tofu grillé mariné au gingembre & asperges vertes", portion: '220g', calories: 200, proteins: 20, carbs: 8, fats: 9, category: 'lunch' },
      { id: 'll-12', name: "Chili végétarien léger aux haricots rouges & maïs doux", portion: '260g', calories: 245, proteins: 14, carbs: 40, fats: 3, category: 'lunch' },
      { id: 'll-13', name: "Filet mignon de porc maigre & champignons de Paris persillés", portion: '220g', calories: 240, proteins: 36, carbs: 4, fats: 8, category: 'lunch' },
      { id: 'll-14', name: "Salade méditerranéenne au concombre, feta légère & origan", portion: '200g', calories: 170, proteins: 9, carbs: 8, fats: 11, category: 'lunch' },
      { id: 'll-15', name: "Gaspacho andalou traditionnel maison à l'huile d'olive", portion: '250ml', calories: 130, proteins: 3, carbs: 16, fats: 6, category: 'lunch' }
    ],
    dinner: [
      { id: 'ld-1', name: "Velouté de potimarron & carottes sans crème", portion: '280ml', calories: 115, proteins: 3, carbs: 22, fats: 1.5, category: 'dinner' },
      { id: 'ld-2', name: "Dos de lieu noir poché au court-bouillon & poireaux fondants", portion: '240g', calories: 180, proteins: 33, carbs: 7, fats: 2, category: 'dinner' },
      { id: 'ld-3', name: "Omelette légère aux herbes fraîches & salade verte croquante", portion: '180g', calories: 175, proteins: 15, carbs: 2, fats: 11, category: 'dinner' },
      { id: 'ld-4', name: "Bouillon thaï aux champignons shiitaké & dés de tofu soyeux", portion: '280ml', calories: 140, proteins: 12, carbs: 9, fats: 4.5, category: 'dinner' },
      { id: 'ld-5', name: "Blanc de poulet émincé à la vapeur & fleurettes de chou-fleur", portion: '240g', calories: 215, proteins: 38, carbs: 6, fats: 3.5, category: 'dinner' },
      { id: 'ld-6', name: "Soupe moulinée de légumes verts (courgettes, épinards, céleri)", portion: '300ml', calories: 95, proteins: 4, carbs: 16, fats: 1, category: 'dinner' },
      { id: 'ld-7', name: "Filet de colin d'Alaska vapeur & julienne de carottes et panais", portion: '230g', calories: 170, proteins: 30, carbs: 9, fats: 1.5, category: 'dinner' },
      { id: 'ld-8', name: "Wok d'aubergines rôties sans gras, ail & coriandre fraîche", portion: '220g', calories: 120, proteins: 3, carbs: 18, fats: 3, category: 'dinner' },
      { id: 'ld-9', name: "Papillote de truite bio au citron vert & épinards branches", portion: '220g', calories: 230, proteins: 28, carbs: 4, fats: 11, category: 'dinner' },
      { id: 'ld-10', name: "Salade tiède de lentilles vertes du Puy & dés d'échalote", portion: '190g', calories: 185, proteins: 12, carbs: 29, fats: 1.5, category: 'dinner' },
      { id: 'ld-11', name: "Tartare de concombre, menthe poivrée & yaourt de brebis 0%", portion: '180g', calories: 90, proteins: 7, carbs: 8, fats: 2, category: 'dinner' },
      { id: 'ld-12', name: "Escalope de veau grillée dégraissée & purée de céleri-rave", portion: '220g', calories: 220, proteins: 34, carbs: 8, fats: 5, category: 'dinner' },
      { id: 'ld-13', name: "Minestrone léger sans pâtes aux haricots blancs & blettes", portion: '280ml', calories: 140, proteins: 7, carbs: 22, fats: 2, category: 'dinner' },
      { id: 'ld-14', name: "Carpaccio de courgettes crues, filet de citron & 20g parmesan", portion: '150g', calories: 130, proteins: 8, carbs: 4, fats: 9, category: 'dinner' },
      { id: 'ld-15', name: "Infusion digestive camomille & verveine sans sucre", portion: '200ml', calories: 2, proteins: 0, carbs: 0.5, fats: 0, category: 'dinner' }
    ],
    snack: [
      { id: 'ls-1', name: "Pomme bio croquante & 8 amandes entières", portion: '160g', calories: 125, proteins: 3, carbs: 19, fats: 5, category: 'snack' },
      { id: 'ls-2', name: "Skyr nature 0% saupoudré de cannelle de Ceylan", portion: '150g', calories: 85, proteins: 16, carbs: 5, fats: 0.2, category: 'snack' },
      { id: 'ls-3', name: "Bâtonnets de carottes & concombre avec houmous léger", portion: '150g', calories: 110, proteins: 4, carbs: 14, fats: 4.5, category: 'snack' },
      { id: 'ls-4', name: "1 Œuf dur bio & pincée de sel aux herbes", portion: '60g', calories: 78, proteins: 6.5, carbs: 0.5, fats: 5.2, category: 'snack' },
      { id: 'ls-5', name: "2 Carrés de chocolat noir 85% aux éclats de fèves", portion: '20g', calories: 118, proteins: 2, carbs: 6, fats: 9.5, category: 'snack' },
      { id: 'ls-6', name: "Poire Conférence mûre & thé vert sencha", portion: '160g', calories: 88, proteins: 0.6, carbs: 22, fats: 0.2, category: 'snack' },
      { id: 'ls-7', name: "Fromage blanc 0% & graines de grenade fraîches", portion: '160g', calories: 105, proteins: 13, carbs: 11, fats: 0.3, category: 'snack' },
      { id: 'ls-8', name: "Une poignée de noix du Brésil (3 unités riches en sélénium)", portion: '15g', calories: 98, proteins: 2, carbs: 1.5, fats: 10, category: 'snack' },
      { id: 'ls-9', name: "Edamame vapeur salé à la fleur de sel", portion: '100g', calories: 120, proteins: 11, carbs: 9, fats: 5, category: 'snack' },
      { id: 'ls-10', name: "Rondelles de radis noir & fromage frais 0%", portion: '130g', calories: 65, proteins: 7, carbs: 6, fats: 0.5, category: 'snack' },
      { id: 'ls-11', name: "Shake de Whey Isolate neutre à l'eau de source", portion: '250ml', calories: 110, proteins: 25, carbs: 1, fats: 0.8, category: 'snack' },
      { id: 'ls-12', name: "Galette de riz complet multicéréales & purée d'amande", portion: '40g', calories: 130, proteins: 3.5, carbs: 18, fats: 5, category: 'snack' },
      { id: 'ls-13', name: "Kiwi vert riche en vitamine C & graines de chia", portion: '120g', calories: 80, proteins: 2, carbs: 16, fats: 1.5, category: 'snack' },
      { id: 'ls-14', name: "Cottage cheese 2% & ciboulette fraîche ciselée", portion: '120g', calories: 100, proteins: 14, carbs: 4, fats: 2.5, category: 'snack' },
      { id: 'ls-15', name: "Infusion détox gingembre, citron & menthe", portion: '250ml', calories: 5, proteins: 0.2, carbs: 1, fats: 0, category: 'snack' }
    ]
  },

  // OBJECTIF : PRENDRE DU POIDS / PRISE DE MASSE (Denses en nutriments, surplus calorique sain, anabolisme propre)
  gain: {
    breakfast: [
      { id: 'gb-1', name: "Porridge royal avoine, beurre de cacahuète & banane", portion: '240g', calories: 420, proteins: 16, carbs: 62, fats: 14, category: 'breakfast' },
      { id: 'gb-2', name: "3 Œufs entiers brouillés, toast au levain & avocat", portion: '230g', calories: 410, proteins: 24, carbs: 32, fats: 21, category: 'breakfast' },
      { id: 'gb-3', name: "Granola croustillant aux noix, yaourt grec 10% & miel", portion: '220g', calories: 430, proteins: 15, carbs: 54, fats: 18, category: 'breakfast' },
      { id: 'gb-4', name: "Pancakes complets à la farine d'avoine & sirop d'érable", portion: '200g', calories: 380, proteins: 14, carbs: 64, fats: 8, category: 'breakfast' },
      { id: 'gb-5', name: "Bagel complet, fromage frais crémeux & saumon fumé", portion: '180g', calories: 395, proteins: 23, carbs: 44, fats: 15, category: 'breakfast' },
      { id: 'gb-6', name: "Smoothie mass gainer (lait entier, avoine, banane, whey)", portion: '350ml', calories: 480, proteins: 36, carbs: 60, fats: 11, category: 'breakfast' },
      { id: 'gb-7', name: "Pain perdu maison au lait d'amande & amandes effilées", portion: '180g', calories: 360, proteins: 13, carbs: 50, fats: 12, category: 'breakfast' },
      { id: 'gb-8', name: "Omelette au fromage cheddar affiné, champignons & pain", portion: '220g', calories: 420, proteins: 26, carbs: 28, fats: 23, category: 'breakfast' },
      { id: 'gb-9', name: "Toast campagnard à la purée d'amande & compote de pomme", portion: '150g', calories: 330, proteins: 10, carbs: 46, fats: 13, category: 'breakfast' },
      { id: 'gb-10', name: "Muesli suisse traditionnel aux fruits secs & lait entier", portion: '250g', calories: 410, proteins: 14, carbs: 68, fats: 11, category: 'breakfast' },
      { id: 'gb-11', name: "Wrap complet aux œufs brouillés, haricots noirs & fromage", portion: '220g', calories: 430, proteins: 22, carbs: 48, fats: 17, category: 'breakfast' },
      { id: 'gb-12', name: "Overnight oats au chocolat noir 70% & graines de courge", portion: '220g', calories: 390, proteins: 15, carbs: 55, fats: 13, category: 'breakfast' },
      { id: 'gb-13', name: "Brioche dorée artisanale, beurre frais & confiture bio", portion: '140g', calories: 375, proteins: 8, carbs: 56, fats: 14, category: 'breakfast' },
      { id: 'gb-14', name: "Cottage cheese entier, dattes Medjool hachées & pistaches", portion: '190g', calories: 350, proteins: 20, carbs: 45, fats: 10, category: 'breakfast' },
      { id: 'gb-15', name: "Café au lait entier ou chocolat chaud crémeux", portion: '220ml', calories: 150, proteins: 8, carbs: 14, fats: 7, category: 'breakfast' }
    ],
    lunch: [
      { id: 'gl-1', name: "Steak de bœuf charolais 15% & frites de patates douces rôties", portion: '320g', calories: 540, proteins: 46, carbs: 52, fats: 16, category: 'lunch' },
      { id: 'gl-2', name: "Pavé de saumon atlantique poêlé, riz basmati & sauce aneth", portion: '300g', calories: 520, proteins: 38, carbs: 48, fats: 20, category: 'lunch' },
      { id: 'gl-3', name: "Pâtes complètes au poulet fermier, pesto genovese & parmesan", portion: '330g', calories: 560, proteins: 44, carbs: 58, fats: 18, category: 'lunch' },
      { id: 'gl-4', name: "Couscous royal semoule fine, bœuf, pois chiches & légumes", portion: '350g', calories: 580, proteins: 42, carbs: 74, fats: 14, category: 'lunch' },
      { id: 'gl-5', name: "Tajine de poulet aux pruneaux, amandes grillées & semoule", portion: '340g', calories: 550, proteins: 40, carbs: 64, fats: 16, category: 'lunch' },
      { id: 'gl-6', name: "Riz sauté à l'indonésienne (Nasi Goreng), poulet & œuf au plat", portion: '320g', calories: 510, proteins: 36, carbs: 60, fats: 15, category: 'lunch' },
      { id: 'gl-7', name: "Filet de thon rouge mi-cuit, quinoa & avocat en dés", portion: '290g', calories: 490, proteins: 42, carbs: 36, fats: 19, category: 'lunch' },
      { id: 'gl-8', name: "Burrito bowl : riz mexicain, steak haché, haricots rouges & cheddar", portion: '350g', calories: 570, proteins: 45, carbs: 62, fats: 17, category: 'lunch' },
      { id: 'gl-9', name: "Curry indien au poulet tikka, lait de coco & riz jasmin", portion: '340g', calories: 540, proteins: 38, carbs: 54, fats: 20, category: 'lunch' },
      { id: 'gl-10', name: "Cuisse de canard confite & pommes de terre sautées à l'ail", portion: '300g', calories: 590, proteins: 34, carbs: 42, fats: 32, category: 'lunch' },
      { id: 'gl-11', name: "Lentilles mijotées au jarret de veau & carottes fondantes", portion: '330g', calories: 480, proteins: 42, carbs: 48, fats: 12, category: 'lunch' },
      { id: 'gl-12', name: "Lasagnes artisanales à la bolognaise maison de bœuf", portion: '320g', calories: 530, proteins: 36, carbs: 52, fats: 20, category: 'lunch' },
      { id: 'gl-13', name: "Sauté de porc au caramel, riz gluant & graines de sésame", portion: '310g', calories: 510, proteins: 35, carbs: 58, fats: 15, category: 'lunch' },
      { id: 'gl-14', name: "Gnocchis au gorgonzola doux & noix concassées", portion: '280g', calories: 520, proteins: 18, carbs: 60, fats: 24, category: 'lunch' },
      { id: 'gl-15', name: "Sandwich baguette campagnarde au rôti de bœuf, cornichons & mayo", portion: '250g', calories: 490, proteins: 32, carbs: 54, fats: 16, category: 'lunch' }
    ],
    dinner: [
      { id: 'gd-1', name: "Filet de cabillaud en croûte d'amandes, purée de pommes de terre", portion: '300g', calories: 460, proteins: 36, carbs: 44, fats: 16, category: 'dinner' },
      { id: 'gd-2', name: "Risotto crémeux aux champignons cèpes, parmesan & huile d'olive", portion: '300g', calories: 480, proteins: 14, carbs: 66, fats: 18, category: 'dinner' },
      { id: 'gd-3', name: "Chili con carne généreux au bœuf haché, maïs & tortilla chips", portion: '330g', calories: 520, proteins: 40, carbs: 56, fats: 15, category: 'dinner' },
      { id: 'gd-4', name: "Poulet rôti au four avec sa peau dorée & patates sautées", portion: '320g', calories: 530, proteins: 46, carbs: 40, fats: 22, category: 'dinner' },
      { id: 'gd-5', name: "Soupe veloutée de châtaignes au lait de coco & graines toastées", portion: '300ml', calories: 340, proteins: 7, carbs: 48, fats: 14, category: 'dinner' },
      { id: 'gd-6', name: "Gratin dauphinois traditionnel au lait entier & fromage comté", portion: '250g', calories: 440, proteins: 12, carbs: 42, fats: 25, category: 'dinner' },
      { id: 'gd-7', name: "Nouilles udon sautées au bœuf émincé, sauce soja & sésame", portion: '320g', calories: 510, proteins: 34, carbs: 64, fats: 14, category: 'dinner' },
      { id: 'gd-8', name: "Omelette paysanne aux lardons fumés, pommes de terre & ciboulette", portion: '260g', calories: 460, proteins: 28, carbs: 24, fats: 28, category: 'dinner' },
      { id: 'gd-9', name: "Filet de truite grillé, polenta crémeuse au beurre & haricots verts", portion: '300g', calories: 470, proteins: 35, carbs: 46, fats: 16, category: 'dinner' },
      { id: 'gd-10', name: "Parmentier de canard confit maison & patate douce", portion: '300g', calories: 520, proteins: 32, carbs: 48, fats: 23, category: 'dinner' },
      { id: 'gd-11', name: "Bowl de quinoa, tofu croustillant à l'arachide & avocat", portion: '310g', calories: 480, proteins: 22, carbs: 52, fats: 21, category: 'dinner' },
      { id: 'gd-12', name: "Chorba algérienne consistante à la viande d'agneau & frik d'orge", portion: '320ml', calories: 380, proteins: 28, carbs: 38, fats: 12, category: 'dinner' },
      { id: 'gd-13', name: "Pavé de flétan rôti au beurre noisette & riz sauvage", portion: '280g', calories: 440, proteins: 36, carbs: 38, fats: 16, category: 'dinner' },
      { id: 'gd-14', name: "Ragoût de pois chiches aux saucisses de volaille & tomates", portion: '320g', calories: 490, proteins: 32, carbs: 48, fats: 18, category: 'dinner' },
      { id: 'gd-15', name: "Gâteau de semoule tiède au lait d'amande & raisins secs", portion: '180g', calories: 310, proteins: 8, carbs: 54, fats: 7, category: 'dinner' }
    ],
    snack: [
      { id: 'gs-1', name: "Sandwich au beurre de cacahuète crémeux & confiture de fraise", portion: '120g', calories: 340, proteins: 12, carbs: 42, fats: 15, category: 'snack' },
      { id: 'gs-2', name: "Mélange montagnard généreux (amandes, noix, noisettes, raisins)", portion: '60g', calories: 330, proteins: 9, carbs: 24, fats: 23, category: 'snack' },
      { id: 'gs-3', name: "Shake protéiné Whey + lait entier + banane mûre", portion: '300ml', calories: 360, proteins: 34, carbs: 38, fats: 9, category: 'snack' },
      { id: 'gs-4', name: "3 Dattes Medjool royales fourrées au beurre d'amande", portion: '90g', calories: 290, proteins: 6, carbs: 52, fats: 9, category: 'snack' },
      { id: 'gs-5', name: "Yaourt grec authentique 10% avec miel & noix de Grenoble", portion: '200g', calories: 320, proteins: 14, carbs: 24, fats: 19, category: 'snack' },
      { id: 'gs-6', name: "Barre protéinée gourmande avoine et pépites de chocolat", portion: '65g', calories: 260, proteins: 20, carbs: 26, fats: 8, category: 'snack' },
      { id: 'gs-7', name: "2 Bananes fraîches mûres avec carrés de chocolat noir", portion: '240g', calories: 270, proteins: 3, carbs: 58, fats: 5, category: 'snack' },
      { id: 'gs-8', name: "Fromage comté affiné 18 mois & pain aux noix", portion: '90g', calories: 340, proteins: 18, carbs: 22, fats: 21, category: 'snack' },
      { id: 'gs-9', name: "Biscuits complets à l'avoine & verre de lait entier", portion: '140g', calories: 290, proteins: 9, carbs: 40, fats: 11, category: 'snack' },
      { id: 'gs-10', name: "Tranche d'avocat toast sur pain campagnard aux graines", portion: '140g', calories: 290, proteins: 7, carbs: 26, fats: 18, category: 'snack' },
      { id: 'gs-11', name: "Smoothie mangue, fruit de la passion & lait de coco", portion: '280ml', calories: 260, proteins: 4, carbs: 38, fats: 11, category: 'snack' },
      { id: 'gs-12', name: "Boules énergétiques dattes, cacao cru & graines de tournesol", portion: '60g', calories: 240, proteins: 6, carbs: 32, fats: 10, category: 'snack' },
      { id: 'gs-13', name: "Cottage cheese avec tranches d'ananas frais & noix de pécan", portion: '180g', calories: 250, proteins: 16, carbs: 26, fats: 9, category: 'snack' },
      { id: 'gs-14', name: "Pain brioché toasté au chocolat fondu noir", portion: '90g', calories: 280, proteins: 6, carbs: 42, fats: 10, category: 'snack' },
      { id: 'gs-15', name: "Pudding de graines de lin et chia au lait d'avoine entier", portion: '180g', calories: 270, proteins: 9, carbs: 28, fats: 14, category: 'snack' }
    ]
  },

  // OBJECTIF : STABILISER LE POIDS (Équilibre parfait isocalorique, régulation de glycémie, long terme)
  maintain: {
    breakfast: [
      { id: 'mb-1', name: "Muesli floconneux aux fruits frais & yaourt nature", portion: '200g', calories: 270, proteins: 12, carbs: 44, fats: 6, category: 'breakfast' },
      { id: 'mb-2', name: "2 Œufs coque bio sur tartine de seigle grillée", portion: '150g', calories: 240, proteins: 16, carbs: 20, fats: 10, category: 'breakfast' },
      { id: 'mb-3', name: "Porridge d'avoine mi-eau mi-lait, pomme râpée & cannelle", portion: '220g', calories: 260, proteins: 9, carbs: 46, fats: 4.5, category: 'breakfast' },
      { id: 'mb-4', name: "Tartine d'avocat écrasé, filet de citron & graines de sésame", portion: '120g', calories: 230, proteins: 6, carbs: 24, fats: 12, category: 'breakfast' },
      { id: 'mb-5', name: "Fromage blanc 3% battu aux myrtilles & cerneaux de noix", portion: '190g', calories: 220, proteins: 16, carbs: 18, fats: 9, category: 'breakfast' },
      { id: 'mb-6', name: "Omelette aux fines herbes du jardin & tranches de tomate", portion: '170g', calories: 210, proteins: 15, carbs: 4, fats: 15, category: 'breakfast' },
      { id: 'mb-7', name: "Pancakes à la banane et flocons d'avoine sans sucre ajouté", portion: '160g', calories: 250, proteins: 9, carbs: 42, fats: 5, category: 'breakfast' },
      { id: 'mb-8', name: "Salade de fruits frais de saison & yaourt de brebis crémeux", portion: '220g', calories: 210, proteins: 8, carbs: 32, fats: 6, category: 'breakfast' },
      { id: 'mb-9', name: "Pain au levain frotté à la tomate, huile d'olive & jambon blanc", portion: '140g', calories: 260, proteins: 15, carbs: 30, fats: 9, category: 'breakfast' },
      { id: 'mb-10', name: "Chia pudding au lait de noisette & fraises fraîches", portion: '180g', calories: 220, proteins: 7, carbs: 24, fats: 11, category: 'breakfast' },
      { id: 'mb-11', name: "Tranche de saumon fumé sur blini de sarrasin maison", portion: '130g', calories: 240, proteins: 16, carbs: 18, fats: 11, category: 'breakfast' },
      { id: 'mb-12', name: "Smoothie équilibré banane, fraise, yaourt nature & épinards", portion: '280ml', calories: 210, proteins: 8, carbs: 38, fats: 3, category: 'breakfast' },
      { id: 'mb-13', name: "Biscottes intégrales aux céréales, beurre demi-sel & miel d'acacia", portion: '80g', calories: 240, proteins: 6, carbs: 38, fats: 8, category: 'breakfast' },
      { id: 'mb-14', name: "Cottage cheese léger sur galette d'épeautre & radis croquants", portion: '140g', calories: 190, proteins: 14, carbs: 20, fats: 4, category: 'breakfast' },
      { id: 'mb-15', name: "Café filtre pur arabica ou thé Earl Grey bergamote", portion: '200ml', calories: 3, proteins: 0.2, carbs: 0.5, fats: 0, category: 'breakfast' }
    ],
    lunch: [
      { id: 'ml-1', name: "Filet de poulet fermier rôti, riz semi-complet & courgettes poêlées", portion: '300g', calories: 410, proteins: 42, carbs: 44, fats: 7, category: 'lunch' },
      { id: 'ml-2', name: "Pavé de saumon grillé, purée de pois cassés & carottes vapeur", portion: '290g', calories: 440, proteins: 36, carbs: 34, fats: 17, category: 'lunch' },
      { id: 'ml-3', name: "Pâtes au coulis de tomates fraîches, basilic & dés de mozzarella", portion: '300g', calories: 430, proteins: 20, carbs: 58, fats: 13, category: 'lunch' },
      { id: 'ml-4', name: "Steak haché 5% façon bistrot, pommes grenaille & salade verte", portion: '280g', calories: 420, proteins: 38, carbs: 36, fats: 12, category: 'lunch' },
      { id: 'ml-5', name: "Couscous équilibré aux légumes du soleil & blancs de dinde", portion: '320g', calories: 430, proteins: 38, carbs: 54, fats: 7, category: 'lunch' },
      { id: 'ml-6', name: "Bowl de quinoa, pois chiches rôtis, avocat & sauce tahini", portion: '300g', calories: 420, proteins: 16, carbs: 52, fats: 16, category: 'lunch' },
      { id: 'ml-7', name: "Filet de merlu blanc au four, riz pilaf & poivrons grillés", portion: '280g', calories: 380, proteins: 34, carbs: 42, fats: 8, category: 'lunch' },
      { id: 'ml-8', name: "Wok de crevettes marinées au gingembre, nouilles soba de sarrasin", portion: '290g', calories: 390, proteins: 30, carbs: 52, fats: 6, category: 'lunch' },
      { id: 'ml-9', name: "Tajine de veau printanier aux petits pois, carottes & coriandre", portion: '310g', calories: 440, proteins: 38, carbs: 32, fats: 16, category: 'lunch' },
      { id: 'ml-10', name: "Salade niçoise traditionnelle au thon germon, haricots & œuf dur", portion: '280g', calories: 390, proteins: 32, carbs: 18, fats: 19, category: 'lunch' },
      { id: 'ml-11', name: "Émincé de porc au curry doux, riz basmati & brocolis vapeur", portion: '290g', calories: 420, proteins: 36, carbs: 46, fats: 10, category: 'lunch' },
      { id: 'ml-12', name: "Dahl indien de lentilles jaunes crémeux & galette naan complet", portion: '300g', calories: 410, proteins: 18, carbs: 62, fats: 9, category: 'lunch' },
      { id: 'ml-13', name: "Filet de canette rôtie sans gras & purée de carottes au cumin", portion: '270g', calories: 390, proteins: 36, carbs: 24, fats: 15, category: 'lunch' },
      { id: 'ml-14', name: "Omelette espagnole (Tortilla) maison & salade de roquette", portion: '250g', calories: 380, proteins: 18, carbs: 30, fats: 20, category: 'lunch' },
      { id: 'ml-15', name: "Tartre de bœuf au couteau assaisonné & salade mélangée", portion: '240g', calories: 350, proteins: 38, carbs: 6, fats: 19, category: 'lunch' }
    ],
    dinner: [
      { id: 'md-1', name: "Dos de cabillaud vapeur, fondue de poireaux & pommes de terre", portion: '280g', calories: 320, proteins: 34, carbs: 28, fats: 6, category: 'dinner' },
      { id: 'md-2', name: "Velouté de légumes anciens (panais, carotte, courge) & croûtons", portion: '300ml', calories: 230, proteins: 6, carbs: 38, fats: 6, category: 'dinner' },
      { id: 'md-3', name: "Omelette roulée aux champignons de Paris & salade verte", portion: '200g', calories: 260, proteins: 18, carbs: 4, fats: 19, category: 'dinner' },
      { id: 'md-4', name: "Blanc de poulet poché au bouillon de légumes & riz brun", portion: '260g', calories: 340, proteins: 38, carbs: 34, fats: 5, category: 'dinner' },
      { id: 'md-5', name: "Chorba légère de légumes, pois chiches & fines herbes", portion: '300ml', calories: 260, proteins: 12, carbs: 40, fats: 5, category: 'dinner' },
      { id: 'md-6', name: "Pavé de truite poêlée sur lit d'épinards frais à la crème légère", portion: '250g', calories: 340, proteins: 30, carbs: 6, fats: 20, category: 'dinner' },
      { id: 'md-7', name: "Salade tiède de lentilles du Puy, carottes fondantes & feta", portion: '240g', calories: 310, proteins: 17, carbs: 36, fats: 11, category: 'dinner' },
      { id: 'md-8', name: "Gratin de courgettes au parmesan & chapelure dorée", portion: '230g', calories: 240, proteins: 11, carbs: 18, fats: 14, category: 'dinner' },
      { id: 'md-9', name: "Bouillon asiatique aux crevettes roses, bok choy & coriandre", portion: '300ml', calories: 220, proteins: 24, carbs: 14, fats: 4, category: 'dinner' },
      { id: 'md-10', name: "Tofu sauté aux petits légumes croquants & graines de sésame", portion: '250g', calories: 280, proteins: 20, carbs: 16, fats: 14, category: 'dinner' },
      { id: 'md-11', name: "Escalope de dinde grillée au jus & purée de potimarron", portion: '260g', calories: 290, proteins: 36, carbs: 22, fats: 5, category: 'dinner' },
      { id: 'md-12', name: "Minestrone traditionnel aux légumes & haricots borlotti", portion: '300ml', calories: 240, proteins: 10, carbs: 38, fats: 4, category: 'dinner' },
      { id: 'md-13', name: "Papillote de colin au romarin & tomates rôties au four", portion: '240g', calories: 210, proteins: 32, carbs: 8, fats: 4, category: 'dinner' },
      { id: 'md-14', name: "Salade de quinoa aux herbes fraîches, concombre & grenade", portion: '220g', calories: 270, proteins: 9, carbs: 42, fats: 7, category: 'dinner' },
      { id: 'md-15', name: "Compote de pommes maison sans sucre ajouté & tisane tilleul", portion: '160g', calories: 95, proteins: 0.5, carbs: 23, fats: 0.2, category: 'dinner' }
    ],
    snack: [
      { id: 'ms-1', name: "Pomme bio croquante & poignée de noisettes fraîches", portion: '170g', calories: 180, proteins: 4, carbs: 22, fats: 9, category: 'snack' },
      { id: 'ms-2', name: "Yaourt nature au lait entier avec 1 cuillère de miel", portion: '150g', calories: 150, proteins: 6, carbs: 18, fats: 5, category: 'snack' },
      { id: 'ms-3', name: "2 Dattes deglet nour & 6 amandes croquantes", portion: '50g', calories: 160, proteins: 3, carbs: 28, fats: 5, category: 'snack' },
      { id: 'ms-4', name: "Fromage blanc fermier & compote de poires maison", portion: '180g', calories: 160, proteins: 14, carbs: 18, fats: 3, category: 'snack' },
      { id: 'ms-5', name: "2 Carrés de chocolat noir 70% & thé blanc", portion: '20g', calories: 115, proteins: 2, carbs: 8, fats: 8.5, category: 'snack' },
      { id: 'ms-6', name: "Tranche de pain complet au levain & fromage de chèvre frais", portion: '80g', calories: 175, proteins: 8, carbs: 22, fats: 6, category: 'snack' },
      { id: 'ms-7', name: "Banane fraîche mûre & infusion menthe poivrée", portion: '150g', calories: 135, proteins: 1.5, carbs: 32, fats: 0.4, category: 'snack' },
      { id: 'ms-8', name: "Houmous classique & fleurettes de chou-fleur ou carottes", portion: '140g', calories: 155, proteins: 6, carbs: 16, fats: 8, category: 'snack' },
      { id: 'ms-9', name: "Poignée de graines de courge et de tournesol toastées", portion: '25g', calories: 140, proteins: 7, carbs: 4, fats: 11, category: 'snack' },
      { id: 'ms-10', name: "Smoothie aux myrtilles sauvages & lait d'amande", portion: '220ml', calories: 130, proteins: 3, carbs: 24, fats: 2.5, category: 'snack' },
      { id: 'ms-11', name: "1 Œuf dur avec sel aux herbes & tranche de tomate", portion: '100g', calories: 95, proteins: 7, carbs: 2, fats: 6, category: 'snack' },
      { id: 'ms-12', name: "Cottage cheese léger aux dés de pêche fraîche", portion: '160g', calories: 140, proteins: 15, carbs: 14, fats: 2, category: 'snack' },
      { id: 'ms-13', name: "Galette de maïs soufflé bio & fine couche de purée de noisette", portion: '40g', calories: 160, proteins: 4, carbs: 20, fats: 7, category: 'snack' },
      { id: 'ms-14', name: "Grappe de raisin blanc frais & quelques noix de Grenoble", portion: '140g', calories: 170, proteins: 3, carbs: 26, fats: 7, category: 'snack' },
      { id: 'ms-15', name: "Infusion rooibos vanille & biscuit sec à l'épeautre", portion: '100g', calories: 110, proteins: 2, carbs: 19, fats: 3, category: 'snack' }
    ]
  }
};

export const MealComposerTab: React.FC<MealComposerTabProps> = ({
  profile,
  nutritionEntries,
  theme,
  t,
  onAddNutrition,
  onDeleteNutrition
}) => {
  const goal: WeightGoalType = profile.weightGoal || 'lose';
  const [today,setToday]=useState(localDate());
  useEffect(()=>{const refresh=()=>setToday(localDate());const timer=window.setInterval(refresh,1000);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);};},[]);
  useEffect(()=>{setPortions({});setJustAddedId(null);setJustAddedMessage('');},[today]);

  // Active Meal Period (breakfast, lunch, dinner, snack)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [justAddedMessage, setJustAddedMessage] = useState('');
  
  // Custom portion quantity overrides (itemId -> quantity in grams/ml)
  const [portions, setPortions] = useState<Record<string, string>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Custom Dish Creator state
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPortion, setCustomPortion] = useState('150');
  const [customCalories, setCustomCalories] = useState('250');
  const [customProteins, setCustomProteins] = useState('20');
  const [customCarbs, setCustomCarbs] = useState('25');
  const [customFats, setCustomFats] = useState('7');

  // Exact 15 foods for the active goal and active meal time
  const currentCatalog = useMemo(() => {
    const list = GOAL_FOOD_CATALOG[goal]?.[selectedMealType] || GOAL_FOOD_CATALOG.lose[selectedMealType];
    return list;
  }, [goal, selectedMealType]);

  // Compute daily totals
  const todayEntries = useMemo(() => {
    return nutritionEntries.filter(entry => entry.date === today);
  }, [nutritionEntries, today]);

  const todayCalories = todayEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const todayProteins = Math.round(todayEntries.reduce((sum, e) => sum + (e.proteins || 0), 0));
  const todayCarbs = Math.round(todayEntries.reduce((sum, e) => sum + (e.carbs || 0), 0));
  const todayFats = Math.round(todayEntries.reduce((sum, e) => sum + (e.fats || 0), 0));

  const targetCalories = nutritionTarget(profile).calories;

  // Parse portion number in grams/ml
  const getPortionMultiplier = (itemId: string, defaultPortion: string) => {
    const entered = portions[itemId];
    if (!entered) return 1;
    const num = parseLocalizedNumber(entered);
    const defaultNum = parseFloat(defaultPortion.replace(/[^0-9.]/g, '')) || 100;
    if (!num || isNaN(num) || defaultNum <= 0) return 1;
    return num / defaultNum;
  };

  const handleAddFoodItem = (food: FoodItem) => {
    if(portions[food.id]&&(parseLocalizedNumber(portions[food.id])===null||parseLocalizedNumber(portions[food.id])!<=0||parseLocalizedNumber(portions[food.id])!>5000)){setJustAddedMessage('Saisissez une quantité entre 1 et 5000 g ou ml.');return;}
    const mult = getPortionMultiplier(food.id, food.portion);
    const actualPortion = portions[food.id] 
      ? `${portions[food.id]}${food.portion.includes('ml')?'ml':'g'}` 
      : food.portion;

    const calculatedCalories = Math.round(food.calories * mult);
    const calculatedProteins = +(food.proteins * mult).toFixed(1);
    const calculatedCarbs = +(food.carbs * mult).toFixed(1);
    const calculatedFats = +(food.fats * mult).toFixed(1);

    const newEntry: NutritionEntry = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: today,
      mealType: selectedMealType,
      name: food.name,
      portion: actualPortion,
      calories: calculatedCalories,
      proteins: calculatedProteins,
      carbs: calculatedCarbs,
      fats: calculatedFats,
      category: food.category,
      imageUrl: foodPhoto({ name: food.name, category: food.category }).src,
      scannedWithAI: false
    };

    onAddNutrition(newEntry);
    setJustAddedMessage(`${food.name} ajouté à votre repas.`);
    setJustAddedId(food.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const cal = parseInt(customCalories, 10) || 200;
    const prot = parseFloat(customProteins) || 15;
    const carb = parseFloat(customCarbs) || 20;
    const fat = parseFloat(customFats) || 5;

    const newEntry: NutritionEntry = {
      id: `custom_${Date.now()}`,
      date: today,
      mealType: selectedMealType,
      name: customName.trim(),
      portion: `${customPortion}g`,
      calories: cal,
      proteins: prot,
      carbs: carb,
      fats: fat,
      category: selectedMealType,
      imageUrl: foodPhoto({ name: customName, category: selectedMealType }).src,
      scannedWithAI: false
    };

    onAddNutrition(newEntry);
    setJustAddedMessage(`${newEntry.name} ajouté à votre repas.`);
    setIsCustomOpen(false);
    setCustomName('');
  };

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, NutritionEntry[]> = {};
    [...nutritionEntries].filter(entry=>entry.date!==today).reverse().forEach(entry => {
      const d = entry.date || today;
      if (!groups[d]) groups[d] = [];
      groups[d].push(entry);
    });
    return groups;
  }, [nutritionEntries, today]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner: Composer vos plats & Daily Overview */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${theme.primaryBg}`}>
                <Utensils className="w-5 h-5 text-white" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                {t.navComposeMeals || "Composer vos plats"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {t.composeMealsSubtitle || "Sélectionnez vos aliments, ajustez vos quantités pour calculer automatiquement les calories et nutriments selon votre objectif, et suivez l'historique de vos repas."}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">Votre repère : environ {targetCalories} kcal/jour, selon votre {nutritionTarget(profile).measured?'métabolisme lu sur InBody':'profil'} et votre objectif. Reste aujourd’hui : {Math.max(0,targetCalories-todayCalories)} kcal.</p>
          {/* Goal Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              goal === 'gain' 
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' 
                : goal === 'maintain' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {goal === 'gain' ? (t.goalGain || 'Prise de poids') : goal === 'maintain' ? (t.goalMaintain || 'Stabilisation') : (t.goalLose || 'Perte de poids')}
            </span>
          </div>
        </div>

        {/* Daily Calorie & Macro Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Calories</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-bold text-white">
              {todayCalories} <span className="text-xs font-normal text-slate-400">/ {targetCalories} kcal</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((todayCalories / targetCalories) * 100))}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">Protéines</div>
            <div className="text-lg font-bold text-sky-400">
              {todayProteins}g
            </div>
            <span className="text-[10px] text-slate-500">Maintien musculaire</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">Glucides</div>
            <div className="text-lg font-bold text-amber-400">
              {todayCarbs}g
            </div>
            <span className="text-[10px] text-slate-500">Énergie & glycogène</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 mb-1">Lipides</div>
            <div className="text-lg font-bold text-emerald-400">
              {todayFats}g
            </div>
            <span className="text-[10px] text-slate-500">Énergie & équilibre</span>
          </div>
        </div>
      </div>

      {/* Main Meal Composer Studio */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl`}>
        {/* Meal Period Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t.foodIdeasFor || "Idées d'aliments pour le"}</span>
              <span className="text-rose-400 capitalize">
                {selectedMealType === 'breakfast' ? (t.periodBreakfast || 'Petit-déjeuner') : selectedMealType === 'lunch' ? (t.periodLunch || 'Déjeuner') : selectedMealType === 'snack' ? 'Pause de l’après-midi' : (t.periodDinner || 'Dîner')}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.mealPortionNotice || "Ajustez la quantité en grammes ou ml : les calories et macros sont recalculées en temps réel."}
            </p>
          </div>

          {/* Meal Period Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
            {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setSelectedMealType(type); setJustAddedMessage(''); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedMealType === type
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'breakfast' ? (t.periodBreakfast || 'Petit-déjeuner') : type === 'lunch' ? (t.periodLunch || 'Déjeuner') : type === 'snack' ? 'Pause de l’après-midi' : (t.periodDinner || 'Dîner')}<span className="block mt-1 text-[10px]">{todayEntries.filter(e=>e.mealType===type).length} aliment(s) · {todayEntries.filter(e=>e.mealType===type).reduce((sum,e)=>sum+e.calories,0)} kcal</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
          <h4 className="font-bold">Mon repas · {todayEntries.filter(e=>e.mealType===selectedMealType).reduce((n,e)=>n+e.calories,0)} kcal</h4>
          {todayEntries.filter(e=>e.mealType===selectedMealType).length===0 ? <p className="text-sm">Choisissez vos aliments ci-dessous.</p> : todayEntries.filter(e=>e.mealType===selectedMealType).map(entry=><div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-slate-800 p-3 text-sm"><span>{entry.name}<small className="block">{entry.portion} · {entry.calories} kcal</small></span><button aria-label={`Retirer ${entry.name}`} onClick={()=>onDeleteNutrition(entry.id)} className="rounded-lg p-2 text-rose-600"><Trash2 size={16}/></button></div>)}
        </div>
        {justAddedMessage && <p role="status" className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{justAddedMessage}</p>}
        {/* Add a custom meal without a redundant search bar */}
        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 whitespace-nowrap transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.customDishBtn || "Plat personnalisé"}</span>
          </button>
        </div>

        {/* Custom Dish Creator Modal/Form */}
        {isCustomOpen && (
          <form onSubmit={handleAddCustomMeal} className="mb-6 p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                {t.addCustomFoodTitle || "Ajouter un plat personnalisé"}
              </h4>
              <button type="button" onClick={() => setIsCustomOpen(false)} className="text-xs text-slate-400 hover:text-white">
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Nom du plat (ex: Gratin de légumes...)"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Portion (g)"
                  value={customPortion}
                  onChange={e => setCustomPortion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Calories"
                  value={customCalories}
                  onChange={e => setCustomCalories(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Protéines (g)"
                  value={customProteins}
                  onChange={e => setCustomProteins(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full h-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 15 Foods Grid according to User Objective */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentCatalog.map((food, index) => {
            const mult = getPortionMultiplier(food.id, food.portion);
            const cal = Math.round(food.calories * mult);
            const prot = +(food.proteins * mult).toFixed(1);
            const carb = +(food.carbs * mult).toFixed(1);
            const fat = +(food.fats * mult).toFixed(1);
            const isJustAdded = todayEntries.some(entry=>entry.mealType===selectedMealType&&entry.name===food.name);

            return (
              <div 
                key={food.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <img src={foodPhoto({name:food.name,category:food.category}).src} alt={food.name} loading="lazy" className="mb-3 h-32 w-full rounded-xl border border-slate-800 bg-slate-900 object-cover" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition leading-snug">
                        {food.name}
                      </h4>
                    </div>
                  </div>

                  {/* Quantity and Portion Input */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Portion :</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={food.portion}
                        value={portions[food.id] || ''}
                        aria-label={`Quantité de ${food.name} en ${food.portion.includes('ml') ? 'ml' : 'g'}`}
                        onChange={e => {
                          const val = e.target.value;
                          setPortions(prev => ({ ...prev, [food.id]: val }));
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                      <span className="text-[10px] text-slate-400">
                        {food.portion.includes('ml') ? 'ml' : 'g'}
                      </span>
                    </div>
                  </div>

                  {/* Calories & Macros summary */}
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-bold text-rose-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{cal} kcal</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-sky-300">{prot}g P</span>
                      <span>•</span>
                      <span className="text-amber-300">{carb}g G</span>
                      <span>•</span>
                      <span className="text-emerald-300">{fat}g L</span>
                    </div>
                  </div>
                </div>

                {/* Add to Today's Log Button */}
                <button
                  type="button"
                  onClick={() => handleAddFoodItem(food)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isJustAdded 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                      : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ajouté au journal !</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter à mon repas</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Journal & History Section */}
      <div className={`p-5 sm:p-6 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t.mealHistoryTitle || "Repas des jours précédents"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {nutritionEntries.length} {t.mealsLoggedCount || "repas enregistrés"}
          </span>
        </div>

        {Object.keys(groupedHistory).length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {t.noMealsLoggedYet || "Aucun aliment ou repas enregistré. Choisissez vos aliments ci-dessus pour composer vos assiettes !"}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-200">
                    {date === today ? (t.todayLabel || "Aujourd'hui") : date}
                  </span>
                  <span className="text-rose-400 font-bold">
                    Total : {entries.reduce((acc, e) => acc + (e.calories || 0), 0)} kcal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entries.map(entry => (
                    <div 
                      key={entry.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-white truncate">{entry.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {entry.portion} • <strong className="text-rose-400">{entry.calories} kcal</strong>
                          {entry.proteins ? ` • ${entry.proteins}g P` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteNutrition(entry.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
