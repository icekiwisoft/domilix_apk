# Backlog — app mobile Domilix

Entrées priorisées (P0 bloquant, P1, P2). Identifiants : `B-xx` bug, `UI-xx` écart visuel, `F-xx`
fonctionnalité. Une entrée n'est développée qu'une fois son lot validé par l'utilisateur.
Sources : utilisateur, audit QA, revues. Règles : `docs/LECONS-EQUIPE.md`.

## Bugs signalés par l'utilisateur (2026-10-28)

### B-01 — La localisation ne fonctionne pas (P0)

- **Constat (utilisateur)** : « the locations does not function ».
- **Piste (lecture du code, non vérifiée sur l'appareil)** : toute la géolocalisation passe par
  Geoapify (`services/geoapify.service.ts`) : « Utiliser ma position » à l'étape 3 de création
  (`reverseGeocode`) et l'autocomplétion d'adresse (`components/forms/address-autocomplete.tsx`).
  La clé est lue dans `EXPO_PUBLIC_GEOAPIFY_API_KEY`, absente de `.env`, de `.env.example` et du
  workflow `build-apk.yml` (seul `EXPO_PUBLIC_API_URL` y est passé). Sans clé, l'appel échoue et
  l'utilisateur voit « Impossible de récupérer votre position ».
- **Précisions (2026-10-28)** :
  - Écran : choix de la localisation à l'étape 3 de la création d'annonce.
  - L'utilisateur soupçonnait un quota Geoapify dépassé. La clé du site
    (`domilix.com/.env`, `NEXT_PUBLIC_GEOAPIFY_API_KEY`) répond HTTP 200 en `reverse` et
    `autocomplete` le 2026-10-28, sans restriction de référent : pas de quota épuisé à cette date.
  - Les secrets GitHub du repo ne contiennent que `EXPO_TOKEN` : le build CI
    (`build-apk.yml`) ne reçoit aucune clé Geoapify, donc `getApiKey()` lève une erreur et l'écran
    affiche « Impossible de récupérer votre position ». L'autocomplétion échoue de la même façon,
    sans message.
  - L'autocomplétion est déjà temporisée (≥ 3 caractères), donc ce n'est pas elle qui épuise le quota.
  - Reste à confirmer en QA : logcat du build installé au moment de l'action.
- **Critères d'acceptation**
  - « Utiliser ma position » remplit ville, quartier et adresse en moins de 5 s en extérieur.
  - L'autocomplétion propose des adresses camerounaises dès 3 caractères.
  - La clé est fournie au build (`.env` local, secret GitHub `EXPO_PUBLIC_GEOAPIFY_API_KEY` dans
    la CI) et documentée dans `.env.example` sans valeur réelle.
  - Permission refusée ou refusée définitivement : message en contexte avec « Ouvrir les
    réglages » et saisie manuelle toujours possible (voir leçons, Permissions).
  - Une erreur de géocodage se distingue d'un refus de permission et d'une absence de réseau ;
    un 429 (quota) donne un message clair et laisse la saisie manuelle.
  - L'absence de clé fait échouer le build (contrôle au démarrage du workflow), pas l'utilisateur.

### B-02 — La connexion Google est trop lente (P1)

- **Constat (utilisateur)** : « the google connection option takes too much time ».
- **Piste** : `hooks/use-google-signin.ts` enchaîne trois étapes séquentielles : flux OAuth
  navigateur (`expo-auth-session`, onglet Chrome Custom Tabs), `signInWithCredential` du SDK
  Firebase JS, puis `POST /auth/firebase` vers le backend. La connexion native Android
  (Credential Manager, ex. `@react-native-google-signin/google-signin`) évite le navigateur et
  renvoie l'`id_token` en une feuille système. À mesurer avant de choisir.
- **À faire d'abord** : mesurer sur le Pixel, en build release, la durée de chaque étape (tap →
  retour du navigateur → jeton Firebase → réponse du backend).
- **Critères d'acceptation**
  - Du tap sur « Continuer avec Google » à l'écran connecté : < 3 s pour un compte déjà choisi
    (réseau 4G correct), mesure citée dans le rapport.
  - Un indicateur de progression est visible pendant toute l'attente, le bouton est désactivé
    (pas de double tap).
  - Annulation par l'utilisateur : retour silencieux à l'écran de connexion, sans message d'erreur.
  - Le contrat backend (`POST /auth/firebase`, `{ id_token }`) reste inchangé.

### B-03 — Le partage d'une annonce n'inclut pas son lien (P0)

- **Constat (utilisateur)** : en partageant une annonce vers un réseau social, le lien n'est pas
  partagé.
