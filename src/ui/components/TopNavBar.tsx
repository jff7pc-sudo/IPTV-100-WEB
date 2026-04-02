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
  const user = useAppStore((state) => state.user);

  const navItems = [
    { name: 'Início', path: '/', icon: <Tv className="w-6 h-6" /> },
    { name: 'Filmes', path: '/movies', icon: <Film className="w-6 h-6" /> },
    { name: 'Séries', path: '/series', icon: <Tv className="w-6 h-6" /> },
    { name: 'Favoritos', path: '/favorites', icon: <Heart className="w-6 h-6" /> },
    { name: 'Histórico', path: '/history', icon: <History className="w-6 h-6" /> },
  ];

  return (
    <nav className="h-14 bg-black/90 backdrop-blur-xl border-b border-white/10 flex items-center px-6 z-50 flex-shrink-0">
      {/* User Info on the left */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-bold text-white">{user?.active_cons || '0'} / {user?.max_connections || '0'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Expira:</span>
          <span className="font-bold text-white">
            {user?.exp_date && user.exp_date !== '0' ? new Date(parseInt(user.exp_date) * 1000).toLocaleDateString('pt-BR') : 'Ilimitado'}
          </span>
        </div>
      </div>

      {/* Centered Navigation */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-white ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
            <span className="text-sm font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Actions on the right */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={refresh}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50"
          title="Atualizar Conteúdo"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-bold">Atualizar</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-bold">Sair</span>
        </button>
      </div>
    </nav>
  );
};
