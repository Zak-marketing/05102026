# AuraSlim — corrections du 5 octobre 2026

## Changements appliqués
- Nouveau volet Bilan & Rapports. Suppression du bilan sur le dashboard et sur le scan; suppression de la mention « IMC certifié » du dashboard.
- Le calculateur contient le scan photo, sa période de repas, son résultat et l’activation de l’offre. Les repas validés alimentent Composer vos plats.
- Composer vos plats affiche le bilan quotidien, les périodes avec leurs totaux, les aliments du repas actif à côté du catalogue, et un historique des jours précédents. Le bouton d’un aliment enregistré reste vert. À minuit local les listes quotidiennes et portions saisies repartent à zéro; les jours précédents sont conservés.
- Une quantité invalide est refusée; les calories et nutriments évoluent avec les grammes ou ml. Les calories journalières utilisent le BMR du dernier InBody disponible, ou les mesures du profil, et l’objectif actif; elles ne suivent pas arbitrairement une ambition rapide.
- Remplacement du bloc de projection et de son simulateur par une ambition utilisateur: poids souhaité à quatre semaines, date finale souhaitée, conseils simples. Aucun délai final n’est imposé. La courbe affiche uniquement les pesées réelles.
- Une fois le poids cible atteint ou dépassé dans le sens de l’objectif, proposition explicite du mode stabilisation. L’utilisateur l’active pour adapter les calories, repas et conseils.
- Correction du mode clair/sombre, y compris la variante dark Tailwind et les textes des boutons d’hydratation.
- Bonjour/Hello/مرحباً suit la langue du profil; suppression du nom d’exemple. Affichage compact dans le bandeau mobile.
- Photos: photo de corps entier recommandée, mais pas exigée pour poursuivre ni enregistrer une photo de suivi; visage facultatif/masqué; possibilité de changer la photo initiale ou actuelle. Le comparateur conserve sa poignée centrale, permet d’agrandir chaque photo et applique correctement les modes « Remplir 100 % » et « Photo entière ».
- Photo objectif: le vrai modèle image Gemini est appelé côté serveur après consentement; l’IA vérifie automatiquement le cadrage et invite à changer une photo coupée, sans bloquer l’accès au tableau de bord. L’image est allégée et les erreurs du serveur sont renvoyées en JSON. Une erreur ne copie jamais la photo initiale en prétendant la générer. Le visuel objectif reste exclu de la vidéo chronologique réelle.
- Courbe de poids et bilan PDF: miniatures cliquables sur les pesées avec photos; le PDF affiche les photos de progression avec date et poids lorsqu’elles sont enregistrées.
- Composer vos plats: photos associées aux aliments et portion éditable qui met à jour calories et nutriments.
- InBody: suppression du formulaire manuel de sexe, mesures et notes. Lecture IA automatique, aperçu des mesures principales et validation avant enregistrement. Les mesures manquantes restent absentes; aucun muscle, BMR ou score fictif. L’eau corporelle du relevé n’est plus confondue avec une quantité d’eau à boire.
- Paramètres en menus repliables; rappels et tests regroupés; partage facultatif placé dans Mes données. Suppression de la devise, des boutons Admin et Nouveau test et du téléchargement du code source. Export/import conserve aussi les relevés InBody. La suppression des données reste disponible dans Mes données.
- Admin accessible par /#admin même sans inscription client. Authentification serveur conservée, suppression du mot de passe public par défaut; AURASLIM_ADMIN_PASSWORD est obligatoire.
- Sécurité: contrôles d’origine des requêtes sensibles, réponses privées sans cache, secret IA uniquement serveur, validation des entrées et résultats InBody, délais d’appel IA. Suppression du code qui modifiait nginx à l’exécution.
- Projets Capacitor Android et iOS inclus, plugin Local Notifications branché aux rappels récurrents et aux tests. Permissions caméra et notifications Android, descriptions d’accès caméra/photos iOS, HTTP non chiffré et sauvegarde automatique Android désactivés.

## Ajouts : historique et paiement
- L’historique affiche « Jour N » depuis la première pesée, avec le même numéro pour deux pesées le même jour. Le badge d’inscription répété a été retiré.
- Le bouton paiement crée une session Checkout avec retour automatique vers l’onglet d’origine et conservation de la position dans la page sur cet appareil.
- L’activation exige une vérification du règlement côté serveur. Un simple retour dans l’application ou un paramètre d’URL ne débloque plus une offre. Une annulation retourne également à l’écran d’origine.

## Validation effectuée
- Interface mobile 390 px : aucune erreur JavaScript, aucun débordement horizontal; scan sans bilan ni historique; ajout d’un aliment confirmé en vert; paramètres repliés et accès admin absent.
- Suppression de la remise à zéro automatique de l’ancien mode test pour préserver les données au rechargement.
- TypeScript: npm run lint.
- Production web: npm run build.
- Synchronisation des projets Android et iOS: npx cap sync.
- Vérifications des jours et du rendu de l’historique, des adresses Stripe de succès/annulation et des refus de paiement non confirmé ou lié à un autre appareil (Stripe simulé).
- Neuf vérifications des routes API avec fournisseur IA simulé: consentement, cadrage incomplet, retour image, absence d’image, incohérence de l’objectif, extraction InBody, rejet de valeurs hors plage, scan des aliments, admin désactivé sans secret.
- Les appels IA réels, paiements Stripe réels, caméra physique et notifications sur téléphones ne sont pas validés ici: aucun secret de production ni appareil physique n’a été fourni.

## Limites explicites
Une taille et un poids ne déterminent pas exactement l’apparence d’un corps. Une illustration IA ne garantit pas une fidélité de 99/100 %, ni la disparition d’une zone corporelle précise. Une photo de repas ne mesure pas l’huile cachée ni le poids exact des ingrédients. Le logiciel n’est pas un nutritionniste certifié; le PDF est un bilan personnel.
Les contours pointillés facultatifs des zones du corps ne sont pas ajoutés, car ils suggéreraient une perte localisée que les mesures ne permettent pas de prévoir.
La validation de publication sur les stores et la conformité à toutes les lois ne peuvent pas être garanties par ce ZIP. Les éléments à finaliser figurent dans AVANT_PUBLICATION.md.
