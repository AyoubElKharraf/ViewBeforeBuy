<div align="center">

# ViewBeforeBuy

### Plateforme immobilière marocaine — Visualisation 3D · Assistant IA · Fintech

[![CI](https://github.com/AyoubElKharraf/ViewBeforeBuy/actions/workflows/ci.yml/badge.svg)](https://github.com/AyoubElKharraf/ViewBeforeBuy/actions/workflows/ci.yml)
[![Stack](https://img.shields.io/badge/stack-PERN-2ea44f)](#-architecture)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D)](https://redis.io/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-licence)

**Visualise. Analyse. Finance.**

</div>

---

Acheter un bien au Maroc prend en moyenne **6 à 18 mois**. **ViewBeforeBuy** accélère et sécurise ce parcours en réunissant, sur une seule plateforme :

| Pilier | Rôle |
| --- | --- |
| **Digital 3D** | Visite immersive des biens avant déplacement |
| **IA** | Copilote immobilier (RAG), conseils crédit, messagerie assistée |
| **Fintech** | Simulation de crédit, score d’éligibilité BAM, acompte Stripe |

Deux espaces utilisateurs : **Agence (B2B)** et **Client (B2C)**, avec authentification JWT, rôles et CI automatisée.

---

## Sommaire

- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Fonctionnalités](#-fonctionnalités)
- [Parcours intégrations](#-parcours-dintégrations-réalisé)
- [Pages de l’application](#-pages-de-lapplication)
- [Prérequis](#-prérequis)
- [Installation & démarrage](#-installation--démarrage)
- [Comptes de démonstration](#-comptes-de-démonstration)
- [Variables d’environnement](#-variables-denvironnement)
- [Scripts](#-scripts)
- [API REST](#-api-rest)
- [Temps réel (Socket.io)](#-temps-réel-socketio)
- [Tests & CI](#-tests--ci)
- [Structure du projet](#-structure-du-projet)
- [Sécurité](#-sécurité)
- [Checklist déploiement](#-checklist--déploiement-fin-dété)
- [Hackathon](#-hackathon)
- [Licence](#-licence)

---

## Architecture

Monorepo **PERN** (PostgreSQL · Express · React/Next.js · Node.js) géré avec **npm workspaces** :

```text
frontend/   → Next.js 15 (App Router) + React 19 + Tailwind CSS 4
backend/    → Express 5 (API REST) + Socket.io + TypeScript ESM
database/   → Prisma ORM + PostgreSQL 16 + seed de démonstration
```

```text
┌─────────────┐     HTTP /api      ┌─────────────┐     Prisma     ┌──────────────┐
│   Next.js   │ ─────────────────▶ │   Express   │ ─────────────▶ │  PostgreSQL  │
│  (port 3000)│ ◀──── WebSocket ── │  (port 4000)│                └──────────────┘
└─────────────┘                    └──────┬──────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
                 Redis              Stripe / AI            Supabase
              (cache, RL)         (Checkout, RAG)          Storage
```

Chaque service externe (Redis, Stripe, Supabase, OpenAI / Lovable, Google OAuth) est **optionnel** : l’application se dégrade proprement si la clé est absente.

---

## Stack technique

| Domaine | Technologies |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide |
| **Visualisation** | Recharts (dashboards), Three.js + React Three Fiber + Drei (visite 3D) |
| **Backend** | Node.js 22, Express 5, TypeScript (ESM / NodeNext), Zod, Helmet, Compression |
| **Logs** | Morgan + Winston |
| **Base de données** | PostgreSQL 16, Prisma ORM 6 |
| **Auth** | JWT, bcryptjs, Passport (Google OAuth2), rôles `CLIENT` / `AGENCY` / `ADMIN` |
| **Cache & perf** | Redis 7 (ioredis), rate-limit distribué (`express-rate-limit` + RedisStore) |
| **Temps réel** | Socket.io (rooms par conversation) |
| **Paiements** | Stripe Checkout (acompte) |
| **Stockage** | Supabase Storage + Multer |
| **IA** | Vercel AI SDK, OpenAI / passerelle Lovable, RAG sur biens & banques |
| **Tests** | Vitest, Supertest |
| **CI/CD** | GitHub Actions (lint + tests sur chaque push/PR) |
| **Infra locale** | Docker Compose, npm workspaces, concurrently |

---

## Fonctionnalités

### Espace Agence (B2B)

| Fonction | Détail |
| --- | --- |
| Dashboard | KPIs + graphiques Recharts (activité, répartition des types) |
| Mes biens | Catalogue, filtres, **upload photo** (Supabase) |
| Conversations IA | Messagerie temps réel (Socket.io) |
| Bibliothèque 3D | Visites immersives (Three.js) par bien |
| Statistiques | KPIs réels + graphiques (types, villes, activité) |
| Paramètres | Profil connecté, préférences agence (démo) |

### Espace Client (B2C)

| Fonction | Détail |
| --- | --- |
| Accueil | Biens en vedette, CTA simulateur / score / IA |
| Catalogue | `/client/browse` — recherche + filtres type / ville |
| Copilote IA | Chat RAG (`/client/ai-assistant`) — biens & financement |
| Simulateur | Mensualités, comparateur bancaire, **optimisation score IA** |
| Éligibilité | Score BAM (33 %), jauge, recommandations IA |
| Paiement | Acompte Stripe Checkout (success / cancel) |
| Visite 3D | Modal interactive sur les fiches biens |

### Transverse

- Inscription / connexion (JWT) + OAuth2 Google (optionnel)
- Pages protégées (`RequireAuth`) — `/agency/*` réservé au rôle **AGENCY** (ou ADMIN)
- Cache Redis, rate-limiting, validation Zod, logs structurés
- Seed démo (utilisateurs, biens, conversations, banques)

---

## Parcours d’intégrations réalisé

| # | Étape | Outils |
| --- | --- | --- |
| 1 | Hardening API | Helmet, Compression, Morgan, Winston, Zod env, rate-limit |
| 2 | Authentification | JWT, bcrypt, Passport Google OAuth2, modèle `User` |
| 3 | Redis | Cache (biens, banques), rate-limit distribué |
| 4 | Paiements | Stripe Checkout |
| 5 | Temps réel | Socket.io |
| 6 | Médias | Supabase Storage + Multer |
| 7 | 3D | Three.js / R3F / Drei |
| 8 | Analytics UI | Recharts |
| 9 | Tests | Vitest + Supertest |
| — | CI/CD | GitHub Actions (Node 22) |
| — | Produit | Login/register, rôles, pages manquantes, seed démo |
| — | IA avancée | RAG copilote + score d’éligibilité (`/api/ai/*`) |

---

## Pages de l’application

| Route | Accès | Description |
| --- | --- | --- |
| `/` | Public | Landing |
| `/login` · `/register` | Public | Auth + comptes démo préremplissables |
| `/auth/callback` | Public | Callback OAuth Google |
| `/agency` | AGENCY | Dashboard |
| `/agency/properties` | AGENCY | Gestion des biens |
| `/agency/conversations` | AGENCY | Messagerie IA |
| `/agency/library` | AGENCY | Bibliothèque 3D |
| `/agency/stats` | AGENCY | Statistiques |
| `/agency/settings` | AGENCY | Paramètres |
| `/client` | Auth | Accueil acheteur |
| `/client/browse` | Auth | Catalogue filtré |
| `/client/ai-assistant` | Auth | Copilote immobilier |
| `/client/simulator` | Auth | Simulateur de crédit |
| `/client/score` | Auth | Score d’éligibilité |
| `/payment/success` · `/cancel` | Public | Retour Stripe |

---

## Prérequis

- **Node.js 22+** (aligné avec la CI)
- **Docker Desktop** (PostgreSQL + Redis)
- Clés optionnelles : `OPENAI_API_KEY` (ou `LOVABLE_API_KEY`), Stripe, Supabase, Google OAuth

> Sans ces clés, l’app reste utilisable (réponses IA déterministes, upload/paiement désactivés proprement).

---

## Installation & démarrage

```bash
# 1. Infrastructure
docker compose up -d

# 2. Environnement
cp .env.example .env

# 3. Dépendances
npm install

# 4. Base de données (ordre important sur une DB neuve)
npm run db:migrate
npm run db:seed

# 5. Développement
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health | http://localhost:4000/health |
| PostgreSQL | `127.0.0.1:5433` |
| Redis | `127.0.0.1:6379` |

---

## Comptes de démonstration

Créés par `npm run db:seed` — mot de passe commun : **`demo1234`**

| Rôle | Email |
| --- | --- |
| **Client** | `client@viewbeforebuy.ma` |
| **Agence** | `agency@viewbeforebuy.ma` |
| **Admin** | `admin@viewbeforebuy.ma` |

Sur `/login`, un clic sur l’email préremplit le formulaire.

---

## Variables d’environnement

Fichier modèle : [`.env.example`](.env.example) — **ne jamais committer** `.env`.

| Variable | Description | Défaut / note |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL | `…@127.0.0.1:5433/viewbeforebuy` |
| `PORT` | Port API | `4000` |
| `FRONTEND_URL` | CORS | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL API côté Next | `http://localhost:4000` |
| `REDIS_URL` | Redis (vide = désactivé) | `redis://127.0.0.1:6379` |
| `JWT_SECRET` | Signature JWT | *à changer* |
| `JWT_EXPIRES_IN` | Durée du token | `7d` |
| `GOOGLE_CLIENT_ID` / `SECRET` | OAuth2 (optionnel) | — |
| `GOOGLE_CALLBACK_URL` | Callback OAuth | `…/api/auth/google/callback` |
| `STRIPE_SECRET_KEY` | Paiements (optionnel) | — |
| `STRIPE_CURRENCY` | Devise | `mad` |
| `STRIPE_DEPOSIT_PERCENT` | % acompte | `10` |
| `SUPABASE_URL` / `SERVICE_ROLE_KEY` | Storage (optionnel) | — |
| `SUPABASE_BUCKET` | Bucket images | `properties` |
| `OPENAI_API_KEY` | IA OpenAI (prioritaire) | — |
| `AI_MODEL` | Modèle OpenAI | `gpt-4o-mini` |
| `LOVABLE_API_KEY` | Passerelle IA de repli | — |

---

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Frontend + backend en parallèle |
| `npm run build` | Build database → backend → frontend |
| `npm start` | Mode production |
| `npm run lint` | ESLint / typecheck |
| `npm test` | Vitest backend + frontend (**25** tests) |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:seed` | Données + comptes démo |
| `npm run db:studio` | Prisma Studio |
| `docker compose up -d` | PostgreSQL + Redis |

---

## API REST

### Authentification

| Méthode | Route | Auth | Description |
| --- | :---: | :---: | --- |
| POST | `/api/auth/register` | — | Inscription (`role`: CLIENT \| AGENCY) |
| POST | `/api/auth/login` | — | Connexion → JWT |
| GET | `/api/auth/me` | 🔒 | Utilisateur courant |
| GET | `/api/auth/google` | — | OAuth2 Google |
| GET | `/api/auth/google/callback` | — | Callback OAuth |

### Biens & médias

| Méthode | Route | Auth | Description |
| --- | :---: | :---: | --- |
| GET | `/api/properties` | — | Liste (filtres `type`, `city`) — *caché* |
| GET | `/api/properties/:id` | — | Détail — *caché* |
| POST | `/api/properties/:id/image` | 🔒 | Upload image (Supabase) |

### Conversations & IA

| Méthode | Route | Auth | Description |
| --- | :---: | :---: | --- |
| GET | `/api/conversations` | — | Liste |
| GET | `/api/conversations/:id` | — | Détail |
| POST | `/api/conversations/:id/messages` | — | Message + diffusion Socket.io |
| POST | `/api/chat` | — | Assistant historique — *rate-limité* |
| POST | `/api/ai/chat` | 🔒 | Copilote RAG + historique — *caché 1 h* |
| POST | `/api/ai/score-eligibility` | 🔒 | Score + recommandations IA — *caché 1 h* |

### Fintech & santé

| Méthode | Route | Auth | Description |
| --- | :---: | :---: | --- |
| GET | `/api/banks` | — | Offres bancaires — *caché* |
| POST | `/api/payments/checkout` | 🔒 | Session Stripe Checkout |
| GET | `/health` | — | Health check |

---

## Temps réel (Socket.io)

| Événement | Sens | Description |
| --- | --- | --- |
| `conversation:join` | Client → serveur | Rejoindre une room |
| `conversation:leave` | Client → serveur | Quitter une room |
| `message:new` | Serveur → clients | Nouveau message diffusé |

---

## Tests & CI

**25 tests** automatisés (`npm test`) :

| Cible | Outils | Couverture |
| --- | --- | --- |
| Backend unitaires | Vitest | Crédit & éligibilité |
| Backend intégration | Vitest + Supertest | Health, auth, validation Zod |
| Backend IA | Vitest + Supertest | `/api/ai/*` (SDK & Prisma mockés) |
| Frontend | Vitest | `creditCalculator` |

**GitHub Actions** (`.github/workflows/ci.yml`) à chaque push / PR sur `main` :

`npm ci` → `db:generate` → `lint` → `test` (Node **22**)

---

## Structure du projet

```text
ViewBeforeBuy/
├── .github/workflows/ci.yml      # CI lint + tests
├── frontend/
│   ├── app/                      # Routes App Router
│   │   ├── agency/               # Dashboard, biens, conversations, library, stats, settings
│   │   ├── client/               # Accueil, browse, IA, simulateur, score
│   │   ├── login/ · register/ · auth/callback/
│   │   └── payment/              # success · cancel
│   └── src/
│       ├── components/           # 3D, AiScoreModal, RequireAuth
│       ├── hooks/
│       ├── lib/                  # api.ts, auth.tsx, socket.ts
│       └── utils/
├── backend/
│   ├── src/
│   │   ├── config/               # env Zod, passport
│   │   ├── controllers/ · routes/ · services/
│   │   ├── shared/               # redis, stripe, supabase, socket, logger, middlewares
│   │   ├── tests/                # tests IA
│   │   └── server.ts
│   └── test/                     # tests API & crédit
├── database/
│   └── prisma/                   # schema, migrations, seed (users démo)
├── docker-compose.yml
├── .env.example
└── package.json                  # workspaces
```

---

## Sécurité

- Helmet (en-têtes HTTP), CORS limité à `FRONTEND_URL`
- Rate-limiting global + strict sur les routes IA
- Validation Zod systématique (env + payloads)
- Mots de passe **bcrypt** · sessions **JWT**
- Contrôle d’accès par rôle (`CLIENT` / `AGENCY` / `ADMIN`)
- Secrets uniquement dans `.env` (gitignoré)

---

## Checklist — déploiement (fin d’été)

L’application est **complète en local**. Pour la mise en ligne plus tard :

- [ ] Hébergement : **Vercel** (frontend) + **Railway / Render** (API + Postgres + Redis)
- [ ] Variables prod : `DATABASE_URL`, `JWT_SECRET` fort, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`
- [ ] Clés optionnelles : OpenAI, Stripe, Supabase, Google OAuth (URLs de callback)
- [ ] `npm run db:migrate` + `npm run db:seed` sur la base de production
- [ ] Vérifier le badge CI vert

---

## Hackathon

Projet réalisé au **DiNext'26** — **2<sup>e</sup> place** — Université Mohammed Premier, Oujda.

| | |
| --- | --- |
| **Thème** | Digital · AI · Fintech |
| **Lieu** | Oujda, Maroc |

---

## Licence

Distribué sous licence **MIT**.

---

<div align="center">

**ViewBeforeBuy** — *Visualise. Analyse. Finance.*

Made with care in Oujda, Morocco.

</div>