- **Cause (lecture du code)** : `handleShare` dans `app/announces/[id].tsx` n'envoie que le titre,
  l'adresse et le prix (`Share.share({ title, message })`) : aucune URL n'est construite.
- **Attendu** : comme le site (`domilix.com/src/components/ShareModal/ShareModal.tsx`), le message
  contient l'URL publique de l'annonce : `https://domilix.com/fr/houses/<id>` (immobilier) ou
  `https://domilix.com/fr/furnitures/<id>` (mobilier), format à confirmer sur le site en ligne.
- **Critères d'acceptation**
  - WhatsApp, Facebook, SMS et « Copier » reçoivent un message qui contient l'URL de l'annonce,
    qui s'ouvre sur la bonne annonce dans un navigateur.
  - Texte du message aligné sur celui du site (titre, ville, prix en FCFA).
  - Sur Android, l'URL est dans `message` (le champ `url` de `Share.share` n'est lu que sur iOS).
- **Hors lot (besoin backend/site)** : ouvrir le lien directement dans l'app (Android App Links)
  demande un fichier `/.well-known/assetlinks.json` sur `domilix.com` et un `intentFilter`
  `autoVerify` dans l'app. À demander aux responsables du site.

### B-04 — L'écran de connexion s'affiche quelques secondes alors qu'on est connecté (P0)

- **Constat (utilisateur)** : à l'ouverture de l'app, connecté, l'écran de connexion apparaît
  quelques secondes avant l'accueil.
- **Cause (lecture du code)** :
  - `app/_layout.tsx` déclare `unstable_settings.anchor = '(auth)'` : la route de départ est
    `(auth)/index`, qui redirige vers `login`.
  - Le splash est masqué dès que les polices sont chargées, sans attendre la restauration de
    session.
  - `providers/auth.provider.tsx` n'appelle `setHydrated()` qu'après `AuthService.me()`, un appel
    réseau : sur une connexion lente, l'écran de connexion reste affiché tout ce temps, puis la
    garde fait `router.replace('/(tabs)')`.
- **Risque voisin à vérifier** : le `catch` de l'hydratation appelle `clearAuth()` sur n'importe
  quelle erreur, y compris une absence de réseau, et `clearAuth()` efface les jetons stockés
  (`TokenStorage.clearTokens()`). Un démarrage sans réseau ou un serveur lent qui renvoie une
  erreur déconnecte donc l'utilisateur pour de bon (lecture du code, à reproduire en QA).
- **Critères d'acceptation**
  - Connecté, démarrage à froid : le splash reste jusqu'à la lecture du jeton local, puis
    l'accueil s'affiche directement ; l'écran de connexion n'apparaît jamais (vérifié sur le
    Pixel en build release, réseau normal et réseau lent).
  - La décision d'afficher l'app repose sur le jeton stocké ; `me()` se fait ensuite en
    arrière-plan (données de profil en cache affichées en attendant).
  - Démarrage hors ligne : l'utilisateur reste connecté ; seul un 401 confirmé après tentative de
    rafraîchissement le déconnecte.
  - Non connecté : l'app s'ouvre sur l'écran de connexion (décision de l'utilisateur, 2026-10-28),
    sans clignotement.

## Améliorations demandées par l'utilisateur

### UI-01 — Écran de connexion plus attrayant (P1)

- **Demande (2026-10-28)** : les utilisateurs non connectés arrivent sur l'écran de connexion
  (décision confirmée) ; cet écran doit être plus attrayant.
- **Attendu** : identité du site (logo, couleurs `primary`, typographie, ton des libellés de
  `domilix.com/messages/`), mise en page pensée pour le mobile : promesse de Domilix en une phrase,
  « Continuer avec Google » et la connexion par téléphone/mot de passe bien hiérarchisées, accès à
  l'inscription, et une option « Explorer sans compte » à valider avec l'utilisateur (le site
  permet de parcourir les annonces sans compte).
- **Critères d'acceptation**
  - Maquette ou capture avant/après validée par l'utilisateur avant le développement.
  - Valeurs du thème uniquement (`constants/theme.ts`), contraste AA clair et sombre, cibles ≥ 48 dp,
    lisible à 200 % de police, TalkBack lit les actions dans l'ordre.
  - Clavier : le champ actif et le bouton principal restent visibles.
  - Pas de régression de B-04 (aucun clignotement au démarrage).

## Lots proposés

1. **Lot 1 — bugs signalés** : B-03, B-04, B-01 (développés, en QA) ; B-02 après mesure.
2. **Lot 2 — écran de connexion** : UI-01 (avec B-02 si la mesure conduit à changer le flux Google).
