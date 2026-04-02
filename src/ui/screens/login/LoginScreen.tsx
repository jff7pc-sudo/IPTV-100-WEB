/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../../di/AppModule';
import { XtreamApi } from '../../../data/remote/XtreamApi';
import { motion } from 'motion/react';
import { LogIn, Server, User as UserIcon, Lock, AlertCircle, Loader2 } from 'lucide-react';

import { SecurityPrefs } from '../../../data/local/SecurityPrefs';

export const LoginScreen: React.FC = () => {
  const saved = SecurityPrefs.getCredentials();
  const [url, setUrl] = useState(saved?.url || '');
  const [username, setUsername] = useState(saved?.username || '');
  const [password, setPassword] = useState(saved?.password || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAppStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const api = new XtreamApi(url, username, password);
      const user = await api.authenticate();
      await login(user);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Erro desconhecido';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
        setError(`Erro de rede: Não foi possível conectar ao servidor. Verifique a URL e se o servidor permite conexões externas. Detalhe: ${errorMessage}`);
      } else if (errorMessage.includes('404')) {
        setError('Servidor não encontrado (404). Verifique a URL digitada.');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setError('Usuário ou senha incorretos (Não autorizado).');
      } else {
        setError(`Erro ao conectar: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    await login({
      username: 'DemoUser',
      password: 'demo_password',
      url: 'http://demo.iptv',
      status: 'Active',
      exp_date: '0',
      is_trial: '0',
      active_cons: '0',
      max_connections: '5',
      created_at: '0'
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bem-vindo</h1>
          <p className="text-base text-gray-400 mt-2">Insira suas credenciais Xtream Codes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-300 ml-1">URL do Servidor</label>
            <div className="relative">
              <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://exemplo.com:8080"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-300 ml-1">Usuário</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu usuário"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-300 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black text-xl py-4 rounded-xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 focus:ring-8 focus:ring-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Autenticando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-lg py-3 rounded-xl transition-all border border-white/5 active:scale-95 focus:ring-8 focus:ring-white"
          >
            Modo de Demonstração
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8">
          Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
};
