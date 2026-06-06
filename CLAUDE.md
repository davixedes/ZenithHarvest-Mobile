# Zenith Harvest — Mobile

> App do produtor rural. React Native + Expo. Consome as APIs do `core-svc` e `analise-svc`
> via gateway. JWT em SecureStore. Conventional Commits. Sem mock de dados.

Este arquivo orienta assistentes de IA a trabalhar neste repositório.
Leia antes de gerar ou alterar qualquer código.

---

## Stack

| Item | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 52+ |
| Navegação | Expo Router (file-based routing) |
| HTTP | Axios com interceptor JWT centralizado |
| Auth storage | expo-secure-store (NUNCA AsyncStorage pra JWT) |
| Lint / Format | ESLint + Prettier |
| Testes | Jest + React Native Testing Library |

---

## Estrutura do projeto

```
app/
 ├─ (auth)/           # rotas públicas
 │   ├─ login.tsx
 │   └─ signup.tsx
 ├─ (app)/            # rotas protegidas (redireciona se sem JWT)
 │   ├─ index.tsx     # Dashboard
 │   ├─ farms/
 │   │   ├─ index.tsx
 │   │   └─ [id].tsx
 │   ├─ claims/
 │   │   ├─ new.tsx
 │   │   └─ [id].tsx
 │   └─ payments.tsx
 └─ about.tsx         # Sobre o App — hash do commit (obrigatório pra entrega)
components/           # componentes reutilizáveis
services/
 ├─ api.ts            # instância Axios + interceptor
 ├─ authService.ts
 ├─ farmService.ts
 └─ claimService.ts
hooks/                # custom hooks (useAuth, useFarms, useClaims...)
constants/            # colors, typography, spacing, API URL
context/              # AuthContext
```

---

## Integração com o backend

**Base URL** via variável de ambiente:
```
EXPO_PUBLIC_API_URL=http://<ip-local>:8080
```

**Serviços disponíveis:**
- `gateway` `:8080` — único ponto de entrada. Valida JWT antes de rotear.
- `core-svc` `:8081` — CRUD de domínio (User, Farm, Plot, Claim, Policy, Payment)
- `analise-svc` `:8082` — análise satelital, laudo IA, chatbot RAG, NDVI histórico

**Todos os endpoints passam pelo gateway.** Nunca chamar core ou analise diretamente.

---

## Convenções de código

### Componentes

- Um componente por arquivo. Nome do arquivo = nome do componente (`FarmCard.tsx`).
- Componentes funcionais com tipagem TypeScript explícita — sem `any`.
- Props sempre tipadas com `interface` ou `type` no mesmo arquivo.
- Componentes de UI puros (sem lógica de negócio) ficam em `components/`.
- Lógica de negócio e chamadas de API ficam em `hooks/` ou `services/`.

```tsx
interface FarmCardProps {
  farm: Farm;
  onPress: (id: string) => void;
}

export function FarmCard({ farm, onPress }: FarmCardProps) {
  return (
    <Pressable
      onPress={() => onPress(farm.id)}
      accessibilityLabel={`Fazenda ${farm.name}`}
    >
      ...
    </Pressable>
  );
}
```

### Custom hooks

Toda chamada de API fica em um hook — nunca diretamente no componente:

```tsx
export function useFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await farmService.list();
      setFarms(data);
    } catch (e) {
      setError('Erro ao carregar fazendas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { farms, loading, error, refetch: load };
}
```

### Padrão de tela (OBRIGATÓRIO em toda tela com requisição)

Toda tela que faz requisição de rede DEVE tratar os 4 estados. Sem exceção:

```tsx
export default function FarmsScreen() {
  const { farms, loading, error, refetch } = useFarms();

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} onRetry={refetch} />;
  if (!farms.length) return <EmptyScreen message="Nenhuma fazenda cadastrada." />;

  return <FarmList farms={farms} />;
}
```

### Tipos e interfaces

Manter os tipos do domínio em `types/` com os mesmos nomes do backend:

```ts
// types/claim.ts
export interface Claim {
  id: string;
  claimNumber: string;
  code: number;
  claimSituationId: number;
  ndviBefore: number | null;   // nullable — preenchido pela IA
  ndviAfter: number | null;
  calculatedAmount: number | null;
  approvedAmount: number | null;
  paidAt: string | null;
}
```

