"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AccessDenied } from "@/components/common";
import { OperationHub } from "@/components/operation";
import type { OperationItem } from "@/components/operation";
import { useApiActivity } from "@/components/layout";
import { createClient } from "@/lib/supabase/client";

type CharacterStatus = "approved" | "pending" | "rejected" | null;

export default function OperationPage() {
  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>(null);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const operationsRef = useRef<OperationItem[]>([]);
  const operationLoadRequestSeqRef = useRef(0);
  const { track } = useApiActivity();

  const isApproved = characterStatus === "approved";

  /* 캐릭터 승인 여부 — /api/me */
  useEffect(() => {
    let mounted = true;
    setStatusLoading(true);
    track(() => fetch("/api/me", { cache: "no-store" }))
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
  }, [track]);

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
    async (options?: { silent?: boolean; retries?: number }) => {
      if (!isMountedRef.current) return;
      const silent = options?.silent ?? false;
      const retries = options?.retries ?? 0;
      const requestId = ++operationLoadRequestSeqRef.current;

      if (!silent) {
        setOperationsLoading(true);
      }
      const run = async () => {
        const response = await fetch("/api/operations", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`FAILED_TO_FETCH_OPERATIONS:${response.status}`);
        }
        const body = await response.json();
        if (!isMountedRef.current || requestId !== operationLoadRequestSeqRef.current) return;
        setOperations(body?.data ?? []);
      };

      try {
        if (silent) {
          await run();
        } else {
          await track(run);
        }
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
        if (!silent) {
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

    // 복귀 이벤트(BFCache/pageshow, focus, visibilitychange)에서 목록을 재검증한다.
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

    window.addEventListener("focus", reload);
    window.addEventListener("pageshow", reload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("pageshow", reload);
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
        loadOperations();
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
    return (
      <div className="py-12 text-center text-sm text-text-secondary">
        확인 중...
      </div>
    );
  }

  return (
    <div className="pb-6">
      {isApproved ? (
        operationsLoading ? (
          <div className="text-sm text-text-secondary py-8">
            작전 목록을 불러오는 중...
          </div>
        ) : (
          <>
            <OperationHub
              operations={operations}
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
