/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../../di/AppModule';
import { Stream } from '../../../domain/model/types';
import { TvMovieCard } from '../../components/TvMovieCard';
import { VideoPlayer } from '../../../player/VideoPlayer';
import { Heart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FavoritesScreen: React.FC = () => {
  const repo = useAppStore((state) => state.repo);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    if (!repo) return;
    setFavorites(repo.getFavorites());

    const loadData = async () => {
      setLoading(true);
      try {
        const favIds = repo.getFavorites();
        const allMovies = await repo.getVodStreams();
        const allSeries = await repo.getSeriesStreams();
        
        const allStreams = [...allMovies, ...allSeries];
        setStreams(allStreams.filter(s => favIds.includes(s.stream_id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [repo]);

  const handleToggleFavorite = (id: number) => {
    if (!repo) return;
    repo.toggleFavorite(id);
    const newFavs = repo.getFavorites();
    setFavorites(newFavs);
    setStreams(prev => prev.filter(s => newFavs.includes(s.stream_id)));
  };

  return (
    <div className="space-y-12">
      <h1 className="text-5xl font-black flex items-center gap-4">
        <Heart className="w-12 h-12 text-red-500" />
        Seus Favoritos
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-6">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <p className="text-2xl text-gray-400 font-black">Carregando favoritos...</p>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500 gap-6">
          <Heart className="w-24 h-24 opacity-20" />
          <p className="text-3xl font-black text-white">Nenhum favorito ainda</p>
          <p className="text-xl">Comece a adicionar conteúdo à sua lista de favoritos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {streams.map((stream) => (
            <motion.div
              key={`${stream.stream_type}-${stream.stream_id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TvMovieCard
                stream={stream}
                onClick={() => setSelectedStream(stream)}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </div>
      )}

      {selectedStream && repo && (
        <VideoPlayer
          url={repo.getStreamUrl(selectedStream.stream_id, selectedStream.stream_type)}
          title={selectedStream.name}
          onClose={() => setSelectedStream(null)}
        />
      )}
    </div>
  );
};
