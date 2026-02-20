"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, FilterChips } from "@/components/ui";
import type { FilterChipOption } from "@/components/ui/FilterChips";

import { CreateOperationModal } from "./CreateOperationModal";
import { MainStoryBanner } from "./MainStoryBanner";
import { OperationCard } from "./OperationCard";
import type { OperationItem, StatusFilter, TypeFilter } from "./types";

type OperationHubProps = {
  operations: OperationItem[];
};

const TYPE_OPTIONS: FilterChipOption<TypeFilter>[] = [
  { label: "ALL", value: "all" },
  { label: "OPERATION", value: "operation" },
  { label: "DOWNTIME", value: "downtime" },
];

const STATUS_OPTIONS: FilterChipOption<StatusFilter>[] = [
  { label: "전체", value: "all" },
  { label: "대기", value: "waiting" },
  { label: "LIVE", value: "live" },
  { label: "완료", value: "completed" },
];

/** 작전 허브 — MAIN STORY 배너 + 타입/상태 필터 + 카드 그리드 */
export function OperationHub({ operations }: OperationHubProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  /** 카드/배너 클릭 → 세션 페이지 이동 */
  const handleNavigate = useCallback(
    (item: OperationItem) => {
      router.push(`/operation/${item.id}`);
    },
    [router],
  );

  /* MAIN STORY 이벤트 추출 (LIVE만) */
  const mainStory = useMemo(
    () => operations.find((op) => op.isMainStory && op.status === "live") ?? null,
    [operations],
  );

  /* 일반 목록 (MAIN STORY 제외) + 필터 적용 */
  const filtered = useMemo(() => {
    return operations
      .filter((op) => !op.isMainStory)
      .filter((op) => {
        if (typeFilter !== "all" && op.type !== typeFilter) return false;
        if (statusFilter !== "all" && op.status !== statusFilter) return false;
        return true;
      });
  }, [operations, typeFilter, statusFilter]);

  return (
    <section className="space-y-6 py-6">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="hud-label mb-1">OPERATION // TACTICAL HUB</p>
          <h1 className="text-xl font-bold text-text">통합 작전 목록</h1>
        </div>
        <p className="text-xs text-text-secondary">{operations.length}개 채널</p>
      </div>

      {/* MAIN STORY 배너 */}
      <MainStoryBanner event={mainStory} onJoin={handleNavigate} />

      {/* 타입 필터 + 생성 CTA */}
      <div className="flex items-center justify-between gap-2">
        <FilterChips
          options={TYPE_OPTIONS}
          selected={typeFilter}
          onChange={setTypeFilter}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          + 새 작전
        </Button>
      </div>

      {/* 상태 필터 */}
      <FilterChips
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={setStatusFilter}
      />

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-text-secondary">
            {typeFilter === "all" && statusFilter === "all"
              ? "등록된 작전이 없습니다."
              : "조건에 맞는 작전이 없습니다."}
          </p>
          {typeFilter === "all" && statusFilter === "all" && (
            <>
              <p className="mt-1 text-xs text-text-secondary/60">
                새 작전을 생성해 보세요.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setModalOpen(true)}
              >
                + 새 작전
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((item) => (
            <OperationCard key={item.id} item={item} onClick={handleNavigate} />
          ))}
        </div>
      )}

      {/* 생성 모달 */}
      <CreateOperationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
