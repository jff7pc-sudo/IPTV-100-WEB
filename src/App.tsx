/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './di/AppModule';
import { LoginScreen } from './ui/screens/login/LoginScreen';
import { MainLayout } from './ui/screens/MainLayout';
import { HomeScreen } from './ui/screens/home/HomeScreen';
import { CatalogScreen } from './ui/screens/catalog/CatalogScreen';
import { FavoritesScreen } from './ui/screens/catalog/FavoritesScreen';
import { HistoryScreen } from './ui/screens/catalog/HistoryScreen';
import { SyncScreen } from './ui/screens/auth/SyncScreen';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isInitializing, isSyncing, init } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center animate-bounce shadow-2xl shadow-blue-600/20">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold text-white">Carregando sua experiência</span>
          <span className="text-gray-500">Verificando credenciais...</span>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return <SyncScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/movies" element={<CatalogScreen type="movie" />} />
            <Route path="/series" element={<CatalogScreen type="series" />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
