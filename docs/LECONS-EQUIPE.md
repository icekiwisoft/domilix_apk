# Leçons de l'équipe de sous-agents

Erreurs réellement commises par l'équipe sur Mass Gain Tracker (octobre 2026), reprises pour
Domilix, et la règle qui les empêche. **Chaque agent lit la section « Règles propres à Domilix »,
la section commune, la section « Connaissances techniques Expo / Android » et celle de son rôle
avant de commencer.** Copie de référence : vault `30_Resources/Leçons - équipe de sous-agents.md`.

## Règles propres à Domilix

1. **L'API de production sert de vrais utilisateurs.** Aucun agent ne crée, modifie ou supprime
   d'annonce, ne débloque une annonce (consomme des crédits), ne souscrit à un abonnement, ne
   déclenche de paiement ni n'envoie de SMS/e-mail sur `api.domilix.com` sans accord explicite de
   l'utilisateur relayé par l'orchestrateur. Pour tester une écriture, lancer le backend en local
   (`~/Documents/GitHub/domilix`, `docker compose up`) et pointer `EXPO_PUBLIC_API_URL` dessus.
2. **Le backend est en lecture seule** (`icekiwisoft/domilix`, NestJS + Prisma + JWT, dossier
   `backend/`). On le lit pour connaître le contrat réel (contrôleurs, DTO, services,
   `swagger.json`) ; un besoin backend va dans le rapport sous « À demander au
   backend », jamais dans un commit. Un mock d'API se calque sur la réponse réelle (resource
   NestJS ou réponse capturée), pas sur une supposition.
3. **Référence visuelle = le site en ligne** (https://domilix.com/fr/houses, code dans
   `~/Documents/GitHub/domilix/domilix.com/`, Next.js + Tailwind : tokens dans
   `tailwind.config.mjs`). Les maquettes `interfacesHTML/` sont secondaires : en cas d'écart, le
   site gagne, et l'écart est signalé. Le site fixe l'**identité** (couleurs, typographie, icônes,
   libellés, formats) ; la **mise en page** s'adapte au mobile au lieu de copier le desktop.
