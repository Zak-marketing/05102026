import type { FoodItem } from '../types';

export function foodPortion(item: FoodItem, userInput?: string) {
  const reference = Number.parseFloat(item.portion.replace(',', '.')) || 100;
  // The catalogue value, visible below the name, must equal the initial input.
  // Weight goals change the daily budget, never the recorded portion by stealth.
  const quantity = userInput === undefined ? reference : Number(userInput);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 2000) return null;
  const ratio = quantity / reference;
  return {
    quantity,
    calories: Math.round(item.calories * ratio),
    proteins: Math.round(item.proteins * ratio * 10) / 10,
    carbs: Math.round(item.carbs * ratio * 10) / 10,
    fats: Math.round(item.fats * ratio * 10) / 10
  };
}
