type PomiAdProps = {
  text: string;
  /** 라벨 기본값: "POMI WELLNESS" */
  label?: string;
};

/** HELIOS 시민 통제 프로파간다 광고 — 이질적으로 귀여운 톤 */
export function PomiAd({ text, label = "POMI WELLNESS" }: PomiAdProps) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
      {/* 라벨 — 둥근 pill, 기존 HUD 스타일과 의도적으로 다르게 */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[0.6rem] font-semibold text-primary tracking-wider uppercase">
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-primary" aria-hidden="true">
            <circle cx="6" cy="6" r="5" opacity="0.3" />
            <circle cx="6" cy="6" r="2.5" />
          </svg>
          {label}
        </span>
      </div>

      {/* 본문 — 부드러운 톤, 살짝 큰 폰트 */}
      <p className="text-sm text-text/70 leading-relaxed font-medium">
        {text}
      </p>
    </div>
  );
}
