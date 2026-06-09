# Zenith Harvest — Fluxo de Teste pelo App

> Teste E2E manual, tela a tela. Cobre core-svc e analise-svc.
> Antes de começar: serviços rodando + `.env` configurado.

---

## Configuração prévia

### .env
```
EXPO_PUBLIC_API_URL=http://<seu-ip-local>:8080
```

### Criar apólice (obrigatório antes de testar sinistros)

O app não tem tela de seguradora/produto. Faça esse pré-setup via Swagger:
`http://localhost:8080/swagger-ui.html`

> Após criar o usuário no app (passo 2), volte aqui e autentique no Swagger com o token JWT.
> Copie o token da resposta de login no app (via logs de rede ou repita o login no Swagger).

**1. Criar seguradora** — `POST /api/insurers`
```json
{
  "name": "Seguradora Rural BR",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@rural-br.com",
  "phone": "1130001234",
  "insurerSituationId": 1
}
```

**2. Criar produto de seguro** — `POST /api/insurances`
```json
{
  "insurerId": "<id da seguradora>",
  "name": "Seguro Rural Básico",
  "insuranceSituationId": 1,
  "deductiblePct": 10.00,
  "graceDays": 7,
  "maxCoveragePerHectare": 8000.00,
  "baseRatePct": 2.50
}
```

**3. Criar cotação** — `POST /api/quotes`
```json
{
  "userId": "<id do usuário criado no app>",
  "plotId": "<id do talhão criado no app>",
  "insuranceId": "<id do produto>",
  "quoteSituationId": 1,
  "insuredAmount": 325000.00,
  "totalPremium": 9750.00,
  "monthlyPremium": 812.50,
  "regionalFactor": 1.10,
  "historyFactor": 1.00
}
```

**4. Aceitar cotação (gera a apólice)** — `POST /api/quotes/<id>/accept`

Após aceitar, a apólice aparece automaticamente na tela de abertura de sinistro do app.

---

## Fluxo pelo app

---

### 1. Cadastro

**Tela:** `/(auth)/signup`

| Campo | Valor de teste |
|---|---|
| Nome | `João` |
| Sobrenome | `Produtor` |
| CPF | `123.456.789-00` |
| Telefone | `(11) 99999-8888` |
| E-mail | `joao@zenith.test` |
| Senha | `Senha@123` |

**Verificar:**
- Toque "Criar conta" → spinner no botão durante a chamada
- Redireciona para o dashboard (sem tela de login intermediária)
- Senha com 7 chars → mensagem "A senha deve ter ao menos 8 caracteres"
- E-mail já cadastrado → mensagem "E-mail ou CPF já cadastrado"

---

### 2. Login

**Tela:** `/(auth)/login`

- E-mail: `joao@zenith.test` / Senha: `Senha@123`
- Ícone de olho alterna visibilidade da senha

**Verificar:**
- Credencial errada → "E-mail ou senha inválidos"
- Sucesso → dashboard carrega com nome "João"
- Token salvo em SecureStore (não aparece em `AsyncStorage`)

---

### 3. Dashboard

**Tela:** `/(app)` (index)

**Verificar:**
- Saudação com o nome do usuário e data atual
- Cards de estatísticas: fazendas, sinistros totais, sinistros em aberto
- 4 botões de atalho: Fazendas, Sinistros, Pagamentos, Chat IA
- Seção "Minhas Fazendas" (até 3, com "Ver todas")
- Seção "Sinistros Recentes" (até 3, com "Ver todos")
- Pull-to-refresh recarrega contadores
- Toque no avatar (canto superior direito) → tela de Perfil

---

### 4. Nova Fazenda

**Tela:** `/(app)/farms/new`  
Acesso: Dashboard → Fazendas → `+` no canto superior direito

| Campo | Valor |
|---|---|
| Nome | `Fazenda Boa Vista` |
| CAR | `SP-1234567-ABCDE` |
| NIRF | `12345678-0` |
| Estado (UF) | `DF` |
| Tipo de propriedade | `Própria` |
| Área total (ha) | `150` |

- Bioma: toque em **Cerrado** (chip fica destacado; toque novamente deseleciona)
- GPS: toque "Usar minha localização" → preenche latitude/longitude automaticamente
  - Ou preencha manualmente: lat `-15.7801` / lng `-47.9292`

**Verificar:**
- Campos obrigatórios vazios → alerta ao tentar salvar
- Toque "Salvar fazenda" → spinner → redireciona para o detalhe da fazenda recém-criada
- Toast "Fazenda cadastrada com sucesso"
- Fazenda aparece na lista e no dashboard

---

### 5. Detalhe da Fazenda

**Tela:** `/(app)/farms/<id>`  
Acesso: lista de fazendas → toque no card

