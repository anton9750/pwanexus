/** Free Open-Meteo APIs — no API key required. */

export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  weathercode: number;
  windspeed: number;
  winddirection: number;
  time: string;
}

export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
}

export interface WeatherBundle {
  current: CurrentWeather;
  daily: DailyForecast;
  timezone: string;
}

const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '🌨️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Rain showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunder + hail', icon: '⛈️' },
  99: { label: 'Thunder + heavy hail', icon: '⛈️' },
};

export function weatherLabel(code: number): string {
  return WMO[code]?.label ?? `Code ${code}`;
}

export function weatherIcon(code: number): string {
  return WMO[code]?.icon ?? '🌡️';
}

export async function searchPlaces(query: string): Promise<GeoResult[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return (data.results ?? []) as GeoResult[];
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: 'true',
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  return {
    current: data.current_weather,
    daily: data.daily,
    timezone: data.timezone,
  };
}

const LAST_LOC_KEY = 'nexus-weather-last';

export function saveLastLocation(place: GeoResult): void {
  localStorage.setItem(LAST_LOC_KEY, JSON.stringify(place));
}

export function loadLastLocation(): GeoResult | null {
  try {
    const raw = localStorage.getItem(LAST_LOC_KEY);
    return raw ? (JSON.parse(raw) as GeoResult) : null;
  } catch {
    return null;
  }
}
