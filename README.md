# AuraSlim — version Web à tester avant publication

Projet extrait de la version la plus récente fournie par l'utilisateur, complété pour un test Web. **Cette archive n'est pas une application Android/iOS distribuable et n'est pas prête pour les boutiques.** Lire `AVANT_PUBLICATION.md` avant toute mise en ligne.

## Démarrage sur PC

1. Installer Node.js et exécuter `npm install` dans ce dossier.
2. Copier `.env.example` vers `.env` et renseigner les variables utiles en gardant les clés privées sur le serveur.
3. Exécuter `npm run dev` puis ouvrir `http://localhost:3000`.
4. Contrôler le code avec `npm run lint`, `npm run build`, `node --import tsx scripts/smoke-api.mjs`, `node --import tsx scripts/smoke-vite.mjs`, `node --import tsx scripts/smoke-meal.mjs`, `node --import tsx scripts/smoke-scan-routing.mjs`, `node --import tsx scripts/smoke-translation-gemini.mjs`, `node --import tsx scripts/smoke-admin.mjs`, puis `node scripts/verify-pdf.mjs`.
5. Pour servir la version compilée : `npm run build` puis `npm start`.

Pour tester sur téléphone/tablette, héberger la version Web sous HTTPS. La caméra et le microphone demandent l'accord du navigateur et du système. La capture mobile par champ fichier dépend de l'appareil et du navigateur ; sur PC elle peut ouvrir un sélecteur de fichiers.

## Essais recommandés

- Inscription : le logo et la langue sont visibles dès le premier écran. Dix dictionnaires sont inclus localement. Avec un serveur accessible et sa clé Gemini, le choix propose **30 langues associées à 30 pays distincts** ; Cloud Translation configuré peut en proposer davantage. Une nouvelle langue n'est appliquée qu'après traduction complète du dictionnaire par le serveur. Les pays/territoires (245) utilisent une liste avec drapeaux emoji ; les indicatifs viennent des métadonnées libphonenumber et le numéro saisi doit correspondre à l'indicatif choisi. L'email et le téléphone sont obligatoires et validés sur leur format, **sans preuve de délivrabilité ni vérification SMS/email**. L'adresse email ne crée pas encore un compte connecté au serveur.
- Objectif : choisir prise ou perte de poids à la première étape, puis modifier âge, taille et poids. Effacer entièrement les valeurs proposées et saisir par exemple **90,5 kg → 95,5 kg** en mode prise de poids ; la virgule et le point sont acceptés. La cible indique les kilos visés et la motivation dans les dix langues incluses ; la cible doit être cohérente avec le sens choisi. Comparer ensuite la photo Jour 1 et créer et confirmer un schéma, ou passer cette étape.
- Pesées : en saisir deux le même jour, par exemple 90 kg puis 87 kg. Vérifier graphique, historique, galerie et PDF. La dictée utilise la reconnaissance vocale disponible dans le navigateur.
- Nutrition : plus de dix suggestions par période, des exemples régionaux pour certains pays et des photographies réelles CC0 de catégories alimentaires, chargées depuis Wikimedia Commons (connexion Internet nécessaire). La portion indiquée et le grammage initial du champ sont identiques ; changer la quantité recalcule calories et macronutriments. Une phrase localisée s'affiche en choisissant matin, midi, soir ou collation. Composer les repas, retirer un élément et consulter l'historique. Le scan vérifie d'abord que le serveur JSON et sa clé Gemini répondent **avant d'envoyer une photo**. L'IA nomme séparément les aliments visibles, estime portions, calories et macronutriments, puis propose « Écouter les aliments » lorsque la synthèse vocale du navigateur existe. Sans serveur ou clé, un diagnostic explicite remplace tout faux résultat. Ces données sont des **estimations indicatives**, pas des portions prescrites ou validées par un diététicien ; valider les catalogues et conseils avec un professionnel avant de les présenter comme tels.
- Photos : Jour 1, puis deux autres photos gratuites (prise de pesée ou galerie). Tester comparaison, lecture, téléchargement et partage de la vidéo : chaque photo est gardée au moins 2 secondes à l'export. La vidéo utilise `MediaRecorder` et le format offert dépend du navigateur.
- Eau : choisir la cible et enregistrer ses verres. Paramètres : langue, devise, schéma, rappels, connexion Bluetooth standard si disponible, export JSON des données et suppression locale.

