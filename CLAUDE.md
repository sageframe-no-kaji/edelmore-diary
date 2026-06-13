# edelmore-diary

A cottage-core private diary for children — SvelteKit full-stack app, SQLite, Docker homelab deploy.

## Languages

@~/.claude/modules/languages-web.md

## Stack

- SvelteKit 2 (TypeScript, Svelte 5 runes)
- SQLite via `better-sqlite3`
- Tailwind v4 (via `@tailwindcss/vite` — no `tailwind.config.js` needed)
- Custom CSS 3D page-turn primitive in `(authenticated)/+layout.svelte` (StPageFlip was rejected during ho-03 — see system design)
- argon2id via `argon2` npm package (PIN hashing)
- `faster-whisper` (separate homelab service) for voice transcription

## Verification stack

- **Lint + format:** Biome for `.ts`/`.js`/`.json` — `npm run lint`
- **Type check:** `svelte-check` for `.svelte` files + TypeScript strict — `npm run check`
  - Note: Biome does not yet support `.svelte` files; `svelte-check` covers them
- **Tests:** Vitest — `npm run test` (`npm run test:coverage` to enforce the floor)
- **Coverage floor:** 95% lines (`@vitest/coverage-v8`, threshold in `vite.config.ts`)
- **Pre-commit:** lefthook runs lint, svelte-check, and test:coverage on every commit (`lefthook install` to activate)
- **CI:** lint + check + coverage must pass before the Docker image publishes (`.github/workflows/docker.yml`)

## Project-specific rules

- Auth: 4-digit PIN per user, hashed via argon2id. Server-issued session cookie, 30-day expiry, refreshed on each visit. No password recovery — reset PINs at the SQLite level.
- Network gate is Tailscale + LAN. PIN is the sibling gate. No public exposure.
- `/admin` (account creation) is gated by the `ADMIN_PIN` env var; unset = open, for first-run bootstrap only.
- Database: `data/edelmore.db` (one file, three tables). Schema reference in `src/lib/db.ts`.
- Autosave: UPSERT against `(user_id, entry_date)` unique constraint, triggered 1.5s after last keystroke.
- Transcription API contract: `POST /api/transcribe` — multipart audio → `{ "text": "..." }`
- `data/` is gitignored. `data/edelmore.db` lives there in development and in the Docker volume mount.
- Secrets in `.env` only (gitignored). `.env.example` is the committed template.
- Private prompts in `prompts/` (gitignored).

## Project documents

Kamae chain lives in `ho-process/` (gitignored — private practitioner work):
- `ho-process/kamae-1-edelmore-diary-seed.md` — Kamae 1+2, braided (seed + system design)
- `ho-process/kamae-2-edelmore-system-design.md` — Kamae 2 standalone
- `ho-process/hos/` — per-ho documents (Kamae 5)

## Deployment

Production runs on **jodo** (homelab Docker host, x86_64) as `svc-edelmore-diary`, port
`8025:3000`, behind Caddy at `diary.sageframe.net`. Voice services (Whisper transcription,
Kokoro TTS) are separate homelab services on **shingan** — optional; the diary degrades
gracefully without them.

**Deploy pattern: build-on-host from git.** jodo holds a read-only deploy-key clone of this
repo at `/opt/services/jodo-edelmore-diary/code` (the deploy key is registered on the GitHub
repo under "jodo-build-deploy"; jodo's `~/.ssh/config` maps `github.com` → `~/.ssh/edelmore_deploy`).
The host `docker-compose.yml` uses `build: ./code`, so a deploy is:

```
ssh jodo 'cd /opt/services/jodo-edelmore-diary && git -C code pull && docker compose up -d --build'
```

Native amd64 build, no image transfer. The SQLite DB lives on the `./data` bind-mount
(`/opt/services/jodo-edelmore-diary/data`) and is never touched by a rebuild. Push to `main`
first so the host pulls verified code (CI gates lint/check/tests on `main`, and also publishes
a `ghcr.io` image as a byproduct — currently unused by the host).

The host compose is tracked in the `sageframe-config` repo
(`jodo/opt/services/jodo-edelmore-diary/docker-compose.yml`); sync it after any host-side change
via the `sageframe-config-sync` skill.

## References

- System design: `ho-process/kamae-2-edelmore-system-design.md`
- StPageFlip: https://github.com/Nodlik/StPageFlip
- SvelteKit docs: https://kit.svelte.dev
- faster-whisper: separate homelab service (already running)
