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

  const value = useMemo(() => ({ pendingCount }), [pendingCount]);

  return (
    <ApiActivityContext.Provider value={value}>
      {children}
      {pendingCount > 0 && (
        <div
          aria-live="polite"
          aria-label="API 요청 처리 중"
          data-testid="global-api-spinner"
          className="fixed inset-0 z-[120] pointer-events-none flex items-start justify-center pt-20"
        >
          <div className="rounded-full border border-border bg-bg-secondary/95 px-3 py-1.5 text-xs text-text-secondary shadow-md">
            동기화 중...
          </div>
        </div>
      )}
    </ApiActivityContext.Provider>
  );
}

export function useApiActivity() {
  return useContext(ApiActivityContext);
}
