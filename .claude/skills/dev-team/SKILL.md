---
name: dev-team
description: Orchestre l'équipe de sous-agents de l'app Domilix (product-analyst → developer → code-reviewer + ux-reviewer → qa-tester → devops-release), un lot de docs/BACKLOG.md à la fois, avec validation de l'utilisateur entre les phases. Invoquer avec /dev-team pour faire avancer le lot en cours, ou /dev-team <phase> (backlog, dev, review, qa, release).
---

Ce skill fait avancer un lot de `docs/BACKLOG.md` à travers le pipeline, un rôle à la fois, en s'arrêtant pour validation de l'utilisateur quand une décision l'engage.

## Séquence

1. **Backlog** : si `docs/BACKLOG.md` n'existe pas ou qu'une nouvelle source arrive (liste de l'utilisateur, audit QA, écarts visuels), invoque `product-analyst`. **Présente les lots proposés et les questions ouvertes, puis attends la validation explicite.**
2. **Dev** : branche `<type>/<lot>` créée à partir de `develop` à jour ; invoque `developer` sur le lot validé.
3. **Review** : `code-reviewer`, et `ux-reviewer` en parallèle si un écran, la navigation, un formulaire ou une notification change. Findings bloquants ou « à corriger » → `developer`, puis nouvelle revue. Deux allers-retours au plus, ensuite remonter à l'utilisateur.
4. **QA** : `qa-tester` sur l'appareil. Échec → `developer`, puis Review si la zone corrigée était déjà revue, sinon QA directement. Même limite.
5. **Release** : `devops-release` vérifie le build release et prépare la PR. **L'orchestrateur pousse la branche et ouvre la PR vers `develop` seulement après accord de l'utilisateur** ; il ne merge jamais.
6. Termine chaque passage par un résumé court : phases exécutées, statut, blocages, besoins backend, prochaine action attendue.

## Règles transverses

- Jamais de `developer` sans lot validé dans `docs/BACKLOG.md`.
- Jamais de `devops-release` avant les verdicts positifs de revue et de QA.
- Donne toujours le chemin absolu du repo (`/home/jason/Documents/GitHub/domilix_apk`) dans le brief : depuis le vault, les types d'agents du repo ne sont pas enregistrés, lance alors `general-purpose` en lui demandant de lire `.claude/agents/<rôle>.md`.
- Le backend (`~/Documents/GitHub/domilix`) est en lecture seule ; les besoins serveur sont regroupés pour ses responsables.

## Règles d'orchestration apprises (voir aussi `docs/LECONS-EQUIPE.md`)

- **Agent neuf à brief court** par tâche (contexte minimal, fichiers à lire, contraintes, rapport ≤ 40 lignes) plutôt que relancer un agent à l'historique long.
- **Modèles** : `sonnet` pour code-reviewer, ux-reviewer, qa-tester, devops-release et les vérifications ciblées ; Opus pour le développement de logique délicate (cache, synchro, notifications, navigation).
- **Une revue combinée code + UX, puis la QA.** Nouvelle boucle seulement pour un bloquant.
- **Ne jamais relayer un « vérifié » sans preuve** : contrôler soi-même au moins un fait clé (`git log`, sortie de test, `dumpsys`, réponse d'API) avant de l'annoncer.
- **Avant de livrer** : build release construit, installé et lancé, `logcat -b crash` vide.
- **Avant de pousser** : tests dans les versions de la CI, historique audité (aucun secret, `.env`, donnée personnelle, `android/`, keystore).
- **Actions visibles ou irréversibles** (push, PR, build EAS, Google Play, écriture sur l'API de prod) : par l'orchestrateur, après accord.
- Si un sous-agent lit par erreur des données personnelles (écran d'accueil, notifications du Pixel), le signaler à l'utilisateur.
