/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Stream } from '../../domain/model/types';
import { Play, Heart } from 'lucide-react';
import { useAppStore } from '../../di/AppModule';

interface TvMovieCardProps {
  stream: Stream;
  onClick: (stream: Stream) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (streamId: number) => void;
}

export const TvMovieCard = React.memo<TvMovieCardProps>(({ stream, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileFocus={{ scale: 1.08 }}
      tabIndex={0}
      onClick={() => onClick(stream)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(stream)}
      className="relative group aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 cursor-pointer shadow-xl"
    >
      <img
        src={stream.stream_icon || `https://picsum.photos/seed/${stream.stream_id}/300/450`}
        alt={stream.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://picsum.photos/seed/${stream.stream_id}/300/450`;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <h3 className="text-xl font-black text-white line-clamp-2 mb-4 leading-tight">{stream.name}</h3>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-600/40">
            <Play className="w-6 h-6 fill-current" />
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(stream.stream_id);
              }}
              className={`p-3 rounded-xl transition-all ${isFavorite ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
      {stream.rating && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-lg text-sm font-black text-yellow-500 border border-yellow-500/30 shadow-lg">
          ★ {stream.rating}
        </div>
      )}
    </motion.div>
  );
});
