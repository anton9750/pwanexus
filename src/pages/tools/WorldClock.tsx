import { useEffect, useState } from 'react';
import styles from './ToolShared.module.css';

const ZONES = [
  { id: 'local', label: 'Local', tz: undefined as string | undefined },
  { id: 'utc', label: 'UTC', tz: 'UTC' },
  { id: 'ny', label: 'New York', tz: 'America/New_York' },
  { id: 'la', label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { id: 'london', label: 'London', tz: 'Europe/London' },
  { id: 'paris', label: 'Paris', tz: 'Europe/Paris' },
  { id: 'tokyo', label: 'Tokyo', tz: 'Asia/Tokyo' },
  { id: 'sydney', label: 'Sydney', tz: 'Australia/Sydney' },
  { id: 'dubai', label: 'Dubai', tz: 'Asia/Dubai' },
  { id: 'mumbai', label: 'Mumbai', tz: 'Asia/Kolkata' },
];

function formatInTz(date: Date, tz?: string) {
  return date.toLocaleTimeString(undefined, {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function dateInTz(date: Date, tz?: string) {
  return date.toLocaleDateString(undefined, {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function WorldClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.clockGrid}>
      {ZONES.map((z) => (
        <div key={z.id} className={styles.clockCard}>
          <span className={styles.clockLabel}>{z.label}</span>
          <span className={styles.clockTime}>{formatInTz(now, z.tz)}</span>
          <span className={styles.clockDate}>{dateInTz(now, z.tz)}</span>
        </div>
      ))}
    </div>
  );
}
