# Zenith Harvest — Fluxo de Teste E2E

> Cobre core-svc (CRUD, auth, policies, claims) e analise-svc (chatbot, NDVI histórico, análises satelitais).

---

## Pré-requisitos

| Item | Valor padrão |
|---|---|
| Gateway | `http://<seu-ip-local>:8080` |
| core-svc | `:8081` (interno) |
| analise-svc | `:8082` (interno) |
| Swagger core-svc | `http://localhost:8080/swagger-ui.html` |
| Swagger analise-svc | `http://localhost:8082/swagger-ui.html` |
| PostgreSQL | `localhost:5432/zenith` |
| MongoDB | `localhost:27017/zenith` |
| Ollama | `localhost:11434` (llama3.2) |

**Variável de ambiente no app:**
```
EXPO_PUBLIC_API_URL=http://<seu-ip-local>:8080
```

---

## Seed automático (recomendado)

Executa todos os passos de setup via API e imprime os IDs:

```bash
chmod +x scripts/seed-test.sh
./scripts/seed-test.sh
# ou com outro host:
API_BASE=http://192.168.0.10:8080 ./scripts/seed-test.sh
```

O script cria: usuário → farm → plot (Soja, Plantado, 50ha) → seguradora → produto → cotação → **apólice ativa** → sinistro aberto.

---

## Fluxo manual passo a passo

### FASE 1 — Autenticação (app)

**Tela: Cadastro**
1. Abra o app → toque em "Criar conta"
2. Preencha:
   - Nome: `João` / Sobrenome: `Produtor`
   - CPF: `123.456.789-00`
   - Telefone: `(11) 99999-8888`
   - E-mail: `joao@zenith.test`
   - Senha: `Senha@123` *(mínimo 8 chars — backend valida isso)*
3. Toque "Criar conta" → deve redirecionar para o dashboard

**Tela: Login** (se não foi redirecionado)
- Use as mesmas credenciais acima

**O que verificar:**
- Token JWT gravado em SecureStore (não aparece em logs de rede)
- Dashboard carrega sem erros

---

### FASE 2 — Fazendas (core-svc)

**Tela: Fazendas → Nova fazenda**

Preencha com dados válidos:
```
Nome:            Fazenda Boa Vista
CAR:             SP-1234567-ABCDE
NIRF:            12345678-0
Estado (UF):     DF
Tipo propr.:     Própria
Área total (ha): 150
```
- Aguarde o GPS preencher latitude/longitude (ou digite: `-15.7801` / `-47.9292`)
- Selecione o bioma: **Cerrado** (id=2)
- Toque "Salvar fazenda"

**Tela: Detalhe da fazenda → Adicionar talhão**
- Toque "+ Novo talhão" (modal)
- Identificador: `T01`
- Área (ha): `50`
- Situação: **Plantado** (id=2)
- Cultura: **Soja** (selecionar no chip)
- Toque "Adicionar"

**O que verificar:**
- Farm e Plot aparecem listados
- `plotSituationId: 2` (Plantado) visível na tela de detalhe
- Cultura "Soja" vinculada ao talhão

**Editar fazenda:**
- Na tela de detalhe, toque no ícone de editar
- Mude o nome para `Fazenda Boa Vista - Editada`
- Salve e confirme que o nome atualizou

**Excluir fazenda (cleanup):**
- Após os testes, você pode excluir via Swagger `DELETE /api/farms/{id}`

---

### FASE 3 — Setup de apólice via Swagger (core-svc)

> O app não tem tela de criação de seguradoras/produtos. Use o Swagger: `http://localhost:8080/swagger-ui.html`
> Autentique: clique "Authorize" e cole o token JWT do passo anterior (sem o prefixo `Bearer `).

**3a. Criar seguradora** — `POST /api/insurers`
```json
{
  "name": "Seguradora Rural BR",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@rural-br.com",
  "phone": "1130001234",
  "insurerSituationId": 1
}
```
Anote o `id` retornado → **{insurerId}**

**3b. Criar produto de seguro** — `POST /api/insurances`
```json
{
  "insurerId": "{insurerId}",
  "name": "Seguro Rural Básico",
  "insuranceSituationId": 1,
  "deductiblePct": 10.00,
  "graceDays": 7,
  "maxCoveragePerHectare": 8000.00,
  "baseRatePct": 2.50
}
```
Anote o `id` → **{insuranceId}**

**3c. Criar cotação** — `POST /api/quotes`
```json
{
  "userId": "{userId}",
  "plotId": "{plotId}",
  "insuranceId": "{insuranceId}",
  "quoteSituationId": 1,
  "insuredAmount": 325000.00,
  "totalPremium": 9750.00,
  "monthlyPremium": 812.50,
  "regionalFactor": 1.10,
  "historyFactor": 1.00
}
```
Anote o `id` → **{quoteId}**

**3d. Aceitar cotação (gera apólice)** — `POST /api/quotes/{quoteId}/accept`
- Retorna a apólice criada com `policySituationId: 1` (Vigente)
- Anote o `id` da apólice → **{policyId}** e o `policyNumber`

---

### FASE 4 — Sinistros (core-svc + dispara analise-svc)

**Tela: Sinistros → Abrir Sinistro**
1. Número do sinistro: `SIN-2024-001`
2. Apólice: selecione a criada no passo anterior
3. Categoria: **Climático** (id=1)
4. Subcategoria: **Estiagem prolongada** (id=1)
5. Descrição: `Estiagem prolongada afetando lavoura de soja — talhão T01`
6. Foto: opcional (câmera ou galeria)
7. GPS: deve auto-preencher
8. Toque "Enviar Sinistro"

