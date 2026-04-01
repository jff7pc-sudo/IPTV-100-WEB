/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../../di/AppModule';
import { Stream } from '../../../domain/model/types';
import { TvMovieCard } from '../../components/TvMovieCard';
import { VideoPlayer } from '../../../player/VideoPlayer';
import { SeriesDetail } from '../../components/SeriesDetail';
import { motion, AnimatePresence } from 'motion/react';
import { Play, TrendingUp, Heart, History, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeScreen: React.FC = () => {
  const repo = useAppStore((state) => state.repo);
  const user = useAppStore((state) => state.user);
  const [featuredMovies, setFeaturedMovies] = useState<Stream[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<Stream[]>([]);
  const [favorites, setFavorites] = useState<Stream[]>([]);
  const [history, setHistory] = useState<Stream[]>([]);
  const [heroItem, setHeroItem] = useState<Stream | null>(null);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Stream | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  // Helper to get deterministic items based on hour
  const getFeaturedByHour = (items: Stream[], count: number) => {
    if (items.length === 0) return [];
    const hour = new Date().getHours();
    const day = new Date().getDate();
    const seed = hour + day * 24;
    
    const shuffled = [...items];
    // Simple deterministic shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed * (i + 1)) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    if (!repo) return;
    const loadHomeData = async () => {
      try {
        const [movies, series] = await Promise.all([
          repo.getMovies(),
          repo.getSeries()
        ]);

        const featuredM = getFeaturedByHour(movies, 12);
        const featuredS = getFeaturedByHour(series, 12);
        
        setFeaturedMovies(featuredM);
        setFeaturedSeries(featuredS);

        // Initial hero item from movies or series
        const allContent = [...movies, ...series];
        if (allContent.length > 0) {
          const hero = allContent[Math.floor(Math.random() * allContent.length)];
          setHeroItem(hero);
        }

        const favIds = repo.getFavorites();
        const histIds = repo.getHistory();

        setFavorites([...movies, ...series].filter(s => favIds.includes(s.stream_id)));
        setHistory([...movies, ...series].filter(s => histIds.includes(s.stream_id)));
      } catch (err) {
        console.error(err);
      }
    };
    loadHomeData();
  }, [repo]);

  // Banner rotation every 60 seconds
  useEffect(() => {
    const allContent = [...featuredMovies, ...featuredSeries];
    if (allContent.length === 0) return;

    const interval = setInterval(() => {
      const nextHero = allContent[Math.floor(Math.random() * allContent.length)];
      setHeroItem(nextHero);
    }, 60000);

    return () => clearInterval(interval);
  }, [featuredMovies, featuredSeries]);

  const handleSelect = (stream: Stream) => {
    if (!repo) return;
    if (stream.stream_type === 'series') {
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
    <div className="space-y-16">
      {/* Hero Banner */}
      <section className="relative h-[70vh] rounded-[3rem] overflow-hidden group shadow-2xl">
        {heroItem ? (
          <>
            <img
              src={heroItem.stream_icon || `https://picsum.photos/seed/${heroItem.stream_id}/1920/1080`}
              alt={heroItem.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent flex flex-col justify-center px-24">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-4xl space-y-8"
              >
                <div className="flex items-center gap-3 text-blue-500 font-black tracking-[0.2em] uppercase text-lg">
                  <TrendingUp className="w-6 h-6" />
                  Recomendado para Você
                </div>
                <h1 className="text-8xl font-black text-white leading-none tracking-tighter">{heroItem.name}</h1>
                <p className="text-2xl text-gray-300 line-clamp-3 max-w-2xl leading-relaxed">
                  Assista agora a este conteúdo em destaque. Milhares de canais, filmes e séries em alta definição com a melhor qualidade de streaming.
                </p>
                <div className="flex items-center gap-6 pt-6">
                  <button
                    onClick={() => handleSelect(heroItem)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl px-12 py-6 rounded-2xl transition-all flex items-center gap-4 shadow-2xl shadow-blue-600/40 active:scale-95 focus:ring-8 focus:ring-white"
                  >
                    <Play className="w-8 h-8 fill-current" />
                    Assistir Agora
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 flex items-center gap-8 hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{user?.status === 'Active' ? 'Ativa' : user?.status || 'Ativa'}</div>
            <div className="text-lg text-gray-500 font-medium">Status da Conta</div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 flex items-center gap-8 hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
            <Play className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{user?.max_connections || '1'}</div>
            <div className="text-lg text-gray-500 font-medium">Conexões Máximas</div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 flex items-center gap-8 hover:bg-white/10 transition-all">
          <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">
              {user?.exp_date && user.exp_date !== '0' ? new Date(parseInt(user.exp_date) * 1000).toLocaleDateString('pt-BR') : 'Ilimitado'}
            </div>
            <div className="text-lg text-gray-500 font-medium">Data de Expiração</div>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-blue-500" />
            Filmes em Destaque
          </h2>
          <Link to="/movies" className="text-blue-500 hover:text-blue-400 text-xl font-bold flex items-center gap-2">
            Ver Todos <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {featuredMovies.map((stream) => (
            <TvMovieCard key={`${stream.stream_type}-${stream.stream_id}`} stream={stream} onClick={handleSelect} />
          ))}
        </div>
      </section>

      {/* Featured Series */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-purple-500" />
            Séries em Destaque
          </h2>
          <Link to="/series" className="text-blue-500 hover:text-blue-400 text-xl font-bold flex items-center gap-2">
            Ver Todas <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {featuredSeries.map((stream) => (
            <TvMovieCard key={`${stream.stream_type}-${stream.stream_id}`} stream={stream} onClick={handleSelect} />
          ))}
        </div>
      </section>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Seus Favoritos
            </h2>
            <Link to="/favorites" className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
              Ver Todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {favorites.map((stream) => (
              <TvMovieCard key={`${stream.stream_type}-${stream.stream_id}`} stream={stream} onClick={handleSelect} />
            ))}
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-purple-500" />
              Continuar Assistindo
            </h2>
            <Link to="/history" className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
              Ver Tudo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {history.map((stream) => (
              <TvMovieCard key={`${stream.stream_type}-${stream.stream_id}`} stream={stream} onClick={handleSelect} />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selectedSeries && (
          <SeriesDetail
            series={selectedSeries}
            onClose={() => setSelectedSeries(null)}
            onPlayEpisode={handlePlayEpisode}
          />
        )}
      </AnimatePresence>

      {selectedStream && repo && (
        <VideoPlayer
          url={repo.getStreamUrl(selectedStream.stream_id, selectedStream.stream_type)}
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
