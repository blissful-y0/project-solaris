"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

import type { CitizenData } from "./mock-citizen";

/* ─── 팩션 스타일 매핑 ─── */
const factionStyle = {
  Bureau: { stripe: "bg-primary", label: "BUREAU", color: "text-primary", cardTitle: "SOLARIS CITIZEN ID" },
  Static: { stripe: "bg-accent", label: "STATIC", color: "text-accent", cardTitle: "UNREGISTERED ENTITY" },
} as const;

/* ─── HP 배터리 세그먼트 ─── */
const hpTiers = {
  high: { bg: "#22c55e", glow: "0 0 6px #22c55e60" },
  mid: { bg: "#eab308", glow: "0 0 6px #eab30860" },
  low: { bg: "#dc2626", glow: "0 0 6px #dc262660" },
} as const;

const MIN_IMAGE_WIDTH = 320;
const MIN_IMAGE_HEIGHT = 400;
const CROPPED_WIDTH = 640;
const CROPPED_HEIGHT = 800;

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
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

async function getCroppedFile(
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

function hpTier(current: number, max: number) {
  if (max <= 0) return hpTiers.low;
  const ratio = current / max;
  if (ratio >= 0.6) return hpTiers.high;
  if (ratio >= 0.3) return hpTiers.mid;
  return hpTiers.low;
}

function HpBattery({ current, max }: { current: number; max: number }) {
  const filled = max > 0 ? Math.round((current / max) * 5) : 0;
  const tier = hpTier(current, max);

  return (
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-8">HP</span>
      <div className="flex gap-[3px] md:flex-1" role="meter" aria-label={`HP ${current}/${max}`} aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="w-5 md:flex-1 h-3 rounded-[2px]"
            style={{
              background: i < filled ? tier.bg : "var(--color-bg-tertiary)",
              boxShadow: i < filled ? tier.glow : "none",
              opacity: i < filled ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <span className="text-[0.6rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── WILL 연속 게이지 (글로우 바) ─── */
function WillGauge({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const low = pct < 30;

  return (
    <div className="flex items-center gap-1.5">
      <span className="hud-label w-8">WILL</span>
      <div
        className="w-[112px] md:flex-1 h-3 rounded-full bg-bg-tertiary overflow-hidden relative"
        role="meter"
        aria-label={`WILL ${current}/${max}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* 글로우 배경 */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: low
              ? "linear-gradient(90deg, #dc2626 0%, #f87171 100%)"
              : "linear-gradient(90deg, #0ea5e9 0%, #00d4ff 60%, #67e8f9 100%)",
            boxShadow: low
              ? "0 0 8px #dc262660, inset 0 1px 0 #ffffff20"
              : "0 0 8px #00d4ff60, inset 0 1px 0 #ffffff20",
          }}
        />
        {/* 소모 영역 틱 마크 */}
        {[20, 40, 60, 80].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-bg-secondary/40"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      <span className="text-[0.6rem] text-text-secondary tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
}

/* ─── 라벨/값 쌍 ─── */
function DataField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <span className="hud-label block mb-0.5">{label}</span>
      <span className="text-sm text-text font-medium block truncate">{value}</span>
    </div>
  );
}

/* ─── 아바타 + 편집 버튼 ─── */
function AvatarWithEdit({
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

/* ────────────────────────────────────────────────
   등록된 시민 카드 (RegisteredCard)
   ──────────────────────────────────────────────── */
function RegisteredCard({
  citizen,
  onAvatarChange,
}: {
  citizen: CitizenData;
  onAvatarChange?: (url: string) => void;
}) {
  const style = factionStyle[citizen.faction];
  const rrHighlight =
    citizen.resonanceRate >= 70
      ? "text-primary"
      : citizen.resonanceRate < 40
        ? "text-accent"
        : "text-text";

  return (
    <div className="rounded-lg border border-border bg-bg-secondary/80 overflow-hidden flex">
      {/* 좌측 팩션 stripe */}
      <div className={cn("w-1 flex-shrink-0", style.stripe)} />

      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label">{style.cardTitle}</span>
          <span className={cn("hud-label", style.color)}>{style.label}</span>
        </div>

        {/* 본문: 사진 + 신상정보 */}
        <div className="flex gap-4 p-4">
          <AvatarWithEdit
            characterId={citizen.characterId}
            avatarUrl={citizen.avatarUrl}
            name={citizen.name}
            onAvatarChange={onAvatarChange}
          />

          {/* 신상정보 + 스탯 */}
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold text-text truncate leading-tight block">
              {citizen.name}
            </span>
            <p className="text-[0.6rem] text-text-secondary mt-0.5 truncate">
              {citizen.faction === "Bureau"
                ? "Solaris Bureau of Civic Security"
                : "The Static"}
            </p>

            <div className="grid grid-cols-2 gap-x-3 mt-2">
              <DataField label="CLASS" value={citizen.abilityClass} />
              <div>
                <span className="hud-label block mb-0.5">RESONANCE RATE</span>
                <span className={cn("text-xl font-bold tabular-nums leading-tight block", rrHighlight)}>
                  {citizen.resonanceRate}%
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <HpBattery current={citizen.hp.current} max={citizen.hp.max} />
              <WillGauge current={citizen.will.current} max={citizen.will.max} />
            </div>
          </div>
        </div>

        {/* 하단 바 */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border text-[0.6rem] text-text-secondary">
          <span className="tabular-nums">{citizen.citizenId}</span>
          <span className="tabular-nums">REG {citizen.joinDate}</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   빈 카드 (캐릭터 미등록) — 캐릭터 생성 유도 CTA
   ──────────────────────────────────────────────── */
function EmptyCard() {
  return (
    <Link href="/character/create" className="group block" aria-label="캐릭터 생성하기">
      <div className="rounded-lg border border-border bg-bg-secondary/80 overflow-hidden flex cursor-pointer transition-all hover:border-primary/40">
        {/* 좌측 stripe — 비활성 */}
        <div className="w-1 flex-shrink-0 bg-border" />

        <div className="flex-1">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="hud-label">SOLARIS CITIZEN ID</span>
            <span className="hud-label text-accent/60">UNREGISTERED</span>
          </div>

          {/* 본문 */}
          <div className="flex gap-4 p-4">
            {/* ? 아바타 */}
            <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-border flex-shrink-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30 group-hover:text-primary/60 transition-colors">
                ?
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className="text-sm font-semibold text-text/50">미확인 시민</span>
                <div className="mt-3 space-y-1.5">
                  {["RR", "HP", "WILL"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="hud-label w-8">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary" role="meter" aria-label={`${label} 0/0`} aria-valuenow={0} aria-valuemin={0} aria-valuemax={0} />
                      <span className="text-[0.6rem] text-text-secondary w-6 text-right">---</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-primary">NEW OPERATIVE REQUIRED</p>
                <p className="text-[0.6rem] text-text-secondary mt-0.5">
                  시민 등록을 완료하여 HELIOS 시스템에 접속하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────
   승인 대기 카드
   ──────────────────────────────────────────────── */
function PendingCard({
  citizen,
  onCancel,
}: {
  citizen: CitizenData;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-lg border border-warning/40 bg-bg-secondary/80 overflow-hidden flex">
      <div className="w-1 flex-shrink-0 bg-warning" />

      <div className="flex-1">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label text-warning">APPROVAL PENDING</span>
          <span className="hud-label tracking-[0.2em]">{citizen.citizenId}</span>
        </div>

        <div className="flex gap-4 p-4">
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-border flex-shrink-0 overflow-hidden">
            {citizen.avatarUrl ? (
              <Image
                src={citizen.avatarUrl}
                alt={`${citizen.name} 아바타`}
                width={128}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warning font-bold text-2xl">
                {citizen.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <span className="text-lg font-bold text-text truncate leading-tight block">
                {citizen.name}
              </span>
              <p className="text-[0.6rem] text-text-secondary mt-0.5">
                {citizen.faction === "Bureau"
                  ? "Solaris Bureau of Civic Security"
                  : "The Static"}
              </p>
            </div>

            <p className="text-xs text-text-secondary">
              HELIOS 시스템이 신원을 확인하고 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 py-2 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-text-secondary hover:text-accent transition-colors"
            aria-label="신청 취소"
          >
            신청 취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   반려 카드
   ──────────────────────────────────────────────── */
function RejectedCard({ citizen }: { citizen: CitizenData }) {
  return (
    <div className="rounded-lg border border-accent/40 bg-bg-secondary/80 overflow-hidden flex">
      <div className="w-1 flex-shrink-0 bg-accent" />

      <div className="flex-1">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="hud-label text-accent">REGISTRATION DENIED</span>
          <span className="hud-label tracking-[0.2em]">{citizen.citizenId}</span>
        </div>

        <div className="flex gap-4 p-4">
          <div className="w-28 h-36 sm:w-32 sm:h-40 rounded bg-bg-tertiary border border-accent/20 flex-shrink-0 overflow-hidden">
            {citizen.avatarUrl ? (
              <Image
                src={citizen.avatarUrl}
                alt={`${citizen.name} 아바타`}
                width={128}
                height={160}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent/60 font-bold text-2xl">
                {citizen.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <span className="text-lg font-bold text-text truncate leading-tight block">
                {citizen.name}
              </span>
              <p className="text-[0.6rem] text-text-secondary mt-0.5">
                {citizen.faction === "Bureau"
                  ? "Solaris Bureau of Civic Security"
                  : "The Static"}
              </p>
            </div>

            <div>
              <p className="text-xs text-accent">등록이 반려되었습니다.</p>
              <p className="text-[0.6rem] text-text-secondary mt-1">
                캐릭터 정보를 수정하여 다시 신청할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center px-4 py-2 border-t border-border">
          <Link
            href="/character/create"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
            aria-label="재신청하기"
          >
            재신청하기 &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   메인 컴포넌트
   ──────────────────────────────────────────────── */
type CitizenIDCardProps = {
  citizen: CitizenData | null;
  className?: string;
  onCancel?: () => void;
  onAvatarChange?: (url: string) => void;
};

export function CitizenIDCard({ citizen, className, onCancel, onAvatarChange }: CitizenIDCardProps) {
  if (!citizen) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyCard />
      </div>
    );
  }

  const status = citizen.status ?? "approved";

  if (status === "pending") {
    return (
      <div className={cn("w-full", className)}>
        <PendingCard citizen={citizen} onCancel={onCancel} />
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className={cn("w-full", className)}>
        <RejectedCard citizen={citizen} />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <RegisteredCard citizen={citizen} onAvatarChange={onAvatarChange} />
    </div>
  );
}
