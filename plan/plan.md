# Zenith Harvest — Plano de Implementações

> Documento de referência para as próximas features do app mobile.
> Stack: React Native + Expo SDK 56 · Expo Router · TypeScript

---

## Estado atual

### Telas implementadas

| Tela | Rota | Status |
|---|---|---|
| Login | `/(auth)/login` | ✅ Completo |
| Cadastro | `/(auth)/signup` | ✅ Completo |
| Dashboard | `/(app)/index` | ✅ Completo |
| Fazendas (lista) | `/(app)/farms` | ✅ Completo |
| Fazenda (detalhe + talhões) | `/(app)/farms/[id]` | ✅ Completo |
| Nova fazenda | `/(app)/farms/new` | ✅ Completo |
| Sinistros (lista) | `/(app)/claims` | ✅ Completo |
| Sinistro (detalhe + timeline) | `/(app)/claims/[id]` | ✅ Completo |
| Novo sinistro | `/(app)/claims/new` | ✅ Completo |
| Pagamentos | `/(app)/payments` | ✅ Completo |
| Apólices | `/(app)/policies` | ✅ Completo |
| Perfil | `/(app)/profile` | ✅ Completo |
| Chat IA | `/(app)/chat` | ✅ Completo |
| Sobre o App | `/about` | ✅ Completo |

### Componentes reutilizáveis

- `EmptyState` — estado vazio com ícone, título, mensagem e CTA
- `ErrorState` — estado de erro com retry
- `LoadingState` — skeleton loader configurável
- `NdviHealthStrip` — barra colorida de saúde NDVI
- `NdviHistoryChart` — gráfico histórico de NDVI
- `NdviGauge` — gauge circular de NDVI
- `ClaimTimeline` — linha do tempo de situações do sinistro
- `KpiStatCard` — card de KPI para o dashboard
- `SkeletonBox` — caixa de skeleton animada
- `Toast` — notificação flutuante (success/error/info)
- `ZenithRefreshControl` — pull-to-refresh estilizado
- `SwipeDeleteRow` — swipe para deletar

### Infraestrutura

- ✅ Axios + interceptor JWT centralizado (`services/api.ts`)
- ✅ SecureStore para JWT (nunca AsyncStorage)
- ✅ HATEOAS parser para Spring HATEOAS (`utils/hateoas.ts`)
- ✅ Plus Jakarta Sans (400/500/600/700/800) via `@expo-google-fonts`
- ✅ Dark mode persistido com tema padrão escuro
- ✅ Tema carregado antes da splash screen (sem flash)
- ✅ `expo-splash-screen` integrado ao carregamento de fontes

---

## Implementações planejadas

### 1. Mapa de Fazendas ✅

**Prioridade:** Alta  
**Esforço:** Médio  
**Dependências:** `react-native-maps`, coordenadas já salvas nos dados de fazenda

#### Descrição

Tela de mapa interativo exibindo a localização geográfica de cada fazenda cadastrada. O pin de cada fazenda é clicável e abre um callout com nome, área e link para o detalhe.

#### Rota sugerida

`/(app)/farms/map` — acessível pelo header da tela de lista de fazendas (ícone de mapa).

#### Funcionalidades

- Pins coloridos por status (verde = ativa, amarelo = com sinistro aberto)
- Callout ao tocar: nome, área em hectares, botão "Ver detalhe"
- Centralizar mapa na região com mais fazendas ao abrir
- Fallback `EmptyState` se não houver fazendas com coordenadas
- Botão para ir para a localização atual do usuário

#### Considerações técnicas

- `react-native-maps` não funciona na web — usar WebView com Leaflet ou esconder a tab no web
- No iOS usa Apple Maps por padrão; no Android usa Google Maps (precisa de API key no `app.json`)
- Coordenadas esperadas nos dados de fazenda: `latitude` e `longitude` (já coletados via `expo-location` no formulário)

---

### 2. Integração Sentinel Hub — Overlay NDVI no Mapa ✅

**Prioridade:** Alta  
**Esforço:** Médio-alto  
**Dependências:** Conta no sentinelhub.com, `instanceId` exposto via `EXPO_PUBLIC_SENTINEL_INSTANCE_ID`

#### Descrição

Sobreposição de tiles de satélite Sentinel-2 diretamente no mapa das fazendas. O componente `UrlTile` do `react-native-maps` aceita qualquer endpoint WMS como camada de tiles — o Sentinel Hub fornece exatamente isso.

