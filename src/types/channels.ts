export type Channel = {
  id: string;
  name: string;
  logo: string;          // e.g. "/channels/messi.jpg"
  category: string;      // e.g. "Sports", "Movies"
  language?: string;     // e.g. "EN"
  streamUrl: string;     // HLS/M3U8 url or Xtream code
  isHd?: boolean;
  epgId?: string;        // optional EPG mapping
    country: string;       // e.g. "US", "UK"
    quality: string;       // e.g. "4K", "FHD", "HD", "SD"
};
