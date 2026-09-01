import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  downloadExport,
  importFromJson,
  clearAllAppData,
} from '../lib/exportImport';
import {
  canInstall,
  canShare,
  isStandalone,
  onInstallAvailable,
  promptInstall,
  shareApp,
  copyToClipboard,
} from '../lib/pwa';
import styles from './Settings.module.css';

export function Settings() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [installReady, setInstallReady] = useState(canInstall());
  const [standalone, setStandalone] = useState(isStandalone());
  const [shareSupported] = useState(canShare());

  useEffect(() => {
    setStandalone(isStandalone());
    return onInstallAvailable(() => {
      setInstallReady(canInstall());
      setStandalone(isStandalone());
    });
  }, []);

  function showMsg(text: string, isError = false) {
    setMsg(text);
    // clear after a bit
    setTimeout(() => setMsg(null), 4000);
    void isError;
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const result = importFromJson(text);
      if (result.ok) {
        showMsg('Import successful — reloading…');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showMsg(`Import failed: ${result.error}`, true);
      }
    };
    reader.readAsText(file);
  }

  function handleClear() {
    if (
      !confirm(
        'Clear all Nexus Hub data on this device? This cannot be undone.'
      )
    )
      return;
    clearAllAppData();
    showMsg('All app data cleared');
    setTimeout(() => window.location.reload(), 600);
  }

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      showMsg('App installed — you can open it from your home screen');
      setStandalone(true);
      setInstallReady(false);
    } else if (outcome === 'dismissed') {
      showMsg('Install cancelled');
    } else {
      showMsg(
        'Install not available yet. On Chrome/Edge use the install icon in the address bar, or on iOS use Share → Add to Home Screen.'
      );
    }
  }

  async function handleShareApp() {
    const ok = await shareApp();
    if (!ok) {
      const copied = await copyToClipboard(window.location.origin);
      showMsg(
        copied
          ? 'Link copied to clipboard — paste it anywhere to share'
          : 'Sharing not supported on this browser'
      );
    }
  }

  async function handleCopyLink() {
    const copied = await copyToClipboard(window.location.origin);
    showMsg(copied ? 'App link copied' : 'Could not copy link');
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.sub}>
          Install, theme, backup, share &amp; device controls
        </p>
      </div>

      {/* Install / App */}
      <section className={styles.section}>
        <h2 className="section-title">App</h2>
        <div className={styles.card}>
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Install Nexus Hub</div>
              <div className={styles.hint}>
                {standalone
                  ? 'Running as an installed app (standalone mode).'
                  : 'Install from this website to use it like a native app — offline shell, home-screen icon, and faster launch.'}
              </div>
            </div>
            <div className={styles.themeBtns}>
              {!standalone && (
                <button
                  className="btn btn-primary"
                  onClick={handleInstall}
                  disabled={!installReady && !canInstall()}
                  title={
                    installReady
                      ? 'Install this app'
                      : 'Browser will offer install when available'
                  }
                >
                  {installReady ? 'Install app' : 'Install (when available)'}
                </button>
              )}
              {standalone && (
                <span className={styles.badge}>Installed</span>
              )}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.row}>
            <div>
              <div className={styles.label}>Share this app</div>
              <div className={styles.hint}>
                Send the website link so others can open or install Nexus Hub.
              </div>
            </div>
            <div className={styles.themeBtns}>
              <button className="btn btn-ghost" onClick={handleShareApp}>
                {shareSupported ? 'Share' : 'Copy link'}
              </button>
              <button className="btn btn-ghost" onClick={handleCopyLink}>
                Copy URL
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.hint} style={{ marginTop: 0 }}>
            <strong>How to install</strong>
            <ul className={styles.list}>
              <li>
                <strong>Chrome / Edge (desktop)</strong> — look for the install
                icon in the address bar, or use the Install button above when it
                lights up.
              </li>
              <li>
                <strong>Android Chrome</strong> — menu → “Install app” or “Add
                to Home screen”.
              </li>
              <li>
                <strong>iPhone / iPad (Safari)</strong> — Share button → “Add to
                Home Screen”.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className={styles.section}>
        <h2 className="section-title">Appearance</h2>
        <div className={styles.card}>
          <div className={styles.row}>
            <div>
              <div className={styles.label}>Theme</div>
              <div className={styles.hint}>Currently: {theme}</div>
            </div>
            <div className={styles.themeBtns}>
              <button
                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button className="btn btn-ghost" onClick={toggleTheme}>
                Toggle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Data / Save */}
      <section className={styles.section}>
        <h2 className="section-title">Save &amp; backup</h2>
        <div className={styles.card}>
          <p className={styles.hint}>
            Notes, tasks, bookmarks, theme, Spotify embeds and other local data
            can be exported as a single JSON file. Import on another device to
            restore everything.
          </p>
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={downloadExport}>
              Export backup
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => fileRef.current?.click()}
            >
              Import backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = '';
              }}
            />
            <button className="btn btn-danger" onClick={handleClear}>
              Clear all data
            </button>
          </div>
          {msg && <p className={styles.msg}>{msg}</p>}
        </div>
      </section>

      {/* Cast / media */}
      <section className={styles.section}>
        <h2 className="section-title">Cast &amp; media</h2>
        <div className={styles.card}>
          <p className={styles.hint}>
            Nexus Hub embeds YouTube and Spotify players. To cast to a TV:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>YouTube</strong> — open a video in the YouTube page, then
              use the cast icon inside the player (or your browser’s cast /
              AirPlay controls).
            </li>
            <li>
              <strong>Spotify</strong> — use Spotify’s own app or the embed’s
              controls; full Chromecast casting works best from the official
              Spotify client.
            </li>
            <li>
              <strong>Chrome Cast</strong> — on desktop Chrome, use the menu →
              “Cast…” to mirror the tab or cast media when available.
            </li>
          </ul>
          <p className={styles.hint} style={{ marginTop: '0.75rem' }}>
            True background casting of arbitrary web content is limited by
            browser security; the built-in players already expose the best
            supported paths.
          </p>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className="section-title">About</h2>
        <div className={styles.card}>
          <p className={styles.hint}>
            Nexus Hub — personal command center. All personal data stays in this
            browser unless you export it.
          </p>
          <p className={styles.hint}>
            Weather via Open-Meteo. QR via api.qrserver.com. No accounts
            required. Works offline after first visit (PWA shell).
          </p>
          <p className={styles.hint} style={{ marginTop: '0.5rem' }}>
            Version 1.1 · Progressive Web App
          </p>
        </div>
      </section>
    </div>
  );
}
