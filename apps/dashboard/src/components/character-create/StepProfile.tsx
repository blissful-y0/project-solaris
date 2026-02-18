import { cn } from "@/lib/utils";

import type { CharacterDraft } from "./types";

type StepProfileProps = {
  draft: CharacterDraft;
  onChange: (patch: Partial<CharacterDraft>) => void;
  onImageUpload?: (file: File) => void | Promise<void>;
  isUploading?: boolean;
};

const labelClass = "block text-xs uppercase tracking-widest text-text-secondary mb-1.5";
const inputClass = cn(
  "w-full min-h-[44px] bg-bg-secondary border border-border rounded-md px-3 py-2 text-text placeholder:text-text-secondary/50",
  "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors",
);
const textareaClass = cn(inputClass, "min-h-[80px] resize-y");

export function StepProfile({ draft, onChange, onImageUpload, isUploading = false }: StepProfileProps) {
  return (
    <div className="space-y-5">
      <p className="hud-label mb-6">// 캐릭터 프로필을 입력하세요</p>

      {/* 이름 + 성별 + 나이 (한 줄) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              // 빈 값이거나 숫자만 허용
              if (val === "" || /^\d+$/.test(val)) {
                onChange({ age: val });
              }
            }}
            placeholder="15~999"
            className={cn(inputClass, "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
          />
          {draft.age !== "" && Number(draft.age) < 15 && (
            <p className="text-xs text-accent mt-1">최소 15세 이상이어야 합니다</p>
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

      <div>
        <label htmlFor="profileImage" className={labelClass}>프로필 이미지</label>
        <input
          id="profileImage"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !onImageUpload) return;
            void onImageUpload(file);
            e.currentTarget.value = "";
          }}
          className={cn(inputClass, "file:mr-3 file:rounded file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary")}
        />
        {isUploading && <p className="text-xs text-text-secondary mt-2">업로드 중...</p>}
        {draft.profileImageUrl && (
          <div className="mt-3">
            <img
              src={draft.profileImageUrl}
              alt="프로필 미리보기"
              className="h-28 w-28 rounded-md object-cover border border-border"
            />
          </div>
        )}
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
