/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '../../../di/AppModule';
import { Category, Stream } from '../../../domain/model/types';
import { TvMovieCard } from '../../components/TvMovieCard';
import { VideoPlayer } from '../../../player/VideoPlayer';
import { SeriesDetail } from '../../components/SeriesDetail';
import { Search, Filter, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogScreenProps {
  type: 'movie' | 'series';
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ type }) => {
  console.log(`CatalogScreen rendering for type: ${type}`);
  const repo = useAppStore((state) => state.repo);
  console.log('Repo available:', !!repo);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Stream | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  console.log('State:', { loading, error, categoriesCount: categories.length, streamsCount: streams.length });

  const [displayLimit, setDisplayLimit] = useState(25);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredStreams = React.useMemo(() => {
    if (!searchQuery) return streams;
    const query = searchQuery.toLowerCase();
    return streams.filter((s) => s.name.toLowerCase().includes(query));
  }, [streams, searchQuery]);

  useEffect(() => {
    if (!repo) return;
    setFavorites(repo.getFavorites());

    const loadData = async () => {
      setLoading(true);
      try {
        let cats: Category[] = [];
        if (type === 'movie') cats = await repo.getVodCategories();
        else if (type === 'series') cats = await repo.getSeriesCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0].category_id);
        } else {
          setError('Nenhuma categoria encontrada.');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar categorias.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [repo, type]);

  useEffect(() => {
    if (!repo || !selectedCategory) return;
    const loadStreams = async () => {
      // Only show loader if data is NOT cached
      const isCached = (repo as any).isCached?.(type, selectedCategory);
      if (!isCached) {
        setLoading(true);
      }
      
      try {
        let data: Stream[] = [];
        if (type === 'movie') data = await repo.getVodStreams(selectedCategory);
        else if (type === 'series') data = await repo.getSeriesStreams(selectedCategory);
        setStreams(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar lista de conteúdos.');
      } finally {
        setLoading(false);
      }
    };
    loadStreams();
  }, [repo, selectedCategory, type]);

  const [displayLimit, setDisplayLimit] = useState(25);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredStreams = React.useMemo(() => {
    if (!searchQuery) return streams;
    const query = searchQuery.toLowerCase();
    return streams.filter((s) => s.name.toLowerCase().includes(query));
  }, [streams, searchQuery]);

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => {
      if (prev >= filteredStreams.length) return prev;
      return prev + 25;
    });
  }, [filteredStreams.length]);

  const displayedStreams = React.useMemo(() => {
    return filteredStreams.slice(0, displayLimit);
  }, [filteredStreams, displayLimit]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    setDisplayLimit(25);
  }, [selectedCategory, type]);

  const handleToggleFavorite = (id: number) => {
    if (!repo) return;
    repo.toggleFavorite(id);
    setFavorites(repo.getFavorites());
  };

  const handleSelect = (stream: Stream) => {
    if (!repo) return;
    if (type === 'series') {
      setSelectedSeries(stream);
    } else {
      repo.addToHistory(stream.stream_id);
      setSelectedStream(stream);
    }
  };

  const handlePlayEpisode = (episode: any) => {
    if (!repo || !selectedSeries) return;
    repo.addToHistory(selectedSeries.stream_id);
    setSelectedEpisode(episode);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* Sidebar Categories */}
      <aside className="w-full md:w-64 flex-shrink-0 overflow-y-auto pr-2">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          Categorias
        </h2>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(cat.category_id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 outline-none border-2 ${
                selectedCategory === cat.category_id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-blue-500'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-white/20 focus:border-blue-500 focus:bg-blue-500/20 focus:ring-4 focus:ring-blue-500'
              }`}
            >
              <span className="text-base font-black line-clamp-1">{cat.category_name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={`Buscar ${type === 'movie' ? 'filmes' : 'séries'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="text-xs text-gray-500">
            {filteredStreams.length} itens
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-xl text-gray-400 font-black">Carregando...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
            <p className="text-xl font-black">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {displayedStreams.map((stream) => (
                <TvMovieCard
                  key={`${stream.stream_type}-${stream.stream_id}`}
                  stream={stream}
                  onClick={handleSelect}
                  isFavorite={favorites.includes(stream.stream_id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
              <div ref={sentinelRef} className="h-10" />
            </div>
          </div>
        )}
      </div>

      {selectedSeries && (
        <SeriesDetail
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
          onPlayEpisode={handlePlayEpisode}
        />
      )}

      {selectedStream && repo && (
        <VideoPlayer
          url={repo.getStreamUrl(selectedStream.stream_id, type)}
          title={selectedStream.name}
          onClose={() => setSelectedStream(null)}
        />
      )}

      {selectedEpisode && selectedSeries && repo && (
        <VideoPlayer
          url={repo.getStreamUrl(selectedEpisode.id || selectedEpisode.stream_id, 'series', selectedEpisode.container_extension)}
          title={`${selectedSeries.name} - ${selectedEpisode.title || `Episódio ${selectedEpisode.episode_num}`}`}
          onClose={() => setSelectedEpisode(null)}
        />
      )}
    </div>
  );
};
