#!/usr/bin/env node
/**
 * Helper usado pelo workflow de build Android.
 * Injeta signingConfig.release no android/app/build.gradle se ainda não existir.
 */
import fs from 'node:fs';
import path from 'node:path';

const buildGradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('android/app/build.gradle não encontrado. Rode expo prebuild primeiro.');
  process.exit(1);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

if (content.includes('signingConfigs.release')) {
  console.log('signingConfigs.release já existe. Nada a fazer.');
  process.exit(0);
}

const releaseSigningBlock = `
    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }`;

// Procura o bloco buildTypes e insere signingConfig signingConfigs.release no buildType release
const buildTypesRegex = /(buildTypes\s*\{)/;
if (!buildTypesRegex.test(content)) {
  console.error('Bloco buildTypes não encontrado em build.gradle.');
  process.exit(1);
}

content = content.replace(buildTypesRegex, `$1${releaseSigningBlock}`);

// Adiciona signingConfig signingConfigs.release dentro do buildType release, se ainda não tiver
const releaseBuildTypeRegex = /(release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.debug)/;
if (releaseBuildTypeRegex.test(content)) {
  content = content.replace(
    releaseBuildTypeRegex,
    `$1\n            signingConfig signingConfigs.release`
  );
}

fs.writeFileSync(buildGradlePath, content);
console.log('signingConfigs.release configurado com sucesso.');