4. **Tout écran touché ressort aussi plus ergonomique** (demande de l'utilisateur,
   2026-10-28) : conventions Material 3 sur Android, cibles ≥ 48 dp, contraste AA, états
   chargement/vide/erreur/hors ligne, police à 200 %, TalkBack, moins de taps sur les parcours
   clés. Une amélioration qui change un parcours ou un comportement (et pas seulement l'aspect)
   passe d'abord par `docs/BACKLOG.md` pour validation.
5. **Repo partagé** (organisation `icekiwisoft`, d'autres développeurs y travaillent) : une branche
   par lot à partir de `develop`, PR vers `develop`. Jamais de push, de force-push, de
   réécriture d'historique ni de modification de `main`/`master` par un sous-agent.
6. **Données personnelles** : le repo est public. Ne jamais commiter de numéro, e-mail, nom de
   testeur ou capture contenant des données d'utilisateurs réels.
7. **Vérifier l'URL d'API du bundle AVANT tout scénario de test.** Un build release sans
   `EXPO_PUBLIC_API_URL` retombe sur `https://api.domilix.com`. *Erreur (QA lot 2) : premier build
   local sans la variable, deux connexions ratées et une vue d'annonce (`POST /see`) envoyées à la
   prod avant de s'en rendre compte.* Contrôle : chercher l'URL attendue dans
   `index.android.bundle` de l'APK, et l'absence de `api.domilix.com` pour un build local.
8. **Firebase est de la production aussi.** Un build local pointé vers un backend local parle quand
   même au vrai projet Firebase `domilix`. *Erreur (B-02) : la connexion Google native tente d'abord
   une connexion silencieuse avec sélection automatique (`GoogleSignInModule.kt:76`) ; le premier tap
   sur l'émulateur a connecté le compte Google présent sur l'appareil au projet Firebase réel.* Avant
   de toucher un bouton de connexion sociale, vérifier qu'aucun compte Google n'est présent sur
   l'appareil de test, ou obtenir l'accord de l'orchestrateur.
9. **Appareils** : Pixel 9 de l'utilisateur `48150DLAQ003HE` (téléphone personnel : apps et
   notifications privées, vérifier le premier plan avant toute capture) et émulateur
   `emulator-5554`. `adb` est dans `~/Android/Sdk/platform-tools/`. Paquet : `com.jack0237.domilix`.
10. **Tout nouveau code d'écran passe par les composants partagés et les jetons** (UI-06) :
   `components/ui` (`Screen`, `ScreenHeader`, `AppText`, `Button`, `Field`, `Card`, `Chip`,
   `PriceTag`, états, `Toast`) et `constants/theme.ts` (`Colors`, `Spacing`, `Radii`,
   `TextVariants`, `Sizes`). Une couleur en dur, un `fontSize`, un rayon ou un espacement chiffré
   dans un écran est un constat de revue, même si le lint ne l'affiche qu'en avertissement hors de
   `components/ui/**`. S'il manque une valeur, on l'ajoute au thème, pas à l'écran. *Constat
   (2026-10-29) : 21 rayons, 14 tailles de police et plus d'une centaine d'espacements différents,
   un bouton maison par écran : chaque page avait sa propre allure.*
11. **Un parcours qui écrit (publier, modifier, profil) se teste contre un backend local, jamais en
   lisant seulement le code.** Copie du backend dans le scratchpad (le repo reste intact), MySQL et S3
   local en conteneurs dédiés, valeurs factices et envois externes coupés, APK pointé sur
   `http://10.0.2.2:3000` avec `usesCleartextTraffic` temporaire, puis build de production réinstallé.
   Comparer chaque champ envoyé ET chaque champ lu au formulaire avec la vraie réponse de l'API
   (`curl` avant/après, diff complet). *Constat (2026-10-30, UI-12) : la modification d'une annonce
   effaçait chambres et catégorie (`bedrooms`/`category_id` lus au lieu de `bedroom`/`category.id`),
   la devise `FCFA` était enregistrée en XOF, et le PUT multipart n'était jamais lu par le serveur :
   tous ces défauts existaient avant le lot et aucune revue de code ne les avait vus.*
12. **L'utilisateur se sert aussi de l'émulateur avec son compte de production.** Avant toute QA,
   regarder si une session est ouverte ; si ce n'est pas le compte de test, ne pas s'en servir et le
   signaler.
13. **Ne jamais fusionner une autre branche dans la branche d'un lot** (ni `main`, ni la branche
   d'un collègue ou de l'utilisateur) : la branche part de `develop` et ne contient que le lot. *Constat
   (2026-10-31, UI-13) : un développeur a fusionné `ci/release-aab` (PR #1 de l'utilisateur, encore
   ouverte) dans le lot ; retiré par l'orchestrateur avant le push.*

## Commun à tous les rôles

1. **« Vérifié » veut dire « prouvé dans les conditions réelles ».** Ne jamais écrire « vérifié sur
   l'appareil » sans la preuve des conditions (ex. app tuée : `pidof` vide au moment du tap ;
   donnée en base : la ligne SQL citée). *Erreur : « Mangé depuis la notification, app non ouverte :
   vérifié » alors que l'app tournait encore ; le défaut bloquant QA2-01 est passé.*
2. **Le rapport sépare trois colonnes** : vérifié sur l'appareil / vérifié seulement par des tests /
   non vérifié. Les faits sont cités tels qu'observés (pas « collation » quand c'était le goûter).
3. **Remettre en état ce qu'on a modifié** et le lister : alarmes de test, `adb reverse` redirigés
   vers un proxy, données de dev, conteneurs, processus. *Erreur : alarmes de test à 00:40 et
   `adb reverse` pointant vers un proxy arrêté, laissés après la QA.*
4. **Appareils Android** : toujours `adb -s <série>` (un second appareil a été branché en cours de
   route). Avant toute capture ou `uiautomator dump`, vérifier que la fenêtre au premier plan est
   bien l'app (`dumpsys window | grep mCurrentFocus`) et filtrer les nœuds sur son paquet. Jamais
   l'écran d'accueil ni le rideau de notifications non recadré. *Erreur : un dump lancé avant
   l'ouverture de l'app a lu la liste des applications personnelles de l'utilisateur.*
5. **Docker** : projet compose dédié et port libre, jamais de prune global, jamais toucher aux
   conteneurs d'autres projets (`deliver-*`).
6. **Rapports courts** (≤ 40 lignes) et preuves plutôt que captures quand une requête SQL, un
   `dumpsys` ou un log suffit.

7. **Ne jamais supprimer un fichier ou dossier temporaire qu'on n'a pas créé soi-même.** Le
   scratchpad est partagé avec l'orchestrateur et les autres agents. *Erreur (QA UI-06) : un nettoyage
   a effacé les sources des maquettes dont le développeur suivant avait besoin.* Lister ce qu'on a créé,
   ne supprimer que cela.

