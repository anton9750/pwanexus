const API_KEY_STORAGE = 'nexus-hub-yt-api-key';

export interface YouTubeResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
}

export function loadYouTubeApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveYouTubeApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

/**
 * Uses the official YouTube Data API v3 search endpoint.
 * Requires a free API key from https://console.cloud.google.com/apis/library/youtube.googleapis.com
 * This is the sanctioned way to search YouTube programmatically — no scraping involved.
 */
export async function searchYouTube(query: string, apiKey: string): Promise<YouTubeResult[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '12');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || `YouTube search failed (${res.status})`);
  }
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
  }));
}
