"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type DashboardMeUser = {
  id: string;
  email: string | null;
  displayName: string;
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

async function fetchMe(): Promise<DashboardMe> {
  const response = await fetch("/api/me");

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "FAILED_TO_FETCH_ME");
  }

  return (await response.json()) as DashboardMe;
}

export function DashboardSessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<DashboardMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const next = await fetchMe();
      setMe(next);
    } catch (err) {
      setMe(null);
      setError(err instanceof Error ? err.message : "FAILED_TO_FETCH_ME");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({ me, loading, error, refetch }),
    [me, loading, error, refetch],
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
