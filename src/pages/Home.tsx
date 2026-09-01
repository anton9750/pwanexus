import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const QUICK_LINKS = [
  { name: 'YouTube', url: 'https://www.youtube.com', color: '#FF0000', icon: '▶' },
  { name: 'Netflix', url: 'https://www.netflix.com', color: '#E50914', icon: 'N' },
  { name: 'Spotify', url: 'https://open.spotify.com', color: '#1DB954', icon: '♫' },
  { name: 'X / Twitter', url: 'https://x.com', color: '#fff', icon: '𝕏' },
  { name: 'Instagram', url: 'https://www.instagram.com', color: '#E4405F', icon: '◎' },
  { name: 'Facebook', url: 'https://www.facebook.com', color: '#1877F2', icon: 'f' },
  { name: 'Steam', url: 'https://store.steampowered.com', color: '#66c0f4', icon: '🎮' },
  { name: 'Amazon', url: 'https://www.amazon.com', color: '#FF9900', icon: 'a' },
  { name: 'Tinder', url: 'https://tinder.com', color: '#FE3C72', icon: '♥' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', color: '#74AA9C', icon: '◍' },
  { name: 'Gemini', url: 'https://gemini.google.com', color: '#8E75F6', icon: '✦' },
  { name: 'Grok', url: 'https://grok.com', color: '#ffffff', icon: '𝕏' },
  { name: 'Claude', url: 'https://claude.ai', color: '#D97757', icon: '✳' },
  { name: 'Outlook', url: 'https://outlook.com', color: '#0A2767', icon: '✉' },
];

export function Home() {
  const [query, setQuery] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  }

  return (
    <div className="page">
      <section className={styles.hero}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Your all-purpose command center</p>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Google… e.g. bloodborne"
              className={styles.searchInput}
              autoFocus
            />
            <button type="submit" className={styles.searchBtn}>
              Search
            </button>
          </div>
          <p className={styles.searchHint}>Press Enter to open Google results in a new tab</p>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className="section-title">Quick Links</h2>
        <div className={styles.linkGrid}>
          {QUICK_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
              style={{ '--link-color': link.color } as React.CSSProperties}
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkName}>{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="section-title">Workspace</h2>
        <div className={styles.workspaceGrid}>
          <Link to="/files" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>📁</div>
            <div>
              <h3>Files & Images</h3>
              <p>Drop files for work. Saved in local storage on this device.</p>
            </div>
          </Link>
          <Link to="/notes" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>📝</div>
            <div>
              <h3>Notes</h3>
              <p>Quick local notes with a two-pane editor.</p>
            </div>
          </Link>
          <Link to="/tasks" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>☑</div>
            <div>
              <h3>Tasks</h3>
              <p>To-dos with priorities, stored on this device.</p>
            </div>
          </Link>
          <Link to="/bookmarks" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>🔖</div>
            <div>
              <h3>Bookmarks</h3>
              <p>Save and tag links for fast access.</p>
            </div>
          </Link>
          <Link to="/music" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>♫</div>
            <div>
              <h3>Spotify Music</h3>
              <p>Embed playlists & listen while you work.</p>
            </div>
          </Link>
          <Link to="/stocks" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>📈</div>
            <div>
              <h3>Stock Market</h3>
              <p>Track popular stocks and market moves.</p>
            </div>
          </Link>
          <Link to="/youtube" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>▶</div>
            <div>
              <h3>YouTube Search</h3>
              <p>Search and watch videos embedded right on this page.</p>
            </div>
          </Link>
          <Link to="/weather" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>☁</div>
            <div>
              <h3>Weather</h3>
              <p>7-day forecast via Open-Meteo — no API key.</p>
            </div>
          </Link>
          <Link to="/tools" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>⚒</div>
            <div>
              <h3>Tools</h3>
              <p>Calculator, units, passwords, QR, clock, pomodoro.</p>
            </div>
          </Link>
          <Link to="/repos" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>⌥</div>
            <div>
              <h3>GitHub Repos</h3>
              <p>A folder of your public repos, pulled live from GitHub.</p>
            </div>
          </Link>
          <Link to="/settings" className={styles.workspaceCard}>
            <div className={styles.wsIcon}>⚙</div>
            <div>
              <h3>Settings</h3>
              <p>Theme, export/import backups, clear data.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
