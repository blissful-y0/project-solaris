"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

export function AppSWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 1,
        dedupingInterval: 1500,
        focusThrottleInterval: 3000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
