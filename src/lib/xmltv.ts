import { XMLParser } from "fast-xml-parser";

export function parseXMLTV(xml: string) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const doc = parser.parse(xml);
  const channels = (doc.tv?.channel || []).map((c: any) => ({
    tvgId: c.id,
    name: Array.isArray(c["display-name"]) ? c["display-name"][0] : c["display-name"],
    logo: c.icon?.src,
  }));
  const programs = (doc.tv?.programme || []).map((p: any) => ({
    channelTvgId: p.channel,
    start: toDate(p.start),
    stop: toDate(p.stop),
    title: Array.isArray(p.title) ? p.title[0] : p.title,
    desc: Array.isArray(p.desc) ? p.desc[0] : p.desc,
    category: Array.isArray(p.category) ? p.category[0] : p.category,
  }));
  return { channels, programs };
}

function toDate(s?: string) {
  // XMLTV format like 20251004 010000 +0000
  if (!s) return undefined;
  // keep it simple: rely on Date parse when possible
  const cleaned = s.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}).*$/, "$1-$2-$3T$4:$5:$6Z");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? undefined : d;
}
