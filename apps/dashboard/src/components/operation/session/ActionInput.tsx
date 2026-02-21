"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type {
  ActionType,
  BattleAbility,
  BattleParticipant,
  TurnPhase,
} from "./types";

/* ── 행동 유형 설정 ── */
const actionTypes: {
  type: ActionType;
  label: string;
  shortLabel: string;
  targetType: "enemy" | "ally";
}[] = [
  { type: "attack", label: "공격", shortLabel: "ATK", targetType: "enemy" },
  { type: "defend", label: "방어", shortLabel: "DEF", targetType: "ally" },
  { type: "support", label: "지원", shortLabel: "SUP", targetType: "ally" },
];

/* ── 능력 티어 표시 ── */
const tierLabel: Record<BattleAbility["tier"], string> = {
  basic: "I",
  mid: "II",
  advanced: "III",
};

type ActionInputProps = {
  phase: TurnPhase;
  currentTurn: number;
  myParticipant: BattleParticipant;
  allies: BattleParticipant[];
  enemies: BattleParticipant[];
  onSubmit: (data: {
    actionType: ActionType;
    abilityId: string;
    targetId: string;
    narration: string;
  }) => void;
  onOocToggle?: () => void;
  className?: string;
};

export function ActionInput({
  phase,
  currentTurn,
  myParticipant,
  allies,
  enemies,
  onSubmit,
  onOocToggle,
  className,
}: ActionInputProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>("attack");
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [narration, setNarration] = useState("");
  const [configExpanded, setConfigExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMyTurn = phase === "my_turn";

  /* 선택한 능력 정보 */
  const selectedAbility = useMemo(
    () => myParticipant.abilities.find((a) => a.id === selectedAbilityId),
    [myParticipant.abilities, selectedAbilityId],
  );

  /* 대상 후보 목록 */
  const targetType = actionTypes.find((a) => a.type === selectedAction)?.targetType ?? "enemy";
  const targetCandidates = targetType === "enemy" ? enemies : allies;

  /* 코스트 부족 체크 */
  const costShortage = useMemo(() => {
    if (!selectedAbility) return null;
    const hpAfter = myParticipant.hp.current - selectedAbility.costHp;
    const willAfter = myParticipant.will.current - selectedAbility.costWill;
    if (hpAfter < 0) return "HP가 부족합니다";
    if (willAfter < 0) return "WILL이 부족합니다";
    return null;
  }, [selectedAbility, myParticipant.hp.current, myParticipant.will.current]);

  /* 코스트 프리뷰 */
  const costPreview = useMemo(() => {
    if (!selectedAbility) return null;
    const parts: string[] = [];
    if (selectedAbility.costHp > 0) {
      parts.push(`HP ${myParticipant.hp.current} → ${myParticipant.hp.current - selectedAbility.costHp}`);
    }
    if (selectedAbility.costWill > 0) {
      parts.push(`WILL ${myParticipant.will.current} → ${myParticipant.will.current - selectedAbility.costWill}`);
    }
    return parts.length > 0 ? parts.join("  /  ") : null;
  }, [selectedAbility, myParticipant.hp.current, myParticipant.will.current]);

  /* 제출 가능 여부 */
  const canSubmit = isMyTurn
    && selectedAbilityId !== ""
    && selectedTargetId !== ""
    && narration.trim() !== ""
    && costShortage === null;

  /* 선택 요약 텍스트 (config 접힘 시 표시) */
  const selectionSummary = useMemo(() => {
    const actionLabel = actionTypes.find((a) => a.type === selectedAction)?.label ?? "";
    const abilityName = selectedAbility?.name ?? "--";
    const targetName = targetCandidates.find((t) => t.id === selectedTargetId)?.name ?? "--";
    return `${actionLabel} / ${abilityName} / ${targetName}`;
  }, [selectedAction, selectedAbility, targetCandidates, selectedTargetId]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      actionType: selectedAction,
      abilityId: selectedAbilityId,
      targetId: selectedTargetId,
      narration: narration.trim(),
    });
    setNarration("");
  }, [canSubmit, onSubmit, selectedAction, selectedAbilityId, selectedTargetId, narration]);

  /* textarea 자동 높이 조절 */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [narration]);

  /* 모바일: 행동+능력+대상 모두 선택 시 설정 패널 자동 접기 */
  useEffect(() => {
    if (
      selectedAction &&
      selectedAbilityId &&
      selectedTargetId &&
      window.innerWidth < 768
    ) {
      setConfigExpanded(false);
    }
  }, [selectedAction, selectedAbilityId, selectedTargetId]);

  /* Enter로 제출 (Shift+Enter는 줄바꿈) */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  /* ── 비활성 상태: 대기 ── */
  if (phase === "waiting") {
    return (
      <div className={cn(
        "border-t border-border bg-bg-secondary/80 backdrop-blur-sm",
        className,
      )}>
        <div className="flex items-center justify-center gap-3 px-4 py-4">
          <div className="flex gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:200ms]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/20 animate-pulse [animation-delay:400ms]" />
          </div>
          <p className="text-xs text-text-secondary tracking-wide">
            상대의 서술을 기다리는 중...
          </p>
        </div>
      </div>
    );
  }

  /* ── 양측 제출 완료 ── */
  if (phase === "both_submitted") {
    return (
      <div className={cn(
        "border-t border-border bg-bg-secondary/80 backdrop-blur-sm",
        className,
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-xs text-text-secondary">
            양측 서술 완료. 판정을 진행하세요.
          </p>
          <Button variant="primary" size="sm" className="text-xs px-4">
            판정 진행
          </Button>
        </div>
      </div>
    );
  }

  /* ── 판정 중 ── */
  if (phase === "judging") {
    return (
      <div className={cn(
        "border-t border-primary/30 bg-bg-secondary/80 backdrop-blur-sm",
        className,
      )}>
        <div className="flex items-center justify-center gap-2.5 px-4 py-4">
          <div className="h-3.5 w-3.5 border-[1.5px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-primary tracking-wider font-medium">
            HELIOS 판정 처리 중...
          </p>
        </div>
      </div>
    );
  }

  /* ── 공통 select 스타일 ── */
  const selectBase = cn(
    "w-full appearance-none bg-bg-tertiary/80 border border-border rounded-md",
    "px-2.5 py-1.5 text-xs text-text",
    "focus:outline-none focus:border-primary/50",
    "transition-colors",
  );

  /* ── 입력 UI (my_turn: 활성 / result: 비활성) ── */
  return (
    <div
      className={cn(
        "border-t border-border bg-bg-secondary/90 backdrop-blur-sm flex-shrink-0",
        isMyTurn && "border-t-primary/40",
        className,
      )}
    >
      {/* ── 설정 패널 (접기/펼치기) ── */}
      <div className="relative">
        {/* 토글 바: 턴 번호 + 선택 요약 + 접기 버튼 */}
        <button
          type="button"
          onClick={() => setConfigExpanded((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-1.5",
            "text-left transition-colors",
            "hover:bg-bg-tertiary/30",
          )}
        >
          {/* 턴 번호 */}
          <span className="hud-label text-primary font-bold tracking-widest shrink-0">
            T{currentTurn}
          </span>

          {/* 구분선 */}
          <span className="w-px h-3 bg-border shrink-0" />

          {/* 선택 요약 (접혀있을 때 더 유용) */}
          <span className="flex-1 text-[0.65rem] text-text-secondary truncate tracking-wide">
            {configExpanded ? "행동 설정" : selectionSummary}
          </span>

          {/* 접기/펼치기 화살표 */}
          <span className={cn(
            "text-[0.6rem] text-text-secondary transition-transform",
            configExpanded ? "rotate-180" : "rotate-0",
          )}>
            ▼
          </span>
        </button>

        {/* 설정 내용 (접기 가능) */}
        <div
          className={cn(
            "transition-all duration-200 ease-out",
            configExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
          )}
        >
          {/* 행동 유형 칩 4개 */}
          <div className="px-3 pb-1.5 flex gap-1">
            {actionTypes.map((at) => {
              const isSelected = selectedAction === at.type;
              return (
                <button
                  key={at.type}
                  type="button"
                  data-testid={`action-${at.type}`}
                  onClick={() => {
                    setSelectedAction(at.type);
                    setSelectedTargetId("");
                  }}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-[0.65rem] font-semibold",
                    "transition-all duration-150 border",
                    "flex flex-col items-center gap-0",
                    isSelected
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-transparent bg-bg-tertiary/60 text-text-secondary hover:bg-bg-tertiary hover:text-text",
                  )}
                >
                  <span className="text-[0.55rem] font-mono opacity-60 leading-none">
                    {at.shortLabel}
                  </span>
                  <span className="leading-tight">{at.label}</span>
                </button>
              );
            })}
          </div>

          {/* 능력 + 대상 드롭다운 (가로 분할) */}
          <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
            {/* 능력 선택 */}
            <div className="relative">
              <select
                data-testid="ability-select"
                value={selectedAbilityId}
                onChange={(e) => setSelectedAbilityId(e.target.value)}
                className={selectBase}
              >
                <option value="">능력 선택</option>
                {myParticipant.abilities.map((ab) => (
                  <option key={ab.id} value={ab.id}>
                    {ab.name} {tierLabel[ab.tier] ?? ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 대상 선택 */}
            <div className="relative">
              <select
                data-testid="target-select"
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className={selectBase}
              >
                <option value="">대상 선택</option>
                {targetCandidates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── 코스트 프리뷰 (인라인, 능력 선택 시만) ── */}
      {selectedAbility && (costPreview || costShortage) && (
        <div className={cn(
          "mx-3 mb-1 px-2.5 py-1 rounded-md text-[0.6rem] tabular-nums",
          "flex items-center gap-2",
          costShortage
            ? "bg-accent/8 border border-accent/20"
            : "bg-primary/5 border border-primary/10",
        )}>
          {costPreview && (
            <span className={costShortage ? "text-accent/80" : "text-text-secondary"}>
              {costPreview}
            </span>
          )}
          {costShortage && (
            <span
              data-testid="cost-warning"
              className="text-accent font-medium ml-auto"
            >
              {costShortage}
            </span>
          )}
        </div>
      )}

      {/* ── 서술 입력 + 제출 ── */}
      <div className="flex items-end gap-2 px-3 pb-3 pt-1">
        <textarea
          ref={textareaRef}
          data-testid="narration-input"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMyTurn ? "행동을 서술하세요..." : "서술 입력 불가"}
          disabled={!isMyTurn}
          rows={3}
          className={cn(
            "flex-1 bg-bg-tertiary/60 border border-border rounded-lg",
            "px-3 py-2 text-sm text-text leading-snug",
            "resize-none overflow-y-auto",
            "placeholder:text-text-secondary/40",
            "focus:outline-none focus:border-primary/40",
            "transition-colors",
            "min-h-[72px] max-h-[180px]",
          )}
        />

        {/* 제출 버튼 — 아이콘 스타일 원형 */}
        <Button
          variant="primary"
          size="sm"
          disabled={!canSubmit}
          onClick={handleSubmit}
          data-testid="submit-btn"
          className={cn(
            "shrink-0 !rounded-lg !px-3 h-[36px]",
            "text-xs font-bold tracking-wider",
            canSubmit && "glow-cyan",
          )}
        >
          제출
        </Button>
      </div>
    </div>
  );
}
