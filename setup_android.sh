#!/bin/bash

# Script para preparação inicial do projeto Android (usar apenas 1 vez)

echo "🚀 Iniciando preparação inicial do projeto Android..."

# 1. Instalar dependências
echo "📦 Instalando dependências npm..."
npm install

# 2. Gerar a build do projeto web
echo "🏗️ Gerando build do projeto web..."
npm run build

# 3. Adicionar plataforma Android
echo "➕ Adicionando plataforma Android..."
npx cap add android

# 4. Sincronizar arquivos web com o projeto nativo
echo "🔄 Sincronizando arquivos com o Capacitor..."
npx cap copy
npx cap sync

# 5. Abrir no Android Studio
echo "📱 Abrindo Android Studio..."
npx cap open android

echo "✨ Processo concluído! Agora gere o APK dentro do Android Studio em: Build > Build APK(s)"