## developer

1. **Un mock de module natif ou de service externe se calque sur la source réelle.** Citer le
   fichier qui produit la forme (ex. `NotificationSerializer.java`) ou une charge utile capturée
   pour de vrai. *Erreurs : test « dataString » placé dans `content.data`, forme qui n'existe pas
   (QA2-01) ; test de réparation après arrêt forcé qui simulait un `getAllScheduledNotificationsAsync`
   qui « perd » les ids, alors qu'il lit le magasin d'expo, pas l'AlarmManager.*
2. **Chaque correctif arrive avec un test qui échoue sur l'ancien code** (le dire dans le commit).
3. **Un correctif ne doit pas élargir le comportement ailleurs** : rejouer les cas voisins.
   *Erreur : la correction « Œufs » (singulier par sous-chaîne) a fait bloquer poivrons, poisson,
   noisettes et « chocolat noir ».*
4. **Pièges récurrents à traiter dès la première version, pas en revue** :
   - concurrence et idempotence (contrôle puis écriture = course : réserver avant, verrou
     consultatif, `ON CONFLICT`) ; *limite de connexion contournable en parallèle, double
     application d'un même opId, collisions de créneau* ;
   - temps : fuseau, changement d'heure, **passage de minuit avec l'écran ouvert**, fenêtres
     « 7 jours » mesurées en heures depuis maintenant (pas jusqu'à minuit J+6) ;
   - normalisation de texte : `toLowerCase()` avant les ligatures (Œ), comparaison par mots
     entiers ;
   - boucles de rendu : un `load` dépendant d'une version ne doit jamais incrémenter cette version ;
   - hors ligne : ne jamais conclure « hors ligne » parce qu'une requête secondaire a échoué ;
   - statuts définitifs vs à réessayer clairement séparés (`rejected` ≠ `retry`) ;
   - derrière Traefik : `trustProxy` limité au réseau du proxy.
5. **Une app mobile n'est pas « terminée » tant que le build release n'a pas été construit et
   lancé** (bundle embarqué, R8 actif). *Erreur : R8 a renommé la base Room de WorkManager, crash
   au démarrage du premier APK release alors que le debug marchait.* Vérifier aussi le buffer
   `logcat -b crash`.
6. **Chaque verbe de la spec doit correspondre à un chemin réellement utilisable.**
   *Erreur : « ou choisir lui-même » un dîner était impossible (blocs 3/2/2 → toujours une 4ᵉ
   recette, 422), découvert seulement en revue finale.*

## code-reviewer et ux-reviewer

1. **Rejouer le scénario, pas seulement lire le code** : les findings les plus utiles (boucle
   infinie hors ligne, `/sync` bloqué par une seule opération invalide) venaient de reproductions.
2. **Vérifier que les tests testent la réalité** : comparer les mocks aux sources natives et aux
   contrats (`docs/API.md`), et signaler un test qui ne peut pas échouer.
3. **Revue d'un correctif = chercher la régression qu'il introduit** (voir developer §3).
4. UX : compter les taps réels, juger l'écran **à l'heure où il pose problème** (fin de journée
   avec des repas oubliés), contraste des cibles interactives ≥ 3:1.

## qa-tester

1. **Partir de la checklist manuelle et la dérouler dans les vraies conditions** (app tuée,
   serveur coupé par proxy, arrêt forcé) : c'est la QA qui a trouvé QA2-01 et la reprise silencieuse
   de dîners en N+1.
2. **Tester les chemins asymétriques** : semaine N+1 déjà créée par un effet de bord, actions
   depuis la notification hors premier plan, création concurrente.
3. Un test qui reproduit un défaut reste rouge jusqu'au correctif ; le développeur ne le modifie pas.

## devops-release

1. **La CI utilise les mêmes versions que le poste** (Node, etc.) et l'agent exécute les tests dans
   la version de la CI avant de pousser (ex. `docker run node:<version>`). *Erreur : CI mobile en
   Node 20 alors que les tests utilisent `node:sqlite` (Node ≥ 22.5) : 7 suites rouges au premier
   run.* Préférer un `.nvmrc` / `engines` comme source unique.
2. **Configurations Docker, Traefik et n8n vérifiées contre la documentation officielle**
   (exigence du vault) ; si l'agent n'a pas d'accès web, il le dit et l'orchestrateur vérifie.
3. **Le build release de l'app fait partie de la livraison** : construit, signé, installé, lancé,
   `logcat -b crash` vide, URL de prod présente dans le bundle et `localhost` absent.
4. Aucune action serveur, secret GitHub ou push : l'orchestrateur les exécute après relecture.

## product-analyst

1. **Fixer dès la spec les critères d'équilibre et de faisabilité**, pas seulement les minima.
   *Erreur : catalogue conforme à AC-30 mais trop riche en protéines (glucides à 72 %) ; AC-33
   ajouté après coup.*
2. **Pour chaque fonctionnalité, écrire le chemin utilisateur complet** (y compris « choisir
   soi-même », hors ligne, app fermée) et vérifier qu'aucune contrainte de conception ne le rend
   impossible.

## Connaissances techniques Expo / Android (acquises sur Mass Gain Tracker)

Constats vérifiés sur de vrais appareils (Samsung A34 et Pixel 9, Android 16). Avant de s'appuyer
sur un point lié à une version d'Expo ou d'Android, vérifier la documentation de la version
installée (`package.json`) : Domilix est en Expo SDK 54.

### Notifications

1. **Expo Go ne suffit pas** : actions de notification et modules natifs exigent un development
   build ou un build release.
2. **Locales ou push ?** Une notification prévisible (rappel, relance) est locale
   (`expo-notifications`). Un événement qui naît sur le serveur (message, nouvelle annonce qui
   correspond à une recherche, validation d'annonce) exige du push FCM et un backend qui envoie :
   pour Domilix c'est un besoin « À demander au backend ». Le push est retardé par Doze.
3. **Forme réelle des données** : hors premier plan, les données arrivent sous
   `content.dataString` (JSON sérialisé par `NotificationSerializer.toBundle`), au premier plan
   sous `content.data`. Lire les deux. *Cause du bloquant QA2-01.*
4. **`useLastNotificationResponse` rejoue la dernière réponse à chaque réouverture** : traiter une
   réponse une seule fois (identifiant mémorisé) et ne traiter que le tap simple par ce hook.
5. **Un arrêt forcé efface les alarmes d'AlarmManager sans vider le magasin d'expo** :
   `getAllScheduledNotificationsAsync` ne voit rien de manquant. Au premier démarrage de chaque
   processus, tout annuler puis tout reprogrammer (opération idempotente).
6. **Alarmes exactes** : sans l'autorisation « Alarmes et rappels », Android décale un rappel
   jusqu'à une heure ; avec, précision ~70 ms. Elle n'est pas accordée par défaut sur Android 14+.
7. **Android 13+** : permission `POST_NOTIFICATIONS` à l'exécution ; canal créé avant la première
   notification (son importance ne peut plus être changée par l'app ensuite, d'où des identifiants
   de canal versionnés si on doit la modifier).
8. **À la déconnexion ou sur 401 définitif** : annuler les notifications programmées et purger le
   cache de l'utilisateur. Garder seulement ce qui n'appartient pas au compte.

### Permissions

1. **Demander en contexte, au moment de l'action** (localisation à l'ouverture de la carte ou du
   filtre « près de moi », photos à l'ajout d'images, notifications quand l'utilisateur active une
   alerte), jamais toutes au démarrage. Un écran explique le bénéfice avant la boîte système.
2. **Gérer les trois réponses** : accordée, refusée (redemander plus tard) et refusée
   définitivement (`canAskAgain === false` → bouton « Ouvrir les réglages » via
   `Linking.openSettings()`). L'écran reste utilisable sans la permission (repli : saisie de la
   ville, liste au lieu de la carte).