Les images et pesées sont conservées sur **cet appareil** dans IndexedDB ; elles ne sont pas synchronisées entre appareils et peuvent être effacées par le navigateur. Sauvegarder le JSON depuis Paramètres. Le schéma protège l'affichage mais ne chiffre pas la base locale. Si le partage administrateur est activé dans Paramètres, une **copie limitée du suivi** (coordonnées déclarées, mesures, repas, eau, nombre de photos) est envoyée au serveur ; les images et notes ne le sont pas.

## Stripe — paiement et retour à l’écran d’origine

| Option | Prix mensuel | Variable serveur |
| --- | ---: | --- |
| Scan Repas | 3,99 € | `STRIPE_PRICE_SCAN_MEALS` |
| Galerie Progrès et vidéo | 3,99 € | `STRIPE_PRICE_PROGRESS_VIDEO` |
| Pack Complet | 6,99 € | `STRIPE_PRICE_COMPLETE_PACK` |

Le bouton appelle `/auraslim-api/checkout` pour créer une session Stripe Checkout. L’application garde l’onglet et la position dans la page; le serveur prépare les adresses de succès et d’annulation pour revenir à cet écran. Dans une page web normale, le paiement s’ouvre dans le même onglet. Dans un aperçu intégré, il s’ouvre dans un onglet séparé pour éviter d’afficher Stripe dans une iframe.

Configurer `STRIPE_SECRET_KEY` et les trois `STRIPE_PRICE_*` dans le même compte Stripe et le même mode (test pour vos essais). Les tarifs doivent être mensuels, actifs et correspondre au tableau. `APP_URL`, si définie, doit utiliser la même origine HTTPS que la page de l’application. Sans elle, le serveur utilise son adresse HTTPS ou localhost. Aucun réglage « Après paiement » d’un ancien Payment Link n’est nécessaire pour ce nouveau bouton.

Après redirection, `/auraslim-api/entitlement` vérifie la session, son lien avec le navigateur, le paiement et l’abonnement avant activation. Une annulation garde l’offre actuelle. En cas de confirmation retardée, le bouton « Vérifier le paiement » relance le contrôle. Ni un paramètre `payment_success=true`, ni une offre gardée dans le stockage local ne suffisent à activer Premium. Les anciennes URL restent uniquement pour reconnaître les abonnements de liens de paiement déjà existants.

Le tableau admin affiche la dernière vérification. Les renouvellements automatiques et la restauration sur un autre appareil nécessitent un webhook et des comptes utilisateurs vérifiés. Pour les achats des applications distribuées dans les boutiques mobiles, voir `AVANT_PUBLICATION.md`.

Vérification locale : `node --import tsx scripts/verify-followup.mts` (Stripe simulé). Un paiement de test sur votre compte reste à effectuer pour confirmer les clés, les tarifs et l’adresse publique.

## Administration et invitations gratuites

