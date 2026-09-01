import { useEffect, useState, FormEvent } from 'react';
import {
  searchPlaces,
  fetchWeather,
  saveLastLocation,
  loadLastLocation,
  weatherIcon,
  weatherLabel,
  GeoResult,
  WeatherBundle,
} from '../lib/weather';
import styles from './Weather.module.css';

export function Weather() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [place, setPlace] = useState<GeoResult | null>(null);
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const last = loadLastLocation();
    if (last) selectPlace(last);
  }, []);

  async function selectPlace(p: GeoResult) {
    setPlace(p);
    setResults([]);
    setQuery(`${p.name}${p.admin1 ? ', ' + p.admin1 : ''}${p.country ? ', ' + p.country : ''}`);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(p.latitude, p.longitude);
      setWeather(data);
      saveLastLocation(p);
    } catch {
      setError('Could not load weather');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const places = await searchPlaces(query);
      setResults(places);
      if (places.length === 0) setError('No places found');
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }

  function dayName(iso: string) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Weather</h1>
          <p className={styles.sub}>Powered by Open-Meteo · no API key needed</p>
        </div>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city…"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((r) => (
            <li key={r.id}>
              <button className={styles.resultBtn} onClick={() => selectPlace(r)}>
                {r.name}
                {r.admin1 ? `, ${r.admin1}` : ''}
                {r.country ? ` · ${r.country}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {weather && place && (
        <div className={styles.panel}>
          <div className={styles.current}>
            <div className={styles.currentMain}>
              <span className={styles.icon}>
                {weatherIcon(weather.current.weathercode)}
              </span>
              <div>
                <div className={styles.temp}>
                  {Math.round(weather.current.temperature)}°
                </div>
                <div className={styles.condition}>
                  {weatherLabel(weather.current.weathercode)}
                </div>
                <div className={styles.placeName}>
                  {place.name}
                  {place.country ? `, ${place.country}` : ''}
                </div>
              </div>
            </div>
            <div className={styles.meta}>
              <div>
                <span className={styles.metaLabel}>Wind</span>
                <span>{Math.round(weather.current.windspeed)} km/h</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Timezone</span>
                <span>{weather.timezone}</span>
              </div>
            </div>
          </div>

          <h2 className="section-title">7-day forecast</h2>
          <div className={styles.forecast}>
            {weather.daily.time.map((day, i) => (
              <div key={day} className={styles.day}>
                <span className={styles.dayName}>{dayName(day)}</span>
                <span className={styles.dayIcon}>
                  {weatherIcon(weather.daily.weathercode[i])}
                </span>
                <span className={styles.dayTemp}>
                  {Math.round(weather.daily.temperature_2m_max[i])}° /{' '}
                  {Math.round(weather.daily.temperature_2m_min[i])}°
                </span>
                <span className={styles.dayRain}>
                  {weather.daily.precipitation_sum[i] > 0
                    ? `${weather.daily.precipitation_sum[i]} mm`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
