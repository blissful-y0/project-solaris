/* ─── 이미지 크롭 상수 및 유틸리티 ─── */

import type { Crop, PixelCrop } from "react-image-crop";

export const MIN_IMAGE_WIDTH = 320;
export const MIN_IMAGE_HEIGHT = 400;
export const CROPPED_WIDTH = 640;
export const CROPPED_HEIGHT = 800;

export async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return dimensions;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("failed_to_load_image"));
      image.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function makeCroppedPixelCrop(
  image: HTMLImageElement,
  crop: Crop,
  sourceDimensions?: { width: number; height: number } | null,
): PixelCrop {
  const sourceWidth = image.naturalWidth || sourceDimensions?.width || 0;
  const sourceHeight = image.naturalHeight || sourceDimensions?.height || 0;
  const width = Math.round(((crop.width ?? 100) / 100) * sourceWidth);
  const height = Math.round(((crop.height ?? 100) / 100) * sourceHeight);
  const x = Math.round(((crop.x ?? 0) / 100) * sourceWidth);
  const y = Math.round(((crop.y ?? 0) / 100) * sourceHeight);
  return { x, y, width, height, unit: "px" };
}

export async function getCroppedFile(
  image: HTMLImageElement,
  crop: Crop,
  sourceDimensions?: { width: number; height: number } | null,
): Promise<File | null> {
  const pixelCrop = makeCroppedPixelCrop(image, crop, sourceDimensions);
  if (pixelCrop.width <= 0 || pixelCrop.height <= 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = CROPPED_WIDTH;
  canvas.height = CROPPED_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    CROPPED_WIDTH,
    CROPPED_HEIGHT,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/webp", 0.95);
  });

  if (!blob) return null;
  return new File([blob], "avatar.webp", { type: "image/webp" });
}
