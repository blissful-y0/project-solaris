import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SystemInfo } from "./systemData";

interface Props {
  system: SystemInfo;
  onClose: () => void;
}

type Phase = "scan" | "expand" | "content" | "closing";

export default function SystemModal({ system, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("scan");
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ── 닫기 핸들러 ── */
  const handleClose = useCallback(() => {
    if (phase === "closing") return;
    setPhase("closing");
    setTimeout(onClose, 250);
  }, [phase, onClose]);

  /* ── ESC 키 닫기 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  /* ── 바디 스크롤 잠금 ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ── 애니메이션 상태 머신 ── */
  useEffect(() => {
    const t1 = setTimeout(
      () => setPhase((prev) => (prev === "closing" ? prev : "expand")),
      300,
    );
    const t2 = setTimeout(
      () => setPhase((prev) => (prev === "closing" ? prev : "content")),
      600,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  /* ── 오버레이 클릭 (배경만) ── */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const isVisible = phase !== "scan";
  const isContent = phase === "content";
  const isClosing = phase === "closing";

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: isClosing ? 0 : 1,
        transition: "opacity 250ms ease-out",
      }}
      onClick={handleOverlayClick}
    >
      {/* 스캔라인 이펙트 */}
      {phase === "scan" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              width: "100%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(0,212,255,0.8), rgba(0,212,255,0.5), transparent)",
              animation: "modal-scan 0.3s linear forwards",
            }}
          />
        </div>
      )}

      {/* 모달 프레임 */}
      <div
        className="relative w-full max-w-[640px] max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: "rgba(10, 10, 15, 0.95)",
          opacity: isClosing ? 0 : isVisible ? 1 : 0,
          transform: isVisible ? "scaleY(1)" : "scaleY(0.95)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
      >
        {/* HUD 코너 브라켓 */}
        <span
          className="absolute top-0 left-0 w-5 h-5"
          style={{
            borderTop: "1px solid var(--color-primary)",
            borderLeft: "1px solid var(--color-primary)",
            opacity: 0.5,
          }}
        />
        <span
          className="absolute top-0 right-0 w-5 h-5"
          style={{
            borderTop: "1px solid var(--color-primary)",
            borderRight: "1px solid var(--color-primary)",
            opacity: 0.5,
          }}
        />
        <span
          className="absolute bottom-0 left-0 w-5 h-5"
          style={{
            borderBottom: "1px solid var(--color-primary)",
            borderLeft: "1px solid var(--color-primary)",
            opacity: 0.5,
          }}
        />
        <span
          className="absolute bottom-0 right-0 w-5 h-5"
          style={{
            borderBottom: "1px solid var(--color-primary)",
            borderRight: "1px solid var(--color-primary)",
            opacity: 0.5,
          }}
        />

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 text-text/50 hover:text-primary transition-colors duration-200 text-lg leading-none cursor-pointer z-10"
          aria-label="닫기"
        >
          &#x2715;
        </button>

        {/* 내부 콘텐츠 */}
        <div className="p-6 md:p-8">
          {/* 헤더 — 글리프 + 타이틀 */}
          <div
            className="flex items-center gap-4 mb-5"
            style={{
              opacity: isClosing ? 0 : isContent ? 1 : 0,
              transition: "opacity 300ms ease-out",
              transitionDelay: isContent ? "0ms" : "0ms",
            }}
          >
            <div className="system-glyph pulse shrink-0">{system.glyph}</div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary text-glow-cyan">
                {system.title}
              </h2>
              <p className="text-text/50 text-sm mt-1">{system.description}</p>
            </div>
          </div>

          {/* 디바이더 */}
          <div
            className="mb-6"
            style={{
              height: "1px",
              background:
                "linear-gradient(to right, var(--color-primary), transparent)",
              opacity: 0.4,
            }}
          />

          {/* 콘텐츠 섹션들 */}
          {system.sections.map((section, i) => (
            <div
              key={section.heading}
              className="mb-5 last:mb-0"
              style={{
                opacity: isClosing ? 0 : isContent ? 1 : 0,
                transform: isContent ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
                transitionDelay: isContent ? `${(i + 1) * 100}ms` : "0ms",
              }}
            >
              <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
                {section.heading}
              </h3>
              <p className="text-text/70 text-sm md:text-base leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}

          {/* Notion 링크 */}
          {system.notionUrl && (
            <>
              <div
                className="my-5"
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(to right, var(--color-primary), transparent)",
                  opacity: 0.25,
                }}
              />
              <a
                href={system.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary hover-glow-cyan transition-colors duration-200"
                style={{
                  opacity: isClosing ? 0 : isContent ? 1 : 0,
                  transition: "opacity 300ms ease-out",
                  transitionDelay: isContent
                    ? `${(system.sections.length + 1) * 100}ms`
                    : "0ms",
                }}
              >
                <span>&#x2197;</span>
                <span>노션에서 자세히 보기</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
