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
  const isMountedRef = useRef(true);

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
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* 작전 목록 — 승인된 경우만 */
  const loadOperations = useCallback(async () => {
    if (!isMountedRef.current) return;
    setOperationsLoading(true);
    try {
      const response = await fetch("/api/operations", { cache: "no-store" });
      const body = await response.json();
      if (!isMountedRef.current) return;
      setOperations(body?.data ?? []);
    } catch {
      if (!isMountedRef.current) return;
      setOperations([]);
    } finally {
      if (!isMountedRef.current) return;
      setOperationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isApproved) return;
    void loadOperations();
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
          <div className="text-sm text-text-secondary py-8">작전 목록을 불러오는 중...</div>
        ) : (
          <OperationHub operations={operations} onOperationCreated={loadOperations} />
        )
      ) : (
        <AccessDenied characterStatus={characterStatus} />
      )}
    </div>
  );
}
