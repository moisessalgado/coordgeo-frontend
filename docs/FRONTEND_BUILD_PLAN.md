# Plano de Construção do Frontend (coordgeo-frontend)

Este plano transforma o guia em uma execução prática, incremental e validável, considerando o estado atual real do repositório `frontend`.

## Pré-requisitos obrigatórios

- Node.js **20.19+** (ou **22.12+**) para compatibilidade com Vite 7 e plugins atuais.
- npm compatível com a versão do Node instalada.
- Em caso de erro de binding nativo do Tailwind (`@tailwindcss/oxide`), limpar dependências e reinstalar:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 1) Estado Atual (auditado)

### Já concluído
- Projeto Vite + React + TypeScript criado.
- Dependências core instaladas (`react-router-dom`, `axios`, `zustand`, `maplibre-gl`).
- Dependências de testes instaladas (`@testing-library/react`, `@testing-library/jest-dom`, `vitest`).
- Dependências de estilização já instaladas (`tailwindcss`, `postcss`, `autoprefixer`).

### Pendente
- Upgrade de Node.js no ambiente local (WSL está em Node 18.x).
- Reinstalação de dependências após upgrade de Node (para resolver bindings nativos).
- Estrutura de pastas de domínio (`components`, `pages`, `services`, `state`, `types`).
- Configuração de variáveis de ambiente (`.env`, `.env.production`).
- Tipos base de domínio (auth, organization, geospatial, api).
- Bootstrap de app (roteamento, providers, integração inicial com API).

---

## 2) Diretriz Importante sobre Tailwind (v4)

O projeto está com `tailwindcss@4.x`. Nesse cenário, o fluxo recomendado não depende de `npx tailwindcss init -p`.

### Estratégia adotada
- Usar plugin oficial do Tailwind para Vite (`@tailwindcss/vite`).
- Importar Tailwind em `src/index.css` com `@import "tailwindcss";`.

Isso evita inconsistência de versões e simplifica o setup.

---

## 3) Fases de Execução

## Fase A — Baseline e confirmação do ambiente
Objetivo: garantir que o frontend atual sobe sem regressão.

Comandos:
```bash
npm run dev
npm run build
```

Critério de conclusão:
- App sobe em `http://localhost:5173`.
- Build executa sem erro.

---

## Fase B — Configurar Tailwind v4 corretamente
Objetivo: habilitar utilitários Tailwind no Vite.

Comandos:
```bash
npm install -D @tailwindcss/vite
```

Mudanças esperadas:
- `vite.config.ts`: adicionar plugin do Tailwind.
- `src/index.css`: substituir CSS padrão por `@import "tailwindcss";` (e estilos globais mínimos, se necessário).

Validação rápida:
- Aplicar uma classe utilitária em `App.tsx` (ex.: `className="p-6"`) e confirmar no navegador.

Critério de conclusão:
- Classes Tailwind aplicadas visualmente.
- `npm run build` sem erro.

---

## Fase C — Estrutura base de pastas e arquivos
Objetivo: criar base para evolução por domínio.

Estrutura alvo:
- `src/components/{Auth,Map,Layout}`
- `src/pages`
- `src/services`
- `src/state`
- `src/types`

Arquivos mínimos:
- `src/services/api.ts`
- `src/services/auth.ts`
- `src/services/geodata.ts`
- `src/state/authStore.ts`
- `src/state/orgStore.ts`
- `src/state/mapStore.ts`
- `src/types/auth.ts`
- `src/types/organization.ts`
- `src/types/geospatial.ts`
- `src/types/api.ts`

Critério de conclusão:
- Estrutura criada e importável sem erros de TypeScript.

---

## Fase D — Variáveis de ambiente
Objetivo: padronizar integração backend/frontend.

Arquivos:
- `.env`
- `.env.production`

Conteúdo inicial:
```env
VITE_API_URL=http://localhost:8000/api
VITE_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

Produção:
```env
VITE_API_URL=https://api.example.com/api
VITE_MAP_STYLE=https://demotiles.maplibre.org/style.json
```

Critério de conclusão:
- Leitura via `import.meta.env.VITE_API_URL` funcionando.

---

## Fase E — App shell e roteamento
Objetivo: trocar template padrão do Vite por shell do produto.

Rotas base:
- `/login`
- `/select-org`
- `/map`
- fallback para `/login`

Critério de conclusão:
- Navegação entre páginas estável.
- Sem dependência do conteúdo exemplo `Vite + React`.

---

## Fase F — Integração API mínima
Objetivo: preparar autenticação e contexto de organização.

Entregas:
- Cliente Axios com base URL por env.
- Interceptor para `Authorization: Bearer <token>`.
- Suporte ao header `X-Organization-ID` para endpoints org-scoped.

Critério de conclusão:
- Chamada a `/api/token/` e endpoint protegido funcionando com token/header.

---

## Fase G — Qualidade e validação contínua
Objetivo: manter feedback rápido durante evolução.

Comandos recorrentes:
```bash
npm run dev
npm run build
npm run lint
```

Opcional (após script de teste configurado):
```bash
npm test
```

Critério de conclusão:
- Build e lint verdes antes de cada commit.

---

## 4) Sequência Recomendada de Execução (curta)

1. Fase A (sanidade do baseline)
2. Fase B (Tailwind v4)
3. Fase C (estrutura)
4. Fase D (env)
5. Fase E (rotas)
6. Fase F (integração API)
7. Fase G (higiene contínua)

---

## 5) Observações práticas (Windows + WSL)

- Executar comandos no diretório raiz do frontend (onde está `package.json`).
- Se `npm run dev` estiver em execução, parar com `Ctrl + C` antes de mudanças de dependência.
- Se necessário, usar segundo terminal para instalar pacotes sem derrubar contexto de logs.

---

## 6) Próximo passo operacional

Próxima ação recomendada: iniciar pela **Fase B (Tailwind v4)**, pois isso destrava layout e UI para as fases seguintes.
