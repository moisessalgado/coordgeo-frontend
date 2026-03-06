# Plano de Construção do Frontend (coordgeo-frontend)

Plano prático, incremental e validável para evolução do frontend React/Vite. **Última atualização: Março 2026**

## Pré-requisitos obrigatórios

- Node.js **20.19+** (ou **22.12+**) para compatibilidade com Vite 7 e plugins atuais.
- npm compatível com a versão do Node instalada.
- Em caso de erro de binding nativo do Tailwind (`@tailwindcss/oxide`), limpar dependências e reinstalar:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 1) Estado Atual (Março 2026)

### ✅ Já concluído
- Projeto Vite + React + TypeScript criado e funcionando
- Dependências core: `react-router-dom`, `axios`, `zustand`, `maplibre-gl`, `tailwindcss`
- Estrutura de pastas: `components`, `pages`, `services`, `state`, `types`
- Tipos base: auth, organization, geospatial, api
- **Autenticação funcional**: login com backend integrado, JWT + refresh tokens
- **Seleção de organização**: OrgSelectPage com lista de orgs do usuário
- **Mapa interativo**: MapLibre GL com layers, datasources e projetos renderizando
- **Estado centralizado**: authStore, orgStore, mapStore com Zustand
- **Tratamento de erros**: telemetria e error handling em place
- **Tailwind v4**: configurado com plugin Vite e utilitários funcionando
- **Landing page**: apresentação da aplicação com hero e features
- **Signup page**: formulário de criação de conta com validação
- **Fluxo completo onboarding**: landing → signup → login → auto-select org → mapa
- **Freemium automático**: usuários novos recebem org padrão invisível + auto-seleção

### ⏳ Próximos focos (Fase J em diante)
1. **CRUD de dados** — Criar/editar projetos, layers e datasources
2. **Melhorias UX** — Interação com o mapa, filtros, busca, relatórios
3. **Dashboard/Analytics** — Estatísticas e insights por organização

---

## 2) Fases de Execução (Roadmap)

### ✅ Fase H — Landing page + Signup (CONCLUÍDO)
**Status: FEITO**

Entregas implementadas:

**LandingPage.tsx** ✅
- Header com logo, navegação e botões Login/SignUp
- Hero section com headline gradiente e description
- 3 feature cards (Visualização, Multi-tenant, Seguro) com ícones
- CTAs primários: "Começar agora" → /signup e "Já tenho conta" → /login
- Footer com copyright
- Design responsivo com Tailwind (mobile-first)
- Backdrop blur na navbar para efeito visual

**SignupPage.tsx** ✅
- Layout centralizado, simples e focado
- SignupForm integrada com validações
- Campo de confirmação de senha
- Validação de senha mínima (8 caracteres)
- Link para login ("Já tem uma conta?")
- Handling de erros com mensagens user-friendly

**SignupForm.tsx** ✅
- Input de email com validação nativa
- Inputs de senha e confirmação
- Validação de match de senhas
- Validação de comprimento mínimo (8 chars)
- Estado de loading com disabled button
- Estilos com Tailwind (focus states, borders)
- Feedback visual claro

**Integração Backend** ✅
- POST `/api/v1/auth/register/` conectado
- Auto-login após signup bem-sucedido
- Redirecionamento automático para /select-org
- Error handling com fallback message
- Suporte a senhas com hash no backend

**Routes & Guards** ✅
- Rota `/`: landing page acessível apenas para não-autenticados
- Rota `/signup`: acessível apenas para não-autenticados
- PublicOnlyGuard implementado
- Redirect automático: se logado & com org → /map

Critério de conclusão: ✅ PASSED
- Novo usuário consegue acessar landing page ✅
- Formulário de signup funciona com validações ✅
- Após signup → auto-login → redireciona para org selection/mapa ✅

---

### ✅ Fase I — Fluxo completo de onboarding (CONCLUÍDO)
**Status: FEITO**

Entregas:
- ✅ Rotas: `/`, `/signup`, `/login`, `/select-org`, `/map`
- ✅ Redirect inteligente baseado em autenticação + organização
- ✅ Landing page com botões de Login e Criar conta
- ✅ Auto-seleção de org padrão para freemium
- ✅ Fluxo invisível: usuario → signup → login → mapa (sem escolher org)

Critério de conclusão: ✅ PASSED
- Novo usuário faz signup no app
- Auto-login após signup ✅
- Auto-seleção de org padrão (PERSONAL) ✅
- Acessa o mapa automaticamente ✅
- Logout retorna para landing/login ✅

---

### ⏳ Fase J — CRUD de Dados (PRÓXIMO)
**Status: POR FAZER**

Objetivo: usuários conseguem criar e editar projetos, layers e datasources.

Entregas por sprint:
1. **Sprint 1 — Criar Projeto**
   - Modal/form para criar novo projeto
   - POST `/api/v1/projects/` com name, description, geometry
   - Refresh da lista após criação
   - Toast de sucesso/erro