**Verificar:**
- Exibe nome, área, estado, CAR, NIRF, latitude/longitude
- Seção "Talhões" aparece com botão "Novo talhão"
- Toque no ícone de editar (lápis) → campos ficam editáveis inline
  - Altere o nome para `Fazenda Boa Vista — Editada`
  - Toque "Salvar" → toast de confirmação

---

### 6. Novo Talhão

**Tela:** Modal na tela de detalhe da fazenda  
Acesso: detalhe da fazenda → botão "+ Novo talhão"

| Campo | Valor |
|---|---|
| Identificador | `T01` |
| Área (ha) | `50` |
| Situação | **Plantado** (chip id=2) |
| Cultura | **Soja** (chip na lista horizontal) |

- Enquanto o modal abre, um spinner carrega as culturas disponíveis
- Se nenhuma cultura aparecer: "Nenhuma cultura disponível no catálogo"

**Verificar:**
- Toque "Adicionar" → modal fecha, talhão aparece na lista
- Toast "Talhão cadastrado com sucesso"
- Situação "Plantado" exibida com cor verde no card do talhão
- Seleção de talhão na lista atualiza o gráfico NDVI abaixo

---

### 7. Mapa de Fazendas

**Tela:** `/(app)/farms/map`  
Acesso: lista de fazendas → ícone de mapa no header

**Verificar:**
- Fazendas aparecem como pinos no mapa
- Toque no pino → callout com nome e área da fazenda
- Toque no callout → navega para o detalhe da fazenda
- Botões de camada: **Padrão / Satélite / NDVI**
  - NDVI mostra badge avisando que Sentinel Hub está desabilitado (esperado em dev)
- Botão de localização centraliza o mapa na posição atual

---

### 8. Abrir Sinistro

> **Pré-requisito:** apólice criada via Swagger (ver pré-setup no início).

**Tela:** `/(app)/claims/new`  
Acesso: Dashboard → Sinistros → `+`, ou detalhe da fazenda → "Abrir sinistro"

| Campo | Valor |
|---|---|
| Número do sinistro | `SIN-2024-001` |
| Apólice | selecione `POL-XXXX` na lista de chips |
| Categoria | **Climático** (id=1) |
| Subcategoria | **Estiagem prolongada** (id=1) |
| Descrição | `Estiagem prolongada afetando talhão T01 — lavoura de soja` |

- **Foto:** toque na área de câmera → escolha "Câmera" ou "Galeria"
  - Câmera solicita permissão → captura foto → miniatura aparece
  - Toque "Remover" apaga a seleção
- GPS: detectado automaticamente (exibido abaixo da foto)

**Verificar:**
- Submeter sem apólice → alerta "Selecione a apólice"
- Submeter sem categoria → alerta "Selecione a categoria"
- Submeter sem número → alerta "Informe o número"
- Envio bem-sucedido → spinner → redireciona para detalhe do sinistro
- Toast "Sinistro registrado com sucesso!"

---

### 9. Detalhe do Sinistro + analise-svc

**Tela:** `/(app)/claims/<id>`  
Acesso: lista de sinistros → toque no card

**Verificar ao abrir:**
- Header com número `SIN-2024-001`, data de abertura e badge **Aberto** (laranja)
- **Linha do tempo** mostra 4 etapas: Aberto (●) → Em análise → Aprovado → Pago
  - Etapa atual pulsa (animação)

**Após o processamento pela analise-svc (aguarde ~5-10s, então puxe para atualizar):**

| Campo | Valor esperado |
|---|---|
| Badge de situação | **Em análise** (azul) |
| Seção "Análise Satelital NDVI" | aparece com valores antes/depois |
| NdviGauge — Antes | `0.72` (valor enviado no payload) |
| NdviGauge — Depois | valor calculado pela IA |
| Perda estimada | ex: `38.5%` |
| Confiança IA | ex: `87%` |
| Fraude | "· Alerta de fraude" (se `fraudFlag=true`) |

**Gráfico NDVI histórico (analise-svc):**
- Carregado de `GET /api/plots/{plotId}/ndvi-historico` (MongoDB via Feign)
- Exibe linha temporal com pontos, labels de data, footer com último NDVI
- Se não houver dados históricos: "Histórico NDVI ainda não disponível"

**Seção Indenização:**
- Valor calculado e aprovado aparecem como `—` até a IA processar
- Mensagem "Aguardando análise satelital" em itálico para situações 1 e 2

**Remover sinistro** (só disponível se situação = Aberto):
- Botão vermelho no final da tela → alerta de confirmação → remove e volta para a lista

---

### 10. Lista de Sinistros

**Tela:** `/(app)/claims`  
Acesso: Dashboard → Sinistros (ou atalho rápido)

**Verificar:**
- Card do sinistro mostra: número, categoria, data, mini-barra NDVI colorida (NdviHealthStrip), badge de situação
- Toque no card → detalhe
- Pull-to-refresh recarrega a lista
- Estado vazio: "Nenhum sinistro registrado"

