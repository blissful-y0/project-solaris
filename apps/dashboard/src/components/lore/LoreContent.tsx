import { cn } from "@/lib/utils";

type LoreContentProps = {
  html: string;
  className?: string;
};

/** 마크다운에서 변환된 HTML을 세계관 스타일로 렌더링 */
export function LoreContent({ html, className }: LoreContentProps) {
  if (!html) {
    return (
      <div className={cn("text-sm text-text-secondary text-center py-8", className)}>
        콘텐츠를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <article
      className={cn("lore-content", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
