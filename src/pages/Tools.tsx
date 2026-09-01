import { useState } from 'react';
import { Calculator } from './tools/Calculator';
import { UnitConverter } from './tools/UnitConverter';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { ColorPicker } from './tools/ColorPicker';
import { QrCode } from './tools/QrCode';
import { WorldClock } from './tools/WorldClock';
import { Pomodoro } from './tools/Pomodoro';
import styles from './Tools.module.css';

const TABS = [
  { id: 'calc', label: 'Calculator', icon: '🧮' },
  { id: 'units', label: 'Units', icon: '📐' },
  { id: 'password', label: 'Password', icon: '🔑' },
  { id: 'color', label: 'Color', icon: '🎨' },
  { id: 'qr', label: 'QR Code', icon: '▦' },
  { id: 'clock', label: 'World Clock', icon: '🌍' },
  { id: 'pomodoro', label: 'Pomodoro', icon: '⏱' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function Tools() {
  const [tab, setTab] = useState<TabId>('calc');

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tools</h1>
          <p className={styles.sub}>Handy utilities that run entirely in your browser</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {tab === 'calc' && <Calculator />}
        {tab === 'units' && <UnitConverter />}
        {tab === 'password' && <PasswordGenerator />}
        {tab === 'color' && <ColorPicker />}
        {tab === 'qr' && <QrCode />}
        {tab === 'clock' && <WorldClock />}
        {tab === 'pomodoro' && <Pomodoro />}
      </div>
    </div>
  );
}
