"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type SquareTokenizeResult = {
  status: string;
  token?: string;
  errors?: Array<{ message?: string }>;
};

type SquareCard = {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<SquareTokenizeResult>;
};

type SquareCardOptions = {
  style?: {
    input?: {
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    };
  };
};

type SquarePayments = {
  card: (options?: SquareCardOptions) => Promise<SquareCard>;
};

type SquareGlobal = {
  payments: (applicationId: string, locationId: string) => Promise<SquarePayments>;
};

declare global {
  interface Window {
    Square?: SquareGlobal;
  }
}

export type SquareCardPaymentHandle = {
  tokenize: () => Promise<string>;
};

function getSquareScriptUrl() {
  const env = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    const fail = () => reject(new Error("Failed to load Square payments script."));

    if (existing) {
      if (existing.dataset.loaded === "true" || window.Square?.payments) {
        resolve();
        return;
      }

      existing.addEventListener(
        "load",
        () => {
          existing.dataset.loaded = "true";
          resolve();
        },
        { once: true },
      );
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  });
}

const SquareCardPayment = forwardRef<SquareCardPaymentHandle>(function SquareCardPayment(
  _props,
  ref,
) {
  const cardRef = useRef<SquareCard | null>(null);
  const initializedRef = useRef(false);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  const mountedRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setErrorState(message: string | null) {
    errorRef.current = message;
    setError(message);
  }

  async function initSquareCard(): Promise<void> {
    if (initializedRef.current) return;
    if (initPromiseRef.current) return initPromiseRef.current;

    setErrorState(null);
    setReady(false);

    const promise = (async () => {
      const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!applicationId || !locationId) {
        throw new Error(
          "Missing Square public config (NEXT_PUBLIC_SQUARE_APPLICATION_ID / NEXT_PUBLIC_SQUARE_LOCATION_ID).",
        );
      }

      await loadScript(getSquareScriptUrl());

      if (!window.Square?.payments) {
        throw new Error("Square payments library did not initialize.");
      }

      const container = document.querySelector("#square-card-container");
      container?.replaceChildren();

      const payments = await window.Square.payments(applicationId, locationId);

      const card = await payments.card({
        style: {
          input: {
            fontFamily: "sans-serif",
            fontSize: "16px",
            fontWeight: "400",
          },
        },
      });

      await card.attach("#square-card-container");

      // Critical: prevent the “iframe shows but app never becomes ready” race
      // when effects are torn down/re-run (dev/fast-refresh).
      if (!mountedRef.current) return;

      cardRef.current = card;
      initializedRef.current = true;
      setReady(true);
    })();

    initPromiseRef.current = promise;

    promise.catch((e) => {
      if (!mountedRef.current) return;
      setReady(false);
      setErrorState(e instanceof Error ? e.message : "Failed to initialize Square.");
    });

    return promise;
  }

  useImperativeHandle(ref, () => ({
    async tokenize() {
      // Start/await init even if the user clicks fast.
      try {
        await initSquareCard();
      } catch {
        // ignore; surfaced below
      }

      if (!cardRef.current) {
        throw new Error(errorRef.current ?? "Payment form is not ready yet.");
      }

      const result = await cardRef.current.tokenize();

      if (!result || result.status !== "OK" || !result.token) {
        const msg = result?.errors?.[0]?.message ?? "Card tokenization failed.";
        throw new Error(msg);
      }

      return result.token;
    },
  }));

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onPointerDownCapture = (event: PointerEvent) => {
      const container = document.getElementById("square-card-container");
      if (!container) return;

      const target = event.target;
      if (!(target instanceof Node)) return;

      if (container.contains(target)) return;

      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
    };
  }, []);

  useEffect(() => {
    void initSquareCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Payment</div>

      {error ? (
        <div className="rounded-2xl border border-red-700/20 bg-red-100 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!error && !ready ? (
        <div className="text-sm text-walnut/70">Loading payment form…</div>
      ) : null}

      <div
        id="square-card-container"
        className="h-20 overflow-hidden rounded-xl border border-walnut/15 bg-sandstone/70 px-4 py-3"
      />
    </div>
  );
});

export default SquareCardPayment;