---

### 11. Chat IA (analise-svc — Ollama)

**Tela:** `/(app)/chat` (ou via botão "Chat IA" no dashboard)

Envie uma pergunta para o llama3.2:
- `"O que é NDVI e como ele indica saúde da lavoura?"`
- `"Meu talhão está com NDVI 0.45 — isso é crítico?"`
- `"Quais as coberturas típicas de um seguro rural para soja?"`

**Verificar:**
- Mensagem enviada aparece como balão à direita
- Resposta do assistente aparece à esquerda após processamento
- Se Ollama não estiver rodando → erro de rede (esperado; inicie com `ollama run llama3.2`)

---

### 12. Pagamentos

**Tela:** `/(app)/payments`  
Acesso: Dashboard → Pagamentos, ou Perfil → Pagamentos

**Verificar:**
- Card de resumo: total recebido + quantidade de pagamentos confirmados
- Lista de pagamentos com: status (bolinha colorida), valor formatado `R$ X.XXX,XX`, badge de situação, data
- Estado vazio: "Nenhum pagamento encontrado"

> Para criar pagamentos: use `POST /api/payments` no Swagger após aprovar um sinistro.

---

### 13. Apólices

**Tela:** `/(app)/policies`  
Acesso: Perfil → Apólices

**Verificar:**
- Card por apólice: número, badge de situação (Vigente = verde)
- Detalhes: valor segurado, prêmio total, vigência início/fim (datas formatadas)
- Estado vazio: "Nenhuma apólice encontrada"

---

### 14. Perfil

**Tela:** `/(app)/profile`

**Verificar:**
- Avatar com iniciais do usuário
- Nome completo e e-mail exibidos
- ID do usuário (UUID)
- Toggle de tema escuro: muda toda a UI para dark mode e persiste ao reabrir o app
- Links: Pagamentos, Apólices, Sobre o App
- Toque "Sair" → alerta de confirmação → faz logout → SecureStore limpo → redireciona para login sem histórico de navegação

---

### 15. Sobre o App

**Tela:** `/about`  
Acesso: Perfil → Sobre o App

**Verificar:**
- Versão do app e hash do commit de build
- Plataforma (iOS / Android)
- Nomes da equipe
- Stack tecnológica listada

---

## Referência rápida de IDs do seed

| ID | Tabela | Valor |
|---|---|---|
| 2 | Biome | Cerrado ← usar na fazenda |
| 2 | PlotSituation | Plantado ← usar no talhão |
| 1 | PlotSituation | Em preparo |
| 1 | ClaimCategory | Climático ← usar no sinistro |
| 2 | ClaimCategory | Biológico |
| 3 | ClaimCategory | Operacional |
| 1 | ClaimSubCategory | Estiagem prolongada ← usar no sinistro |
| 2 | ClaimSubCategory | Geada de radiação |
| 3 | ClaimSubCategory | Tempestade de granizo |
| 1 | ClaimSituation | Aberto |
| 2 | ClaimSituation | Em análise |
| 3 | ClaimSituation | Aprovado |
| 1 | PolicySituation | Vigente |

---

## Checklist de validação

### Auth
- [ ] Signup com senha < 8 chars mostra erro correto
- [ ] Signup com dados válidos → login automático → dashboard
- [ ] Login com senha errada → erro sem travar o botão
- [ ] Logout limpa token e não permite voltar com o botão "voltar"

### Core-svc
- [ ] Criar fazenda com bioma → aparece na listagem e no mapa
- [ ] Editar nome da fazenda → reflete na lista e detalhe
- [ ] Adicionar talhão com situação e cultura → chip de situação com cor correta
- [ ] Talhão listado no detalhe da fazenda com área e situação
- [ ] Abrir sinistro com apólice válida → criado com situação "Aberto"
- [ ] Categorias e subcategorias exibidas corretamente (Climático, Biológico, Operacional)
- [ ] Apólices aparecem na tela de políticas

### Analise-svc
- [ ] Após criar sinistro, worker atualiza situação para "Em análise"
- [ ] NdviGauge exibe valores antes/depois com rótulos de saúde
- [ ] NdviHistoryChart exibe histórico do talhão (se Sentinel Hub ativo ou dados mockados no MongoDB)
- [ ] Chatbot responde perguntas em português
- [ ] Gráfico animado ao entrar na tela

### UX
- [ ] Dark mode funciona em todas as telas
- [ ] Pull-to-refresh funciona em listas
- [ ] Campos nullable exibem `—` em vez de null/undefined
- [ ] Valores monetários formatados como `R$ X.XXX,XX`
- [ ] Datas formatadas como `DD/MM/AAAA HH:MM`
- [ ] Botões desabilitados durante loading (sem duplo envio)
