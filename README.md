# CoordGeo Frontend

Frontend SPA do CoordGeo (React + TypeScript + Vite + MapLibre), integrado ao backend Django REST multi-tenant.

## Requisitos

- Node.js 20.19+ (ou 22.12+)
- npm

## Scripts

- `npm run dev` — servidor local
- `npm run build` — build de produção
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

1. Login em `/login` com JWT (`/token/`)
2. Seleção de organização em `/select-org` (`/user/organizations/`)
3. Mapa em `/map` com carregamento de:
   - `/projects/`
   - `/layers/`
   - `/datasources/`

Endpoints org-scoped enviam `X-Organization-ID` automaticamente via interceptor.

## Estabilização (Fase 1.4)

- Paginação DRF consumida em todas as páginas (`count/next/previous/results`) para projects/layers/datasources.
- Retry automático de rede (backoff simples) para chamadas idempotentes.
- Mensagens de erro padronizadas por status HTTP (`400`, `401`, `403`, `5xx`).
- Métrica básica de falhas de API em memória (contador por sessão).

## Estrutura principal

- `src/services/` — cliente API + serviços de auth/geodata
- `src/state/` — stores Zustand (`authStore`, `orgStore`, `mapStore`)
- `src/pages/` — `LoginPage`, `OrgSelectPage`, `MapPage`
- `src/components/` — componentes de auth e mapa
- `src/types/` — tipos de domínio e API

## Observações

- O backend mantém compatibilidade legada em `/api`, mas o frontend usa `/api/v1` como base canônica.
- Durante transição de identificadores no backend, os serviços normalizam IDs para string no frontend.
