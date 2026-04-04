import { useEffect } from 'react';

export type TVAction = 'BACK' | 'PLAY' | 'PAUSE' | 'PLAY_PAUSE' | 'FF' | 'RW' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER';

interface UseTVRemoteOptions {
  onAction?: (action: TVAction, event: KeyboardEvent) => boolean | void;
  isActive?: boolean;
}

export const useTVRemote = ({ onAction, isActive = true }: UseTVRemoteOptions = {}) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      let action: TVAction | null = null;

      switch (e.keyCode) {
        case 38: if (!isTyping) action = 'UP'; break;
        case 40: if (!isTyping) action = 'DOWN'; break;
        case 37: if (!isTyping) action = 'LEFT'; break;
        case 39: if (!isTyping) action = 'RIGHT'; break;
        case 13: action = 'ENTER'; break;
        case 27: // Escape
        case 10009: // Tizen Return
        case 461: // WebOS Back
          action = 'BACK'; 
          break;
        case 8: // Backspace
          if (!isTyping) action = 'BACK';
          break;
        case 415: // WebOS Play
          action = 'PLAY'; break;
        case 19: // WebOS Pause
          action = 'PAUSE'; break;
        case 10014: // Tizen Play/Pause
        case 10252: // Tizen Play/Pause
        case 32: // Space
          if (!isTyping) action = 'PLAY_PAUSE'; break;
        case 417: // Fast Forward
          action = 'FF'; break;
        case 412: // Rewind
          action = 'RW'; break;
      }

      if (action) {
        const handled = onAction?.(action, e);
        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onAction]);
};
