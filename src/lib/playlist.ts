export type RawChannel = {
  name: string;
  url: string;
  tvgId?: string;
  logo?: string;
  group?: string;
  country?: string;
  language?: string;
};

export function parseM3U(m3u: string): RawChannel[] {
  const lines = m3u.split(/\r?\n/);
  const out: RawChannel[] = [];
  let meta: Partial<RawChannel> = {};
  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const tvgId = /tvg-id="([^"]+)"/.exec(line)?.[1];
      const logo  = /tvg-logo="([^"]+)"/.exec(line)?.[1];
      const group = /group-title="([^"]+)"/.exec(line)?.[1];
      const country = /tvg-country="([^"]+)"/.exec(line)?.[1];
      const language = /tvg-language="([^"]+)"/.exec(line)?.[1];
      const name = line.split(",").slice(1).join(",").trim();
      meta = { name, tvgId, logo, group, country, language };
    } else if (line && !line.startsWith("#")) {
      out.push({ ...(meta as RawChannel), url: line.trim() });
      meta = {};
    }
  }
  return out;
}
