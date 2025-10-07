// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.css";  
export default function NeonApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Root wrapper gives a subtle gradient + glow backdrop */}
      <div className="neon-root">
        <Component {...pageProps} />
      </div>

      {/* Global Neon Theme (single file) */}
      <style jsx global>{`
        /* ---------- Base + Resets ---------- */
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #__next { height: 100%; }
        body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }

        /* ---------- Neon tokens ---------- */
        :root {
          --radius: 10px;

          /* light base */
          --background: oklch(0.98 0 0);
          --foreground: oklch(0.14 0 0);
          --border: oklch(0.9 0 0);

          /* neon hues */
          --neon-pink: oklch(0.8 0.25 350);
          --neon-cyan: oklch(0.9 0.16 200);
          --neon-purple: oklch(0.78 0.22 290);
          --neon-lime: oklch(0.9 0.2 135);

          /* primary/accent mapping */
          --primary: var(--neon-cyan);
          --primary-foreground: oklch(0.15 0 0);
          --accent: var(--neon-pink);
          --accent-foreground: oklch(0.15 0 0);

          /* text shades */
          --muted-fg: oklch(0.5 0 0);
          --soft-white: oklch(0.98 0 0);
        }

        /* prefer dark neon by default – remove if you want light default */
        html { color-scheme: dark; }
        body { background: var(--background); color: var(--soft-white); }

        .dark {
          --background: oklch(0.15 0 0);
          --foreground: oklch(0.98 0 0);
          --border: oklch(1 0 0 / 10%);

          --primary: var(--neon-cyan);
          --primary-foreground: oklch(0.15 0 0);
          --accent: var(--neon-pink);
          --accent-foreground: oklch(0.15 0 0);
        }

        /* ---------- App wrapper background ---------- */
        .neon-root {
          min-height: 100%;
          position: relative;
          background:
            radial-gradient(60rem 30rem at 10% -10%, color-mix(in oklch, var(--accent) 20%, transparent), transparent 60%),
            radial-gradient(50rem 30rem at 110% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%),
            radial-gradient(80rem 50rem at 50% 120%, color-mix(in oklch, var(--neon-purple) 12%, transparent), transparent 70%),
            linear-gradient(180deg, oklch(0.12 0 0), oklch(0.18 0 0));
        }

        /* ---------- Neon text glows ---------- */
        .neon {
          text-shadow:
            0 0 .5rem color-mix(in oklch, var(--primary) 70%, white 30%),
            0 0 1.25rem var(--primary),
            0 0 2.5rem var(--primary);
        }
        .neon-accent {
          text-shadow:
            0 0 .5rem color-mix(in oklch, var(--accent) 70%, white 30%),
            0 0 1.25rem var(--accent),
            0 0 2.5rem var(--accent);
        }

        /* ---------- Neon borders / containers ---------- */
        .neon-border {
          position: relative;
          border-radius: 1rem;
        }
        .neon-border::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(90deg, var(--primary), var(--accent), var(--neon-purple), var(--primary));
          background-size: 300% 100%;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0) padding-box;
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          animation: neon-flow 6s linear infinite;
        }
        @keyframes neon-flow { to { background-position: 300% 0; } }

        .card-neon {
          position: relative;
          border: 1px solid color-mix(in oklch, var(--primary) 40%, var(--border));
          border-radius: 1rem;
          padding: 1.25rem;
          background: color-mix(in oklch, oklch(0.12 0 0) 80%, transparent);
          box-shadow:
            0 0 .4rem color-mix(in oklch, var(--primary) 30%, transparent),
            0 0 1.4rem color-mix(in oklch, var(--accent) 20%, transparent);
        }

        /* ---------- Neon buttons ---------- */
        .btn-neon {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          padding: .65rem 1.1rem;
          border-radius: 1rem;
          font-weight: 600;
          border: 1px solid transparent;
          color: var(--soft-white);
          background:
            linear-gradient(to bottom, oklch(0.16 0 0/.2), oklch(0 0 0/.35)) padding-box,
            linear-gradient(90deg, var(--primary), var(--accent)) border-box;
          box-shadow:
            0 0 .4rem color-mix(in oklch, var(--primary) 40%, transparent),
            0 0 1.2rem color-mix(in oklch, var(--accent) 35%, transparent);
          transition: filter .15s ease, transform .1s ease, box-shadow .2s ease;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-neon:hover {
          filter: brightness(1.06);
          box-shadow:
            0 0 .6rem var(--primary),
            0 0 1.6rem var(--accent);
        }
        .btn-neon:active { transform: translateY(1px); }

        .btn-neon-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          padding: .65rem 1.1rem; border-radius: 1rem; font-weight: 600;
          border: 1px solid color-mix(in oklch, var(--primary) 70%, transparent);
          color: var(--primary); background: transparent; cursor: pointer;
          transition: box-shadow .2s ease, filter .15s ease;
          text-decoration: none;
        }
        .btn-neon-ghost:hover {
          box-shadow:
            0 0 .5rem var(--primary),
            inset 0 0 .25rem color-mix(in oklch, var(--primary) 30%, transparent);
          filter: brightness(1.05);
        }

        /* ---------- Inputs ---------- */
        .input-neon {
          width: 100%;
          padding: .7rem .9rem;
          border-radius: .9rem;
          border: 1px solid color-mix(in oklch, var(--accent) 35%, var(--border));
          background: transparent;
          color: var(--soft-white);
          font-size: 0.95rem;
          box-shadow: inset 0 0 .4rem color-mix(in oklch, var(--accent) 18%, transparent);
          outline: none;
          transition: box-shadow .2s ease, border-color .15s ease;
        }
        .input-neon:focus {
          border-color: var(--accent);
          box-shadow:
            0 0 .7rem color-mix(in oklch, var(--accent) 45%, transparent),
            inset 0 0 .4rem color-mix(in oklch, var(--accent) 25%, transparent);
        }

        /* ---------- Links ---------- */
        .link-neon {
          position: relative;
          color: var(--accent);
          text-decoration: none;
        }
        .link-neon::after {
          content: "";
          position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--primary));
          box-shadow: 0 0 .6rem color-mix(in oklch, var(--accent) 50%, transparent);
          transform: scaleX(0); transform-origin: left;
          transition: transform .25s ease;
        }
        .link-neon:hover::after { transform: scaleX(1); }

        /* ---------- Helpers ---------- */
        .muted { color: var(--muted-fg); }
        .radius { border-radius: var(--radius); }
      `}</style>
    </>
  );
}
