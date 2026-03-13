## Compet Enchanted Tools – Front Admin

### 1. Documentation technique

- **Technologie principale**: `Next.js` (App Router) avec React et TypeScript  
- **Rôle de l’application**: interface d’administration pour gérer le contenu et les règles métier exposées par le back :
  - gestion des modules, missions, parcours
  - configuration des récompenses
  - suivi des joueurs / statistiques (selon ce qui est implémenté)
- **Organisation du code**:
  - `app/` : pages d’administration (tableaux, formulaires, dashboards, etc.)
  - `components/` : composants d’UI back‑office (tableaux, formulaires, filtres, etc.)
  - `public/` : assets statiques
- **Communication avec le back**: via l’API `Compet-Enchanted-Tools-Back` (endpoints CRUD pour les entités métiers).

### 2. Schéma d’architecture (vue globale)

- **Administrateur (navigateur)**  
  ⟶ **Front Admin Next.js (ce dépôt)**  
  ⟶ consomme l’**API REST** du `Back` pour :
  - créer / modifier / supprimer modules, missions, parcours
  - créer / paramétrer les récompenses
  - consulter la progression des joueurs

Le front admin est un client de la même API que le front joueur, avec des endpoints supplémentaires ou des rôles/permissions différents.

### 3. Guide d’installation

#### Prérequis

- Node.js (version LTS recommandée, ex. 18+)
- npm, yarn, pnpm ou bun

#### Installation

```bash
cd Compet-Enchanted-Tools-Admin/my-app
npm install
# ou
yarn install
```

### 4. Guide d’utilisation (front admin)

#### Lancer l’application en développement

```bash
cd Compet-Enchanted-Tools-Admin/my-app
npm run dev
```

Puis ouvrir `http://localhost:3000` dans un navigateur.

#### Fonctionnalités principales (exemples)

- **Gestion des parcours**: création / édition / organisation des parcours pédagogiques.  
- **Gestion des modules & missions**: CRUD complet sur les modules, missions, étapes de jeu.  
- **Gestion des récompenses**: configuration des récompenses (type, conditions d’obtention, visuels).  
- **Suivi des joueurs**: vue de la progression, filtrage par groupe, par module, etc. (selon ce qui est implémenté).

### 5. Exemples de données

Les exemples de données métiers sont maintenus dans le back (`Compet-Enchanted-Tools-Back`) et exposés via l’API.  
Pour tester l’admin, démarre le back avec ses données de démo puis configure l’URL de l’API (par exemple `NEXT_PUBLIC_API_URL` ou équivalent pour cette application).

### 6. Instructions de déploiement

- **Build de production**

```bash
cd Compet-Enchanted-Tools-Admin/my-app
npm run build
npm run start
```

- **Environnement recommandé**
  - Variable d’environnement pour l’URL API (`NEXT_PUBLIC_API_URL` ou similaire)
  - Gestion des rôles/permissions admin côté back (l’admin doit être protégé via authentification et autorisation).

- **Plateformes possibles**
  - Vercel, Netlify, ou serveur Node dédié derrière un reverse proxy.

Vérifie que le back est accessible depuis le domaine de l’admin, et que les configurations CORS et de sécurité sont correctement mises en place.

