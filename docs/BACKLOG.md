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

### B-02 — La connexion Google est trop lente (P2, non reproduit)

- **Test de bout en bout (2026-10-29, émulateur, build release clé debug, API de prod, compte Google
  de l'émulateur avec l'accord de l'utilisateur)** : sélecteur de compte affiché à chaque tap (0,3 à
  1,1 s ; 4,5 à 4,9 s au premier appel après installation, démarrage de Google Play Services) ;
  « Continuer » → accueil connecté en 2,9 s ; déconnexion → écran de connexion sans message, puis le
  sélecteur réapparaît ; aucun crash (`logcat -b crash` vide). Non testé : cas « aucun compte Google »,
  Play Services absent, et un build signé par Google Play (clé `CB:A4:27…`, enregistrée).

- **Constat (utilisateur)** : « the google connection option takes too much time ».
- **Piste** : `hooks/use-google-signin.ts` enchaîne trois étapes séquentielles : flux OAuth
  navigateur (`expo-auth-session`, onglet Chrome Custom Tabs), `signInWithCredential` du SDK
  Firebase JS, puis `POST /auth/firebase` vers le backend. La connexion native Android
  (Credential Manager, ex. `@react-native-google-signin/google-signin`) évite le navigateur et
  renvoie l'`id_token` en une feuille système. À mesurer avant de choisir.
- **Mesure (2026-10-28, Pixel 9, APK 1.0.0 installé, Wi-Fi)** : non reproduit. Tap → onglet du
  navigateur ouvert en 0,3 s ; 6,3 s dans l'onglet (choix du compte par l'utilisateur) ; retour à
  l'app puis accueil en moins d'une seconde selon l'utilisateur.
- **Constat** : le flux passe par l'onglet du **navigateur par défaut** (Brave sur ce téléphone),
  pas par une feuille Google native. Causes probables de la lenteur ressentie : navigateur à
  froid ou non connecté à Google (saisie du mot de passe), réseau mobile lent, première connexion
  (création du compte côté serveur). À préciser avec l'utilisateur.
- **Décision (2026-10-28, utilisateur)** : migration validée vers la connexion Google native
  Android, dans le lot 2. Proposition retenue : connexion Google native (Credential Manager), avec UI-01 :
  feuille système avec les comptes du téléphone, sans navigateur. Prérequis à vérifier : client
  OAuth Android avec l'empreinte SHA-1 de la clé de signature de production (EAS) et de la clé
  Google Play si l'app y est publiée.
