import { useEffect, useRef, useState } from 'react';
import styles from './ToolShared.module.css';

type Mode = 'focus' | 'break';

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
};

export function Pomodoro() {
  const [mode, setMode] = useState<Mode>('focus');
  const [seconds, setSeconds] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const endRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      if (!endRef.current) return;
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) {
        setRunning(false);
        endRef.current = null;
        try {
          new Notification('Pomodoro', {
            body: mode === 'focus' ? 'Focus session done!' : 'Break over!',
          });
        } catch {
          /* notifications may be blocked */
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, mode]);

  function switchMode(m: Mode) {
    setRunning(false);
    setMode(m);
    setSeconds(DURATIONS[m]);
  }

  function reset() {
    setRunning(false);
    setSeconds(DURATIONS[mode]);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className={styles.panel} style={{ textAlign: 'center' }}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${mode === 'focus' ? styles.tabActive : ''}`}
          onClick={() => switchMode('focus')}
        >
          Focus 25m
        </button>
        <button
          className={`${styles.tab} ${mode === 'break' ? styles.tabActive : ''}`}
          onClick={() => switchMode('break')}
        >
          Break 5m
        </button>
      </div>
      <div className={styles.timerDisplay}>
        {mm}:{ss}
      </div>
      <div className={styles.row} style={{ justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