3. **Localisation** : Android 12+ permet de n'accorder que la position approximative ; le code doit
   l'accepter. Premier plan uniquement, `getCurrentPositionAsync` avec précision équilibrée,
   jamais de `watchPositionAsync` permanent.
4. **Photos** : sur Android 13+, le sélecteur système de photos ne demande aucune permission ; ne
   pas réclamer `READ_MEDIA_IMAGES` sans besoin (vérifier ce que déclare le plugin
   `expo-image-picker` de la version installée, la politique Google Play le contrôle).
5. **Exemption d'optimisation batterie** : seulement si une fonction ne peut pas marcher sans
   (rappels critiques), avec explication. Domilix n'en a a priori pas besoin.

### Cache et données serveur (React Query)

1. **`staleTime` choisi par type de donnée** (liste d'annonces : minutes ; profil, villes,
   catégories : longue durée) plutôt que le défaut 0 qui refait la requête à chaque focus et
   chaque montage.
2. **Boucles de chargement** : un chargement qui dépend d'une version ou d'une clé ne doit jamais
   la modifier lui-même. *Boucle infinie hors ligne sur l'écran principal, bloquant de revue.*
3. **Optimiste** : une seule action à la fois sur un élément (garde + bouton désactivé),
   `cancelQueries` avant d'écrire l'état optimiste pour qu'un rafraîchissement ne l'écrase pas,
   restauration de l'instantané en cas d'échec, pas de `setState` après démontage.
