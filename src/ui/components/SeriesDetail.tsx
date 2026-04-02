import React, { useEffect, useState } from 'react';
import { Stream } from '../../domain/model/types';
import { useAppStore } from '../../di/AppModule';
import { X, Play, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeriesDetailProps {
  series: Stream;
  onClose: () => void;
  onPlayEpisode: (episode: any) => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ series, onClose, onPlayEpisode }) => {
  const repo = useAppStore((state) => state.repo);
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  useEffect(() => {
    if (!repo) return;
    const loadInfo = async () => {
      setLoading(true);
      try {
        const data = await repo.getSeriesInfo(series.stream_id);
        setInfo(data);
        if (data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0].season_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInfo();
  }, [repo, series.stream_id]);

  const currentSeason = info?.seasons?.find((s: any) => s.season_number === selectedSeason);
  const episodes = info?.episodes?.[selectedSeason] || currentSeason?.episodes || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
    >
      <div className="bg-white/5 border border-white/10 rounded-3xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-white transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-400 font-medium">Carregando detalhes da série...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Info */}
            <div className="w-1/3 p-12 space-y-8 border-r border-white/10 overflow-y-auto">
              <img
                src={series.stream_icon || `https://picsum.photos/seed/${series.stream_id}/400/600`}
                alt={series.name}
                className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/${series.stream_id}/400/600`;
                }}
              />
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white leading-tight">{series.name}</h2>
                <div className="flex items-center gap-3 text-sm font-bold text-blue-500 uppercase tracking-wider">
                  <span>{info?.info?.genre || 'Série'}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{info?.info?.releaseDate || series.year || 'N/A'}</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {info?.info?.plot || 'Nenhuma descrição disponível para esta série.'}
                </p>
              </div>
            </div>

            {/* Right Side: Seasons & Episodes */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Season Selector */}
              <div className="p-8 border-b border-white/10 flex items-center gap-4 overflow-x-auto">
                {info?.seasons?.map((season: any) => (
                  <button
                    key={season.season_number}
                    onClick={() => setSelectedSeason(season.season_number)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                      selectedSeason === season.season_number
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Temporada {season.season_number}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {episodes.length > 0 ? (
                  episodes.map((episode: any, index: number) => (
                    <button
                      key={episode.id || index}
                      onClick={() => onPlayEpisode(episode)}
                      className="w-full group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-6 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">
                            Episódio {episode.episode_num || index + 1}
                          </div>
                          <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {episode.title || `Episódio ${index + 1}`}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p className="text-xl font-medium">Nenhum episódio encontrado para esta temporada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
