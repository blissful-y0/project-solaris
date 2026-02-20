"use client";

import { useState } from "react";

import { Button, Input, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { OperationType } from "./types";

type CreateOperationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateOperationData) => void;
};

/** 모달에서 수집하는 생성 데이터 */
export interface CreateOperationData {
  type: OperationType;
  title: string;
  summary: string;
}

/** 작전 생성 모달 — OPERATION/DOWNTIME 타입 선택 + 기본 필드 */
export function CreateOperationModal({
  open,
  onClose,
  onSubmit,
}: CreateOperationModalProps) {
  const [selectedType, setSelectedType] = useState<OperationType | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = () => {
    if (!selectedType || !title.trim()) return;
    onSubmit?.({
      type: selectedType,
      title: title.trim(),
      summary: summary.trim(),
    });
  };

  const handleClose = () => {
    /* 폼 초기화 */
    setSelectedType(null);
    setTitle("");
    setSummary("");
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

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedType || !title.trim()}
            onClick={handleSubmit}
          >
            작전 생성
          </Button>
        </div>
      </div>
    </Modal>
  );
}
