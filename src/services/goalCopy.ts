const copy: Record<string, [string, string, string, string, string, string, string, string]> = {
  fr: ['Votre objectif', 'Perdre du poids', 'Prendre du poids', 'à perdre', 'à prendre', 'Chaque petit pas compte. Avancez à votre rythme et restez régulier.', 'Saisissez une adresse email au format valide.', 'Saisissez un numéro de téléphone valide pour cet indicatif.'],
  en: ['Your goal', 'Lose weight', 'Gain weight', 'to lose', 'to gain', 'Every small step counts. Keep going at your own pace and stay consistent.', 'Enter a valid email address.', 'Enter a valid phone number for this calling code.'],
  es: ['Tu objetivo', 'Perder peso', 'Ganar peso', 'por perder', 'por ganar', 'Cada paso cuenta. Avanza a tu ritmo y sé constante.', 'Introduce un correo electrónico válido.', 'Introduce un número de teléfono válido para este prefijo.'],
  de: ['Dein Ziel', 'Gewicht verlieren', 'Gewicht zunehmen', 'abzunehmen', 'zuzunehmen', 'Jeder kleine Schritt zählt. Bleib in deinem Tempo dabei.', 'Gib eine gültige E-Mail-Adresse ein.', 'Gib eine gültige Telefonnummer für diese Vorwahl ein.'],
  it: ['Il tuo obiettivo', 'Perdere peso', 'Aumentare di peso', 'da perdere', 'da aumentare', 'Ogni piccolo passo conta. Procedi con calma e costanza.', 'Inserisci un indirizzo email valido.', 'Inserisci un numero di telefono valido per questo prefisso.'],
  pt: ['Seu objetivo', 'Perder peso', 'Ganhar peso', 'a perder', 'a ganhar', 'Cada pequeno passo conta. Siga no seu ritmo com constância.', 'Digite um email válido.', 'Digite um telefone válido para este código.'],
  ar: ['هدفك', 'فقدان الوزن', 'زيادة الوزن', 'لخسارتها', 'لاكتسابها', 'كل خطوة صغيرة مهمة. تقدّم بوتيرتك وحافظ على الاستمرار.', 'أدخل عنوان بريد إلكتروني صالحًا.', 'أدخل رقم هاتف صحيحًا لهذا الرمز.'],
  zh: ['你的目标', '减重', '增重', '需要减去', '需要增加', '每一小步都重要。按照自己的节奏，坚持下去。', '请输入有效的电子邮箱。', '请输入该区号对应的有效电话号码。'],
  ja: ['あなたの目標', '減量', '増量', '減らす量', '増やす量', '小さな一歩が大切です。自分のペースで続けましょう。', '有効なメールアドレスを入力してください。', 'この国番号の有効な電話番号を入力してください。'],
  ru: ['Ваша цель', 'Снизить вес', 'Набрать вес', 'нужно сбросить', 'нужно набрать', 'Каждый шаг важен. Двигайтесь в своём темпе и сохраняйте регулярность.', 'Введите действительный адрес электронной почты.', 'Введите действительный номер телефона для этого кода.']
};
const encouragement: Record<string, [string, string]> = {
  fr: ['Votre solde = objectif quotidien − calories des repas + activité enregistrée. Il guide le choix du prochain repas, sans remplacer vos sensations de faim ou un avis médical. Chaque repas est une nouvelle occasion d’avancer.', 'Chaque verre d’eau noté est un pas vers votre objectif personnel. Pensez à boire régulièrement selon votre soif.'],
  en: ['Your balance = daily target − calories logged from meals + recorded activity. Use it to plan your next meal while listening to your hunger and fullness. Every meal is a fresh start.', 'Every glass you log is a step toward your personal goal. Drink regularly according to your thirst.'],
  es: ['Tu saldo = objetivo diario − calorías de las comidas + actividad registrada. Úsalo para organizar la próxima comida y escucha tu apetito. Cada comida es una nueva oportunidad.', 'Cada vaso registrado te acerca a tu objetivo. Bebe regularmente según tu sed.'],
  de: ['Dein Rest = Tagesziel − erfasste Mahlzeiten + erfasste Aktivität. Nutze ihn als Orientierung und achte auf Hunger und Sättigung. Jede Mahlzeit ist eine neue Chance.', 'Jedes eingetragene Glas ist ein Schritt zu deinem persönlichen Ziel. Trinke nach deinem Durst.'],
  it: ['Il saldo = obiettivo giornaliero − calorie dei pasti + attività registrata. Usalo come guida e ascolta fame e sazietà. Ogni pasto è una nuova occasione.', 'Ogni bicchiere registrato ti avvicina al tuo obiettivo personale. Bevi secondo la tua sete.'],
  pt: ['Saldo = meta diária − calorias dos alimentos + atividade registrada. Use-o como referência e respeite sua fome e saciedade. Cada refeição é uma nova oportunidade.', 'Cada copo registrado é um passo rumo à sua meta pessoal. Beba conforme sua sede.'],
  ar: ['الرصيد = الهدف اليومي − سعرات الوجبات المسجلة + النشاط المسجل. استخدمه كدليل مع مراعاة الجوع والشبع. كل وجبة فرصة جديدة.', 'كل كوب تسجله خطوة نحو هدفك الشخصي. اشرب بانتظام حسب شعورك بالعطش.'],
  zh: ['剩余热量 = 每日目标 − 已记录的餐食热量 + 已记录的运动消耗。用它安排下一餐，也要留意饥饿和饱腹感。每一餐都是新机会。', '记录每一杯水，逐步接近个人目标。按照口渴程度规律饮水。'],
  ja: ['残りの目安 = 1日の目標 − 記録した食事のカロリー + 記録した活動量。空腹感も大切にしながら次の食事の参考にしましょう。', '水を記録するたびに目標に近づきます。喉の渇きに合わせて水分を取りましょう。'],
  ru: ['Остаток = дневная цель − калории записанных блюд + записанная активность. Используйте его как ориентир, прислушиваясь к голоду и насыщению.', 'Каждый отмеченный стакан воды — шаг к вашей цели. Пейте регулярно, ориентируясь на жажду.']
};
export function goalCopy(language: string) {
  const [title, lose, gain, lossDelta, gainDelta, motivation, invalidEmail, invalidPhone] = copy[language] || copy.en;
  const [calorieGuide, waterGuide] = encouragement[language] || encouragement.en;
  return { title, lose, gain, lossDelta, gainDelta, motivation, invalidEmail, invalidPhone, calorieGuide, waterGuide };
}
