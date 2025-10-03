import Protected from "@/components/Protected";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";

type Chan = { key: string; name: string };

export default function Watch() {
  const [channels, setChannels] = useState<Chan[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeAt, setResumeAt] = useState<number>(0); // continue watching

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // load channel list
  useEffect(() => {
    fetch("/api/streams/list")
      .then(async r => {
        if (!r.ok) { setBlocked(true); return; }
        const j = await r.json();
        const list: Chan[] = (j.channels || []).map((c: any) => ({ key: c.id || c.key, name: c.name }));
        setChannels(list);
        if (list[0]) setCurrent(list[0].key);
      })
      .catch(() => setBlocked(true));
  }, []);

  // resolve stream + session guard + continue progress
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!current) return;
      // resolve: url + sessionId
      const r = await fetch(`/api/streams/get?id=${encodeURIComponent(current)}`);
      if (!r.ok) { setBlocked(true); return; }
      const { url, sessionId: sid, playhead } = await r.json(); // allow API to return prior playhead if you prefer
      if (sid) setSessionId(sid);

      // get resume
      const cw = await fetch("/api/user/continue").then(r=>r.json()).catch(()=>({items:[]}));
      const found = (cw.items || []).find((it:any)=> it.channelKey === current);
      setResumeAt(found?.playhead || playhead || 0);

      const v = videoRef.current;
      if (!v) return;

      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

      const tryPlay = () => {
        if (resumeAt > 0) { try { v.currentTime = resumeAt; } catch {} }
        v.play().catch(() => {});
      };

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { if (!cancelled) tryPlay(); });
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = url;
        const onLoaded = () => { v.removeEventListener("loadedmetadata", onLoaded); if (!cancelled) tryPlay(); };
        v.addEventListener("loadedmetadata", onLoaded, { once: true });
      } else {
        v.src = url;
      }
    })();

    return () => {
      cancelled = true;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [current, resumeAt]);

  // periodic ping (progress + device guard)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const t = setInterval(() => {
      const playhead = Math.floor(v.currentTime || 0);
      fetch("/api/streams/ping", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId, channelKey: current, playhead })
      }).catch(()=>{});
    }, 15000);
    return () => clearInterval(t);
  }, [sessionId, current]);

  if (blocked) {
    return (
      <Protected>
        <main className="my-10">
          <h1 className="text-2xl font-bold">Watch</h1>
          <p className="text-red-600">Access blocked — start a trial or upgrade.</p>
        </main>
      </Protected>
    );
  }

  return (
    <Protected>
      <main className="my-8 space-y-4">
        <h1 className="text-2xl font-bold">Watch</h1>
        <div className="flex gap-2 flex-wrap">
          {channels.map(c => (
            <Button
              key={c.key}
              variant={current === c.key ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setCurrent(c.key)}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <video ref={videoRef} controls muted autoPlay className="w-full rounded-2xl border" />

        {/* EPG row */}
        <EpgRow channelKey={current} />
      </main>
    </Protected>
  );
}

function EpgRow({ channelKey }: { channelKey: string | null }) {
  const [items, setItems] = useState<{ title: string; start: string; end: string }[]>([]);
  useEffect(() => {
    if (!channelKey) return;
    fetch(`/api/epg/list?channelKey=${encodeURIComponent(channelKey)}`)
      .then(r=>r.json()).then(j=> setItems(j.items || [])).catch(()=>setItems([]));
  }, [channelKey]);
  const now = Date.now();

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold opacity-80 mb-2">Program Guide</h2>
      <div className="flex gap-2 overflow-x-auto">
        {items.map((p, idx) => {
          const start = new Date(p.start).getTime();
          const end = new Date(p.end).getTime();
          const live = start <= now && now < end;
          return (
            <div key={idx} className={`rounded-xl border px-3 py-2 text-sm whitespace-nowrap ${live ? "border-black" : ""}`}>
              <span className="font-medium">{p.title}</span>
              <span className="opacity-70 ml-2">{new Date(p.start).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}–{new Date(p.end).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</span>
              {live && <span className="ml-2 text-red-600">● LIVE</span>}
            </div>
          );
        })}
        {items.length === 0 && <div className="text-sm opacity-70">No schedule</div>}
      </div>
    </div>
  );
}
