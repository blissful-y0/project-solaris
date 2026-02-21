"use client";

import { useState } from "react";

import { Button, Input, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { OperationType } from "./types";

type CreateOperationModalProps = {
  open: boolean;
  onClose: () => void;
  /** 생성 성공 후 호출 — 목록 새로고침 등 */
  onCreated?: () => void;
};

/** 작전 생성 모달 — OPERATION/DOWNTIME 타입 선택 + 기본 필드 */
export function CreateOperationModal({
  open,
  onClose,
  onCreated,
}: CreateOperationModalProps) {
  const [selectedType, setSelectedType] = useState<OperationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedType || !title.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: title.trim(),
          summary: summary.trim(),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "작전 생성에 실패했습니다.");
        return;
      }

      // 성공 — 폼 초기화 후 콜백
      setSelectedType(null);
      setTitle("");
      setSummary("");
      onClose();
      onCreated?.();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setSelectedType(null);
    setTitle("");
    setSummary("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="NEW OPERATION // 작전 생성"
    >
      <div className="space-y-5">
        {/* 타입 선택 */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-text-secondary">
            타입 선택
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { type: "operation", label: "작전 개시" },
                { type: "downtime", label: "다운타임 개설" },
              ] as const
            ).map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "rounded-md border px-3 py-2.5 text-sm font-medium transition-colors",
                  selectedType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-bg-secondary text-text-secondary hover:border-primary/30 hover:text-text",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 공통 필드 */}
        <Input
          label="제목"
          placeholder="작전 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <label
            htmlFor="op-summary"
            className="mb-1.5 block text-xs uppercase tracking-widest text-text-secondary"
          >
            상황 설명
          </label>
          <textarea
            id="op-summary"
            rows={3}
            placeholder="작전 배경 및 상황을 설명하세요"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-text placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* 타입별 조건부 필드 */}
        {selectedType === "operation" && (
          <div className="space-y-3 rounded-md border border-border/50 bg-bg-secondary/50 p-3">
            <p className="text-xs font-medium text-primary">아군 진영</p>
            <p className="text-xs text-text-secondary">
              본인 자동 포함 · 1명 추가 가능 (캐릭터 검색 — 추후 연동)
            </p>
            <p className="text-xs font-medium text-accent">적군 진영</p>
            <p className="text-xs text-text-secondary">
              1~2명 선택 (캐릭터 검색 — 추후 연동)
            </p>
          </div>
        )}

        {selectedType === "downtime" && (
          <div className="space-y-3 rounded-md border border-border/50 bg-bg-secondary/50 p-3">
            <p className="text-xs font-medium text-text">참가자 초대</p>
            <p className="text-xs text-text-secondary">
              선택 사항 · 링크 공유로도 참가 가능 (추후 연동)
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p className="text-xs text-accent">{error}</p>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedType || !title.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "생성 중..." : "작전 생성"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
