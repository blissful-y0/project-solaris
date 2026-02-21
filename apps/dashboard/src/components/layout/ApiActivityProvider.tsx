"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ApiActivityContextValue = {
  pendingCount: number;
};

const defaultApiActivityContextValue: ApiActivityContextValue = {
  pendingCount: 0,
};

const ApiActivityContext = createContext<ApiActivityContextValue>(defaultApiActivityContextValue);

export function ApiActivityProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const wrappedFetch: typeof window.fetch = async (input, init) => {
      const nextHeaders = new Headers(
        init?.headers ??
          (input instanceof Request ? input.headers : undefined),
      );
      const skipGlobalLoading = nextHeaders.get("x-no-global-loading") === "true";
      const url =
        typeof input === "string"
          ? new URL(input, window.location.origin)
          : input instanceof URL
            ? input
            : new URL(input.url);
      const isSameOriginApi =
        url.origin === window.location.origin && url.pathname.startsWith("/api/");

      if (!isSameOriginApi || skipGlobalLoading) {
        return originalFetch(input, init);
      }

      setPendingCount((prev) => prev + 1);
      try {
        return await originalFetch(input, init);
      } finally {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    };

    window.fetch = wrappedFetch;
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  /* 120ms 디바운스 — 빠른 응답에 스피너가 깜빡이지 않도록 */
  useEffect(() => {
    if (pendingCount === 0) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [pendingCount]);

  const value = useMemo(() => ({ pendingCount }), [pendingCount]);

  return (
    <ApiActivityContext.Provider value={value}>
      {children}
      {visible && (
        <div
          aria-live="polite"
          aria-label="API 요청 처리 중"
          data-testid="global-api-spinner"
          className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center"
        >
          {/* 배경 딤 */}
          <div className="absolute inset-0 bg-bg/60" />

          {/* 스피너 + 텍스트 */}
          <div className="relative flex flex-col items-center gap-4">
            {/* 회전 링 */}
            <svg
              className="h-12 w-12 animate-spin"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="var(--color-border)"
                strokeWidth="2"
              />
              <path
                d="M24 4a20 20 0 0 1 20 20"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 6px rgba(0, 212, 255, 0.7))",
                }}
              />
            </svg>

            <span
              className="font-mono text-xs uppercase tracking-[0.25em] text-primary"
              style={{ textShadow: "0 0 12px rgba(0, 212, 255, 0.5)" }}
            >
              SYNCING
            </span>
          </div>
        </div>
      )}
    </ApiActivityContext.Provider>
  );
}

export function useApiActivity() {
  return useContext(ApiActivityContext);
}
