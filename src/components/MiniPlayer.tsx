import { usePlayer } from '../context/PlayerContext';
import styles from './MiniPlayer.module.css';

export function MiniPlayer() {
  const { nowPlaying, stop, miniPlayerOpen, setMiniPlayerOpen } = usePlayer();

  if (!nowPlaying) return null;

  return (
    <div className={`${styles.dock} ${miniPlayerOpen ? '' : styles.collapsed}`}>
      <div className={styles.dockHeader}>
        <span className={styles.dockLabel}>♫ Now playing — {nowPlaying.label}</span>
        <div className={styles.dockActions}>
          <button
            className={styles.dockBtn}
            onClick={() => setMiniPlayerOpen(!miniPlayerOpen)}
            title={miniPlayerOpen ? 'Collapse' : 'Expand'}
          >
            {miniPlayerOpen ? '⌄' : '⌃'}
          </button>
          <button className={styles.dockBtn} onClick={stop} title="Stop">
            ×
          </button>
        </div>
      </div>
      {/* This iframe is mounted once in Layout, outside <Routes>, so navigating
          between pages (Home, Files, Stocks…) never unmounts or reloads it —
          the track keeps playing no matter where you are in the app. */}
      <iframe
        key={nowPlaying.url}
        src={`${nowPlaying.url}?utm_source=generator&theme=0`}
        width="100%"
        height={miniPlayerOpen ? 152 : 0}
        style={{ display: miniPlayerOpen ? 'block' : 'none' }}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={nowPlaying.label}
      />
    </div>
  );
}
