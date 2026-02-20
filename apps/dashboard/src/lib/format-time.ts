/** 타임스탬프 → HH:MM 포맷 (SSR/CSR 동일 결과 보장) */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
