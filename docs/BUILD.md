# Build Android pelo GitHub Actions

Este projeto usa **Expo SDK 54** com prebuild nativo e gera o APK/AAB diretamente no runner do GitHub Actions. O workflow está em `.github/workflows/build-android.yml` e não depende do EAS Build.

## Configuração obrigatória no GitHub

O bloqueio encontrado nas últimas execuções foi a ausência das variáveis do Supabase. O workflow interrompia na primeira etapa com a mensagem `Falta a variável EXPO_PUBLIC_SUPABASE_URL`, e o CI também falhava no teste `tests/supabase-config.test.ts` porque `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não estavam definidos.

Cadastre no repositório, em **Settings → Secrets and variables → Actions**, os seguintes valores. É possível usar **Variables** ou **Secrets**; o workflow aceita os dois formatos. A configuração por Secrets é preferível se a política do projeto exigir que os valores não apareçam como variáveis do repositório.

| Nome recomendado                | Valor                                                                        | Obrigatório |
| ------------------------------- | ---------------------------------------------------------------------------- | ----------: |
| `EXPO_PUBLIC_SUPABASE_URL`      | URL HTTPS do projeto Supabase, por exemplo `https://seu-projeto.supabase.co` |         Sim |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase                                             |         Sim |

O workflow também aceita os nomes legados `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Não cadastre nem use `SUPABASE_SERVICE_ROLE_KEY` no aplicativo: essa chave é privada e deve permanecer somente no servidor, se for necessária.

## Assinatura do Android

Para gerar um APK instalável, o workflow consegue usar um keystore persistente ou criar um keystore temporário. O modo recomendado para versões que serão distribuídas é cadastrar os quatro Secrets abaixo:

| Secret                      | Conteúdo                                         |
| --------------------------- | ------------------------------------------------ |
| `ANDROID_KEYSTORE_BASE64`   | Conteúdo Base64 do arquivo `.keystore` ou `.jks` |
| `ANDROID_KEY_ALIAS`         | Alias da chave dentro do keystore                |
| `ANDROID_KEYSTORE_PASSWORD` | Senha do keystore                                |
| `ANDROID_KEY_PASSWORD`      | Senha da chave                                   |

Se esses Secrets não existirem, o workflow cria um keystore temporário com alias e senha de CI. Esse modo gera um APK válido para testes, mas não deve ser usado para atualizações de produção, porque uma nova chave não poderá atualizar um APK anteriormente assinado por outra chave.

Para gerar o Base64 do keystore em Linux, macOS ou WSL:

```bash
base64 -w 0 release.keystore
```

No macOS, se `-w 0` não estiver disponível, use:

```bash
base64 release.keystore | tr -d '\n'
```

## Como gerar o APK

Abra a aba **Actions**, selecione **Build Android** e clique em **Run workflow**. Mantenha o tipo de artefato como `apk`. Ao final, o job publica o arquivo no artefato `app-release-apk`, que pode ser baixado na página da execução.

Também é possível disparar a geração criando uma tag no formato `v*`, por exemplo:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Quando a execução for disparada por uma tag, o APK também será anexado à release do GitHub. O workflow recebe permissão `contents: write` especificamente para essa publicação.

Para gerar um AAB destinado à publicação na Google Play, execute o workflow manualmente e selecione `aab`. O arquivo será publicado no artefato `app-release-aab`.

## O que foi reforçado no workflow

O pipeline agora aceita os dois padrões de nomes de variáveis Supabase, valida que a URL começa com `https://`, instala explicitamente `platforms;android-36`, `build-tools;36.0.0` e `ndk;27.1.12297006`, falha se o APK/AAB não for encontrado e usa `--stacktrace` no Gradle para facilitar o diagnóstico.

O diretório `android/` continua sendo gerado pelo `expo prebuild --platform android --clean` e permanece ignorado pelo Git. Isso evita versionar arquivos nativos gerados e garante que o build reproduza a configuração de `app.config.ts` no runner.

## Validação local

Para validar TypeScript, lint e testes localmente, copie `.env.example` para `.env.local` e preencha os valores reais:

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
```

O build nativo local exige Android SDK, Java 17 e as mesmas plataformas/NDK usadas pelo workflow. Sem Android SDK configurado, o Gradle falhará com `SDK location not found`; isso é uma limitação do ambiente local e não do workflow hospedado, que instala o SDK explicitamente.
