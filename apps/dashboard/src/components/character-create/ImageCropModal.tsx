"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/Button";

/** 크롭 영역을 캔버스에 그려서 Blob으로 추출 */
function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const outW = 512;
  const outH = 640;
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
  });
}

type ImageCropModalProps = {
  rawSrc: string;
  onConfirm: (file: File, previewUrl: string) => void;
  onCancel: () => void;
};

export function ImageCropModal({
  rawSrc,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-bg-secondary p-5 space-y-4">
        <p className="hud-label">// 이미지 영역을 선택하세요</p>

        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={4 / 5}
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
