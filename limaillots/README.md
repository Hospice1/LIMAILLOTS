<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
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
>>>>>>> b0c67ae (feat: launch LIMAILLOTS storefront)
