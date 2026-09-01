import { useState, useMemo } from 'react';
import styles from './ToolShared.module.css';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function ColorPicker() {
  const [hex, setHex] = useState('#6366f1');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(
    () => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null),
    [rgb]
  );

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <input
          type="color"
          value={hex.length === 7 ? hex : '#000000'}
          onChange={(e) => setHex(e.target.value)}
          className={styles.colorInput}
        />
        <input
          className={styles.input}
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#6366f1"
        />
      </div>
      <div
        className={styles.swatch}
        style={{ background: rgb ? hex : 'transparent' }}
      />
      <div className={styles.metaGrid}>
        <div>
          <span className={styles.metaLabel}>HEX</span>
          <code>{hex}</code>
        </div>
        <div>
          <span className={styles.metaLabel}>RGB</span>
          <code>
            {rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '—'}
          </code>
        </div>
        <div>
          <span className={styles.metaLabel}>HSL</span>
          <code>
            {hsl ? `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` : '—'}
          </code>
        </div>
      </div>
    </div>
  );
}
