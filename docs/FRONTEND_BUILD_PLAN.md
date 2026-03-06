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

### ⏳ Fase J — CRUD de Dados (EM ANDAMENTO)
**Status: Sprint 1, 2, 3 e 4 CONCLUÍDAS**

Objetivo: usuários conseguem criar e editar projetos, layers e datasources.

Entregas por sprint:
1. **✅ Sprint 1 — Criar Projeto (CONCLUÍDO)**
   - ✅ Modal/form para criar novo projeto
   - ✅ POST `/api/v1/projects/` com name, description, geometry
   - ✅ Refresh da lista após criação
   - ✅ Feedback visual de sucesso/erro
   - **Componentes criados:**
     - `ProjectForm.tsx`: Formulário reutilizável com validação
     - `CreateProjectModal.tsx`: Modal container com integração API
     - `ProjectList.tsx`: Lista de projetos na sidebar com botão "Novo"
   - **Serviço:** Método `createProject()` adicionado ao `geodataService`
   - **Integração:** MapPage atualizado com ProjectList e modal

2. **✅ Sprint 2 — Desenhar e criar Layer (CONCLUÍDO)**
   - ✅ Ferramentas de desenho: ponto, linha, polígono
   - ✅ Integração com maplibre-gl-draw
   - ✅ Geoprocessamento client-side com Turf.js
   - ✅ Cálculo automático de área, perímetro e coordenadas
   - ✅ Modal para salvar geometria desenhada como layer
   - ✅ POST `/api/v1/layers/` com geometria e vinculação ao projeto
   - ✅ Datasource GeoJSON inline criado automaticamente
   - ✅ Refresh automático do mapa após criação
   - **Bibliotecas adicionadas:**
     - `maplibre-gl-draw@1.6.9`: Desenho interativo no mapa
     - `@turf/turf@7.2.0`: Operações geoespaciais client-side
   - **Componentes criados:**
     - `DrawControls.tsx`: Botões de controle de desenho
     - `CreateLayerModal.tsx`: Modal com form e cálculos geométricos
   - **Serviços:** Métodos `createLayer()` e `createDatasource()` no `geodataService`

3. **✅ Sprint 3 — Editar geometrias (CONCLUÍDO)**
   - ✅ Botão "Editar" nos controles de desenho
   - ✅ Modo de edição do maplibre-gl-draw (direct_select)
   - ✅ Carrega geometria existente para edição
   - ✅ PATCH para atualizar geometria e metadados
   - ✅ Recalcula métricas com Turf.js após edição
   - ✅ Suporte apenas para layers desenhadas (GeoJSON inline)
   - ✅ Cria novo datasource e atualiza layer (versionamento de geometrias)
   - **Componentes criados:**
     - `EditLayerModal.tsx`: Modal para selecionar e editar layer
   - **Componentes atualizados:**
     - `DrawControls.tsx`: Adicionado botão e estado de edição
     - `MapContainer.tsx`: Integração completa do fluxo de edição
   - **Serviços:** Método `updateLayer()` adicionado ao `geodataService`

4. **✅ Sprint 4 — Deletar layers (CONCLUÍDO)**
   - ✅ Botão 🗑️ de exclusão na lista de layers
   - ✅ Modal de confirmação de deleção
   - ✅ DELETE `/api/v1/layers/:id/`
   - ✅ Feedback visual (loading state)
   - ✅ Refresh automático do mapa após deleção
   - ✅ Tratamento de erros com mensagem user-friendly
   - **Componentes criados:**
     - `DeleteLayerModal.tsx`: Modal de confirmação de deleção
   - **Componentes atualizados:**
     - `LayerToggle.tsx`: Adicionado botão de deleção ao lado de cada layer
     - `MapPage.tsx`: Integração do modal de deleção
   - **Serviços:** Método `deleteLayer()` adicionado ao `geodataService`

Critério de conclusão: ✅ Sprint 1, 2, 3 e 4 CONCLUÍDAS
- ✅ Usuário consegue criar projetos
- ✅ Usuário desenha geometrias no mapa (ponto, linha, polígono)
- ✅ Geometrias são salvas como layers vinculadas a projetos
- ✅ Datasources GeoJSON criados automaticamente
- ✅ Cálculos de área/perímetro exibidos
- ✅ Usuário consegue editar geometrias de layers existentes
- ✅ Edição atualiza datasource e recalcula métricas
- ✅ Usuário consegue deletar layers com confirmação
- ✅ CRUD completo de layers

---

### ⏳ Fase K — Melhorias de UX (Mapa + UI) (EM ANDAMENTO)
**Status: Sprint 1 iniciada**

Objetivo: melhorar experiência de uso e interação.

Entregas por sprint:

1. **✅ Sprint 1 — Interação com features (CONCLUÍDO)**
   - ✅ Click em features no mapa mostra detalhes
   - ✅ Painel com informações da layer/datasource
   - ✅ Zoom em geometria de projeto com botão
   - ✅ Animação suave de zoom com duração de 1s
   - **Componentes criados:**
     - `FeatureDetailsPanel.tsx`: Painel com detalhes da layer ao clicar
   - **Componentes atualizados:**
     - `MapContainer.tsx`: Listener de click para features
     - `ProjectList.tsx`: Adicionado botão 🔍 para zoom
     - `MapPage.tsx`: Integração do zoom de projetos
   - **Funcionalidades:**
     - Click em feature mostra painel com nome, descrição, datasource type e metadados
     - Botão zoom em lado de cada projeto (se tiver geometria)
     - Calcular bounds automático e fazer fitBounds com padding

2. **Sprint 2 — Busca e filtro**
   - Busca por nome de projeto/layer
   - Filtro por tipo de datasource
   - Aplicar filtros em real-time na UI

3. **Sprint 3 — Dashboard melhorado**
   - Stats de projetos, layers, datasources por org
   - Cards com informações resumidas
   - Miniatura/preview de layers

4. **Sprint 4 — Responsividade mobile**
   - Layout colapsável em mobile
   - Touch-friendly controls
   - Responsive sidebar

5. **Sprint 5 — Temas e acessibilidade**
   - Dark mode
   - Melhor contraste (WCAG AA)
   - ARIA labels

Critério de conclusão Sprint 1: ✅ PASSED
- ✅ Click em feature mostra painel
- ✅ Painel exibe informações corretas
- ✅ Botão de zoom em projetos funciona
- ✅ Zoom com animação suave
- ✅ Zoom funciona com qualquer tipo de geometria

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

