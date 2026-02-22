"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "helios_personal_directives";

export function ResonanceTasks() {
  const [memo, setMemo] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트 마운트 후 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    setIsMounted(true);
    const savedMemo = localStorage.getItem(STORAGE_KEY);
    if (savedMemo) {
      setMemo(savedMemo);
    }
  }, []);

  // 메모 변경 시 상태 관리 및 로컬 스토리지 저장
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setMemo(newVal);
    localStorage.setItem(STORAGE_KEY, newVal);
  };

  return (
    <Card hud className="relative group overflow-hidden bg-bg-secondary/40 border-border/50 transition-colors hover:border-primary/30 p-0 flex-1 flex flex-col h-full">
      <label htmlFor="directives-memo" className="sr-only">Personal Directives Memo</label>

      {/* 시스템 상태 저장 표시 */}
      <div className="absolute top-2 right-3 z-10 pointer-events-none">
        <span
          className={cn(
            "text-[0.6rem] font-mono tracking-widest uppercase transition-colors",
            isMounted ? "text-success/40" : "text-text-secondary/20",
          )}
        >
          {isMounted ? "SYNC: OK" : "SYNC: INIT"}
        </span>
      </div>

      <textarea
        id="directives-memo"
        value={memo}
        onChange={handleChange}
        placeholder={isMounted ? "> ENTER DIRECTIVE...\\\n> _" : "LOADING SYSTEM..."}
        disabled={!isMounted}
        spellCheck={false}
        className={cn(
          "w-full flex-1 h-full min-h-[220px] bg-transparent border-none resize-none px-4 py-4 focus:outline-none focus:ring-0",
          "font-mono text-sm tracking-widest text-text-secondary placeholder:text-text-secondary/30",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-colors duration-200",
          "focus:text-text focus:bg-primary/[0.02]",
        )}
      />

      {/* 우측 하단 장식 요소 */}
      <div className="absolute right-2 bottom-2 font-mono text-[10px] text-text-secondary/20 pointer-events-none">
        {memo.length} BYTES
      </div>
    </Card>
  );
}
