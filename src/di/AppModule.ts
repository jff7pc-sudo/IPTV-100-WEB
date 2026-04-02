/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User } from '../domain/model/types';
import { ConteudoRepo } from '../data/repository/ConteudoRepo';
import { SecurityPrefs } from '../data/local/SecurityPrefs';
import { XtreamApi } from '../data/remote/XtreamApi';

interface AppState {
  user: User | null;
  repo: ConteudoRepo | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isSyncing: boolean;
  syncProgress: number;
  login: (user: User) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  repo: null,
  isAuthenticated: false,
  isInitializing: true,
  isSyncing: false,
  syncProgress: 0,

  login: async (user: User) => {
    const repo = new ConteudoRepo(user);
    set({ user, repo, isAuthenticated: true, isInitializing: false, isSyncing: true, syncProgress: 0 });
    
    if (user.password && user.url !== 'http://demo.iptv') {
      SecurityPrefs.saveCredentials(user.username, user.password, user.url);
    }

    try {
      await repo.sync((progress) => {
        set({ syncProgress: progress });
      });
    } catch (error) {
      console.error('Sync failed during login', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  logout: () => {
    set({ user: null, repo: null, isAuthenticated: false, isInitializing: false, isSyncing: false });
    SecurityPrefs.clearCredentials();
  },

  refresh: async () => {
    const { repo } = get();
    if (!repo) return;

    set({ isSyncing: true, syncProgress: 0 });
    try {
      await repo.clearCache();
      await repo.sync((progress) => {
        set({ syncProgress: progress });
      });
    } catch (error) {
      console.error('Manual sync failed', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  init: async () => {
    const credentials = SecurityPrefs.getCredentials();
    if (credentials) {
      try {
        const api = new XtreamApi(credentials.url, credentials.username, credentials.password);
        const user = await api.authenticate();
        const repo = new ConteudoRepo(user);
        
        // Try to load from local cache first
        const hasLocalCache = await repo.loadFromLocal();
        
        set({ user, repo, isAuthenticated: true, isInitializing: false });

        // If no local cache, or we want to refresh, we sync
        if (!hasLocalCache) {
          set({ isSyncing: true, syncProgress: 0 });
          try {
            await repo.sync((progress) => {
              set({ syncProgress: progress });
            });
          } finally {
            set({ isSyncing: false });
          }
        }
      } catch (error) {
        console.error('Auto-login failed, credentials might be expired', error);
        set({ isInitializing: false });
      }
    } else {
      set({ isInitializing: false });
    }
  }
}));
