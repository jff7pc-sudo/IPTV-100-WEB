/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  username: string;
  password?: string;
  url: string;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  max_connections: string;
  created_at: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface Stream {
  num: number;
  name: string;
  stream_type: "live" | "movie" | "series";
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  thumbnail?: string;
  rating?: string;
  year?: string;
}

export interface MovieDetail extends Stream {
  info: {
    movie_image: string;
    genre: string;
    plot: string;
    cast: string;
    director: string;
    releasedate: string;
    youtube_trailer: string;
    backdrop_path: string[];
    duration: string;
    rating: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}