Campos nullable do backend **são nullable no TypeScript também**. Nunca assumir que
um campo operacional vem preenchido — sempre checar antes de renderizar.

---

## Regras de segurança

- JWT **sempre** em `expo-secure-store`. NUNCA em `AsyncStorage`, `useState` ou variável global.
- `EXPO_PUBLIC_API_URL` em `.env`. `.env` no `.gitignore`. NUNCA commitar.
- Sem credenciais, tokens ou chaves hardcoded em qualquer arquivo.
- Logout limpa o SecureStore completamente antes de redirecionar.

---

## Regras de UX / feedback visual

- Todo botão de ação mostra `ActivityIndicator` enquanto a requisição roda.
- Erros de rede mostram mensagem legível + botão "Tentar novamente".
- Campos nullable do backend (ex: `approvedAmount`) mostram `—` ou `Aguardando análise`,
  nunca `null`, `undefined` ou string vazia.
- Dinheiro formatado sempre com `Intl.NumberFormat`: `R$ 12.500,00`.
- Datas formatadas com `date-fns` ou `Intl.DateTimeFormat` — nunca exibir ISO string bruta.
- Formulários validam no client antes de chamar a API (evita round-trip desnecessário).

---

## Regras de acessibilidade

- Todo `Pressable`, `TouchableOpacity` e elemento interativo com `accessibilityLabel`.
- Imagens com `accessibilityLabel` descritivo ou `accessible={false}` se decorativas.
- Contraste mínimo 4.5:1 entre texto e fundo (WCAG AA).
- Não depender só de cor pra transmitir estado — usar ícone ou texto junto.

---

## Navegação (Expo Router)

- Grupos `(auth)` e `(app)` controlam acesso por autenticação.
- Redirecionar com `router.replace` (não `push`) em login/logout — sem histórico de
  tela anterior na pilha de navegação.
- Parâmetros de rota tipados — não usar `params` sem tipar.

---

## Commits (Conventional Commits com escopo)

```
feat(farms): add farm list screen
feat(claims): implement open claim form with photo
fix(auth): clear secure store on 401 response
refactor(hooks): extract useClaims hook
style(theme): update primary color to Zenith green
```

Escopos válidos: `auth`, `farms`, `claims`, `payments`, `dashboard`, `chat`,
`analysis`, `hooks`, `services`, `theme`, `nav`, `infra`.

- Commits pequenos e frequentes — um por feature ou fix.
- Histórico evolutivo — a banca avalia o Git. Subir tudo de uma vez perde -30.
- NUNCA commitar `.env` ou qualquer arquivo com credencial.

---

## O que NÃO fazer

- `AsyncStorage` para JWT — vulnerabilidade de segurança. Usar `expo-secure-store`.
- Dados mockados em tela que deveria consumir API — a banca valida dados reais.
- Chamar `core-svc` ou `analise-svc` diretamente — sempre passar pelo gateway `:8080`.
- `any` no TypeScript — tipar explicitamente.
- Renderizar `null` ou `undefined` diretamente na tela — tratar antes de exibir.
- Campo nullable do backend tratado como sempre preenchido — verificar antes de usar.
- Lógica de negócio dentro de componente de UI — extrair pra hook ou service.
- Credencial ou `.env` commitado — penalidade -30 no DevOps.
- Commit único com todo o projeto — histórico incoerente perde -30.
- Esquecer `accessibilityLabel` em elementos interativos.

---

## Checklist antes de cada commit

- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] ESLint sem warnings (`npx eslint .`)
- [ ] Tela com requisição trata loading + error + empty + content
- [ ] Campos nullable do backend tratados antes de renderizar
- [ ] Nenhum dado mockado onde deveria ser API
- [ ] Nenhuma credencial no diff (`git diff` antes de commitar)
- [ ] Mensagem de commit no padrão Conventional Commits com escopo

---

## Checklist de entrega final

- [ ] Mínimo 6 telas funcionais (a tela "Sobre o App" não conta)
- [ ] Tela "Sobre o App" com hash do commit de referência
- [ ] CRUD completo via API (Create, Read, Update, Delete)
- [ ] Autenticação: signup + login + logout + proteção de rotas
- [ ] Publicado no Firebase App Distribution
- [ ] E-mail do professor adicionado como tester
- [ ] Vídeo demo ≤5 min no YouTube
- [ ] README com nomes, link YouTube e descrição
- [ ] Entregue via GitHub Classroom