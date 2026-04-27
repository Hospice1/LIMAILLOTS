# LIMAILLOTS Incident & Release Runbook

## Owners
- Product owner: Hospice1
- Technical owner: Dev Web LIMAILLOTS
- Backup owner: Support Ops

## Release Rules
- Branch `main` is production-only.
- Every release must pass: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:unit`.
- Tag format: `release-YYYY.MM.DD-N` (example: `release-2026.04.26-1`).

## Quick Rollback (1 command)
- Rollback to a known deployment URL:
  `npx vercel rollback <deployment-url> --scope hospice1s-projects`

## Emergency Checks
1. Confirm prod URL health: `https://limaillots.vercel.app`
2. Inspect latest deployment logs in Vercel dashboard
3. If impact confirmed, run rollback command immediately
4. Notify owner and create post-mortem note

## Secrets Policy
- No API key in repository.
- Keep all secrets in Vercel Environment Variables only.
- Rotate any leaked key immediately.
