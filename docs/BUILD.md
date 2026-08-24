# Build Android 100% GitHub Actions

Este projeto gera APK/AAB sem depender do EAS Build. Tudo acontece no runner do GitHub Actions.

## 1. Pré-requisitos

- Repositório no GitHub: `ClaudioBrasilia/cesta-nacional-mobile`
- Node 20 + pnpm 9 (o workflow instala automaticamente)
- Um keystore Android para assinar o app

## 2. Gerar o keystore

No terminal (Linux/macOS/WSL):

```bash
keytool -genkeypair \
  -v \
  -keystore release.keystore \
  -alias cestanacional \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass SUA_SENHA_DO_KEYSTORE \
  -keypass SUA_SENHA_DA_CHAVE \
  -dname "CN=Seu Nome, OU=Dev, O=Cesta Nacional, L=Brasilia, ST=DF, C=BR"
