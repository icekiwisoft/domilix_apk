# TODO — Connexion avec Google (mobile)

Statut : **bloqué**, en attente d'identifiants OAuth externes que je ne peux pas créer moi-même (pas d'accès à la console Firebase / Google Cloud du projet).

## Contexte

Le web app (`domilix.com`) propose déjà "Se connecter avec Google". Le backend expose un endpoint dédié et fait une vraie vérification cryptographique du jeton — ce n'est pas un simple champ email/nom à transmettre. Ce document sert de spec complète pour reprendre l'implémentation dès que les identifiants manquants sont disponibles.

## Ce qui bloque

Google Sign-In natif sur mobile nécessite un **Client ID OAuth 2.0** (au minimum "Web", idéalement aussi iOS et Android) enregistré dans la console Google Cloud rattachée au projet Firebase **"domilix"**. Aucune trace de ça dans ce repo :
- pas de `google-services.json` (Android)
- pas de `GoogleService-Info.plist` (iOS)
- pas de `bundleIdentifier` iOS défini dans `app.json` (seulement `android.package: "com.jack0237.domilix"`)
- pas de Client ID OAuth référencé nulle part

Je n'ai pas accès à la console Firebase/Google Cloud pour les créer.

## Ce qu'il faut obtenir avant de continuer

Dans la [console Google Cloud](https://console.cloud.google.com/apis/credentials) du projet Firebase **"domilix"** (le même projet que le web app) :

1. **Web Client ID** — probablement déjà présent (le web app en a forcément un, via Firebase Auth). Le retrouver dans Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → type "Web application".
2. **iOS Client ID** — à créer (type "iOS"), nécessite de choisir/fixer un **bundle identifier** pour l'app iOS (actuellement non défini dans `app.json`, ex: `com.jack0237.domilix` pour rester cohérent avec le package Android).
3. **Android Client ID** — à créer (type "Android"), nécessite le package `com.jack0237.domilix` **et** l'empreinte SHA-1 du keystore de signature (debug + release/EAS).
4. Ajouter l'app iOS et l'app Android dans la **console Firebase** (Project Settings → Add app), ce qui génère :
   - `GoogleService-Info.plist` (iOS)
   - `google-services.json` (Android)

## Contrat API confirmé (backend, déjà en prod)

```
POST /auth/firebase
Body: { "id_token": string }   // le SEUL champ attendu, requis
```

- Vérification serveur réelle (RS256) contre les certificats publics Google (`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`), `audience`/`issuer` liés au projet Firebase `domilix`.
- Rejette si `email_verified !== true` ou si `firebase.sign_in_provider !== 'google.com'`.
- Si l'utilisateur existe déjà (par email) → connexion, notification "new_login".
- Si l'utilisateur n'existe pas → création automatique (nom depuis le claim `name` ou la partie locale de l'email, `phone_number` synthétique `firebase_<random>`, mot de passe aléatoire, `phone_verified: false`, `email_verified: true`), crédits de bienvenue, notifications "welcome"/"signup_gift_received".
- Réponse : **même enveloppe que `/auth/login` et `/auth/register`** :
  ```json
  { "user": { ... }, "authorisation": { "token": "...", "refresh_token": "...", "type": "bearer" } }
  ```
  → compatible tel quel avec `extractTokens()` déjà utilisé dans `hooks/queries/use-auth-queries.ts`.

## Config Firebase publique (déjà confirmée, sûre à réutiliser telle quelle)

```
apiKey: AIzaSyAK-m_mPZtTIQWgKRSq95XYkPQT4komPY8
authDomain: domilix.firebaseapp.com
projectId: domilix
storageBucket: domilix.firebasestorage.app
messagingSenderId: 782365365187
appId (web): 1:782365365187:web:3bc2abc46b92e46791a376
```
(Il faudra l'`appId` spécifique iOS/Android une fois ces apps enregistrées dans Firebase — différent de l'`appId` web ci-dessus.)

## Dépendances à installer

- `expo-auth-session` — flow OAuth natif (obtenir un id_token Google)
- `expo-crypto` — requis par expo-auth-session pour PKCE
- `firebase` (SDK JS, pas `@react-native-firebase/*`, pour rester cohérent avec l'approche web et éviter la config native lourde de RNFirebase) — utiliser `initializeAuth` + `getReactNativePersistence(AsyncStorage)` pour la persistance de session
- `@react-native-async-storage/async-storage` — déjà présent dans le projet

`expo-web-browser` est déjà installé (nécessaire pour `expo-auth-session`).

## Plan d'implémentation (une fois les identifiants disponibles)

1. **`app.json`** :
   - Ajouter `ios.bundleIdentifier`
   - Placer `GoogleService-Info.plist` / `google-services.json` à la racine, les référencer si un plugin config l'exige
   - Ajouter le scheme de redirection OAuth si nécessaire (`expo-auth-session` gère généralement ça via `scheme` déjà défini : `"domilix"`)

2. **`lib/firebase.ts`** (nouveau) — initialise l'app Firebase avec la config ci-dessus + `initializeAuth` avec persistance AsyncStorage.

3. **`hooks/use-google-signin.ts`** (nouveau) — encapsule `expo-auth-session/providers/google` (`Google.useAuthRequest({ webClientId, iosClientId, androidClientId })`), échange le jeton Google obtenu contre un credential Firebase (`GoogleAuthProvider.credential(idToken)` + `signInWithCredential`), récupère `result.user.getIdToken()`.

4. **`services/auth.service.ts`** — ajouter une méthode `firebaseLogin: (idToken: string) => client.post('/auth/firebase', { id_token: idToken })`, même enveloppe de réponse que `login`/`register`.

5. **`hooks/queries/use-auth-queries.ts`** — ajouter `useFirebaseLogin()`, mirroring `useLogin()` (mêmes `setTokens`/`setUser`/`qc.setQueryData(['me'], user)` dans `onSuccess`).

6. **UI** — bouton "Continuer avec Google" sur `app/(auth)/login.tsx` et `app/(auth)/register.tsx`, sous le formulaire existant (séparateur "ou"), gérant l'état de chargement du flow OAuth + les erreurs (utilisateur annule le popup, jeton refusé par le backend, etc.).

## Routes / endpoints impliqués

- `POST /auth/firebase` — le seul endpoint backend à appeler (déjà existant, ne pas le modifier)
- Aucune autre route backend concernée — tout le reste (stockage token, `/auth/me`, navigation post-connexion) réutilise le flow déjà en place pour login/register classique.
