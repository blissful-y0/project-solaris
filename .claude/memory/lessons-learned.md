# Lessons Learned

---

## 2026-02-18 — 홈 페이지 리디자인

### 1. Next.js 클라이언트 process.env 인라인
- **증상**: dev에서 "환경변수 검증 실패" 에러
- **원인**: `parsePublicEnv(process.env)` — 클라이언트에서 `process.env`는 빈 객체
- **해결**: 개별 키 직접 참조 `{ NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL }`
- **교훈**: Next.js 클라이언트에서 process.env 전체를 함수에 넘기지 말 것

### 2. 과도한 장식 CSS
- **증상**: absolute 블러 원형, 스캔라인 오버레이 → 유저 "이거 뭐임?"
- **교훈**: 장식 최소화. HUD 코너 + 글로우 정도만. 블러 원형/그라데이션 배경 자제.

### 3. Flip 애니메이션 → 단일 카드
- **증상**: 3D flip 구현했으나 유저 "없어도 됨"
- **교훈**: 멋진 인터랙션보다 정보 밀도가 중요. 한 면에 모든 정보.

### 4. Badge vs 텍스트 중복
- **증상**: Badge(SBCS) + 소속 풀네임 동시 표시 → "이상하지 않나?"
- **교훈**: 같은 정보를 두 가지 형태로 동시에 보여주지 않기.

### 5. img → next/image
- **증상**: `<img>` 태그로 구현 → 유저가 `next/image` Image로 직접 변경
- **교훈**: Next.js에서 이미지는 처음부터 `next/image` 사용할 것.

### 6. 에이전트 팀 작업 시 공유 파일 충돌
- **증상**: 3개 에이전트가 동시에 `index.ts`에 export 추가 → 마지막 결과만 반영
- **교훈**: 공유 파일(index.ts)은 통합 단계에서 확인 필요.

---

## 2026-02-16 — System Popups (Landing)

### 1. 모달이 안 뜸
- **원인**: unlayered CSS `.section-shell > *`가 `position: relative` → Tailwind `fixed` 무력화
- **해결**: `createPortal(jsx, document.body)`
- **교훈**: Tailwind v4에서 position 안 먹히면 unlayered CSS부터 의심. 모달은 무조건 Portal.

### 2. 애니메이션 타이머 경합
- **원인**: setTimeout이 setPhase("closing") 이후에 실행되면서 덮어씀
- **해결**: `setPhase((prev) => prev === "closing" ? prev : "expand")` — functional update 가드
- **교훈**: 여러 setTimeout이 상태를 건드릴 때는 항상 functional update.

### 3. 유저의 직접 파일 수정
- **증상**: 커밋 후 git diff에 유저 수정분이 남아있음
- **교훈**: 커밋 전 반드시 `git status` + `git diff --stat` 확인.

---

## 유저와 작업할 때 주의사항

1. **텍스트는 유저가 결정** — 세계관 문구를 내가 창작하지 말 것
2. **반말체 일관성** — "~합니다" 아니라 "~한다" 체
3. **빠른 반영 > 완벽한 설계** — 눈으로 확인 후 즉시 수정 지시하는 스타일
4. **커밋 전 diff 확인 필수** — 유저가 중간에 직접 파일 수정하는 경우 잦음
5. **장식 자제** — 화려한 CSS 효과보다 깔끔한 정보 전달 선호

## 기술적 주의사항

1. **Tailwind v4**: 새 CSS는 `@layer` 안에. unlayered CSS와 충돌 주의.
2. **Portal 필수**: 모달/토스트 오버레이는 `createPortal(jsx, document.body)`.
3. **next/image**: 대시보드에서 이미지는 항상 `next/image` Image 컴포넌트.
4. **env.client.ts**: process.env 개별 키 참조. 전체 객체 넘기면 클라이언트에서 undefined.
5. **PR 머지**: merge commit 사용, squash 아님. 브랜치 유지.