2. **Sprint 2 — Criar Datasource**
   - Modal para criar novo datasource
   - POST `/api/v1/datasources/` com name, datasource_type, storage_url
   - Suporte a PMTiles, MVT, GeoJSON, Raster
   - Feedback visual de criação

3. **Sprint 3 — Criar Layer**
   - Modal para criar nova layer
   - POST `/api/v1/layers/` com name, project_id, datasource_id, style_config
   - Ligar layer ao datasource criado
   - Preview no mapa em tempo real

4. **Sprint 4 — Editar dados**
   - Forms para editar projetos, datasources e layers
   - PUT endpoints
   - Validar mudanças

5. **Sprint 5 — Deletar dados**
   - Confirmação de exclusão
   - DELETE endpoints

Critério de conclusão: A definir
- Usuário consegue criar, listar, editar e deletar dados pelo frontend
- Dados persistem no mapa após CRUD
- Feedback visual adequado

---

### ⏳ Fase K — Melhorias de UX (Mapa + UI) (FUTURO)
**Status: POR FAZER**

Objetivo: melhorar experiência de uso e interação.

Entregas:
1. **Interação com o mapa**
   - Click em features mostra detalhes
   - Zoom em geometria de projeto
   - Busca e filtro de layers/projetos

2. **Dashboard/Sidebar melhorado**
   - Stats por organização (projetos, layers, datasources)
   - Listagem de layers com thumbnails/preview
   - Filtro por tipo de datasource

3. **Responsividade**
   - Layout mobile-friendly
   - Sidebar colapsável em mobile

4. **Temas e acessibilidade**
   - Dark mode
   - Melhor contraste
   - ARIA labels

5. **Performance**
   - Lazy loading de dados
   - Caching estratégico

Critério de conclusão: A definir
- App funciona bem em mobile e desktop
- Mapa responsivo e interativo
- Acessibilidade em nível AA (WCAG)

---

## 3) Sequência Recomendada Atual (Março 2026)

### ✅ Fases Concluídas
- **Fase A-G**: Baseline, estrutura, auth, mapa (completo)
- **Fase H**: Landing + Signup (completo)
- **Fase I**: Fluxo completo onboarding (completo)

### 🎯 Próximo Foco: Fase J — CRUD de Dados

Recomendação: Começar por **Criar Projeto** (Sprint 1) para validar padrão e depois evoluir para datasources e layers.

**Stack para CRUD:**
- Modal/Dialog components (pode usar headless UI ou criar simples com Tailwind)
- Forms com validação
- POST/PUT/DELETE endpoints
- Refresh de listagens após operações
- Toast notifications para feedback
- Otimistic updates (opcional)

---

## 4) Observações práticas (Windows + WSL)

- Executar comandos no diretório raiz do frontend (onde está `package.json`).
- Se `npm run dev` estiver em execução, parar com `Ctrl + C` antes de mudanças de dependência.
- Backend deve estar rodando em `http://localhost:8000` para testes integrados.

---

## 5) Appendix: Fases A-G (concluídas previamente)

<details>
<summary>Ver detalhes das fases já concluídas</summary>

### Fase A — Baseline e confirmação do ambiente ✅
- App sobe em `http://localhost:5173`
- Build executa sem erro

### Fase B — Tailwind v4 ✅
- Plugin `@tailwindcss/vite` instalado
- Classes utilitárias funcionando

### Fase C — Estrutura base ✅
- Pastas: `components`, `pages`, `services`, `state`, `types`
- Arquivos de servico e estado criados

### Fase D — Variáveis de ambiente ✅
- `.env` configurado com `VITE_API_URL`

### Fase E — App shell e roteamento ✅
- Rotas: `/login`, `/select-org`, `/map`
- Guards de autenticação funcionando

### Fase F — Integração API ✅
- Cliente Axios configurado
- Interceptors para JWT e `X-Organization-ID`

### Fase G — Qualidade contínua ✅
- Build e lint operacionais
- Testes unitários configurados (Vitest)

</details>

---

## 6) Próximo passo operacional

**Ação recomendada agora**: iniciar **Fase J Sprint 1** — criar modal/form para novos projetos.

**Estrutura esperada:**
```
src/components/
├── Projects/
│   ├── ProjectForm.tsx         (novo)
│   ├── CreateProjectModal.tsx  (novo)
│   └── ProjectList.tsx         (refactor do existente)
├── Map/
│   ├── MapContainer.tsx
│   └── LayerToggle.tsx
└── ...
```

**API a ser usada:**
- `POST /api/v1/projects/` com { name, description, geometry, organization }
- Retorna novo projeto com ID e detalhes
- Refresh mapStore.fetchMapData() após sucesso
- Toast feedback (sucesso/erro)

