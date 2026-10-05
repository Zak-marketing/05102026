# Corrections AuraSlim — 5 octobre 2026

## Changements livrés

- **Jours de suivi** : chaque ligne de l’historique affiche « Jour 1 », « Jour 2 », etc., calculé depuis la date de la première pesée. Deux pesées le même jour gardent le même numéro; les jours sans pesée sont comptés. L’ordre chronologique est commun au graphique et à l’historique. Le badge « Départ / Inscription » n’est plus affiché.
- **Retour après paiement** : le bouton crée désormais une session Stripe Checkout avec une adresse de retour vers l’onglet d’origine. La position dans la page est conservée sur cet appareil. Le paiement et l’abonnement sont vérifiés par le serveur avant activation; une annulation ramène aussi à l’onglet d’origine. En cas de délai de confirmation, un bouton permet de vérifier à nouveau. L’ancien déblocage automatique au simple retour sur la fenêtre a été supprimé.
- **Photo objectif IA** : la case de confirmation « corps entier » a été retirée. Après consentement explicite à l’envoi, l’IA vérifie le cadrage; si les pieds ou le corps sont coupés, l’utilisateur peut changer la photo ou poursuivre sans illustration. Les photos sont allégées, les erreurs de taille sont renvoyées en JSON et la réponse Gemini est demandée au format image.
- **Tableau de bord** : suppression du groupe de trois chiffres répétés. Le poids de départ reste dans sa carte, le poids actuel dans la carte d’objectif, et la cible avec le reste à perdre dans l’objectif actif. La carte d’ambition mène directement au plan, avec une marge sous l’en-tête fixe.
- **Graphique et photos** : les pesées avec photo affichent une vignette cliquable; le comparateur avant/après ouvre les deux photos en grand. « Remplir 100 % » recadre maintenant l’image et « Photo entière » la contient sans recadrage. Une photo entière est recommandée, mais n’est plus imposée pour enregistrer une photo de suivi.
- **Plats et PDF** : le catalogue des plats présente les photos associées aux aliments; la portion reste saisissable et recalcule les calories. Le bilan PDF ajoute des vignettes sur la courbe et les photos de progression datées avec le poids.
- **Bluetooth** : connexion BLE native Android/iOS aux capteurs exposant les profils standard fréquence cardiaque ou balance. L’application n’affiche plus de données simulées comme si elles venaient d’une montre. Les notifications sont de vraies notifications locales du téléphone ; leur duplication vers une montre dépend du système et de l’application compagnon.
- **Objectifs** : les cibles hebdomadaires suivent maintenant perte, prise ou stabilisation. La stabilisation vise un poids stable et affiche l’écart à la cible ; ses préréglages ne parlent plus de perte.
- **Traductions** : les langues disponibles utilisent le dictionnaire complet du serveur, avec Google Cloud Translate ou Gemini comme moteur. Les paramètres et textes longs se replient sur plusieurs lignes sur petit écran au lieu d’être coupés.

## Configuration requise

Sur le serveur, configurez `GEMINI_API_KEY`. Le modèle image par défaut est `gemini-3.1-flash-image`; si nécessaire, définissez `GEMINI_IMAGE_MODEL` avec un modèle image autorisé par cette clé. Une clé `GOOGLE_CLOUD_TRANSLATE_API_KEY` reste facultative : Gemini peut traduire le dictionnaire complet.

Pour le paiement, configurez `STRIPE_SECRET_KEY` et les trois `STRIPE_PRICE_*` avec les tarifs mensuels correspondant aux offres (3,99 / 3,99 / 6,99 EUR). `APP_URL`, si renseignée, doit utiliser l’origine HTTPS de l’application ouverte par l’utilisateur. Sans cette variable, le serveur peut utiliser sa propre adresse HTTPS ou localhost. Les liens de paiement statiques ne sont plus utilisés par le bouton de l’application. Dans un aperçu intégré, le paiement s’ouvre dans un onglet séparé; hors aperçu, il s’ouvre dans l’onglet courant.

Le Bluetooth nécessite l’application native Android/iOS, le Bluetooth et les autorisations du système, ainsi qu’un appareil BLE qui expose l’un des profils standard pris en charge. Les montres Apple, Garmin et Fitbit ne donnent pas toutes directement accès à leurs données par BLE standard; leurs intégrations officielles et les API Santé ne sont pas incluses dans ce correctif.

## Vérifications effectuées le 5 octobre

- `npm run lint` — réussi
- `npm run build` — réussi
- `npx cap sync` — réussi pour Android et iOS
- Vérifications API (cadrage automatique, consentement, retour image, repas, InBody) — réussies avec réponses IA simulées
- `node --import tsx scripts/verify-followup.mts` — historique rendu en français, jours calendaires, sauvegarde de l’écran et de sa position, redirections succès/annulation, refus de paiement non confirmé et vérification d’appareil; Stripe simulé
- Génération du PDF — réussie avec photo de départ et vignettes

Les appels Gemini et Stripe réels, les autorisations sur un téléphone physique et l’appairage avec un modèle précis de montre ou de balance restent à vérifier sur les comptes et appareils de destination.
