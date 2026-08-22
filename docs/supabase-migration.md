# Migração do backend para Supabase

A integração usa o **Supabase Auth por e-mail** e sincroniza uma carreira por usuário na tabela `public.career_snapshots`. O aplicativo continua gravando em `AsyncStorage`, portanto funciona offline e tenta sincronizar quando existe uma sessão autenticada.

## Aplicar o banco

No painel do Supabase, abra **SQL Editor** e execute, nesta ordem, `supabase/migrations/001_career_snapshots.sql` e `supabase/migrations/002_online_league.sql`. A primeira migração cria a carreira individual; a segunda cria ligas, membros, submissões de rodada, classificação compartilhada e as funções protegidas de processamento. Confirme que as tabelas estão com RLS ativado. As políticas permitem que cada usuário leia somente as ligas das quais participa, enquanto apenas o criador pode processar a rodada.

## Variáveis de ambiente

| Variável                    | Onde usar                            | Observação                                                  |
| --------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `VITE_SUPABASE_URL`         | Aplicativo, Vercel e desenvolvimento | URL pública do projeto.                                     |
| `VITE_SUPABASE_ANON_KEY`    | Aplicativo, Vercel e desenvolvimento | Chave pública protegida por RLS.                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor, se necessário      | Nunca colocar em código do app, GitHub ou variável `VITE_`. |

No Vercel, configure somente as variáveis públicas para a prévia web. A chave `service_role` não é necessária para o fluxo atual do cliente e deve permanecer fora do bundle.

## Fluxo do usuário

O jogador acessa **Mais → Liga Nacional Online**, cria uma conta ou entra por e-mail, cria uma liga e compartilha o código de seis caracteres, ou entra em uma liga existente. Cada técnico escolhe sua estratégia e confirma a rodada; o criador processa a rodada quando todos enviarem. A classificação compartilhada é atualizada pela função protegida do Supabase. A carreira local continua disponível separadamente e sincroniza pelo fluxo **Mais → Sincronizar carreira**.

A confirmação de e-mail e os provedores de SMTP devem ser configurados no painel **Authentication → Providers → Email** do Supabase. Para produção, use um SMTP próprio ou um provedor transacional com domínio verificado.
