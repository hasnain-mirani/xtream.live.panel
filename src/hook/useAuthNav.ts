"use client";

import useSWR from "swr";

type MeResp =
  | { isLoggedIn: false }
  | { isLoggedIn: true; user: { id: string; name: string; email: string }; onTrial: boolean };

const fetcher = (url: string) =>
  fetch(url, { credentials: "same-origin" }).then((r) => r.json());

export function useAuthNav() {
  const { data, error, mutate, isLoading } = useSWR<MeResp>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const isLoggedIn = !!data && data.isLoggedIn === true;
  const onTrial = isLoggedIn ? data.onTrial : false;
  const user = isLoggedIn ? data.user : undefined;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    await mutate({ isLoggedIn: false }, { revalidate: false });
    // optional redirect:
    if (typeof window !== "undefined") window.location.href = "/";
  }

  return {
    isLoading,
    isLoggedIn,
    onTrial,
    user,
    logout,
    error,
    refresh: () => mutate(),
  };
}
