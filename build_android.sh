#!/bin/bash

# 1. Garante que as dependências do projeto estão instaladas
echo "--- Instalando dependências (npm install) ---"
npm install

# 2. Gera os arquivos de produção do React/Vite (pasta dist)
echo "--- Gerando build do React (npm run build) ---"
npm run build

# 3. Sincroniza os arquivos novos com a pasta nativa do Android
echo "--- Sincronizando com Capacitor (npx cap sync) ---"
npx cap sync

# 4. Abre o Android Studio com o projeto atualizado
echo "--- Abrindo o Android Studio ---"
npx cap open android

echo "--- Tudo pronto! Agora compile pelo Android Studio ---"
