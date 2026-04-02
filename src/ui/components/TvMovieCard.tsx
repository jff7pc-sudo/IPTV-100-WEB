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
      whileHover={{ scale: 1.05 }}
      whileFocus={{ scale: 1.05 }}
      tabIndex={0}
      onClick={() => onClick(stream)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(stream);
        }
      }}
      className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-white/5 cursor-pointer shadow-lg outline-none border-2 border-white/20 focus:border-blue-500 focus:bg-blue-500/20 focus:ring-4 focus:ring-blue-500"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-sm font-black text-white line-clamp-2 mb-2 leading-tight">{stream.name}</h3>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/40">
            <Play className="w-4 h-4 fill-current" />
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(stream.stream_id);
              }}
              className={`p-2 rounded-lg transition-all ${isFavorite ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
      {stream.rating && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xl px-2 py-1 rounded-md text-[10px] font-black text-yellow-500 border border-yellow-500/30 shadow-lg">
          ★ {stream.rating}
        </div>
      )}
    </motion.div>
  );
});
