# Copilot Instructions — coordgeo/frontend

## 1) Escopo
- Este repositório é o cliente `frontend/` (React + TypeScript + Vite).
- Existe um backend separado em `../backend` (Django REST + multi-tenant).
- Mantenha mudanças focadas no frontend, exceto quando o contrato de API exigir ajuste coordenado.

## 2) Arquitetura atual
- Stack runtime: React 19, React Router, Axios, Zustand, MapLibre GL (`package.json`).
- Build tooling: Vite 7 + TypeScript.
- Tailwind v4 está ativo via plugin Vite em `vite.config.ts` (`@tailwindcss/vite`).
- Entrada global de estilos em `src/index.css` com `@import "tailwindcss";`.

## 3) Contrato com o backend (não quebrar)
- API canônica do backend: `/api/v1/`.
- Compatibilidade legada ainda existe em `/api/`.
- Auth JWT:
  - `POST /api/v1/token/` (preferido)
  - `POST /api/v1/token/refresh/` (preferido)
- Bootstrap de organizações (sem header de org):
  - `GET /api/v1/user/organizations/` (preferido)
- Endpoints org-scoped exigem:
  - `Authorization: Bearer <access_token>`
  - `X-Organization-ID: <uuid>`
- Semântica esperada de erro:
  - Header ausente → 400
  - Usuário sem membership na org → 403
- Listagens seguem paginação DRF: `count`, `next`, `previous`, `results` (`PAGE_SIZE=50`).

## 4) Fluxo de desenvolvimento
- Requisito de ambiente: Node.js `20.19+` (ou `22.12+`) para Vite 7.
- Comandos principais (na pasta `frontend/`):
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- Se usar `nvm`, prefira shell interativo (`bash -ic`) para carregar a versão correta do Node.
- Se ocorrer erro do `@tailwindcss/oxide`:
  - `rm -rf node_modules package-lock.json && npm install`

## 5) Padrões de implementação
- Não inferir organização no cliente; sempre usar org selecionada explicitamente.
- Diferenciar claramente endpoints que pedem org header dos que não pedem.
- Ao criar cliente HTTP, centralizar base URL por env e headers de auth/org.
- Seguir o plano incremental em `docs/FRONTEND_BUILD_PLAN.md` para novas entregas.

## 6) Validação antes de PR
- Frontend mínimo: `npm run build` e `npm run lint`.
- Se houver mudança no contrato de API, validar também no backend:
  - `python manage.py test -v 2` (em `backend/`).

## 7) Referências rápidas
- `package.json`
- `vite.config.ts`
- `src/index.css`
- `docs/FRONTEND_BUILD_PLAN.md`
- `../backend/api/urls.py`
- `../backend/organizations/permissions.py`# Copilot Instructions for coordgeo-frontend

## Project scope
- This workspace has two codebases:
  - `frontend/`: React + TypeScript + Vite client.
  - `backend/`: Django REST API (multi-tenant, PostGIS).
- Treat `frontend/` and `backend/` as separate repos with separate tooling.

## Frontend architecture (current state)
- Frontend is currently in early bootstrap (still close to Vite template in `src/App.tsx`).
- Runtime stack in `frontend/package.json`: React 19, Vite 7, React Router, Axios, Zustand, MapLibre GL.
- Tailwind is configured with Vite plugin (`@tailwindcss/vite`) in `frontend/vite.config.ts`.
- Global CSS entrypoint is `frontend/src/index.css` using `@import "tailwindcss";`.

## Environment and commands
- Use Node.js `20.19+` (or `22.12+`) because Vite 7 and related packages require it.
- If Node is managed by `nvm`, run commands in interactive shell (`bash -ic`) so the correct Node is loaded.
- Main frontend commands (run in `frontend/`):
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- If Tailwind native binding errors occur (`@tailwindcss/oxide`), reset deps:
  - `rm -rf node_modules package-lock.json && npm install`

## Backend integration contract (must preserve)
- Auth uses JWT:
  - `POST /api/token/`
  - `POST /api/token/refresh/`
- Organization bootstrap endpoint (no org header required):
  - `GET /api/user/organizations/`
- Main org-scoped resources are exposed through DRF router in `backend/api/urls.py`:
  - `/api/users/`, `/api/organizations/`, `/api/memberships/`, `/api/teams/`
  - `/api/projects/`, `/api/layers/`, `/api/datasources/`, `/api/permissions/`
- For org-scoped endpoints, frontend must send:
  - `Authorization: Bearer <access_token>`
  - `X-Organization-ID: <uuid>`
- Missing `X-Organization-ID` returns 400; unauthorized org returns 403 (enforced by `backend/organizations/permissions.py`).
- List endpoints are paginated by default (`count/next/previous/results`, `PAGE_SIZE=50` in `backend/config/settings.py`).
- CORS is configured for local frontend hosts in `backend/config/settings.py` (`localhost:5173`, `127.0.0.1:5173`).

## Backend multi-tenant patterns (for full-stack edits)
- Org isolation is implemented in permission class `IsOrgMember`, which sets `request.active_organization`.
- ViewSets filter by active org in `get_queryset()` and enforce org in `perform_create()`.
- Reference examples:
  - `backend/projects/views.py`
  - `backend/data/views.py`
  - `backend/permissions/views.py`

## Testing workflows
- Backend full suite: `python manage.py test -v 2` (inside `backend/`).
- Backend helper: `python run_tests.py` (uses `keepdb=True`).
- Frontend currently has Vitest dependency installed, but no stable `npm test` script yet; prefer `npm run build` + `npm run lint` for validation.

## Conventions in this workspace
- Keep changes minimal and scoped to the active repo.
- Do not infer organization context on the client; always use selected org ID.
- Keep frontend API clients explicit about required headers per endpoint (org header is required for org-scoped endpoints, but not for `/api/token/` and `/api/user/organizations/`).
- Prefer Portuguese commit messages (project convention from backend README).
- Before adding new frontend features, check `frontend/docs/FRONTEND_BUILD_PLAN.md` for current execution phases.
