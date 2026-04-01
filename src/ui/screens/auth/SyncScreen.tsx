/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../../../di/AppModule';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const SyncScreen: React.FC = () => {
  const syncProgress = useAppStore((state) => state.syncProgress);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 z-[9999]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-16 text-center"
      >
        <div className="relative inline-block">
          <div className="w-48 h-48 bg-blue-600/20 rounded-[3rem] flex items-center justify-center text-blue-500 mb-12 mx-auto relative z-10">
            <Database className="w-24 h-24" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-[100px] -z-0"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-6xl font-black text-white tracking-tight">Sincronizando Conteúdo</h1>
          <p className="text-gray-400 text-2xl max-w-lg mx-auto">
            Estamos preparando sua biblioteca de filmes e séries. Isso acontece apenas uma vez.
          </p>
        </div>

        <div className="space-y-8">
          <div className="relative h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${syncProgress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-4 text-blue-500 font-black text-2xl">
              {syncProgress < 100 ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
              <span>{syncProgress < 100 ? 'Processando...' : 'Concluído!'}</span>
            </div>
            <span className="text-6xl font-black text-white">{syncProgress}%</span>
          </div>
        </div>

        <div className="pt-12 grid grid-cols-3 gap-8 text-lg font-black uppercase tracking-widest text-gray-600">
          <div className={syncProgress >= 20 ? 'text-blue-500' : ''}>Categorias</div>
          <div className={syncProgress >= 60 ? 'text-blue-500' : ''}>Filmes</div>
          <div className={syncProgress >= 90 ? 'text-blue-500' : ''}>Séries</div>
        </div>
      </motion.div>
    </div>
  );
};