4. **Hors ligne** : ne jamais conclure « hors ligne » parce qu'une requête secondaire a échoué ;
   s'appuyer sur l'état réseau réel. Un écran hors ligne montre les données en cache et dit
   qu'elles peuvent être anciennes, jamais un écran blanc.
5. **Cache persistant** (pour relire hors ligne) : borné en taille et en âge, purgé à la
   déconnexion, mis à jour avant qu'une opération soit retirée d'une file.

### SQLite et synchronisation

1. `expo-sqlite` sert de cache local et de file d'opérations hors ligne. Schéma versionné
   (`PRAGMA user_version`), migrations en transaction.
2. **Chaque opération porte un `opId` UUID créé sur le téléphone** pour que le serveur la rende
   idempotente. Statuts séparés : définitifs (`applied`, `duplicate`, `rejected` → retirer de la
   file et prévenir l'utilisateur) et à réessayer (réseau, 5xx). Une opération invalide ne doit
   jamais bloquer le lot.
3. Une écriture hors ligne n'est possible que si l'API la rend idempotente. Le backend Domilix
   étant en lecture seule, toute file d'écriture se limite à ce que l'API actuelle supporte sans
   doublon (sinon : « À demander au backend »).
4. Les tests qui utilisent `node:sqlite` exigent Node ≥ 22.5 (en local comme en CI).

### Batterie et performance

1. Aucun travail périodique en arrière-plan sans besoin produit : pas de `setInterval` ni de
   `refetchInterval` actif quand l'app n'est pas au premier plan (`AppState`), pas de suivi de
   position continu.
2. **Listes** : `FlatList`/`FlashList` avec clés stables, tailles estimées, pas de liste dans un
   `ScrollView`. Images via `expo-image` avec `cachePolicy`, miniatures à la bonne taille (jamais
   la photo pleine résolution dans une carte de liste).
3. **Carte** : nombre de marqueurs limité ou regroupé, pas de rendu de tous les marqueurs à chaque
   déplacement.
4. **Mesurer en build release**, pas en debug (le debug est bien plus lent et trompe les
   conclusions).

### Interface (constats sur appareil)

1. **Utiliser `useRouter()`**, pas l'objet global `router` d'expo-router : à la recréation de
   l'activité, l'ancien démontage le désactive (« imperative router unavailable »). Recréer
   l'activité pour tester : `adb shell settings put system font_scale 1.15` puis `1.0`.
2. Edge-to-edge : prévoir un bandeau de la couleur du fond sous la barre d'état pour que le contenu
   ne passe pas dessous au défilement ; respecter les safe areas en bas (barre de gestes).
3. Le bouton flottant « Tools » d'expo-dev-client masque le haut à droite en debug
   (`DevMenu.setToolsButtonVisible(false)`) ; les toasts LogBox peuvent bloquer une QA en debug.
4. Un `borderRadius` de `View` n'est pas toujours appliqué dans une barre d'onglets animée : si une
   pastille s'affiche en rectangle, la dessiner en SVG.
5. Accessibilité : cibles ≥ 48 dp, contraste ≥ 4,5:1 pour le texte et ≥ 3:1 pour les bordures de
   contrôles, `accessibilityLabel` sur chaque bouton icône, test à 200 % de taille de police.
6. Un bouton flottant ne doit pas masquer une cible en bas de liste.

### Build release et CI

1. **R8 renomme des classes** : un module natif peut casser seulement en release (WorkManager sur
   Mass Gain Tracker). Toujours installer et lancer l'APK release, puis lire `logcat -b crash`.
2. Le bundle release contient l'URL de prod et aucune trace de `localhost`.
3. Versions de Node identiques en local et en CI (`develop` : CI en Node 20.x ; la branche
   `ci/release-aab` passe en Node 22).
