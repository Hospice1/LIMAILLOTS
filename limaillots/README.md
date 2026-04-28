# LIMAILLOTS

Boutique e-commerce football moderne (Next.js + TypeScript + Tailwind) avec:
- storefront responsive
- panier + wishlist
- dashboard admin
- auth admin securisee (cookie HTTP-only signee)
- persistance serveur (PostgreSQL via Prisma)

## Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL

## Variables d'environnement
Copie `.env.example` vers `.env` puis configure:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/limaillots?sslmode=require"
ADMIN_SESSION_SECRET="met-un-secret-long-et-aleatoire"
```

`ADMIN_SESSION_SECRET` doit etre prive et long (min 24 caracteres).

## Installation
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

## Build et qualite
```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

## Admin
- URL: `/admin`
- mot de passe initial: `LIMAILLOTS#2026`
- changement mot de passe + email de recuperation dans l'onglet `Securite`

## Notes de fonctionnement
- Si `DATABASE_URL` est configure, les donnees admin/boutique sont persistees en base serveur.
- Si `DATABASE_URL` est absent, l'app passe en mode demonstration (memoire serveur volatile).
- L'API admin utilise une session securisee via cookie HTTP-only signe.
