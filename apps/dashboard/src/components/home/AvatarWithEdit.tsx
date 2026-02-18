"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { createClient } from "@/lib/supabase/client";
import { readImageDimensions, getCroppedFile, MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT } from "./image-crop-utils";

/* ─── 아바타 + 편집 버튼 ─── */
export function AvatarWithEdit({
  characterId,
  avatarUrl,
  name,
  onAvatarChange,
}: {
  characterId?: string;
  avatarUrl: string | null;
  name: string;
  onAvatarChange?: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropSourceDimensions, setCropSourceDimensions] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 5,
    width: 80,
    height: 90,
  });

  useEffect(() => {
    return () => {
      if (cropSource) URL.revokeObjectURL(cropSource);
    };
  }, [cropSource]);

  const runUpload = useCallback(async (file: File) => {
    if (!characterId) return;

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
      const issueResponse = await fetch(`/api/characters/${characterId}/avatar`, {
        method: "POST",
        body: JSON.stringify({ ext, contentType: file.type, size: file.size }),
        headers: { "Content-Type": "application/json" },
      });

      const issueBody = (await issueResponse.json().catch(() => null)) as
        | { path?: string; token?: string; detail?: string; error?: string }
        | null;

      if (!issueResponse.ok || !issueBody?.path || !issueBody?.token) {
        const message = issueBody?.detail ?? issueBody?.error ?? "업로드 URL 발급 실패";
        toast.error(`업로드 실패: ${message}`);
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("character-profile-images")
        .uploadToSignedUrl(issueBody.path, issueBody.token, file);
      if (uploadError) {
        toast.error(`업로드 실패: ${uploadError.message}`);
        return;
      }

      const finalizeResponse = await fetch(`/api/characters/${characterId}/avatar`, {
        method: "PATCH",
        body: JSON.stringify({ path: issueBody.path }),
        headers: { "Content-Type": "application/json" },
      });
      const finalizeBody = (await finalizeResponse.json().catch(() => null)) as
        | { url?: string; detail?: string; error?: string }
        | null;
      if (!finalizeResponse.ok || !finalizeBody?.url) {
        const message = finalizeBody?.detail ?? finalizeBody?.error ?? "프로필 반영 실패";
        toast.error(`업로드 실패: ${message}`);
        return;
      }

      onAvatarChange?.(finalizeBody.url);
      toast.success("프로필 이미지가 변경되었습니다.");
    } catch {
      toast.error("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [characterId, onAvatarChange]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !characterId) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED.includes(file.type)) {
      toast.error("JPG, PNG, WEBP 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("파일 크기가 5MB를 초과합니다.");
      return;
    }

    try {
      const { width, height } = await readImageDimensions(file);
      if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
        toast.error(`이미지 해상도는 최소 ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} 이상이어야 합니다.`);
        return;
      }

      if (cropSource) URL.revokeObjectURL(cropSource);
      setCropSourceDimensions({ width, height });
      setCrop({
        unit: "%",
        x: 10,
        y: 5,
        width: 80,
        height: 90,
      });
      setCropSource(URL.createObjectURL(file));
    } catch {
      toast.error("이미지 정보를 읽지 못했습니다.");
    }
  }

  async function handleConfirmCrop() {
    if (!cropImageRef.current) return;
    const croppedFile = await getCroppedFile(cropImageRef.current, crop, cropSourceDimensions);
    if (!croppedFile) {
      toast.error("이미지 크롭에 실패했습니다.");
      return;
    }

    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    setCropSourceDimensions(null);
    await runUpload(croppedFile);
  }

  function handleCancelCrop() {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
    setCropSourceDimensions(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-border flex-shrink-0">
      <div className="w-full h-full rounded overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${name} 아바타`}
            width={128}
            height={160}
            priority
            quality={100}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/40 font-bold text-3xl">
            {name.charAt(0)}
          </div>
        )}
      </div>

      {characterId && (
        <>
          <button
            type="button"
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full bg-bg-secondary border border-border p-1.5 hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로필 이미지 변경"
          >
            <Camera className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
        </>
      )}

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/60">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {cropSource && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="w-full max-w-lg rounded-lg border border-border bg-bg-secondary p-4 space-y-3">
            <p className="hud-label">이미지 영역을 선택하세요</p>
            <div className="flex justify-center">
              <ReactCrop crop={crop} onChange={(_, pc) => setCrop(pc)} aspect={4 / 5}>
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
              <button
                type="button"
                onClick={handleCancelCrop}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="rounded-md border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
              >
                확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
