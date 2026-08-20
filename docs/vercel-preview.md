# Prévia web no Vercel

O Cesta Nacional Mobile continua sendo um aplicativo Expo para Android e iOS. Esta configuração adiciona uma prévia web estática para validar telas, navegação e fluxos no navegador antes da publicação mobile.

## Teste local

```bash
pnpm install
pnpm export:web
```

O comando gera a pasta `dist/`, que é usada pelo Vercel como diretório de saída.

## Configuração no Vercel

Ao importar o repositório, use:

| Campo | Valor |
|---|---|
| Framework Preset | Other |
| Build Command | `pnpm export:web` |
| Output Directory | `dist` |
| Install Command | `pnpm install` |
|

O arquivo `vercel.json` já contém esses valores e uma regra de rewrite para as rotas do Expo Router.

A prévia web é destinada a testes. A publicação do aplicativo Android/iOS continua sendo feita pelo fluxo Expo correspondente e não pelo Vercel.
