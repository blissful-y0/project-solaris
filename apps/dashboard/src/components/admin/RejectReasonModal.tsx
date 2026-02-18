"use client";

import { useState } from "react";

import { Button, Modal } from "@/components/ui";

type RejectReasonModalProps = {
  open: boolean;
  characterName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const MIN_REASON_LENGTH = 20;

export function RejectReasonModal({
  open,
  characterName,
  loading,
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");

  const isValid = reason.trim().length >= MIN_REASON_LENGTH;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (loading) return;
    setReason("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="반려 사유 입력">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text">{characterName}</span>에 대한
          반려 사유를 입력하세요. 플레이어에게 전달됩니다.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="반려 사유를 입력하세요 (최소 20자)"
          rows={4}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-secondary/50 focus:border-primary focus:outline-none resize-none"
        />

        <p className="text-xs text-text-secondary">
          {reason.trim().length}/{MIN_REASON_LENGTH}자 (최소 {MIN_REASON_LENGTH}자)
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            disabled={!isValid}
            onClick={handleConfirm}
          >
            반려
          </Button>
        </div>
      </div>
    </Modal>
  );
}