#### Camadas disponíveis

| Camada | Identificador WMS | Descrição |
|---|---|---|
| NDVI colorido | `NDVI` | Gradiente vermelho→verde por saúde vegetal |
| True color | `TRUE-COLOR` | Imagem real de satélite |
| False color | `FALSE-COLOR` | Realça vegetação em vermelho |
| Vapor d'água | `MOISTURE-INDEX` | Índice de umidade do solo |

#### Fluxo de uso

1. Usuário abre o mapa de fazendas
2. Botão "Satélite" no canto superior direito alterna entre mapa padrão e overlay NDVI
3. Slider de data permite ver imagens históricas (últimos 12 meses)
4. Ao selecionar uma fazenda, o mapa centraliza na área e aplica zoom para ver o NDVI do talhão

#### Endpoint WMS

```
https://services.sentinel-hub.com/ogc/wms/{instanceId}
  ?SERVICE=WMS
  &REQUEST=GetMap
  &LAYERS=NDVI
  &BBOX={west},{south},{east},{north}
  &WIDTH=256&HEIGHT=256
  &FORMAT=image/png
  &TIME={date}
```

#### Variável de ambiente necessária

```
EXPO_PUBLIC_SENTINEL_INSTANCE_ID=seu-instance-id-aqui
```

#### Considerações técnicas

- Plano gratuito do Sentinel Hub: 30.000 requisições/mês (suficiente para demo)
- Criar conta em: https://www.sentinel-hub.com/
- Configurar uma "Configuration" com as camadas NDVI e TRUE-COLOR
- O `instanceId` é público (aparece na URL do WMS) — seguro expor via `EXPO_PUBLIC_`
- Resolução máxima dos tiles Sentinel-2: 10m/pixel (detalhe de talhão visível)

---

### 3. Foto da Lavoura no Sinistro ✅

**Prioridade:** Média  
**Esforço:** Baixo  
**Dependências:** `expo-image-picker` (já instalado)

#### Descrição

Ao abrir um sinistro, o produtor pode anexar fotos da lavoura afetada. As imagens são enviadas para o backend junto com o formulário.

#### Funcionalidades

- Picker com opções: câmera ou galeria
- Preview das fotos selecionadas antes de enviar
- Limite de 3 fotos por sinistro
- Compressão automática antes do upload (`quality: 0.7`)
- Indicador de progresso durante upload

#### Considerações técnicas

- `expo-image-picker` já está no `package.json`
- Verificar se o `core-svc` aceita `multipart/form-data` no endpoint de sinistros
- Permissão de câmera precisa ser declarada no `app.json` (iOS: `NSCameraUsageDescription`)

---

### 4. Notificações Push ✅

**Prioridade:** Média  
**Esforço:** Médio  
**Dependências:** `expo-notifications`, configuração no backend

#### Descrição

Notificações para eventos relevantes do sinistro: aprovação, pagamento processado, nova análise NDVI disponível.

#### Eventos sugeridos

| Evento | Mensagem |
|---|---|
| Sinistro aprovado | "Sinistro #SIN-001 foi aprovado. Pagamento em processamento." |
| Pagamento liberado | "Pagamento de R$ 12.500 enviado via PIX." |
| Análise NDVI concluída | "Nova análise da Fazenda São João disponível." |

#### Considerações técnicas

- Requer configuração de webhook no backend para disparar notificações
- Token de push deve ser enviado ao backend no login
- No web, notificações push têm suporte limitado (apenas Chrome/Edge via Service Worker)

---

## Checklist de entrega (FIAP Global Solution)

- [x] Mínimo 6 telas funcionais
- [x] Tela "Sobre o App" com hash do commit (`EXPO_PUBLIC_COMMIT_HASH`)
- [x] CRUD completo via API (farms: create, read, update, delete)
- [x] Autenticação: signup + login + logout + proteção de rotas
- [ ] Publicado no Firebase App Distribution
- [ ] E-mail do professor adicionado como tester
- [ ] Vídeo demo ≤ 5 min no YouTube
- [ ] README com nomes, link YouTube e descrição
- [ ] Entregue via GitHub Classroom

---

## Ordem de implementação recomendada

1. **Mapa de Fazendas** — visual impactante para a apresentação, relativamente simples
2. **Overlay Sentinel Hub** — diferencial técnico forte, aproveita o mapa já implementado
3. **Foto no sinistro** — melhora a experiência do fluxo principal
4. **Notificações push** — depende de configuração no backend, deixar por último
