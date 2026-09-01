import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MiniPlayer } from './MiniPlayer';
import { PinterestSidebar } from './PinterestSidebar';
import { GeminiSidebar } from './GeminiSidebar';
import { CommandPalette } from './CommandPalette';
import { useTheme } from '../context/ThemeContext';
import styles from './Layout.module.css';

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/files', label: 'Files', icon: '📁' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/tasks', label: 'Tasks', icon: '☑' },
  { to: '/bookmarks', label: 'Links', icon: '🔖' },
  { to: '/music', label: 'Music', icon: '♫' },
  { to: '/stocks', label: 'Stocks', icon: '📈' },
  { to: '/youtube', label: 'YouTube', icon: '▶' },
  { to: '/weather', label: 'Weather', icon: '☁' },
  { to: '/tools', label: 'Tools', icon: '⚒' },
  { to: '/repos', label: 'Repos', icon: '⌥' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function Layout({ children }: { children: ReactNode }) {
  const [pinterestOpen, setPinterestOpen] = useState(false);
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>◈</span>
          <span className={styles.name}>Nexus Hub</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.headerIcons}>
          <button
            className={styles.iconBtn}
            onClick={() => setPaletteOpen(true)}
            title="Command palette (Ctrl/⌘ K)"
          >
            ⌘
          </button>
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setGeminiOpen(true)}
            title="Open Gemini chat"
          >
            💬
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setPinterestOpen(true)}
            title="Search Pinterest without leaving the site"
          >
            📌
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            title="Open GitHub"
          >
            🐙
          </a>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>Nexus Hub — Your personal command center</span>
        <span className={styles.footerNote}>Data stays on this device · Ctrl/⌘ K for commands</span>
      </footer>

      <MiniPlayer />
      <PinterestSidebar open={pinterestOpen} onClose={() => setPinterestOpen(false)} />
      <GeminiSidebar open={geminiOpen} onClose={() => setGeminiOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
