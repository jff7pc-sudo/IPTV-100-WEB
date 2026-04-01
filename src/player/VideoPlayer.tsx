/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);

      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          togglePlay();
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'ArrowUp':
          setVolume(prev => Math.min(prev + 0.1, 1));
          break;
        case 'ArrowDown':
          setVolume(prev => Math.max(prev - 0.1, 0));
          break;
        case 'Escape':
        case 'Backspace':
          onClose();
          break;
      }
    };

    window.addEventListener('mousemove', () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [onClose, isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center group overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-white/10 rounded-full text-white transition-colors focus:ring-4 focus:ring-blue-500"
                >
                  <X className="w-8 h-8" />
                </button>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group/progress">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={togglePlay} 
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors focus:ring-4 focus:ring-blue-500"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsMuted(!isMuted)} 
                      className="p-2 hover:bg-white/10 rounded-full text-white transition-colors focus:ring-4 focus:ring-blue-500"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 accent-blue-600 focus:ring-4 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                  <div className="text-white font-medium">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
