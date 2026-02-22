"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui";

interface CharacterSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** 캐릭터 검색 — 300ms debounce */
export function CharacterSearchBar({
  value,
  onChange,
  className,
}: CharacterSearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (local !== value) {
        onChange(local);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [local, onChange, value]);

  return (
    <Input
      type="text"
      placeholder="캐릭터 검색..."
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      className={className}
    />
  );
}
