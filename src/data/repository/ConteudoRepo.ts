/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { XtreamApi } from '../remote/XtreamApi';
import { SecurityPrefs } from '../local/SecurityPrefs';
import { Category, Stream, User } from '../../domain/model/types';
import localforage from 'localforage';

export class ConteudoRepo {
  private xtreamApi: XtreamApi | null = null;
  private cache: {
    vodCategories?: Category[];
    seriesCategories?: Category[];
    vodStreams: Record<string, Stream[]>;
    seriesStreams: Record<string, Stream[]>;
    seriesInfo: Record<number, any>;
  } = {
    vodStreams: {},
    seriesStreams: {},
    seriesInfo: {},
  };
  private pendingRequests: Record<string, Promise<any>> = {};

  constructor(user: User | null) {
    if (user && user.url && user.username) {
      this.xtreamApi = new XtreamApi(user.url, user.username, user.password);
    }
    // Configure localforage
    localforage.config({
      name: 'VODStream',
      storeName: 'iptv_cache'
    });
  }

  private async deduplicate<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests[key]) return this.pendingRequests[key];
    this.pendingRequests[key] = fetchFn().finally(() => {
      delete this.pendingRequests[key];
    });
    return this.pendingRequests[key];
  }

  async loadFromLocal(): Promise<boolean> {
    try {
      const savedCache = await localforage.getItem<any>('full_cache');
      if (savedCache) {
        this.cache = savedCache;
        return true;
      }
    } catch (e) {
      console.error('Failed to load cache from localforage', e);
    }
    return false;
  }

  async saveToLocal(): Promise<void> {
    try {
      await localforage.setItem('full_cache', this.cache);
    } catch (e) {
      console.error('Failed to save cache to localforage', e);
    }
  }

  async clearCache(): Promise<void> {
    this.cache = {
      vodStreams: {},
      seriesStreams: {},
      seriesInfo: {},
    };
    await localforage.removeItem('full_cache');
  }

  async sync(onProgress: (progress: number) => void): Promise<void> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    
    let currentProgress = 0;
    const updateProgress = (p: number) => {
      currentProgress = p;
      onProgress(p);
    };

    try {
      updateProgress(5);
      // 1. Get Categories
      const [vodCats, seriesCats] = await Promise.all([
        this.xtreamApi.getVodCategories().catch(e => { console.error('VOD Cats failed', e); return []; }),
        this.xtreamApi.getSeriesCategories().catch(e => { console.error('Series Cats failed', e); return []; })
      ]);
      
      this.cache.vodCategories = vodCats;
      this.cache.seriesCategories = seriesCats;
      updateProgress(20);

      // 2. Get All Streams (this is the heavy part)
      const [vodStreams, seriesStreams] = await Promise.all([
        this.xtreamApi.getVodStreams().catch(e => { console.error('VOD Streams failed', e); return []; }),
        this.xtreamApi.getSeriesStreams().catch(e => { console.error('Series Streams failed', e); return []; })
      ]);
      
      this.cache.vodStreams['all'] = vodStreams;
      updateProgress(60);
      
      this.cache.seriesStreams['all'] = seriesStreams;
      updateProgress(90);

      // 3. Save to local storage
      await this.saveToLocal();
      updateProgress(100);
    } catch (error) {
      console.error('Sync process encountered a critical error', error);
      throw error;
    }
  }

  async getVodCategories(): Promise<Category[]> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    if (this.cache.vodCategories) return this.cache.vodCategories;
    
    return this.deduplicate('vod_categories', async () => {
      const cats = await this.xtreamApi!.getVodCategories();
      this.cache.vodCategories = cats;
      return cats;
    });
  }

  async getVodStreams(categoryId?: string): Promise<Stream[]> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    const key = categoryId || 'all';
    if (this.cache.vodStreams[key]) return this.cache.vodStreams[key];

    // If we have 'all' cached, we can filter it locally
    if (categoryId && this.cache.vodStreams['all']) {
      const filtered = this.cache.vodStreams['all'].filter(s => String(s.category_id) === String(categoryId));
      if (filtered.length > 0) {
        this.cache.vodStreams[key] = filtered;
        return filtered;
      }
    }

    return this.deduplicate(`vod_streams_${key}`, async () => {
      const streams = await this.xtreamApi!.getVodStreams(categoryId);
      this.cache.vodStreams[key] = streams;
      return streams;
    });
  }

  async getSeriesCategories(): Promise<Category[]> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    if (this.cache.seriesCategories) return this.cache.seriesCategories;

    return this.deduplicate('series_categories', async () => {
      const cats = await this.xtreamApi!.getSeriesCategories();
      this.cache.seriesCategories = cats;
      return cats;
    });
  }

  async getSeriesStreams(categoryId?: string): Promise<Stream[]> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    const key = categoryId || 'all';
    if (this.cache.seriesStreams[key]) return this.cache.seriesStreams[key];

    // If we have 'all' cached, we can filter it locally
    if (categoryId && this.cache.seriesStreams['all']) {
      const filtered = this.cache.seriesStreams['all'].filter(s => String(s.category_id) === String(categoryId));
      if (filtered.length > 0) {
        this.cache.seriesStreams[key] = filtered;
        return filtered;
      }
    }

    return this.deduplicate(`series_streams_${key}`, async () => {
      const streams = await this.xtreamApi!.getSeriesStreams(categoryId);
      this.cache.seriesStreams[key] = streams;
      return streams;
    });
  }

  isCached(type: 'movie' | 'series', categoryId?: string): boolean {
    const key = categoryId || 'all';
    if (type === 'movie') {
      return !!(this.cache.vodStreams[key] || (categoryId && this.cache.vodStreams['all']));
    } else {
      return !!(this.cache.seriesStreams[key] || (categoryId && this.cache.seriesStreams['all']));
    }
  }

  async getMovies(): Promise<Stream[]> {
    return this.getVodStreams();
  }

  async getSeries(): Promise<Stream[]> {
    return this.getSeriesStreams();
  }

  async getSeriesInfo(seriesId: number): Promise<any> {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    if (this.cache.seriesInfo[seriesId]) return this.cache.seriesInfo[seriesId];

    const info = await this.xtreamApi.getSeriesInfo(seriesId);
    this.cache.seriesInfo[seriesId] = info;
    return info;
  }

  getFavorites(): number[] {
    return SecurityPrefs.getFavorites();
  }

  toggleFavorite(streamId: number) {
    const favorites = SecurityPrefs.getFavorites();
    const index = favorites.indexOf(streamId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(streamId);
    }
    SecurityPrefs.saveFavorites(favorites);
  }

  getHistory(): number[] {
    return SecurityPrefs.getHistory();
  }

  addToHistory(streamId: number) {
    const history = SecurityPrefs.getHistory();
    const index = history.indexOf(streamId);
    if (index > -1) {
      history.splice(index, 1);
    }
    history.unshift(streamId);
    if (history.length > 50) history.pop();
    SecurityPrefs.saveHistory(history);
  }

  getStreamUrl(streamId: number, type: 'live' | 'movie' | 'series' = 'live', extension?: string): string {
    if (!this.xtreamApi) throw new Error('Not authenticated');
    return this.xtreamApi.getStreamUrl(streamId, type, extension);
  }
}
