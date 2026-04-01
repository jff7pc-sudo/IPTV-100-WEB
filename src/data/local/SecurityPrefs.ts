/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CryptoJS from 'crypto-js';

const SECRET_KEY = 'iptv-pro-web-secret-key'; // In a real app, this should be more secure

export const SecurityPrefs = {
  saveCredentials: (username: string, password: string, url: string) => {
    const data = JSON.stringify({ username, password, url });
    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    localStorage.setItem('iptv_credentials', encrypted);
  },

  getCredentials: () => {
    const encrypted = localStorage.getItem('iptv_credentials');
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (e) {
      console.error('Failed to decrypt credentials', e);
      return null;
    }
  },

  clearCredentials: () => {
    localStorage.removeItem('iptv_credentials');
  },

  saveFavorites: (favorites: number[]) => {
    localStorage.setItem('iptv_favorites', JSON.stringify(favorites));
  },

  getFavorites: (): number[] => {
    const favs = localStorage.getItem('iptv_favorites');
    return favs ? JSON.parse(favs) : [];
  },

  saveHistory: (history: number[]) => {
    localStorage.setItem('iptv_history', JSON.stringify(history));
  },

  getHistory: (): number[] => {
    const hist = localStorage.getItem('iptv_history');
    return hist ? JSON.parse(hist) : [];
  }
};
