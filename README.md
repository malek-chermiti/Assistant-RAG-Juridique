# Assistant RAG Juridique

Assistant juridique avec interface React, API Express, recherche documentaire Pinecone et modèle Groq.

## Prerequis

- Node.js 20 ou plus recent
- Cles API Groq et Pinecone

## Installation

Depuis la racine du projet :

```bash
npm install
npm run install:all
```

Creer un fichier `.env` a la racine :

```env
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
PINECONE_API_KEY=...
PINECONE_INDEX=...
```

Ne jamais committer `.env` ni partager les cles API.

## Demarrage

Depuis la racine, lancer le frontend et le backend :

```bash
npm run dev
```

Ouvrir http://localhost:5173. L'API est sur http://localhost:3001; son etat se verifie sur http://localhost:3001/api/health.

Pour lancer uniquement le backend :

```bash
npm run dev --prefix server
```

L'import accepte les fichiers PDF jusqu'a 25 Mo. Le proxy Vite transmet les requetes `/api` au backend.
