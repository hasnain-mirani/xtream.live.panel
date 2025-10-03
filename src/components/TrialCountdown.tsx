import { useEffect, useState } from "react";

export default function TrialCountdown({ trialEndsAt }: { trialEndsAt?: string | null }) {
  const [text, setText] = useState("—");
  useEffect(() => {
    if (!trialEndsAt) return setText("No trial");
    const t = setInterval(() => {
      const end = new Date(trialEndsAt).getTime();
      const left = end - Date.now();
      if (left <= 0) { setText("Expired"); return; }
      const mins = Math.floor(left/60000);
      const hrs = Math.floor(mins/60);
      const d = Math.floor(hrs/24);
      const remH = hrs % 24;
      const remM = mins % 60;
      setText(d > 0 ? `${d}d ${remH}h ${remM}m` : `${remH}h ${remM}m`);
    }, 1000);
    return () => clearInterval(t);
  }, [trialEndsAt]);
  return <span>{text}</span>;
}
