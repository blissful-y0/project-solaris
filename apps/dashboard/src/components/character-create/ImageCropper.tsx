"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ImageCropperProps {
  /** 현재 미리보기 URL (blob 또는 업로드된 URL) */
  previewUrl: string | null;
  /** 이미지 변경 시 콜백 (크롭된 Blob + 미리보기 URL) */
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

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
  });
}

export function ImageCropper({ previewUrl, onImageChange, className }: ImageCropperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  /* 원본 이미지 소스 (크롭 전) */
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState<string | null>(null);

  /** 파일 선택 */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기가 ${MAX_SIZE_MB}MB를 초과합니다.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setRawSrc(url);
    setCrop(undefined);
  }, []);

  /** 크롭 확정 */
  const handleCropConfirm = useCallback(async () => {
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

    onImageChange(croppedFile, croppedUrl);
    setRawSrc(null);
  }, [crop, onImageChange]);

  /** 크롭 취소 */
  const handleCropCancel = useCallback(() => {
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(null);
    setCrop(undefined);
  }, [rawSrc]);

  /** 이미지 제거 */
  const handleRemove = useCallback(() => {
    onImageChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImageChange]);

  /* 크롭 모드 */
  if (rawSrc) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-xs uppercase tracking-widest text-text-secondary">이미지 영역을 선택하세요</p>
        <div className="rounded-lg border border-border bg-bg-secondary p-2 flex justify-center">
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
              className="max-h-[360px] object-contain"
            />
          </ReactCrop>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCropConfirm} disabled={!crop}>
            확정
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCropCancel}>
            취소
          </Button>
        </div>
      </div>
    );
  }

  /* 미리보기 / 업로드 모드 */
  return (
    <div className={cn("space-y-2", className)}>
      {previewUrl ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="프로필 미리보기"
            className="w-32 h-32 rounded-md border border-border object-cover"
          />
          <div className="flex gap-2">
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
            "w-32 h-32 rounded-md border-2 border-dashed border-border",
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

      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
