import { useState } from 'react';
import styles from './ToolShared.module.css';

export function QrCode() {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(200);

  const src =
    text.trim().length > 0
      ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text.trim())}`
      : '';

  return (
    <div className={styles.panel}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="URL or text to encode"
        rows={3}
      />
      <label className={styles.label}>
        Size: {size}px
        <input
          type="range"
          min={120}
          max={400}
          step={20}
          value={size}
          onChange={(e) => setSize(+e.target.value)}
          className={styles.range}
        />
      </label>
      {src && (
        <div className={styles.qrWrap}>
          <img src={src} alt="QR code" width={size} height={size} />
        </div>
      )}
    </div>
  );
}
