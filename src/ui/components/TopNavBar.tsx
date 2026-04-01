/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Tv, Film, PlayCircle, Heart, History, LogOut, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../di/AppModule';
import { motion } from 'motion/react';

export const TopNavBar: React.FC = () => {
  const logout = useAppStore((state) => state.logout);
  const refresh = useAppStore((state) => state.refresh);
  const isSyncing = useAppStore((state) => state.isSyncing);

  const navItems = [
    { name: 'Início', path: '/', icon: <Tv className="w-6 h-6" /> },
    { name: 'Filmes', path: '/movies', icon: <Film className="w-6 h-6" /> },
    { name: 'Séries', path: '/series', icon: <Tv className="w-6 h-6" /> },
    { name: 'Favoritos', path: '/favorites', icon: <Heart className="w-6 h-6" /> },
    { name: 'Histórico', path: '/history', icon: <History className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-xl border-b border-white/10 flex items-center px-12 z-50">
      {/* Centered Navigation */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-white ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {item.icon}
            <span className="text-lg font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Actions on the right */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={refresh}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50"
          title="Atualizar Conteúdo"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-base font-bold">Atualizar</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-base font-bold">Sair</span>
        </button>
      </div>
    </nav>
  );
};