- **Empreintes à enregistrer dans Google Cloud** (clients OAuth Android, paquet
  `com.jack0237.domilix`, relevées le 2026-10-29) : clé EAS par défaut du projet
  `@jack0237/domilix` (créée le 2026-05-13) `77:18:A8:44:57:6A:BF:80:15:28:D4:35:BE:7A:D8:73:4C:15:20:20` ;
  clé debug `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` ; clé de signature
  Google Play (l'app est publiée sur Play, versions signées par Play, 100 % des installations via Play)
  `CB:A4:27:9F:9C:26:B2:EF:FE:37:0E:51:08:28:32:A4:E5:04:B9:F5`. La clé d'importation Play est la clé
  EAS (`77:18:A8…`). État au 2026-10-29 : EAS déjà enregistrée dans Firebase, debug ajoutée par
  l'utilisateur, clé Play ajoutée par l'utilisateur : les 3 empreintes sont enregistrées, B-02 débloqué.
- **Bibliothèque retenue (2026-10-28, utilisateur)** : `@thoughtbot/react-native-social-auth`
  (MIT, thoughtbot, Turbo Module, Credential Manager via `androidx.credentials` 1.5.0 et `googleid`
  1.1.1, plugin Expo, boutons Google conformes). Version figée (0.4.0 au moment du choix, API en
  0.x) ; `signIn()` → `idToken` (audience = client Web) → Firebase JS → `POST /auth/firebase`
  inchangé. Repli : module Expo local sur Credential Manager.
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

### B-05 — Session refusée : l'app reste en invité au lieu d'afficher la connexion (P2)

- **Source** : QA lot 1 (QA-02), 2026-10-28.
- **Constat** : après un 401 confirmé et un refresh refusé, la session est effacée mais l'app reste
  sur l'accueil en invité ; l'écran de connexion n'apparaît qu'au démarrage suivant.
- **Attendu** (décision « non connecté → écran de connexion ») : à la fin de session, retour à
  l'écran de connexion avec un message court (« Votre session a expiré, reconnectez-vous »).

### À vérifier (QA lot 1)

- **QA-01** : sur l'émulateur, après une première position réussie, « Utiliser ma position »
  renvoie parfois « Position introuvable » alors qu'un fix existe. À reproduire sur le Pixel ; si
  confirmé, essayer `getLastKnownPositionAsync` en repli et un délai plus long.
- **QA-04** : le filtre « Mobilier » de l'Explorer affichait 0 annonce alors que
  `GET /announces?type=furniture` en renvoyait une (données locales sans médias). À vérifier
  quand la prod aura des annonces de mobilier.
- Partage réel vers WhatsApp, Facebook, SMS : seul l'aperçu du sélecteur Android a été vérifié.

## À demander à l'équipe backend et site (lecture seule pour nous)

1. **Critique** : `POST /auth/refresh` accepte un jeton d'accès non vérifié (`jwt.decode`) ;
   message prêt dans le vault (`10_Projects/Domilix/2026-10-28 Audit - Sécurité du
   rafraîchissement JWT (backend).md`). Vérifier aussi `JWT_SECRET` / `JWT_REFRESH_SECRET` en prod.
2. Refresh token à signature invalide → 500 au lieu de 401 (l'app ne peut pas conclure tout de
   suite que la session est morte ; QA-03).
3. Refresh tokens révoqués gardés en mémoire (perdus au redémarrage, non partagés).
4. `docker-compose.yml` de la racine du repo décrit encore l'ancien backend Laravel ; les
   migrations Prisma échouent sur une base vide (`20260428000000_add_real_estate_amenities`).
5. Site : `public/logo.png` contient un faux damier de transparence (pixels gris/blancs dans
   l'image, mode RGB sans canal alpha).
6. Site : boutons blanc sur `#E8921A` à ~2,5:1 de contraste (minimum AA 4,5:1).
7. Connexion d'un numéro non vérifié : le 403 ne renvoie pas de `user_id`, l'app ne peut pas
   relancer le code SMS (F-01).
8. Ouverture des liens d'annonce dans l'app (Android App Links) : `/.well-known/assetlinks.json`
   sur `domilix.com` (B-03, hors lot).

## Améliorations demandées par l'utilisateur

### UI-01 — Écran de connexion plus attrayant (P1)

- **Maquette validée par l'utilisateur (2026-10-28)** : canvas
  https://claude.ai/artifact/WLXBZm78scsjXm9epfNcnC (planches « Après », clair et sombre). Bandeau
  mascotte + pastille logo, titre du site « Logements, terrains et meubles au Cameroun », bouton
  Google officiel en premier, champs Email ou téléphone / Mot de passe, bouton « Se connecter »
  texte `#291800` sur ambre `#f5a623` (contraste ~8,5:1, le blanc sur `#E8921A` du site et de l'app
  ne fait que ~2,5:1), liens `#835500`, lien « Explorer les annonces sans compte », police Mona Sans.

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

### UI-02 — Écran d'inscription aligné sur la connexion (P1)

- **Demande (2026-10-28)** : refaire l'écran d'inscription dans le même esprit que UI-01.
- **Maquette validée par l'utilisateur (2026-10-28)** : même canvas, rangée « Inscription ».
- **Changements proposés** : bandeau mascotte réduit avec bouton Retour 48 dp ; « S'inscrire avec
  Google » en premier ; champs Nom d'utilisateur (« Votre prénom ou pseudo », libellés du site),
  Téléphone avec préfixe +237 et aide « code par SMS », Email (facultatif), Mot de passe avec bouton
  Afficher et règle « Au moins 8 caractères » en direct ; **suppression de « Confirmer le mot de
  passe »** (le backend ne l'exige pas : `register.dto.ts` prend `name`, `email?`, `phone_number?`,
  `password`) ; case CGU de 48 dp ; bouton « Créer mon compte » (libellé du site) ; « Déjà
  inscrit ? Se connecter ».
- **Critères d'acceptation** : ceux de UI-01, plus : erreurs de validation affichées sous le champ
  concerné, en français ; le clavier numérique s'ouvre pour le téléphone ; l'écran défile sans que
  le bouton principal soit masqué par le clavier ; le parcours SMS (`verify-phone`) reste inchangé.

### UI-03 — Police Mona Sans dans toute l'app (P1)

- **Décision (2026-10-28, utilisateur)** : Mona Sans partout, comme le site
  (`tailwind.config.mjs` : `fontFamily.sans = Mona Sans`), à la place de Plus Jakarta Sans.
- **Constat** : `PlusJakartaSans_*` est écrit en dur dans 33 fichiers (107 occurrences) au lieu de
  passer par le thème.
- **Attendu** : paquet `@expo-google-fonts/mona-sans` (4 graisses utilisées : 400, 500, 600, 700),
  noms de police centralisés dans `constants/theme.ts` (aucun nom de police en dur ailleurs), chargés
  dans `app/_layout.tsx` avant de masquer le splash (B-04), ancien paquet retiré.
- **Critères d'acceptation** : `grep PlusJakartaSans` ne trouve plus rien ; aucun texte tronqué ou
  débordant sur les écrans principaux (Mona Sans est plus large) à 100 % et 200 % de police ; build
  release vérifié sur l'appareil.

### UI-04 — Contraste et lisibilité dans le reste de l'app (P1)

- **Source** : revue et QA du lot 2 (2026-10-28).
- **Contraste** : texte blanc sur `#E8921A` (~2,5:1) encore utilisé par les boutons Paper « contained »
  et les fonds `C.primary` de : forgot-password, reset-password, verify-phone, announces/[id],
  création étapes 1 à 5, edit/[id], favorites, profil, profile/settings, subscriptions,
  announcer-profile, notifications, announcers/[id], unlock-confirm, filter-sheet ; composants
  login-gate, empty-state, plan-card, search-bar, map-list-toggle, filter-bar, broadcast-banner,
  profile-form, announcer-form, media-upload-grid, create-step-header, notif-item, listing-card-h,
  announcer-contact, announcer-hero. Bandeau « DISCOVER THE APP » peu lisible en sombre.
- **Police à 200 %** (QA-05) : libellés de la barre d'onglets tronqués (« Accu », « Explo »),
  placeholder de recherche de l'accueil coupé, lignes de prix qui passent à la ligne, bouton des
  cartes d'abonnement tronqué.
- **Attendu** : tokens `cta` / `onCta` du lot 2 partout, AA en clair et en sombre, rien de tronqué à
  200 %.

### F-01 — Connexion par téléphone non vérifié (P2)

- **Source** : développeur lot 2.
- **Constat** : un numéro jamais vérifié reçoit 403 à la connexion, l'app affiche « Identifiant ou
  mot de passe incorrect » et ne propose pas de finir la vérification.
- **Dépendance backend** : la réponse 403 ne contient pas de `user_id`, nécessaire pour
  `resendVerificationCode`. À demander au backend.
- Suggestion annexe : toucher le choix « Standing » déjà sélectionné pourrait le désélectionner.

### UI-05 — Écrans d'annonceur à 200 % (P2)

- **Source** : QA du lot 3 (QA-05e), 2026-10-29.
- `my-listings.tsx` : « Modifier » / « Supprimer » tronqués. `announces/edit/[id].tsx` : le titre
  chevauche « Enregistrer » (« Enreg »), segments « Im… / Mo… / Loc… / Ve… ». Création : « Immobilier »
  coupé au milieu du mot, « Utiliser ma position actu… », Standing « Stand… / Confo… / Haut… ».
- Petits badges à 9–10 px (`mainBadge`, `newBadge`, `photoBadge`) sous la taille lisible : décision de
  design à prendre. `Typography.labelSm` a une hauteur de ligne égale à la taille (libellés serrés quand
  ils passent à la ligne). En-tête de section : nom de ville et « VOIR TOUT » se touchent à 200 %.

### B-06 — État « Plan actuel » jamais affiché (P3)

- **Source** : revue du lot 3. `app/profile/subscriptions.tsx:396` ne passe jamais `current` à
  `PlanCard` : l'état « Plan actuel » est du code mort. Le brancher sur l'abonnement actif ou le retirer.

### UI-06 — Système de design : échelles, garde-fous et composants partagés (P1)

- **Demande (2026-10-29)** : rendre les éléments et composants cohérents sur toutes les pages, comme
  sur Mass Gain Tracker. Étapes 1 et 2 du plan validées par l'utilisateur.
- **Constat (mesuré le 2026-10-29)** : bouton Paper dans 25 fichiers, 58 `Pressable` faits main,
  `components/ui/button.tsx` utilisé nulle part ; 21 rayons d'angle différents ; 92 `fontSize` en dur
  (14 valeurs) ; 117 espacements en dur ; 41 codes couleur dans 13 fichiers ; spinner brut dans 10
  fichiers, squelette dans 5, `EmptyState` dans 1 ; chaque écran refait en-tête, zones sûres, défilement
  et clavier.
- **Étape 1, échelles et garde-fous** : 4 rayons, une échelle d'espacement, des variantes de texte
  nommées (titre, corps, libellé, légende, prix) dans `constants/theme.ts` ; règle ESLint qui refuse
  couleurs en dur et nombres bruts de style (erreur dans `components/ui/**`, avertissement ailleurs
  jusqu'à la migration) ; règle ajoutée aux leçons de l'équipe.
- **Étape 2, composants partagés** (modèle Mass Gain Tracker, identité du site) : `Screen`,
  `ScreenHeader`, `SheetHeader`, `AppText`, `Button` (primaire, secondaire, texte, danger, Google ;
  48 dp, chargement, libellé qui passe à la ligne à 200 %), `Field`, `Card`, `Chip`, `PriceTag`,
  `States` (chargement en squelette, vide, erreur, hors ligne), `Toast`.
- **Critères d'acceptation** : aucun changement visible dans cette étape (les écrans ne sont pas
  encore migrés) ; chaque composant n'utilise que les jetons du thème ; AA en clair et en sombre ;
  cibles ≥ 48 dp ; libellés TalkBack ; correct à 200 % ; `tsc` et lint sans nouvelle erreur.
- **Suite** : étape 3, maquettes des écrans principaux (accueil, explorer, détail, profil) à valider ;
  étape 4, migration par zone et retrait de React Native Paper ; étape 5, écran catalogue en dev.

### UI-07 — Migration Accueil et Explorer vers le kit (P1)

- **Décision (2026-10-29)** : maquettes de tous les écrans validées en direction par l'utilisateur
  (canvas https://claude.ai/artifact/WLXBZm78scsjXm9epfNcnC, rangée « Accueil et recherche ») ;
  migration par zone, en commençant par Accueil et Explorer.
- **Périmètre** : `app/(tabs)/index.tsx` (accueil), `app/(tabs)/explore/index.tsx` (liste),
  `app/(tabs)/explore/map.tsx` (carte), `app/(modals)/filter-sheet.tsx` (filtres), la barre d'onglets
  `app/(tabs)/_layout.tsx`, et les composants qu'ils utilisent (`components/home`, `components/search`,
  `components/listing` pour les cartes d'annonce, `components/maps`).
- **Nouveaux composants du kit** : `SearchBar`, `ListingCard` (verticale et compacte horizontale),
  `TabBar` (bouton Publier central).
- **Critères d'acceptation** : écrans conformes aux maquettes (identité, hiérarchie, composants) ;
  uniquement le kit et les jetons (0 avertissement de la règle de lint dans les fichiers migrés) ; plus
  de React Native Paper dans ces écrans ; comportement inchangé (requêtes, filtres, navigation,
  pagination, favoris, partage) ; AA clair et sombre, 48 dp, 200 %, TalkBack ; build release vérifié.

### F-02 — Carte des annonces (P1)

- **Constat (2026-10-29, lot UI-07)** : `app.json` n'a jamais eu de clé Google Maps
  (`android.config.googleMaps.apiKey`) : l'onglet Carte plantait l'app sur Android, probablement aussi en
  production. Depuis UI-07, la carte est masquée tant que la clé manque (`lib/map-availability.ts`).
- **Décision (utilisateur)** : carte désactivée pour l'instant ; lot dédié quand la clé existera.
- **À faire** : clé « Maps SDK for Android » (Google Cloud, projet domilix, restreinte au paquet
  `com.jack0237.domilix` et aux 3 empreintes SHA-1), passée par secret CI et non commitée ; vraies
  coordonnées des annonces (le backend les a : `maps.service`, `RealEstate.lat/lng` ; les marqueurs
  actuels sont placés au hasard autour du centre-ville) ; « Ma position » (permission en contexte) et
  « Rechercher dans cette zone » ; vérification sur appareil.

### B-07 — « Charger plus » remplace la liste au lieu de l'allonger (P2)

- **Constat** : Explorer affiche seulement la page N ; impossible de revenir aux annonces précédentes.
- **Attendu** : défilement infini (`useInfiniteQuery`), pied de liste en chargement, fin de liste annoncée.

### B-08 — Contenus à corriger (P3)

- Bandeau d'accueil (diffusion serveur) en anglais : « Coming soon / The Domilix app is coming /
  Discover the app » ; à traduire dans l'administration ou par l'équipe backend.
- Annonces sans photo : image aléatoire (picsum) en repli ; remplacer par une illustration Domilix neutre.
- `handleCategory` sur l'accueil garde d'anciens filtres et la recherche.

## Lots proposés

1. **Lot 1 — bugs signalés** : B-03, B-04, B-01 développés, revus, QA émulateur OK (2026-10-28).
2. **Lot 2 — connexion, inscription et police** : UI-03 d'abord (base des deux écrans), puis UI-01,
   UI-02, B-02 (connexion Google native) et B-05.
3. **Lot 3 — contraste et 200 %** : UI-04 (fusionné). Puis F-01 quand le backend renverra le `user_id`.
4. **Lot 4 — système de design** : UI-06 fusionné (PR #7, 2026-10-29).
5. **Lot 5 — migration** : UI-07 Accueil et Explorer, puis Annonce, Compte, Publier.