**O que verificar:**
- Sinistro criado com `claimSituationId: 1` (Aberto)
- Criação dispara evento RabbitMQ `sinistro.aberto` → analise-svc processa assincronamente
- Após alguns segundos, recarregue → situação deve mudar para **Em análise** (id=2)
- Campos `ndviAfter`, `mlConfidenceScore` são preenchidos pelo worker da IA

**Linha do tempo (tela de detalhe do sinistro):**
```
[●] Aberto → [●] Em análise → [ ] Aprovado → [ ] Pago
```

---

### FASE 5 — Análise satelital (analise-svc)

**Via Swagger analise-svc** (`http://localhost:8082/swagger-ui.html`)

**5a. NDVI histórico (MongoDB)**
```
GET /api/ndvi/{plotId}/historico
```
Retorna série temporal de NDVI (dados do Sentinel Hub ou mock se `sentinel-hub.enabled=false`).

**5b. Análises satelitais (Postgres)**
```
GET /api/ndvi/{plotId}/analises
```
Retorna análises geradas pelo worker após o sinistro. Campos relevantes:
- `meanNdvi` — NDVI médio da imagem
- `mlConfidence` — confiança do modelo (0-1)
- `satelliteClassId` — 1=Saudável, 2=Estresse leve, 3=Moderado, 4=Severo, 5=Solo exposto
- `affectedAreaM2` — área afetada em m²

**No app (tela de detalhe do sinistro):**
- Componente `NdviGauge` exibe NDVI antes/depois
- Componente `NdviHistoryChart` exibe o histórico carregado de `/api/plots/{plotId}/ndvi-historico`

---

### FASE 6 — Chatbot (analise-svc)

**Tela: Chat** (se disponível no app)

Exemplos de perguntas para testar o llama3.2 via Ollama:
- `"Qual é o NDVI ideal para soja no cerrado?"`
- `"Meu talhão T01 está com NDVI 0.45, o que isso significa?"`
- `"Como identificar sinistro de estiagem em lavoura de soja?"`

**Via Swagger:** `POST /api/chatbot`
```json
{ "mensagem": "O que é NDVI e como ele ajuda no seguro rural?" }
```

**O que verificar:**
- Resposta retornada em `resposta` (string)
- Ollama deve estar rodando em `localhost:11434`
- Se Ollama não estiver disponível, o endpoint retorna 500

---

### FASE 7 — Pagamentos (core-svc)

> Fluxo pós-aprovação. Requer aprovação do sinistro via Swagger primeiro.

**7a. Aprovar sinistro** — `POST /api/claims/{claimId}/approve?approvedAmount=50000`

**7b. Criar pagamento** — `POST /api/payments`
```json
{
  "paymentTypeId": 1,
  "paymentSituationId": 1,
  "claimId": "{claimId}",
  "amount": 50000.00,
  "pixKey": "joao@zenith.test"
}
```

**7c. Confirmar pagamento** — `POST /api/payments/{paymentId}/confirm?pspTransactionId=PSP-123456`

**No app:**
- Tela de Pagamentos mostra a lista com situação **Pendente → Confirmado**

---

### FASE 8 — Alertas preventivos (analise-svc worker)

O worker roda diariamente às 06h00 (cron `0 0 6 * * *`). Para disparar manualmente:

**Via Swagger analise-svc:** `POST /api/varredura/alertas`

Cria alertas em talhões onde o NDVI histórico indica queda. No app:
- Se houver tela de alertas, alertas com `alertSituationId: 1` (Aberto) aparecem em destaque
- Marcar como visualizado via `POST /api/preventive-alerts/{id}/view`

---

## Referência rápida de IDs do seed

| Entidade | ID | Valor |
|---|---|---|
| Biome | 1 | Amazônia |
| Biome | 2 | Cerrado ← usar no teste |
| Biome | 3 | Caatinga |
| PlotSituation | 1 | Em preparo |
| PlotSituation | 2 | Plantado ← usar no teste |
| ProductionSystem | 1 | Sequeiro |
| ProductionSystem | 2 | Irrigado |
| ClaimCategory | 1 | Climático ← usar no teste |
| ClaimCategory | 2 | Biológico |
| ClaimCategory | 3 | Operacional |
| ClaimSubCategory | 1 | Estiagem prolongada ← usar no teste |
| ClaimSubCategory | 2 | Geada de radiação |
| ClaimSubCategory | 3 | Tempestade de granizo |
| PaymentType | 1 | Indenização sinistro PIX (OUT) |
| AlertSeverity | 1 | Informativo (#2E7D32) |
| AlertSeverity | 2 | Atenção (#F9A825) |
| AlertSeverity | 3 | Crítico (#C62828) |

---

## Checklist de validação

- [ ] Cadastro e login funcionando (JWT em SecureStore, não em AsyncStorage)
- [ ] Criação de fazenda com bioma persiste no banco
- [ ] Talhão criado com `plotSituationId` correto e crop vinculada
- [ ] Apólice visível na tela de abertura de sinistro
- [ ] Sinistro criado com `categoryId` e `subCategoryId` válidos (sem FK error)
- [ ] Worker analise-svc processa o evento RabbitMQ após criação do sinistro
- [ ] NDVI histórico carrega no detalhe do sinistro (NdviHistoryChart)
- [ ] Análises satelitais disponíveis via `GET /api/ndvi/{plotId}/analises`
- [ ] Chatbot responde (Ollama rodando)
- [ ] Pagamento confirmado muda `claimSituationId` para 5 (Pago)
- [ ] Logout limpa SecureStore e redireciona para login
