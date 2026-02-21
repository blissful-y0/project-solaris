"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ApiActivityContextValue = {
  pendingCount: number;
  begin: () => () => void;
  track: <T>(work: () => Promise<T>) => Promise<T>;
};

const defaultApiActivityContextValue: ApiActivityContextValue = {
  pendingCount: 0,
  begin: () => () => undefined,
  track: async <T,>(work: () => Promise<T>) => work(),
};

const ApiActivityContext = createContext<ApiActivityContextValue>(defaultApiActivityContextValue);

export function ApiActivityProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const begin = useCallback(() => {
    setPendingCount((prev) => prev + 1);
    let closed = false;

    return () => {
      if (closed) return;
      closed = true;
      setPendingCount((prev) => Math.max(0, prev - 1));
    };
  }, []);

  const track = useCallback(
    async <T,>(work: () => Promise<T>) => {
      const done = begin();
      try {
        return await work();
      } finally {
        done();
      }
    },
    [begin],
  );

  const value = useMemo(
    () => ({ pendingCount, begin, track }),
    [pendingCount, begin, track],
  );

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
