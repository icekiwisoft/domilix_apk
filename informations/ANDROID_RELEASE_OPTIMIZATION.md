# Optimisation Android Release

## Objectif

Cette configuration active les optimisations Android de release recommandees par Google pour reduire la taille de l'application et supprimer le code natif inutilise.

Elle concerne uniquement les builds Android de publication. Elle ne modifie pas le code metier, les ecrans, les routes Expo Router, les services API ou les stores Zustand.

## Configuration activee

Le projet utilise `expo-build-properties` dans `app.json` :

```json
[
  "expo-build-properties",
  {
    "android": {
      "enableMinifyInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
    }
  }
]
```

Ces options activent :

- `enableMinifyInReleaseBuilds`: minification/optimisation du code Android en release via R8.
- `enableShrinkResourcesInReleaseBuilds`: suppression des ressources Android natives inutilisees.

`enableShrinkResourcesInReleaseBuilds` depend de `enableMinifyInReleaseBuilds`. Les deux doivent rester activees ensemble.

## Pourquoi ce choix

Cette approche evite une dette de code parce qu'elle reste limitee a la configuration de build :

- pas de refactor applicatif ;
- pas de logique conditionnelle ajoutee dans l'app ;
- pas de modification des flux utilisateur ;
- pas de dossier `android/` genere et maintenu manuellement dans le depot.

## Risques a valider

R8 peut parfois supprimer ou renommer du code utilise dynamiquement par certaines bibliotheques natives. Le risque est faible dans ce projet, mais un build Android interne doit etre teste avant publication.

Sur Domilix, les zones a surveiller sont :

- authentification Firebase et session utilisateur ;
- appels API avec refresh token ;
- creation et modification d'annonces ;
- upload d'images ;
- localisation ;
- carte ;
- favoris ;
- profil annonceur et profil utilisateur ;
- navigation Expo Router, y compris les modales.

## Validation avant publication

1. Lancer la verification statique :

```bash
npm run lint
```

2. Generer un build Android de production :

```bash
eas build --platform android --profile production
```

3. Installer le build via une piste de test interne Google Play ou via le lien EAS.

4. Tester les parcours critiques :

- ouvrir l'application et parcourir l'accueil ;
- se connecter et se deconnecter ;
- consulter une annonce immobiliere ;
- consulter une annonce mobilier ;
- ajouter et retirer un favori ;
- creer une annonce avec images ;
- modifier une annonce existante ;
- utiliser la localisation ;
- ouvrir la vue carte ;
- consulter le profil.

5. Comparer la taille du build avec un build precedent si disponible.

6. Surveiller Google Play Console apres distribution interne :

- crashes ;
- ANR ;
- temps de demarrage ;
- taille de telechargement ;
- problemes Android Vitals.

## Retour arriere

Si une regression apparait uniquement sur le build Android release, desactiver temporairement les options dans `app.json` :

```json
[
  "expo-build-properties",
  {
    "android": {
      "enableMinifyInReleaseBuilds": false,
      "enableShrinkResourcesInReleaseBuilds": false
    }
  }
]
```

Puis relancer un build Android production pour confirmer que le probleme vient bien de l'optimisation R8/resource shrinking.

## Reference

Guide Android officiel : https://developer.android.com/topic/performance/app-optimization/enable-app-optimization?hl=fr
