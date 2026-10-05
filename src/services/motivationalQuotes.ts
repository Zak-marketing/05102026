/**
 * Daily motivational quotes service that rotates automatically each day of the year
 * and adapts to the user's preferred language.
 */

export interface MotivationalQuote {
  quote: string;
  author: string;
}

const quotesFr: MotivationalQuote[] = [
  { quote: "Chaque petit pas compte vers la meilleure version de vous-même.", author: "AuraSlim" },
  { quote: "La discipline et la régularité battent toujours la motivation passagère.", author: "AuraSlim" },
  { quote: "Votre corps vous remerciera demain pour les choix sains que vous faites aujourd'hui.", author: "AuraSlim" },
  { quote: "Un jour ou premier jour ? Vous avancez avec brio, continuez ainsi !", author: "AuraSlim" },
  { quote: "L'important n'est pas d'aller vite, mais de ne jamais abandonner.", author: "AuraSlim" },
  { quote: "70% de la réussite se construit dans l'assiette et dans l'esprit. Vous avez ce pouvoir !", author: "AuraSlim" },
  { quote: "Célébrez chaque victoire, même discrète : les grands résultats sont l'addition de petits efforts.", author: "AuraSlim" },
  { quote: "La patience est la clé des transformations durables.", author: "AuraSlim" },
  { quote: "Ne comparez pas votre chapitre 1 au chapitre 20 de quelqu'un d'autre. Votre parcours est unique.", author: "AuraSlim" },
  { quote: "Une bonne hydratation, un bon sommeil et un repas équilibré : vous avez les clés en main.", author: "AuraSlim" },
  { quote: "Chaque pesée est une donnée d'apprentissage, jamais un jugement.", author: "AuraSlim" },
  { quote: "Ce que vous faites aujourd'hui détermine votre silhouette de demain.", author: "AuraSlim" },
  { quote: "Faites confiance au processus : la régularité transforme tout.", author: "AuraSlim" },
  { quote: "Respirez, buvez un grand verre d'eau et gardez votre cap avec sérénité.", author: "AuraSlim" }
];

const quotesEn: MotivationalQuote[] = [
  { quote: "Every small step counts towards the best version of yourself.", author: "AuraSlim" },
  { quote: "Consistency and discipline always beat temporary motivation.", author: "AuraSlim" },
  { quote: "Your body will thank you tomorrow for the healthy choices you make today.", author: "AuraSlim" },
  { quote: "One day or day one? You are making great progress, keep going!", author: "AuraSlim" },
  { quote: "It doesn't matter how slowly you go, as long as you do not stop.", author: "AuraSlim" },
  { quote: "70% of success is built in your meals and your mindset. You have the power!", author: "AuraSlim" },
  { quote: "Celebrate every small win: great results are the sum of small efforts.", author: "AuraSlim" },
  { quote: "Patience is the foundation of lasting physical transformation.", author: "AuraSlim" },
  { quote: "Don't compare your chapter 1 to someone else's chapter 20. Your journey is unique.", author: "AuraSlim" },
  { quote: "Great hydration, sound sleep, and balanced nutrition: you hold all the keys.", author: "AuraSlim" },
  { quote: "Every weigh-in is simply feedback, never a verdict.", author: "AuraSlim" },
  { quote: "What you choose today shapes how vibrant you feel tomorrow.", author: "AuraSlim" },
  { quote: "Trust the process: dedication turns effort into lasting lifestyle.", author: "AuraSlim" },
  { quote: "Take a deep breath, drink fresh water, and stay focused on your vision.", author: "AuraSlim" }
];

const quotesEs: MotivationalQuote[] = [
  { quote: "Cada pequeño paso cuenta hacia la mejor versión de ti mismo.", author: "AuraSlim" },
  { quote: "La disciplina y la constancia siempre vencen a la motivación pasajera.", author: "AuraSlim" },
  { quote: "Tu cuerpo te agradecerá mañana las elecciones saludables que haces hoy.", author: "AuraSlim" },
  { quote: "¡Confía en el proceso y celebra cada progreso!", author: "AuraSlim" },
  { quote: "Lo importante no es la rapidez, sino la constancia y no rendirse nunca.", author: "AuraSlim" }
];

