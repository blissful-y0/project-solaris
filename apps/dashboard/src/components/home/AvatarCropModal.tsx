"use client";

import type { RefObject } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui";

type AvatarCropModalProps = {
  cropSource: string;
  crop: Crop;
  cropImageRef: RefObject<HTMLImageElement | null>;
  onChange: (nextCrop: Crop) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AvatarCropModal({
  cropSource,
  crop,
  cropImageRef,
  onChange,
  onCancel,
  onConfirm,
}: AvatarCropModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-bg-secondary p-4 space-y-3">
        <p className="hud-label">이미지 영역을 선택하세요</p>
        <div className="flex justify-center">
          <ReactCrop crop={crop} onChange={(_, pc) => onChange(pc)} aspect={4 / 5}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={cropImageRef}
              src={cropSource}
              alt="크롭 원본"
              className="max-h-[60vh] max-w-full object-contain"
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>취소</Button>
          <Button size="sm" onClick={onConfirm}>확정</Button>
        </div>
      </div>
    </div>
  );
}
