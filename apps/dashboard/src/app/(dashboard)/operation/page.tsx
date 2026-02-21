"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AccessDenied } from "@/components/common";
import { OperationHub } from "@/components/operation";
import type { OperationItem } from "@/components/operation";
import { createClient } from "@/lib/supabase/client";

type CharacterStatus = "approved" | "pending" | "rejected" | null;

export default function OperationPage() {
  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>(null);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const isMountedRef = useRef(true);
  const operationsRef = useRef<OperationItem[]>([]);
  const operationLoadRequestSeqRef = useRef(0);

  const isApproved = characterStatus === "approved";

  /* 캐릭터 승인 여부 — /api/me */
  useEffect(() => {
    let mounted = true;
    setStatusLoading(true);
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        const status: CharacterStatus = body?.character?.status ?? null;
        setCharacterStatus(status);
      })
      .catch(() => {
        if (!mounted) return;
        setCharacterStatus(null);
      })
      .finally(() => {
        if (!mounted) return;
        setStatusLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    operationsRef.current = operations;
  }, [operations]);

  /* 작전 목록 — 승인된 경우만 */
  const loadOperations = useCallback(
    async (options?: { silent?: boolean; retries?: number; append?: boolean; offset?: number }) => {
      if (!isMountedRef.current) return;
      const silent = options?.silent ?? false;
      const retries = options?.retries ?? 0;
      const append = options?.append ?? false;
      const offset = options?.offset ?? 0;
      const requestId = ++operationLoadRequestSeqRef.current;

      if (append) {
        setLoadingMore(true);
      } else if (!silent) {
        setOperationsLoading(true);
      }
      const run = async () => {
        const response = await fetch(`/api/operations?limit=20&offset=${offset}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`FAILED_TO_FETCH_OPERATIONS:${response.status}`);
        }
        const body = await response.json();
        if (!isMountedRef.current || requestId !== operationLoadRequestSeqRef.current) return;
        const incoming = (body?.data ?? []) as OperationItem[];
        setHasMore(Boolean(body?.page?.hasMore));
        setNextOffset(typeof body?.page?.nextOffset === "number" ? body.page.nextOffset : null);
        setOperations((prev) => {
          if (!append) return incoming;

          const byId = new Map(prev.map((item) => [item.id, item]));
          for (const item of incoming) byId.set(item.id, item);
          return Array.from(byId.values());
        });
      };

      try {
        await run();
      } catch {
        if (!isMountedRef.current || requestId !== operationLoadRequestSeqRef.current) return;

        if (retries > 0) {
          setTimeout(() => {
            void loadOperations({ silent: true, retries: retries - 1 });
          }, 700);
          return;
        }

        // empty 응답과 일시 실패를 구분하기 위해, 기존 목록이 있으면 보존한다.
        if (operationsRef.current.length === 0) {
          setOperations([]);
        }
      } finally {
        if (!isMountedRef.current || requestId !== operationLoadRequestSeqRef.current) return;
        if (append) {
          setLoadingMore(false);
        } else if (!silent) {
          setOperationsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!isApproved) return;
    void loadOperations({ retries: 2 });
  }, [isApproved, loadOperations]);

  useEffect(() => {
    if (!isApproved) return;

    // 복귀 시점은 visibilitychange 하나로 통합한다.
    const reload = () => {
      void loadOperations({
        silent: operationsRef.current.length > 0,
        retries: 1,
      });
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
  }, [isApproved, loadOperations]);

  /* 목록 Realtime 동기화: operation/participant 변경 시 재조회 */
  useEffect(() => {
    if (!isApproved) return;

    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleReload = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        void loadOperations({ silent: true, retries: 0 });
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
  }, [isApproved, loadOperations]);

  if (statusLoading) {
    return <div className="pb-6" />;
  }

  return (
    <div className="pb-6">
      {isApproved ? (
        operationsLoading && operations.length === 0 ? (
          <div className="py-8" />
        ) : (
          <>
            <OperationHub
              operations={operations}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={() => {
                if (!hasMore || nextOffset == null) return;
                void loadOperations({ append: true, offset: nextOffset, retries: 1 });
              }}
              onOperationCreated={() => {
                void loadOperations({ retries: 1 });
              }}
            />
          </>
        )
      ) : (
        <AccessDenied characterStatus={characterStatus} />
      )}
    </div>
  );
}
