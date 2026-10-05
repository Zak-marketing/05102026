import type { FoodItem } from '../types';

// Photographs on Wikimedia Commons explicitly marked CC0. These are
// category illustrations, not photos of the exact recipe or purchased food.
// File pages and authors remain accessible from the expanded food card.
const photoFiles = {
  oats: 'Fruit and Honey French Oatmeal 2.jpg', eggs: 'Egg and spinach breakfast omelet.jpg',
  salmon: 'Grilled plated salmon fillet.jpg', chicken: 'Chicken breast on vegetables - Massachusetts.jpg',
  rice: '804Cooked rice.jpg', salad: 'Salad Bowl (Unsplash).jpg',
  soup: 'Picture of Vegetable Soup.jpg', lentils: 'Lentil soup, Hattenheim.jpg',
  tofu: 'ToFu Salad.jpg', nuts: 'Mixed Nuts (Alabama Extension).jpg',
  apple: 'Apples fruit.jpg', banana: 'Banana pic.jpg',
  yogurt: 'Strawberries & Yogurt.jpg', bread: 'Freshippo whole wheat soft bread.jpg',
  coffee: 'Cup Coffee.jpg', quinoa: 'Quinoa Salad, Vegan and Pasta @ Wikimania Montréal 2017.jpg',
  pasta: 'Pasta picture.jpg', beef: 'Grilled beef lunch of Matsuya.jpg',
} as const;

export function foodPhoto(item: Pick<FoodItem, 'name' | 'category'>) {
  const name = item.name.toLowerCase();
  let key: keyof typeof photoFiles =
    /avoine|porridge|flocon/.test(name) ? 'oats' :
    /œuf|omelette|idli/.test(name) ? 'eggs' :
    /saumon|cabillaud|sardine|thon/.test(name) ? 'salmon' :
    /poulet|dinde/.test(name) ? 'chicken' :
    /lentille|dal|chorba/.test(name) ? 'lentils' :
    /tofu|miso/.test(name) ? 'tofu' :
    /amande|noix|datte|abricot/.test(name) ? 'nuts' :
    /pomme|poire|papaye|mandarine/.test(name) ? 'apple' :
    /banane|mangue/.test(name) ? 'banana' :
    /yaourt|skyr|fromage blanc|lait/.test(name) ? 'yogurt' :
    /pain|tartine|toast/.test(name) ? 'bread' :
    /café|thé/.test(name) ? 'coffee' :
    /quinoa|couscous/.test(name) ? 'quinoa' :
    /pâte/.test(name) ? 'pasta' :
    /bœuf/.test(name) ? 'beef' :
    /soupe|velouté/.test(name) ? 'soup' :
    /riz|haricot/.test(name) ? 'rice' : 'salad';
  if (/salade|légume|brocoli|courgette|carotte/.test(name)) key = 'salad';
  const file = photoFiles[key];
  const page = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(' ', '_'))}`;
  const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=480`;
  return { src, page };
}
