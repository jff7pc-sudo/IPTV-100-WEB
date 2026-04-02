#!/bin/bash

# Script de build para Android (IPTV App)
# Executar na raiz do projeto

echo "🚀 Iniciando build do projeto..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Build do projeto web
echo "🏗️ Gerando build web..."
npm run build

# 3. Sincronizar com Capacitor
echo "🔄 Sincronizando com Capacitor..."
npx cap sync

# 4. Abrir Android Studio
echo "🤖 Abrindo Android Studio..."
npx cap open android

echo "✅ Processo concluído! Agora gere o APK no Android Studio."
