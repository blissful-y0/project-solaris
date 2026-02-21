"use client";

import { useCallback, useEffect, useState } from "react";

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

  /* 작전 목록 — 승인된 경우만 */
  const loadOperations = useCallback(() => {
    let mounted = true;
    setOperationsLoading(true);
    fetch("/api/operations", { cache: "no-store" })
      .then((r) => r.json())
      .then((body) => {
        if (!mounted) return;
        setOperations(body?.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setOperations([]);
      })
      .finally(() => {
        if (!mounted) return;
        setOperationsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isApproved) return;
    return loadOperations();
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
