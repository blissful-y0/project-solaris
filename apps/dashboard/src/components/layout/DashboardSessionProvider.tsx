"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { swrFetcher } from "@/lib/swr/fetcher";

export type DashboardMeUser = {
  id: string;
  email: string | null;
  displayName: string;
  discordUsername: string | null;
  isAdmin: boolean;
};

export type DashboardMeCharacter = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  profile_image_url: string | null;
  faction: string;
  ability_class: string | null;
  hp_max: number;
  hp_current: number;
  will_max: number;
  will_current: number;
  resonance_rate: number | null;
  created_at: string;
};

export type DashboardMe = {
  user: DashboardMeUser;
  character: DashboardMeCharacter | null;
};

type DashboardSessionContextValue = {
  me: DashboardMe | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const DashboardSessionContext = createContext<DashboardSessionContextValue | null>(null);

export function DashboardSessionProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWRImmutable<DashboardMe>(
    "/api/me",
    swrFetcher,
  );

  const refetch = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const value = useMemo(
    () => ({
      me: data ?? null,
      loading: isLoading && !data,
      error: error instanceof Error ? error.message : null,
      refetch,
    }),
    [data, error, isLoading, refetch],
  );

  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error("useDashboardSession must be used within DashboardSessionProvider");
  }
  return context;
}
