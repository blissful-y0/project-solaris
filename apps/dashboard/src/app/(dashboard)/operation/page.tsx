"use client";

import { useEffect, useRef } from "react";

import { AccessDenied } from "@/components/common";
import { OperationHub } from "@/components/operation";
import type { OperationItem } from "@/components/operation";
import { useOffsetInfinite } from "@/lib/swr/use-offset-infinite";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSession } from "@/components/layout/DashboardSessionProvider";

const OPERATION_PAGE_LIMIT = 10;
const MIN_REFETCH_INTERVAL_MS = 1500;

export default function OperationPage() {
  const { me, loading: statusLoading } = useDashboardSession();
  const characterStatus = me?.character?.status ?? null;
  const lastLoadAtRef = useRef(0);

  const isApproved = characterStatus === "approved";
  const {
    items: operations,
    loading: operationsLoading,
    loadingMore,
    hasMore,
    loadMore,
    mutate,
  } = useOffsetInfinite<OperationItem>({
    baseUrl: "/api/operations",
    limit: OPERATION_PAGE_LIMIT,
    getItemId: (item) => item.id,
    enabled: isApproved,
  });

  useEffect(() => {
    if (!operationsLoading) {
      lastLoadAtRef.current = Date.now();
    }
  }, [operationsLoading]);

  useEffect(() => {
    if (!isApproved) return;

    // 복귀 시점은 visibilitychange 하나로 통합한다.
    const reload = () => {
      if (Date.now() - lastLoadAtRef.current < MIN_REFETCH_INTERVAL_MS) return;
      void mutate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isApproved, mutate]);

  /* 목록 Realtime 동기화: operation/participant 변경 시 재조회 */
  useEffect(() => {
    if (!isApproved) return;

    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleReload = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        void mutate();
      }, 150);
    };

    const channel = supabase
      .channel("operations:list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operations" },
        scheduleReload,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operation_participants" },
        scheduleReload,
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void channel.unsubscribe();
    };
  }, [isApproved, mutate]);

  if (statusLoading) {
    return <div className="pb-6" />;
  }

  if (!isApproved) {
    return (
      <div className="flex min-h-[calc(100dvh-10rem)]">
        <AccessDenied characterStatus={characterStatus} />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {operationsLoading && operations.length === 0 ? (
        <div className="py-8" />
      ) : (
        <OperationHub
          operations={operations}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={() => {
            void loadMore();
          }}
          onOperationCreated={() => {
            void mutate();
          }}
        />
      )}
    </div>
  );
}
