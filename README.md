<div align="center">

# 🏠 ViewBeforeBuy

**Plateforme immobilière marocaine — Visualisation 3D, Assistant IA & Outils Fintech**

[![CI](https://github.com/AyoubElKharraf/ViewBeforeBuy/actions/workflows/ci.yml/badge.svg)](https://github.com/AyoubElKharraf/ViewBeforeBuy/actions/workflows/ci.yml)
[![Stack](https://img.shields.io/badge/stack-PERN-2ea44f)](#-architecture)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-licence)

*Visualise. Analyse. Finance.*

</div>

> Acheter un bien au Maroc prend **6 à 18 mois** en moyenne. **ViewBeforeBuy** combine **3D**, **IA** et **Fintech** pour accélérer et sécuriser ce parcours, côté agence (B2B) et côté acheteur (B2C).

---

## 📑 Sommaire

- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation & démarrage](#-installation--démarrage)
- [Variables d'environnement](#-variables-denvironnement)
- [Scripts](#-scripts)
- [API REST](#-api-rest)
- [Temps réel (Socket.io)](#-temps-réel-socketio)
- [Structure du projet](#-structure-du-projet)
- [Sécurité](#-sécurité)
- [Hackathon](#-hackathon)
- [Licence](#-licence)

---

## 🏗 Architecture

Monorepo **PERN** (PostgreSQL · Express · React/Next · Node) organisé en workspaces npm :

```text
frontend/   # Next.js (App Router) + React 19 + Tailwind CSS 4
backend/    # Node.js + Express 5 (API REST) + Socket.io
database/   # Prisma ORM + PostgreSQL
```

**Flux applicatif :**

```text
Browser ──▶ Next.js ──HTTP /api──▶ Express ──▶ Prisma ──▶ PostgreSQL
   ▲                                   │
   └────────── WebSocket ──────────────┘  (Socket.io, temps réel)
                                       │
                              Redis · Stripe · Supabase
```

- **Cache & rate-limiting** distribués via **Redis** (dégradation gracieuse si indisponible).
- **Paiements** via **Stripe Checkout**.
- **Stockage d'images** via **Supabase Storage**.
- **Visite 3D** rendue côté client avec **Three.js / React Three Fiber**.

---

## 🧰 Stack technique

| Domaine | Technologies |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide, Recharts, React Three Fiber / Drei |
| **Backend** | Node.js, Express 5, TypeScript, Zod, Helmet, Compression, Morgan, Winston, express-rate-limit |
| **Base de données** | PostgreSQL 16, Prisma ORM |
| **Authentification** | JWT, bcrypt, Passport (OAuth2 Google) |
| **Cache / Realtime** | Redis (ioredis), Socket.io |
| **Paiements** | Stripe (Checkout) |
| **Stockage** | Supabase Storage (upload d'images, Multer) |
| **3D** | Three.js, @react-three/fiber, @react-three/drei |
| **Infra** | Docker Compose (PostgreSQL + Redis), npm workspaces |

---

## ✨ Fonctionnalités

### 🏢 Espace Agence (B2B)
- **Dashboard analytics** avec graphiques Recharts (activité, répartition des biens par type)
- **Gestion des biens** + **upload de photos** (Supabase Storage)
- **Messagerie IA en temps réel** (Socket.io)
- **Visite 3D interactive** des biens (Three.js)

### 🔑 Espace Client (B2C)
- **Biens en vedette** avec photos et visite **3D**
- **Réservation / acompte** en ligne via **Stripe Checkout**
- **Simulateur de crédit** temps réel + graphiques (capital/intérêts, comparateur bancaire)
- **Score d'éligibilité** (règle BAM, taux d'endettement max 33 %)
- **Conseils IA** personnalisés

### 🔐 Transverse
- **Authentification** email/mot de passe (JWT) + **OAuth2 Google**
- **Sécurité** renforcée (Helmet, CORS, rate-limiting, validation Zod)
- **Cache Redis** sur les données fréquemment lues
- **Logs structurés** (Winston + Morgan)

---

## 📋 Prérequis

- **Node.js** 20+
- **Docker** (recommandé pour PostgreSQL + Redis)
- Clés optionnelles selon les fonctionnalités activées :
  - `STRIPE_SECRET_KEY` (paiements)
  - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (upload d'images)
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (OAuth2)
  - `LOVABLE_API_KEY` (assistant IA)

> 💡 Chaque intégration externe se **désactive proprement** si sa clé est absente — l'app reste fonctionnelle.

---

## 🚀 Installation & démarrage

```sh
# 1. Services d'infrastructure (PostgreSQL sur 5433, Redis sur 6379)
docker compose up -d

# 2. Variables d'environnement
cp .env.example .env      # puis renseigner les clés souhaitées

# 3. Installer les dépendances
npm install

# 4. Base de données : migrations + données de démonstration
npm run db:migrate
npm run db:seed

# 5. Lancer le frontend (3000) + backend (4000)
npm run dev
```

- Frontend : http://localhost:3000
- API : http://localhost:4000 · Santé : http://localhost:4000/health

---

## 🔑 Variables d'environnement

| Variable | Description | Défaut |
| --- | --- | --- |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL | `postgresql://postgres:postgres@127.0.0.1:5433/viewbeforebuy?schema=public` |
| `PORT` | Port de l'API Express | `4000` |
| `FRONTEND_URL` | Origine autorisée (CORS) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL de l'API côté frontend | `http://localhost:4000` |
| `REDIS_URL` | Connexion Redis (cache + rate-limit) | `redis://127.0.0.1:6379` |
| `JWT_SECRET` | Secret de signature des JWT | *(à définir)* |
| `JWT_EXPIRES_IN` | Durée de validité des JWT | `7d` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth2 Google (optionnel) | — |
| `GOOGLE_CALLBACK_URL` | Callback OAuth2 | `http://localhost:4000/api/auth/google/callback` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (optionnel) | — |
| `STRIPE_CURRENCY` | Devise des paiements | `mad` |
| `STRIPE_DEPOSIT_PERCENT` | % du prix pour l'acompte | `10` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage (optionnel) | — |
| `SUPABASE_BUCKET` | Bucket de stockage des images | `properties` |
| `LOVABLE_API_KEY` | Clé de l'assistant IA (optionnel) | — |

> ⚠️ Le fichier `.env` est ignoré par Git — ne jamais committer de secrets.

---

## 📜 Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Next.js + Express en parallèle |
| `npm run dev:frontend` | Next.js seul (`http://localhost:3000`) |
| `npm run dev:backend` | Express seul (`http://localhost:4000`) |
| `npm run build` | Build database → backend → frontend |
| `npm start` | Démarre les builds de production |
| `npm run lint` | Lint / typecheck frontend + backend |
| `npm test` | Lance les tests (backend + frontend) |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Seed (biens, conversations, banques) |
| `npm run db:studio` | Prisma Studio |
| `docker compose up -d` | PostgreSQL + Redis |

---

## 🔌 API REST

**Authentification**

| Méthode | Route | Auth | Description |
| --- | --- | :---: | --- |
| POST | `/api/auth/register` | — | Inscription (email, mot de passe) |
| POST | `/api/auth/login` | — | Connexion → JWT |
| GET | `/api/auth/me` | 🔒 | Profil de l'utilisateur courant |
| GET | `/api/auth/google` | — | Démarre l'OAuth2 Google *(si configuré)* |
| GET | `/api/auth/google/callback` | — | Callback OAuth2 |

**Biens & médias**

| Méthode | Route | Auth | Description |
| --- | --- | :---: | --- |
| GET | `/api/properties` | — | Liste des biens (filtres `type`, `city`) — *caché* |
| GET | `/api/properties/:id` | — | Détail d'un bien — *caché* |
| POST | `/api/properties/:id/image` | 🔒 | Upload d'une photo (Supabase) |

**Conversations & IA**

| Méthode | Route | Auth | Description |
| --- | --- | :---: | --- |
| GET | `/api/conversations` | — | Liste des conversations |
| GET | `/api/conversations/:id` | — | Détail d'une conversation |
| POST | `/api/conversations/:id/messages` | — | Envoi d'un message (diffusé en temps réel) |
| POST | `/api/chat` | — | Assistant IA — *rate-limité* |
| POST | `/api/ai/chat` | 🔒 | Copilote immobilier (RAG biens/banques + historique) — *caché 1h, rate-limité* |
| POST | `/api/ai/score-eligibility` | 🔒 | Score d'éligibilité + recommandations IA d'optimisation — *caché 1h* |

**Fintech & santé**

| Méthode | Route | Auth | Description |
| --- | --- | :---: | --- |
| GET | `/api/banks` | — | Offres bancaires — *caché* |
| POST | `/api/payments/checkout` | 🔒 | Crée une session Stripe Checkout (acompte) |
| GET | `/health` | — | Health check |

---

## ⚡ Temps réel (Socket.io)

| Événement | Sens | Payload | Description |
| --- | --- | --- | --- |
| `conversation:join` | client → serveur | `conversationId` | Rejoint la room d'une conversation |
| `conversation:leave` | client → serveur | `conversationId` | Quitte la room |
| `message:new` | serveur → client | `{ conversationId, message }` | Nouveau message diffusé aux participants |

---

## 🗂 Structure du projet

```text
ViewBeforeBuy/
├── frontend/                 # Next.js (App Router)
│   ├── app/                  # Pages (/, /agency, /client, /payment, ...)
│   └── src/
│       ├── components/       # Viewer 3D, modals, ...
│       ├── hooks/            # useAI, ...
│       └── lib/              # client API REST, client Socket.io
├── backend/                  # API Express
│   └── src/
│       ├── config/           # env (Zod), passport (OAuth2)
│       ├── controllers/      # auth, properties, conversations, payments, storage, chat
│       ├── routes/           # routeur API
│       ├── services/         # logique métier
│       ├── shared/           # logger, redis, stripe, supabase, socket, middlewares
│       └── server.ts         # serveur HTTP + Socket.io
├── database/                 # Prisma
│   └── prisma/               # schema, migrations, seed
├── docker-compose.yml        # PostgreSQL + Redis
└── package.json              # workspaces + scripts
```

---

## 🧪 Tests

Suite de tests automatisés exécutable via `npm test` (à la racine).

| Cible | Outils | Couverture |
| --- | --- | --- |
| **Backend — unitaires** | Vitest | Calcul de crédit & score d'éligibilité (`services/credit`) |
| **Backend — intégration** | Vitest + Supertest | Endpoints API (`/health`, 404, auth JWT, validation Zod, routes protégées) |
| **Backend — IA** | Vitest + Supertest | Endpoints `/api/ai/*` (SDK IA & Prisma mockés → zéro quota/zéro DB, 200/400/401) |
| **Frontend — unitaires** | Vitest | Calculs crédit/éligibilité (`utils/creditCalculator`) |

```bash
npm test                              # backend + frontend
npm test -w @viewbeforebuy/backend    # backend uniquement
npm test -w @viewbeforebuy/frontend   # frontend uniquement
```

> Les tests s'exécutent en isolation, sans base de données ni services externes (Redis/Stripe/Supabase désactivés en contexte de test).

---

## 🔒 Sécurité

- **En-têtes HTTP** durcis via **Helmet** (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** restreint à `FRONTEND_URL`
- **Rate-limiting** distribué (Redis) : global + strict sur l'IA
- **Validation** systématique des entrées avec **Zod**
- **Mots de passe** hachés avec **bcrypt** ; **JWT** pour les sessions stateless
- **Rôles** (`CLIENT` / `AGENCY` / `ADMIN`) : l'espace agence est réservé au rôle `AGENCY` (garde côté frontend `RequireAuth`), les pages sont protégées et redirigent vers `/login`
- **Secrets** hors du dépôt (`.env` gitignoré)

---

## 🏆 Hackathon

Projet réalisé au **DiNext'26** — **2ᵉ place** — Université Mohammed Premier, Oujda.

| | |
| --- | --- |
| **Thème** | Digital · AI · Fintech |
| **Lieu** | Oujda, Maroc |

---

## 📄 Licence

Distribué sous licence **MIT**.

---

<div align="center">

**ViewBeforeBuy** — *Visualise. Analyse. Finance.*

Made with ❤️ in Oujda, Morocco.

</div>
