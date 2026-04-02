#!/bin/bash

# Script para atualizar o projeto Android (usar para atualizações)

echo "🚀 Iniciando atualização do projeto Android..."

# 1. Gerar a build do projeto web
echo "🏗️ Gerando build do projeto web..."
npm run build

# 2. Sincronizar arquivos web com o projeto nativo
echo "🔄 Sincronizando arquivos com o Capacitor..."
npx cap copy
npx cap sync

# 3. Abrir no Android Studio
echo "📱 Abrindo Android Studio..."
npx cap open android

echo "✨ Processo concluído! Agora gere o APK dentro do Android Studio em: Build > Build APK(s)"
