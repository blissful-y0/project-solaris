/**
 * 랜딩 헤더 시작 버튼.
 * Vercel 통합 배포에서는 대시보드 /login으로 이동한다.
 * (Supabase implicit flow 제거 — 대시보드 PKCE flow 사용)
 */
export default function AuthButton() {
  return (
    <a className="header-discord" href="/login" aria-label="시작하기">
      START
    </a>
  );
}
