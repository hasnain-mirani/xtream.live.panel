import { useEffect, useState } from "react";

export function useAuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onTrial, setOnTrial] = useState(false);

  useEffect(() => {
    let killed = false;
    (async () => {
      const t = Date.now(); // cache-buster
      try {
        const [meR, subR] = await Promise.all([
          fetch(`/api/auth/me?t=${t}`, { cache: "no-store" }),
          fetch(`/api/subscription/me?t=${t}`, { cache: "no-store" }),
        ]);
        if (!killed) {
          setIsLoggedIn(meR.ok);
          if (subR.ok) {
            const sub = await subR.json();
            setOnTrial(sub?.status === "trial");
          } else {
            setOnTrial(false);
          }
        }
      } catch {
        if (!killed) { setIsLoggedIn(false); setOnTrial(false); }
      }
    })();
    return () => { killed = true; };
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    location.reload(); // refresh the header
  };

  return { isLoggedIn, onTrial, logout };
}
