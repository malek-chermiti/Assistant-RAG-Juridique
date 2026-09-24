# Assistant RAG Juridique

Application full-stack avec un client React/Vite et une API Express/Node.js.

## Architecture

```text
.
├── client/             # Frontend React + Vite
│   └── src/
├── server/             # Backend Express
│   └── src/index.js
├── package.json        # Commandes communes
└── README.md
```

## Installation

```bash
npm install
npm install --prefix client
npm install --prefix server
```

## Developpement

Lancer le client et le serveur ensemble :

```bash
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3000
- Health check : http://localhost:3000/api/health

Le proxy Vite redirige automatiquement les requetes `/api` du client vers Express.

## Production

```bash
npm run build --prefix client
npm start --prefix server
```
