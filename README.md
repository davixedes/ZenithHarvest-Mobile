# Integrantes

- Davi Praxedes Santos Silva - RM 560719
- Kauê Vinicius Samartino da Silva - RM 559317
- João dos Santos Cardoso de Jesus - RM 560400
- Alexis Ronaldo Quirijota Rondo - RM 560384

# Link Youtube
https://youtu.be/CIySOhyJZEI

# Zenith Harvest — App Mobile

> Plataforma de seguro paramétrico agrícola operada por satélite e inteligência artificial.
> Quando o índice NDVI cai, a IA aprova o sinistro automaticamente e o pagamento vai via PIX.

**Global Solution · FIAP · 4º Semestre · 2025**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Navegação | Expo Router (file-based routing) |
| HTTP | Axios com interceptor JWT centralizado |
| Auth storage | expo-secure-store |
| Mapas | react-native-maps (MapView) |
| Localização | expo-location |
| Câmera / galeria | expo-image-picker |
| Tipagem | TypeScript 6 |
| Lint / Format | ESLint + Prettier |

---

## Pré-requisitos

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular **ou** Android Emulator / iOS Simulator
- Backend Zenith-API rodando (ver repositório `Zenith-API`)

---

## Instalação

```bash
git clone <url-do-repositório>
cd ZenithApp
npm install
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://<seu-ip-local>:8080
EXPO_PUBLIC_COMMIT_HASH=dev
```

> O IP deve ser o da máquina que roda o backend, acessível pelo celular/emulador.
> Não use `localhost` — o dispositivo não consegue resolver para a sua máquina.

---

## Como rodar

```bash
# Expo Go (iOS / Android)
npm start

# Emulador Android
npm run android

# Simulador iOS
npm run ios

# Navegador (web)
npm run web
```

---

## Estrutura do projeto

```
app/
 ├─ (auth)/              # Rotas públicas
 │   ├─ login.tsx
 │   └─ signup.tsx
 ├─ (app)/               # Rotas protegidas (redireciona se sem JWT)
 │   ├─ index.tsx        # Dashboard
 │   ├─ farms/
 │   │   ├─ index.tsx    # Lista de fazendas
 │   │   ├─ new.tsx      # Cadastrar fazenda
 │   │   ├─ [id].tsx     # Detalhe + talhões + NDVI
 │   │   └─ map.tsx      # Mapa com pinos Sentinel
 │   ├─ claims/
 │   │   ├─ index.tsx    # Lista de sinistros
 │   │   ├─ new.tsx      # Abrir sinistro
 │   │   └─ [id].tsx     # Detalhe + NDVI + indenização
 │   ├─ chat.tsx         # Chatbot IA (llama3.2 via Ollama)
 │   ├─ payments.tsx     # Pagamentos
 │   ├─ policies.tsx     # Apólices
 │   └─ profile.tsx      # Perfil + dark mode + logout
 └─ about.tsx            # Sobre o App (obrigatório — exibe hash do commit)
components/              # Componentes reutilizáveis
services/                # Chamadas de API (um arquivo por domínio)
hooks/                   # Custom hooks
utils/                   # Funções puras (máscaras, HATEOAS, storage)
constants/               # Tema, cores, tipografia, URL da API
store/                   # AuthContext (JWT + usuário)
```

---

## Funcionalidades

### Autenticação
- Cadastro de produtor rural com CPF, telefone e senha
- Login com JWT salvo em `expo-secure-store`
- Logout limpa o storage e redireciona sem histórico de navegação

### Fazendas
- CRUD completo de fazendas (nome, CAR, NIRF, estado, bioma, GPS)
- Localização GPS automática no cadastro
- Mapa interativo com pinos e camadas Satélite / NDVI (Sentinel-2)
- Talhões por fazenda com situação, cultura e área

### Sinistros
- Abertura de sinistro vinculado a uma apólice
- Captura de foto do dano (câmera ou galeria)
- GPS automático na abertura
- Linha do tempo visual do ciclo do sinistro
- Análise NDVI antes/depois gerada pela IA após processamento satelital
- Gráfico histórico de NDVI do talhão

### Análise via satélite (analise-svc)
- Histórico NDVI do talhão (séries temporais do MongoDB)
- Análises satelitais Postgres geradas pelo worker após cada sinistro
- Score de confiança da IA e flag de suspeita de fraude
- Varredura preventiva de NDVI: quando o índice cai, gera alerta e notifica via PIX
  (backend — `POST /api/varredura/alertas` dispara; alertas em `/api/alertas`)

### Chatbot IA
- Chat especializado em agronegócio via llama3.2 (Ollama)
- Respostas sobre NDVI, coberturas, lavoura e sinistros

### Pagamentos e Apólices
- Listagem de pagamentos com situação e valor formatado em BRL
- Listagem de apólices com vigência e valor segurado

---

## Backend (Zenith-API)

O app consome exclusivamente o gateway na porta `8080`, que roteia para:

| Serviço | Porta | Responsabilidade |
|---|---|---|
| gateway | 8080 | Valida JWT e roteia |
| core-svc | 8081 | CRUD de domínio (Farm, Plot, Claim, Policy, Payment) |
| analise-svc | 8082 | NDVI, análise satelital, chatbot RAG |

> Todos os endpoints passam pelo gateway. O app nunca chama core ou analise diretamente.

---

## Formatação de inputs

Máscaras visuais implementadas em `utils/masks.ts` — formatação apenas para exibição, a API recebe os valores brutos:

| Campo | Exibição | API recebe |
|---|---|---|
| CPF | `123.456.789-00` | `12345678900` |
| Telefone | `(11) 99999-8888` | `11999998888` |
| NIRF | `12345678-0` | string formatada |
| Área (ha) | aceita `,` como decimal | `float` (ex: `150.5`) |

---

## Comandos úteis

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Formatar código
npm run format
```

---

## Demo

🎥 Link do vídeo demo: `<inserir link do YouTube>`

---

## Licença

Projeto acadêmico — FIAP Global Solution 2025.
