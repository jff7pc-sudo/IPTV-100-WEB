/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { User, Category, Stream, MovieDetail } from '../../domain/model/types';

export class XtreamApi {
  private baseUrl: string;
  private username: string;
  private password?: string;

  constructor(baseUrl: string, username: string, password?: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.username = username;
    this.password = password;
  }

  private getUrl(action?: string, extraParams: Record<string, string | number> = {}) {
    const params = new URLSearchParams({
      username: this.username,
      password: this.password || '',
      ...extraParams
    });
    if (action) {
      params.append('action', action);
    }
    const targetUrl = `${this.baseUrl}/player_api.php?${params.toString()}`;
    
    // On native platforms (Android/iOS), call the URL directly.
    // On web, use the local proxy to bypass CORS.
    if (Capacitor.isNativePlatform()) {
      return targetUrl;
    }
    
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
  }

  async authenticate(): Promise<User> {
    const response = await axios.get(this.getUrl());
    if (response.data.user_info) {
      return {
        ...response.data.user_info,
        url: this.baseUrl,
        username: this.username,
        password: this.password
      };
    }
    throw new Error('Authentication failed');
  }

  async getVodCategories(): Promise<Category[]> {
    if (this.baseUrl === 'http://demo.iptv') {
      return [
        { category_id: '1', category_name: 'Action', parent_id: 0 },
        { category_id: '2', category_name: 'Comedy', parent_id: 0 },
      ];
    }
    const response = await axios.get(this.getUrl('get_vod_categories'));
    return response.data;
  }

  async getVodStreams(categoryId?: string): Promise<Stream[]> {
    if (this.baseUrl === 'http://demo.iptv') {
      return Array.from({ length: 20 }).map((_, i) => ({
        num: i + 1,
        name: `Demo Movie ${i + 1}`,
        stream_type: 'movie',
        stream_id: 2000 + i,
        stream_icon: `https://picsum.photos/seed/movie${i}/300/450`,
        epg_channel_id: '',
        added: '',
        category_id: categoryId || '1',
        custom_sid: '',
        tv_archive: 0,
        direct_source: '',
        tv_archive_duration: 0
      }));
    }
    const params: Record<string, string | number> = {};
    if (categoryId) params.category_id = categoryId;
    const response = await axios.get(this.getUrl('get_vod_streams', params));
    const streams = Array.isArray(response.data) ? response.data : [];
    return streams.map((s: any, index: number) => ({
      ...s,
      stream_id: s.stream_id || s.vod_id || s.id || `fallback-${index}`,
      stream_type: 'movie'
    }));
  }

  async getSeriesCategories(): Promise<Category[]> {
    if (this.baseUrl === 'http://demo.iptv') {
      return [
        { category_id: '1', category_name: 'Drama', parent_id: 0 },
      ];
    }
    const response = await axios.get(this.getUrl('get_series_categories'));
    return response.data;
  }

  async getSeriesStreams(categoryId?: string): Promise<Stream[]> {
    if (this.baseUrl === 'http://demo.iptv') {
      return Array.from({ length: 20 }).map((_, i) => ({
        num: i + 1,
        name: `Demo Series ${i + 1}`,
        stream_type: 'series',
        stream_id: 3000 + i,
        stream_icon: `https://picsum.photos/seed/series${i}/300/450`,
        epg_channel_id: '',
        added: '',
        category_id: categoryId || '1',
        custom_sid: '',
        tv_archive: 0,
        direct_source: '',
        tv_archive_duration: 0
      }));
    }
    const params: Record<string, string | number> = {};
    if (categoryId) params.category_id = categoryId;
    const response = await axios.get(this.getUrl('get_series', params));
    const series = Array.isArray(response.data) ? response.data : [];
    return series.map((s: any, index: number) => ({
      ...s,
      stream_id: s.series_id || s.stream_id || s.id || `fallback-${index}`,
      stream_type: 'series',
      stream_icon: s.cover || s.stream_icon
    }));
  }

  async getMovieDetails(streamId: number): Promise<MovieDetail> {
    if (this.baseUrl === 'http://demo.iptv') {
      return {
        num: 1,
        name: 'Demo Movie',
        stream_type: 'movie',
        stream_id: streamId,
        stream_icon: '',
        epg_channel_id: '',
        added: '',
        category_id: '1',
        custom_sid: '',
        tv_archive: 0,
        direct_source: '',
        tv_archive_duration: 0,
        info: {
          movie_image: '',
          genre: 'Action',
          plot: 'This is a demo movie plot.',
          cast: 'Demo Actor',
          director: 'Demo Director',
          releasedate: '2024',
          youtube_trailer: '',
          backdrop_path: [],
          duration: '120',
          rating: '8.5'
        }
      };
    }
    const response = await axios.get(this.getUrl('get_vod_info', { vod_id: streamId }));
    return response.data;
  }

  async getSeriesInfo(seriesId: number): Promise<any> {
    if (this.baseUrl === 'http://demo.iptv') {
      return {
        seasons: [
          {
            season_number: 1,
            name: 'Season 1',
            episode_count: 5,
            episodes: Array.from({ length: 5 }).map((_, i) => ({
              id: i + 1,
              title: `Episode ${i + 1}`,
              container_extension: 'm3u8'
            }))
          }
        ],
        info: {
          name: 'Demo Series',
          plot: 'Demo series plot'
        }
      };
    }
    const response = await axios.get(this.getUrl('get_series_info', { series_id: seriesId }));
    return response.data;
  }

  getStreamUrl(streamId: number, type: 'live' | 'movie' | 'series' = 'live', extension?: string): string {
    if (this.baseUrl === 'http://demo.iptv') {
      return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Sample HLS stream
    }
    let ext = extension || 'm3u8';
    if (type === 'movie' || type === 'series') {
      ext = extension || 'mp4';
    }
    return `${this.baseUrl}/${type}/${this.username}/${this.password}/${streamId}.${ext}`;
  }
}
