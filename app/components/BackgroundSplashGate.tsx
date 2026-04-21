"use client";

import { useEffect, useState } from "react";

export default function BackgroundSplashGate({ minMs = 250 }: { minMs?: number }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const img = new Image();
    img.src = "/textures/red_wood_grain.jpg";

    const done = () => {
      const elapsed = performance.now() - started;
      const remaining = Math.max(0, minMs - elapsed);

      window.setTimeout(() => {
        if (!cancelled) setShow(false);
      }, remaining);
    };

    if (typeof img.decode === "function") {
      img.decode().then(done).catch(done);
    } else {
      img.onload = done;
      img.onerror = done;
    }

    return () => {
      cancelled = true;
    };
  }, [minMs]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-9999 pointer-events-none bg-[url('/textures/red_wood_grain.jpg')] bg-cover bg-center bg-no-repeat"
    />
  );
}