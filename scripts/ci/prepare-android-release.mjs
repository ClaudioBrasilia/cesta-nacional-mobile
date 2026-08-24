#!/usr/bin/env node
/**
 * Helper usado pelo workflow de build Android.
 * Injeta signingConfigs.release em android/app/build.gradle e faz o
 * buildType "release" usar essa assinatura.
 */
import fs from 'node:fs';
import path from 'node:path';

const buildGradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradlePath)) {
  console.error('android/app/build.gradle nao encontrado. Rode expo prebuild primeiro.');
  process.exit(1);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

if (!content.includes('signingConfigs.release')) {
  const releaseSigningBlock = `    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }

`;

  // IMPORTANTE: o bloco signingConfigs vai ANTES de buildTypes, nunca dentro dele.
  const buildTypesRegex = /^([ \t]*)buildTypes\s*\{/m;
  if (!buildTypesRegex.test(content)) {
    console.error('Bloco buildTypes nao encontrado em build.gradle.');
    process.exit(1);
  }
  content = content.replace(buildTypesRegex, (match) => releaseSigningBlock + match);

  // Dentro do buildType release, troca a assinatura de debug pela de release.
  const releaseTypeRegex = /(release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.)debug/;
  if (releaseTypeRegex.test(content)) {
    content = content.replace(releaseTypeRegex, '$1release');
  } else {
    content = content.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{)/,
      '$1\n            signingConfig signingConfigs.release'
    );
  }

  fs.writeFileSync(buildGradlePath, content);
  console.log('signingConfigs.release configurado com sucesso.');
} else {
  console.log('signingConfigs.release ja existe. Nada a fazer.');
}

// Sanity check: as propriedades precisam existir no gradle.properties
const propsPath = path.join(process.cwd(), 'android', 'gradle.properties');
const props = fs.existsSync(propsPath) ? fs.readFileSync(propsPath, 'utf8') : '';
for (const key of [
  'MYAPP_UPLOAD_STORE_FILE',
  'MYAPP_UPLOAD_KEY_ALIAS',
  'MYAPP_UPLOAD_STORE_PASSWORD',
  'MYAPP_UPLOAD_KEY_PASSWORD',
]) {
  if (!props.includes(key)) {
    console.error(`Faltando ${key} em android/gradle.properties`);
    process.exit(1);
  }
}
console.log('gradle.properties OK.');
