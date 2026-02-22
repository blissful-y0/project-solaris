"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  closeButtonClassName?: string;
};

export function Modal({ open, onClose, title, ariaLabel, children, className, closeButtonClassName }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title ?? "상세 보기"}
        className={cn(
          "relative max-w-lg w-full mx-4 bg-bg-secondary border border-border rounded-lg max-h-[85dvh] overflow-y-auto",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 — 항상 우상단 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className={cn(
            "absolute top-2 right-2 z-10 text-text-secondary hover:text-text transition-colors p-1",
            closeButtonClassName,
          )}
        >
          &#x2715;
        </button>

        {/* 타이틀 헤더 — 있을 때만 표시 */}
        {title && (
          <div className="px-4 pt-3 pb-2 border-b border-border">
            <h2 className="text-xs uppercase tracking-widest text-primary font-semibold pr-6">
              {title}
            </h2>
          </div>
        )}

        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