1. Sur le **serveur uniquement**, définir `AURASLIM_ADMIN_PASSWORD` (secret unique d'au moins 20 caractères) et `AURASLIM_DATA_DIR` (volume privé et persistant). Ne jamais enregistrer ces valeurs dans GitHub ou le code de l'application. Redémarrer le serveur ; ouvrir `https://votre-domaine/admin` et se connecter.
2. Pour offrir l'application, choisir l'offre et la durée (1 à 90 jours), créer un code puis le copier immédiatement : son texte n'est affiché qu'une seule fois. La personne le saisit dans **Paramètres → Mon offre → Code d'essai**. L'accès est associé à ce navigateur, commence à l'activation, expire automatiquement et peut être révoqué dans l'espace admin. Il ne crée **aucun abonnement Stripe** et ne demande aucune carte.
3. Pour voir un suivi individuel, la personne active volontairement **Paramètres → Partage facultatif avec l’administrateur**. L'admin reçoit coordonnées, pays, objectif, pesées, menus, calories, hydratation et nombre de photos. Retirer l'autorisation efface cette fiche du serveur. Si l'admin efface une fiche alors que le partage reste actif sur l'appareil, elle reviendra lors de la prochaine synchronisation ; faire retirer le consentement dans l'application. Les photos et notes personnelles ne sont pas transmises. Les coordonnées ne sont pas vérifiées par email ni SMS.

Dans l'aperçu **Google AI Studio**, l'API est montée dans `server.ts` et dans le Vite de ce projet. Vérifier **dans l'aperçu réellement lancé** que `/auraslim-api/status` ou `/api/status` renvoie du JSON avec `ai: true`. Si les deux chemins affichent le HTML de l'application, l'hébergement a lancé seulement la page et pas notre serveur : le scan ne peut pas fonctionner tant que ce routage n'est pas réparé dans ce projet AI Studio. Définir `AURASLIM_ADMIN_PASSWORD` comme **secret côté serveur** (au moins 20 caractères ; valeur créée par vous), puis ouvrir `/admin` dans la barre de chemin de l'aperçu. Le tableau s'actualise toutes les 15 secondes pendant que l'onglet est visible, selon la dernière synchronisation volontaire de chaque utilisateur. Si le suivi ne s'affiche pas, vérifier l'autorisation de partage sur l'appareil client et la réponse JSON de `/auraslim-api/admin/session`. L'aperçu AI Studio ne garantit pas la persistance de SQLite : pour suivre des utilisateurs sur la durée ou sur plusieurs instances, héberger le serveur avec un volume privé persistant (`AURASLIM_DATA_DIR`), sauvegardes et authentification adaptée. Ne jamais saisir le mot de passe dans le code ou dans GitHub.

Les codes internes sont adaptés à un essai Web sur un appareil. Stripe peut aussi proposer des essais d'abonnement et des codes promotionnels configurés sur ses Payment Links, mais il faut alors configurer et vérifier ces offres dans Stripe. Sauvegarder et protéger le fichier SQLite sur le volume serveur, limiter l'accès administratif et préparer une politique de confidentialité, une durée de conservation et des demandes d'accès/suppression avant un lancement public. Le stockage AI Studio de prévisualisation n'est pas un volume persistant garanti.

### Connexion Bluetooth et rappels

Dans Paramètres, « Associer un appareil Bluetooth » propose les appareils BLE visibles par un navigateur compatible (HTTPS, permission utilisateur). Si l'appareil expose les services standards batterie ou fréquence cardiaque, AuraSlim peut les lire pendant la connexion. Les appareils qui nécessitent un protocole privé ou une application du fabricant ne sont pas synchronisés. « Tester un rappel » envoie une notification **au navigateur de cet appareil** ; sa transmission vers une montre dépend des réglages du téléphone et du fabricant, et n'est pas garantie par la connexion BLE. Pour des notifications sur Apple Watch et Wear OS lorsque l'application est fermée, prévoir une application mobile native et ses services de notifications.

## Import dans Google AI Studio

Décompresser ce ZIP ; déposer **tous les fichiers et les dossiers `src/`, `server/` et `scripts/`** dans un dépôt GitHub privé (racine du projet, pas le ZIP seul et pas `node_modules/`, `dist/`, ni `.env`). La route du scan a besoin de `server/api.ts` **et** `vite.config.ts`. Si l'application Google AI Studio est déjà reliée à ce dépôt, ouvrir **Settings → GitHub** et **récupérer les changements depuis GitHub** dans le projet existant ; examiner tout éventuel conflit avant d'accepter. Pour une copie séparée : **Build → + → Import from GitHub**. Vérifier que l'aperçu utilise bien le nouveau commit, puis refaire le test du scan. La version sur GitHub ne se met pas à jour toute seule après des modifications dans AI Studio : exporter les changements à nouveau si nécessaire.

## Limites de cette version de test

Un véritable compte utilisateur avec vérification d'email, sauvegarde chiffrée, restauration entre appareils, webhooks Stripe, contrôle serveur des quotas gratuits, notifications lorsque l'application est fermée, intégrations natives des montres, vérification humaine des traductions et tests sur de vrais appareils sont encore nécessaires avant publication. Le mot de passe admin protège uniquement l'interface serveur, pas les données locales des utilisateurs. Dix dictionnaires sont livrés ; les vingt autres langues de base nécessitent un serveur Gemini disponible, ou Cloud Translation configuré. Des textes écrits directement après inscription et le catalogue de plats restent en français : **aucune traduction intégrale de tous les écrans n'est revendiquée**. Les drapeaux emoji dépendent du rendu du système ; la webcam PC dans un aperçu intégré dépend du navigateur, de HTTPS et des permissions du cadre. Les photos de Wikimedia Commons illustrent des catégories et ne représentent pas nécessairement les produits indiqués. La conversion de devise n'est pas disponible par défaut avec les trois liens en euros.
