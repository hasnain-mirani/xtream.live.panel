import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function Player() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let interval: any;

    (async () => {
      const r = await fetch("/api/streams/current");
      if (!r.ok) { setBlocked(true); return; }
      const { url } = await r.json();
      const v = ref.current!;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(v);
      } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = url;
      }
      v.play().catch(()=>{});

      // send a ping every 15s
      interval = setInterval(() => {
        const playhead = Math.floor(v.currentTime || 0);
        fetch("/api/streams/ping", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ playhead })
        }).catch(()=>{});
      }, 15000);
    })().catch(() => setBlocked(true));

    return () => interval && clearInterval(interval);
  }, []);

  if (blocked) return <div className="text-red-600">Access blocked. Start a trial or upgrade.</div>;
  return <video ref={ref} controls className="w-full rounded-2xl border" />;
}
