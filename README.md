# CoordGeo Frontend

Frontend SPA do CoordGeo (React + TypeScript + Vite + MapLibre), integrado ao backend Django REST multi-tenant.

## Requisitos

- Node.js 20.19+ (ou 22.12+)
- npm

## Scripts

- `npm run dev` — servidor local
- `npm run build` — type-check (`tsc -b`) + build de produção
- `npm run lint` — validação estática
- `npm run preview` — preview do build

## Variáveis de ambiente

Arquivo `.env` (desenvolvimento):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

Arquivo `.env.production` (produção):

```env
VITE_API_URL=https://api.example.com/api/v1
VITE_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

## Fluxo implementado

1. Landing em `/` e cadastro em `/signup`.
2. Login em `/login` com JWT (`/token/`).
3. Resolução automática da organização ativa:
   - tenta `GET /user/organizations/`
   - fallback em `GET /user/default-organization/`
   - se necessário, envia para `/select-org`
4. Mapa em `/map` com carregamento de:
   - `/projects/`
   - `/layers/`
   - `/datasources/`
5. Telas adicionais:
   - `/settings` para gestão de projetos/camadas/datasources
   - `/upgrade` para fluxo de plano PRO

Endpoints org-scoped enviam `X-Organization-ID` automaticamente via interceptor.

Endpoints sem `X-Organization-ID` no cliente:
- `/token/`
- `/token/refresh/`
- `/auth/register/`
- `/user/profile/`
- `/user/organizations/`
- `/user/default-organization/`
- `/organizations/create-team/`

## Estabilização (Fase 1.4)

- Paginação DRF consumida automaticamente em todas as páginas (`count/next/previous/results`) para projects/layers/datasources.
- Retry automático de rede apenas para chamadas idempotentes (`GET/HEAD/OPTIONS`), com limite de 2 tentativas e backoff incremental.
- Mensagens de erro padronizadas por status HTTP (`400`, `401`, `403`, `5xx`).
- Métrica básica de falhas de API em memória (contador + últimas falhas da sessão, sem painel visual dedicado).

## Estrutura principal

- `src/services/` — cliente API + serviços de auth/geodata
- `src/state/` — stores Zustand (`authStore`, `orgStore`, `mapStore`)
- `src/pages/` — `LandingPage`, `SignupPage`, `LoginPage`, `OrgSelectPage`, `MapPage`, `SettingsPage`, `UpgradePage`
- `src/components/` — componentes de auth e mapa
- `src/types/` — tipos de domínio e API

## Testes

- Atualmente não há suíte de testes frontend executável via script (`npm run test` não está configurado).
- Dependências de teste (`vitest` e `@testing-library/*`) estão instaladas para evolução futura.

## Observações

- A base canônica da API no frontend é `/api/v1`.
- Durante transição de identificadores no backend, os serviços normalizam IDs para string no frontend.
