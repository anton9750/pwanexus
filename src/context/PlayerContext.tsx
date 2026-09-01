import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const NOW_PLAYING_KEY = 'nexus-hub-now-playing';

export interface NowPlaying {
  url: string; // spotify embed url
  label: string;
}

interface PlayerContextValue {
  nowPlaying: NowPlaying | null;
  play: (track: NowPlaying) => void;
  stop: () => void;
  miniPlayerOpen: boolean;
  setMiniPlayerOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function loadNowPlaying(): NowPlaying | null {
  try {
    const raw = localStorage.getItem(NOW_PLAYING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(() => loadNowPlaying());
  const [miniPlayerOpen, setMiniPlayerOpen] = useState(true);

  useEffect(() => {
    if (nowPlaying) {
      localStorage.setItem(NOW_PLAYING_KEY, JSON.stringify(nowPlaying));
    } else {
      localStorage.removeItem(NOW_PLAYING_KEY);
    }
  }, [nowPlaying]);

  function play(track: NowPlaying) {
    setNowPlaying(track);
    setMiniPlayerOpen(true);
  }

  function stop() {
    setNowPlaying(null);
  }

  return (
    <PlayerContext.Provider value={{ nowPlaying, play, stop, miniPlayerOpen, setMiniPlayerOpen }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
