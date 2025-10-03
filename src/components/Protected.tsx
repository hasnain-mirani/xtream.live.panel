import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Protected({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) router.replace("/auth/login");
      else setOk(true);
    });
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
