# Configuration et publication

## Lancer le projet dans Google AI Studio
1. Importer les fichiers du ZIP. Node 22.13 minimum (ou Node 24) pour node:sqlite.
2. npm ci, puis npm run dev. Le serveur server.ts sert les API et la page.
3. Définir GEMINI_API_KEY côté serveur. Le modèle image par défaut est gemini-3.1-flash-image, configurable via GEMINI_IMAGE_MODEL. Le compte Google doit avoir accès au modèle et un quota suffisant.
4. Définir GOOGLE_CLOUD_TRANSLATE_API_KEY si la traduction distante est utilisée.
5. Définir STRIPE_SECRET_KEY et STRIPE_PRICE_SCAN_MEALS, STRIPE_PRICE_PROGRESS_VIDEO, STRIPE_PRICE_COMPLETE_PACK pour les tarifs mensuels (3,99 / 3,99 / 6,99 EUR). Le bouton prépare une session Checkout avec retour automatique vers l’écran d’origine; le serveur confirme le paiement avant activation. Vérifier ce parcours avec une carte de test avant d’utiliser les clés de production.
6. APP_URL: adresse HTTPS publique de l’application et du serveur. DISABLE_HMR peut être false (développement) ou true si l’aperçu en a besoin.
7. AURASLIM_ADMIN_PASSWORD: secret personnel aléatoire d’au moins 20 caractères, jamais dans le code client. AURASLIM_DATA_DIR: chemin d’un volume privé persistant sur l’hébergement.
8. /auraslim-api/status confirme la présence des clés; ce contrôle ne prouve pas que le quota/modèle fonctionne. Scanner un vrai plat et un vrai relevé, puis tester une vraie génération objectif.

## Favori administrateur
Ajouter /#admin à l’adresse de l’application, par exemple l’adresse affichée dans la barre Chrome suivie de /#admin. Si cette adresse a déjà un fragment après #, le remplacer par admin. Le lien exact dépend de votre déploiement; aucun domaine public n’est inventé ici. Le secret admin reste nécessaire.

## Version mobile native
Les dossiers android/ et ios/ sont générés et le plugin notifications y est enregistré. Ils ne constituent pas un AAB/IPA signé.
- Définir APP_URL avec le site HTTPS et le serveur Express déployés avant npx cap sync: la version native charge cette application sécurisée et utilise ses API. Sans APP_URL, les fichiers web embarqués fonctionnent pour l’interface mais les API Node n’existent pas dans le téléphone.
- npm run build, puis npx cap sync.
- npx cap open android: compiler/signature AAB avec Android Studio et compte Google Play.
- npx cap open ios: compiler/signature et soumission avec Xcode sur Mac et compte Apple Developer.
- Remplacer les icônes par celles de la marque et confirmer l’identifiant com.growfasterwithia.auraslim avant première publication.
- Tester caméra, import galerie, notifications, refus des autorisations, fermeture de l’app, redémarrage, fuseaux horaires, vidéo, suppression/export de données, accessibilité et connexion lente sur appareils réels.
- Les notifications récurrentes natives sont programmées auprès du système après autorisation. Le mode économie d’énergie et les réglages du téléphone peuvent retarder les alertes. Dans un simple navigateur, les rappels horaires nécessitent que la page reste ouverte; le service worker permet d’afficher une notification système mais ne planifie pas des rappels hors ligne.

## Points à finaliser avant les boutiques
- Achats numériques natifs: les abonnements Stripe existants sont pour le web. Intégrer et valider les achats intégrés Apple/Google, produits et vérification serveur, ou une exception de distribution applicable, avant la vente d’options dans les apps natives. Ce ZIP n’intègre pas StoreKit/Play Billing.
- Compte utilisateur: authentification, récupération et quotas liés à un compte côté serveur restent à prévoir pour empêcher qu’un essai gratuit soit relancé en effaçant les données du navigateur.
- Protection des données: publier une politique complète avec identité/contact de l’éditeur, finalités, fondements, conservation, transferts vers Google, sous-traitants, droits et suppression serveur, protections et sauvegardes. Les données locales ne sont pas un coffre chiffré; le schéma masque l’écran uniquement. La désactivation du partage supprime la fiche administrateur mais pas les obligations de conservation légale des paiements.
- Faire contrôler les déclarations Health apps/Data safety et App Privacy, les transferts internationaux, les textes de consentement et les règles des pays de distribution. Les anciens badges « 100% conforme » ont été retirés. Aucun certificat juridique universel n’est annoncé.
- Faire revoir les conseils par un professionnel de nutrition/activité. Les chiffres sont des repères, les lectures IA doivent être confirmées sur le relevé original. Aucune estimation photographique ne peut être exacte à 100 %.
- Les textes français encore présents dans plusieurs modules doivent être révisés pour chaque langue commercialisée, même si la salutation suit la langue de l’utilisateur.
- Audit de sécurité, test de restauration des sauvegardes, signature et tests de distribution avant soumission. Une compilation web réussie ne vaut pas validation App Store/Play Store.
