import { cn } from "@/lib/utils";

import type { CharacterDraft } from "./types";
import { ImageCropper } from "./ImageCropper";

type StepProfileProps = {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  imagePreviewUrl: string | null;
};

const labelClass = "block text-xs uppercase tracking-widest text-text-secondary mb-1.5";
const inputClass = cn(
  "w-full min-h-[44px] bg-bg-secondary border border-border rounded-md px-3 py-2 text-text placeholder:text-text-secondary/50",
  "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors",
);
const numInputClass = cn(
  inputClass,
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
);
const textareaClass = cn(inputClass, "min-h-[80px] resize-none");

/** 팩션별 공명율 범위 */
const RESONANCE_RANGE = {
  bureau: { min: 80, max: 100, label: "80~100" },
  static: { min: 0, max: 15, label: "0~15" },
} as const;

export function StepProfile({ draft, onChange, onImageChange, imagePreviewUrl }: StepProfileProps) {
  const range = draft.faction ? RESONANCE_RANGE[draft.faction] : null;
  const rrValue = Number(draft.resonanceRate);
  const rrOutOfRange = draft.resonanceRate !== "" && range
    && (rrValue < range.min || rrValue > range.max);

  return (
    <div className="space-y-5">
      <p className="hud-label mb-6">// 캐릭터 프로필을 입력하세요</p>

      {/* 상단: 이미지 (좌) + 기본 정보 (우) — 이력서 스타일 */}
      <div className="flex items-stretch gap-5">
        {/* 좌측: 프로필 이미지 — 우측 입력 영역 높이에 맞춤 */}
        <div className="w-32 shrink-0 flex flex-col">
          <p className={labelClass}>프로필 이미지</p>
          <div className="flex-1">
            <ImageCropper
              previewUrl={imagePreviewUrl}
              onImageChange={onImageChange}
              className="h-full"
            />
          </div>
        </div>

        {/* 우측: 이름 / 성별 / 나이 / 공명율 */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <label htmlFor="charName" className={labelClass}>캐릭터 이름</label>
            <input
              id="charName"
              type="text"
              maxLength={20}
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="이름"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gender" className={labelClass}>성별</label>
              <input
                id="gender"
                type="text"
                maxLength={10}
                value={draft.gender}
                onChange={(e) => onChange({ gender: e.target.value })}
                placeholder="자유 입력"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="age" className={labelClass}>나이</label>
              <input
                id="age"
                type="number"
                min={15}
                max={999}
                value={draft.age}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d+$/.test(val)) {
                    onChange({ age: val });
                  }
                }}
                placeholder="15~999"
                className={numInputClass}
              />
              {draft.age !== "" && Number(draft.age) < 15 && (
                <p className="text-xs text-accent mt-1">최소 15세</p>
              )}
            </div>
          </div>

          {range && (
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="resonanceRate" className={labelClass}>공명율</label>
                <span className="text-[0.55rem] text-text-secondary/50 tabular-nums">{range.label}%</span>
              </div>
              <input
                id="resonanceRate"
                type="number"
                min={range.min}
                max={range.max}
                value={draft.resonanceRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d+$/.test(val)) {
                    onChange({ resonanceRate: val });
                  }
                }}
                placeholder={range.label}
                className={cn(
                  numInputClass,
                  rrOutOfRange && "border-accent/60 focus:ring-accent/50",
                )}
              />
              {rrOutOfRange && (
                <p className="text-xs text-accent mt-1">
                  {draft.faction === "bureau" ? "보안국" : "스태틱"} 범위: {range.label}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 외형 묘사 */}
      <div>
        <label htmlFor="appearance" className={labelClass}>외형 묘사</label>
        <textarea
          id="appearance"
          maxLength={500}
          value={draft.appearance}
          onChange={(e) => onChange({ appearance: e.target.value })}
          placeholder="캐릭터의 외모를 묘사하세요"
          className={textareaClass}
        />
      </div>

      {/* 성격 */}
      <div>
        <label htmlFor="personality" className={labelClass}>성격</label>
        <textarea
          id="personality"
          maxLength={500}
          value={draft.personality}
          onChange={(e) => onChange({ personality: e.target.value })}
          placeholder="캐릭터의 성격을 묘사하세요"
          className={textareaClass}
        />
      </div>

      {/* 배경 스토리 */}
      <div>
        <label htmlFor="backstory" className={labelClass}>배경 스토리</label>
        <textarea
          id="backstory"
          maxLength={1000}
          value={draft.backstory}
          onChange={(e) => onChange({ backstory: e.target.value })}
          placeholder="캐릭터의 배경 이야기를 작성하세요"
          className={cn(textareaClass, "min-h-[120px]")}
        />
      </div>
    </div>
  );
}
