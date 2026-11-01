# QA Build & Test Guide — CaveWorld

Authoritative commands for local validation runs. Derived from the Local Runbook (doc 30d790bf) and the Quality & Test Strategy (doc bd53db55). All npm commands run from `CWFrontend/`.

## Environment

- Node v24.21.0 (target 22 LTS exceeded), npm 11.19.0, Git 2.31.1
- Docker Desktop 29.8.2, Linux containers, Compose v5.5.1
- Worktrees live under `.synod-worktrees/<story-key>/`; each fresh worktree needs `npm ci` in `CWFrontend/` first (never share node_modules)

## Commands

| Purpose | Command (cwd) | Timeout guidance |
| --- | --- | --- |
| Install deps | `npm ci --no-audit --no-fund` (CWFrontend) | 15m (1425 pkgs ≈ 45s warm) |
| Production build (build gate) | `npm run build` (CWFrontend) | 20m |
| Type check | `npx tsc --noEmit -p tsconfig.json` (CWFrontend) | 10m |
| Unit tests + coverage gate (hard-fails on miss via jest.config.js) | `CI=true npm test -- --coverage --watchAll=false` (CWFrontend) | 15m |
| Single-file unit run | `CI=true npm test -- <pattern> --watchAll=false` (CWFrontend) | 10m |
| Cypress integration suite (builds SPA in Docker, nginx + cypress/included:13.15.0) | `docker compose -f docker-compose-test.yml up --build --abort-on-container-exit` (repo root) | 25m (first image build ~5m, suite ~3-5m) |

## Notes for QA runs

- `npm test` from the repo root fails — no root package.json.
- Use `npm ci`, not `npm install` (lockfileVersion 3 stays authoritative).
- The coverage gate ratchets only files listed in `CWFrontend/jest.config.js` `collectCoverageFrom`; story changes must add their touched `src/` files there (minus strategy allow-list: TextureService, Cave, Map, `*.d.ts`, plus same-family new WebGL wrappers).
- No git push, no destructive git commands, no `docker system prune`/`down -v` unless asked.
- Pre-existing build warnings: eslint warnings in `ConstructScaffoldingGoal.tsx` etc. exist on master — not a QA blocker.
