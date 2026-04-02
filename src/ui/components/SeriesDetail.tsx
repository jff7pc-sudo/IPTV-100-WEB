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
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="bg-white/5 border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors z-10 focus:ring-4 focus:ring-blue-500 outline-none"
          autoFocus
        >
          <X className="w-8 h-8" />
        </button>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Carregando detalhes da série...</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Info */}
            <div className="w-1/3 p-8 space-y-6 border-r border-white/10 overflow-y-auto">
              <img
                src={series.stream_icon || `https://picsum.photos/seed/${series.stream_id}/400/600`}
                alt={series.name}
                className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/${series.stream_id}/400/600`;
                }}
              />
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white leading-tight">{series.name}</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                  <span>{info?.info?.genre || 'Série'}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{info?.info?.releaseDate || series.year || 'N/A'}</span>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {info?.info?.plot || 'Nenhuma descrição disponível para esta série.'}
                </p>
              </div>
            </div>

            {/* Right Side: Seasons & Episodes */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Season Selector */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3 overflow-x-auto">
                {info?.seasons?.map((season: any) => (
                  <button
                    key={season.season_number}
                    onClick={() => setSelectedSeason(season.season_number)}
                    className={`px-6 py-3 rounded-xl text-lg font-black transition-all whitespace-nowrap outline-none focus:ring-4 focus:ring-white ${
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {episodes.length > 0 ? (
                  episodes.map((episode: any, index: number) => (
                    <button
                      key={episode.id || index}
                      onClick={() => onPlayEpisode(episode)}
                      className="w-full group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-5 flex items-center justify-between transition-all outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white group-focus:bg-blue-600 group-focus:text-white transition-all">
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">
                            Episódio {episode.episode_num || index + 1}
                          </div>
                          <div className="text-xl font-black text-white group-hover:text-blue-400 group-focus:text-blue-400 transition-colors">
                            {episode.title || `Episódio ${index + 1}`}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white group-focus:text-white transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p className="text-lg font-medium">Nenhum episódio encontrado para esta temporada.</p>
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