const quotesDe: MotivationalQuote[] = [
  { quote: "Jeder kleine Schritt zählt auf dem Weg zu deiner besten Version.", author: "AuraSlim" },
  { quote: "Disziplin und Beständigkeit schlagen immer flüchtige Motivation.", author: "AuraSlim" },
  { quote: "Dein Körper wird dir morgen für die gesunden Entscheidungen von heute danken.", author: "AuraSlim" },
  { quote: "Vertraue dem Prozess: Ausdauer verwandelt Bemühungen in dauerhaften Erfolg.", author: "AuraSlim" }
];

const quotesIt: MotivationalQuote[] = [
  { quote: "Ogni piccolo passo conta verso la migliore versione di te stesso.", author: "AuraSlim" },
  { quote: "La costanza e la disciplina battono sempre la motivazione passeggera.", author: "AuraSlim" },
  { quote: "Il tuo corpo ti ringrazierà domani per le scelte sane che fai oggi.", author: "AuraSlim" },
  { quote: "Abbi fiducia nel percorso: ogni giorno ti avvicina al tuo traguardo.", author: "AuraSlim" }
];

const quotesPt: MotivationalQuote[] = [
  { quote: "Cada pequeno passo conta para a melhor versão de si mesmo.", author: "AuraSlim" },
  { quote: "A disciplina e a constância sempre superam a motivação passageira.", author: "AuraSlim" },
  { quote: "O seu corpo agradecerá amanhã pelas escolhas saudáveis de hoje.", author: "AuraSlim" },
  { quote: "Confie no processo: cada dia é uma vitória em direção ao seu objetivo.", author: "AuraSlim" }
];

const quotesAr: MotivationalQuote[] = [
  { quote: "كل خطوة صغيرة تقربك من أفضل نسخة من نفسك.", author: "AuraSlim" },
  { quote: "الاستمرارية والانضباط يصنعان دائماً الفارق الحقيقي.", author: "AuraSlim" },
  { quote: "جسدك سيشكرك غداً على خياراتك الصحية اليوم.", author: "AuraSlim" },
  { quote: "ثق برحلتك وواصل التقدم، فأنت على الطريق الصحيح.", author: "AuraSlim" }
];

const quotesZh: MotivationalQuote[] = [
  { quote: "通往更好自己的路上，每一个微小的坚持都至关重要。", author: "AuraSlim" },
  { quote: "自律与持续的坚持，终将超越一时的热情。", author: "AuraSlim" },
  { quote: "今天的自律与健康选择，定会收获明天更健康的身体。", author: "AuraSlim" },
  { quote: "相信积累的力量，稳步迈向您的理想目标。", author: "AuraSlim" }
];

const quotesJa: MotivationalQuote[] = [
  { quote: "毎日の小さな一歩が、最高の自分をつくり上げます。", author: "AuraSlim" },
  { quote: "継続と規律こそが、確かな成果を生み出します。", author: "AuraSlim" },
  { quote: "今日の健康的な選択が、明日のあなたを輝かせます。", author: "AuraSlim" },
  { quote: "焦らず一歩ずつ、確実に理想のゴールへ近づいています。", author: "AuraSlim" }
];

const quotesRu: MotivationalQuote[] = [
  { quote: "Каждый маленький шаг приближает вас к лучшей версии себя.", author: "AuraSlim" },
  { quote: "Дисциплина и постоянство всегда превосходят временную мотивацию.", author: "AuraSlim" },
  { quote: "Ваше тело скажет спасибо завтра за здоровые решения сегодня.", author: "AuraSlim" },
  { quote: "Доверяйте процессу: вы уверенно идете к поставленной цели.", author: "AuraSlim" }
];

const quoteCollections: Record<string, MotivationalQuote[]> = {
  fr: quotesFr,
  en: quotesEn,
  es: quotesEs,
  de: quotesDe,
  it: quotesIt,
  pt: quotesPt,
  ar: quotesAr,
  zh: quotesZh,
  ja: quotesJa,
  ru: quotesRu
};

/**
 * Returns today's motivational quote for the given language.
 * Changes daily based on day of year.
 */
export function getDailyMotivationalQuote(language: string = 'fr'): MotivationalQuote {
  const collection = quoteCollections[language] || (language === 'fr' ? quotesFr : quotesEn);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % collection.length;
  return collection[index] || collection[0];
}
