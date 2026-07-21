# ViewBeforeBuy

Plateforme immobilière marocaine : visualisation 3D, assistant intelligent et outils fintech.

> Acheter un bien au Maroc prend **6 à 18 mois** en moyenne. ViewBeforeBuy combine **3D**, **IA** et **Fintech** pour accélérer ce parcours.

## Architecture PERN

```text
frontend/   # Next.js (App Router) + React + Tailwind
backend/    # Node.js + Express REST API
database/   # Prisma + PostgreSQL
```

```text
Browser → Next.js → HTTP /api → Express → Prisma → PostgreSQL
```

## Fonctionnalités

### Espace Agence (B2B)
- Dashboard analytics
- Gestion des biens
- Conversations IA
- Aperçu 3D (placeholder)
- Upload de documents

### Espace Client (B2C)
- Biens en vedette
- Simulateur de crédit
- Comparateur bancaire (CIH, Attijariwafa, BMCE)
- Score d'éligibilité (règle BAM 33 %)
- Conseils IA

## Prérequis

- Node.js 20+
- PostgreSQL (Docker recommandé)
- Clé API optionnelle : `LOVABLE_API_KEY`

## Setup

```sh
# 1. PostgreSQL (port 5433 pour éviter un Postgres local sur 5432)
docker compose up -d

# 2. Environnement
cp .env.example .env

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

## Hackathon

Projet réalisé au **DiNext'26** — 2<sup>e</sup> place — Université Mohammed Premier, Oujda.

| | |
| --- | --- |
| **Thème** | Digital · AI · Fintech |

## License

MIT

---

**ViewBeforeBuy** — *Visualise. Analyse. Finance.*

Made with love in Oujda, Morocco.
