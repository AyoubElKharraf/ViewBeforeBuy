# ViewBeforeBuy

Plateforme immobilière marocaine (PERN) : visualisation 3D, assistant intelligent et outils fintech.

## Architecture

```text
frontend/   # Next.js (App Router) + React + Tailwind
backend/    # Node.js + Express REST API
database/   # Prisma + PostgreSQL
```

```text
Browser → Next.js → HTTP /api → Express → Prisma → PostgreSQL
```

## Prérequis

- Node.js 20+
- PostgreSQL (ou Docker)
- Clé API optionnelle pour l'assistant : `LOVABLE_API_KEY`

## Setup

```sh
# 1. PostgreSQL
docker compose up -d

# 2. Environnement
cp .env.example .env
# Éditer LOVABLE_API_KEY si besoin

# 3. Installer + migrer + seed
npm install
npm run db:migrate
npm run db:seed

# 4. Lancer Next (3000) + Express (4000)
npm run dev
```

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Next.js + Express en parallèle |
| `npm run dev:frontend` | Next.js seul (`http://localhost:3000`) |
| `npm run dev:backend` | Express seul (`http://localhost:4000`) |
| `npm run build` | Build database → backend → frontend |
| `npm start` | Démarre les builds de production |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Seed (biens, conversations, banques) |
| `npm run db:studio` | Prisma Studio |
| `docker compose up -d` | PostgreSQL local |
| `npm run lint` | Lint frontend + backend |

## API REST

| Méthode | Route |
| --- | --- |
| GET | `/health` |
| GET | `/api/properties` |
| GET | `/api/properties/:id` |
| GET | `/api/conversations` |
| GET | `/api/conversations/:id` |
| POST | `/api/conversations/:id/messages` |
| GET | `/api/banks` |
| POST | `/api/chat` |

## Espaces UI

| Route | Description |
| --- | --- |
| `/` | Landing |
| `/agency` | Espace agence |
| `/client` | Espace acheteur |
