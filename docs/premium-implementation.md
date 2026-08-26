# Cesta Nacional Pro — base técnica inicial

A primeira versão comercial do produto usa uma compra única não consumível.

| Campo | Valor |
|---|---|
| Nome comercial | Cesta Nacional Pro |
| Product ID | `cesta_pro_lifetime` |
| Entitlement ID | `cesta_pro` |
| Tipo | `non_consumable` |
| Preço de lançamento recomendado | R$ 14,90 |
| Modelo | Compra única; sem assinatura e sem venda de créditos |

## Arquivos preparados

`lib/premium-catalog.ts` contém os identificadores estáveis, os limites gratuito/Pro e os recursos liberáveis. `supabase/migrations/003_premium_entitlements.sql` cria a tabela de direitos de acesso, restringe a leitura ao próprio usuário e não concede escrita ao cliente autenticado. A escrita deve ocorrer apenas por uma rotina de servidor que valide a compra recebida da Apple, do Google ou de uma camada de cobrança escolhida.

`tests/premium-catalog.test.ts` fixa o catálogo e garante que os recursos premium não sejam considerados disponíveis quando não há entitlement.

## Próxima integração

Antes de habilitar um botão de compra, cadastre o produto `cesta_pro_lifetime` no App Store Connect e no Google Play Console, configure o preço brasileiro e crie uma build nativa de desenvolvimento. A integração deverá validar a transação no backend antes de liberar o `cesta_pro`, tratar restauração em outro aparelho e revogar o acesso quando houver reembolso.

A versão web não deve usar a chave de compra nativa do iOS/Android. Se for necessário vender no navegador, será preciso definir uma cobrança web separada e sincronizar o mesmo entitlement com o usuário autenticado.

## Validações executadas

- `pnpm check`: aprovado.
- `pnpm test` com as variáveis públicas do Supabase: 10 testes aprovados e 1 teste explicitamente ignorado.
- `pnpm lint`: 0 erros; 2 avisos preexistentes em `app/online-league.tsx`.
- `git diff --check`: aprovado.
