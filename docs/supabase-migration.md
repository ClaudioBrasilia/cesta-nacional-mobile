# Migração do backend para Supabase

A integração usa o **Supabase Auth por e-mail** e sincroniza uma carreira por usuário na tabela `public.career_snapshots`. O aplicativo continua gravando em `AsyncStorage`, portanto funciona offline e tenta sincronizar quando existe uma sessão autenticada.

## Aplicar o banco

No painel do Supabase, abra **SQL Editor**, execute o conteúdo de `supabase/migrations/001_career_snapshots.sql` e confirme que a tabela foi criada com RLS ativado. As políticas permitem que cada usuário leia e altere somente a própria carreira.

## Variáveis de ambiente

| Variável | Onde usar | Observação |
|---|---|---|
| `VITE_SUPABASE_URL` | Aplicativo, Vercel e desenvolvimento | URL pública do projeto. |
| `VITE_SUPABASE_ANON_KEY` | Aplicativo, Vercel e desenvolvimento | Chave pública protegida por RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor, se necessário | Nunca colocar em código do app, GitHub ou variável `VITE_`. |

No Vercel, configure somente as variáveis públicas para a prévia web. A chave `service_role` não é necessária para o fluxo atual do cliente e deve permanecer fora do bundle.

## Fluxo do usuário

O jogador acessa **Mais → Sincronizar carreira**, cria uma conta ou entra por e-mail, confirma a conta quando solicitado e retorna ao jogo. A carreira local existente permanece disponível; depois da autenticação, o aplicativo tenta carregar a cópia remota e atualiza o snapshot após mudanças.

A confirmação de e-mail e os provedores de SMTP devem ser configurados no painel **Authentication → Providers → Email** do Supabase. Para produção, use um SMTP próprio ou um provedor transacional com domínio verificado.
