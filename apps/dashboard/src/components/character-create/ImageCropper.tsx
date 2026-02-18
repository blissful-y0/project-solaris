"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ImageCropperProps {
  previewUrl: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  className?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

/** 크롭 영역을 캔버스에 그려서 Blob으로 추출 */
function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
  });
}

/** 크롭 모달 — Portal로 body에 렌더링 */
function CropModal({
  rawSrc,
  onConfirm,
  onCancel,
}: {
  rawSrc: string;
  onConfirm: (file: File, previewUrl: string) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();

  const handleConfirm = useCallback(async () => {
    if (!imgRef.current || !crop) return;

    const pixelCrop: PixelCrop = {
      x: Math.round((crop.x ?? 0) / 100 * imgRef.current.naturalWidth),
      y: Math.round((crop.y ?? 0) / 100 * imgRef.current.naturalHeight),
      width: Math.round((crop.width ?? 100) / 100 * imgRef.current.naturalWidth),
      height: Math.round((crop.height ?? 100) / 100 * imgRef.current.naturalHeight),
      unit: "px",
    };

    const blob = await getCroppedBlob(imgRef.current, pixelCrop);
    if (!blob) return;

    const croppedFile = new File([blob], "avatar.webp", { type: "image/webp" });
    const croppedUrl = URL.createObjectURL(blob);
    onConfirm(croppedFile, croppedUrl);
  }, [crop, onConfirm]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-bg-secondary p-5 space-y-4">
        <p className="hud-label">// 이미지 영역을 선택하세요</p>

        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={1}
            circularCrop={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={rawSrc}
              alt="크롭 원본"
              className="max-h-[60vh] max-w-full object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!crop}>
            확정
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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

    setRawSrc(URL.createObjectURL(file));
  }, []);

  /** 크롭 확정 콜백 */
  const handleCropConfirm = useCallback((file: File, url: string) => {
    onImageChange(file, url);
    setRawSrc(null);
  }, [onImageChange]);

  /** 크롭 취소 */
  const handleCropCancel = useCallback(() => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
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
        <CropModal
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
