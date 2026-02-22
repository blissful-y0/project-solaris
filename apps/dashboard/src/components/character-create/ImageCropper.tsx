"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
const ImageCropModal = dynamic(
  () => import("./ImageCropModal").then((mod) => mod.ImageCropModal),
  { ssr: false },
);

interface ImageCropperProps {
  previewUrl: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export function ImageCropper({ previewUrl, onImageChange, className }: ImageCropperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** 파일 선택 */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP만 가능");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`${MAX_SIZE_MB}MB 초과`);
      return;
    }

    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(URL.createObjectURL(file));
  }, [rawSrc]);

  /** 크롭 확정 콜백 */
  const handleCropConfirm = useCallback((file: File, url: string) => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    onImageChange(file, url);
    setRawSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImageChange, rawSrc]);

  /** 크롭 취소 */
  const handleCropCancel = useCallback(() => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [rawSrc]);

  /** 이미지 제거 */
  const handleRemove = useCallback(() => {
    onImageChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImageChange]);

  return (
    <div className={cn("shrink-0 flex flex-col", className)}>
      {/* 크롭 모달 */}
      {rawSrc && (
        <ImageCropModal
          rawSrc={rawSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* 미리보기 또는 업로드 버튼 — 부모 높이에 맞춤 */}
      {previewUrl ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="프로필 미리보기"
            className="w-full flex-1 min-h-0 rounded-md border border-border object-cover"
          />
          <div className="flex gap-2 mt-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[0.625rem] text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
            >
              변경
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-[0.625rem] text-accent/60 hover:text-accent transition-colors uppercase tracking-wider"
            >
              제거
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full flex-1 min-h-[120px] rounded-md border-2 border-dashed border-border",
            "flex flex-col items-center justify-center gap-1",
            "hover:border-primary/40 transition-colors cursor-pointer",
          )}
        >
          <span className="text-2xl text-text-secondary/40">+</span>
          <span className="text-[0.55rem] text-text-secondary leading-tight text-center px-1">
            프로필 이미지
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="프로필 이미지 업로드"
      />

      {error && <p className="text-xs text-accent mt-1">{error}</p>}
    </div>
  );
}
