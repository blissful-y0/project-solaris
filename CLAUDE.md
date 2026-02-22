# PROJECT SOLARIS — Agent Operating Manual

## 0. 이 문서의 성격

이 문서는 "프로젝트 소개"가 아니라 **에이전트 운영 규약**이다.
작업 중 충돌이 생기면 이 문서와 `docs/specs/*.md`를 우선 참조한다.

---

## 1. 필독 순서 (작업 시작 전)

아래 순서대로 읽고 시작한다.

1. `docs/WORLDBUILDING.md`
2. `docs/specs/_overview.md` — 프로젝트 구조, 공통 규칙, 디자인 시스템
3. 작업 대상 기능의 스펙 파일:
   - `docs/specs/auth.md` — 인증/세션
   - `docs/specs/home.md` — 홈, 뉴스, 알림
   - `docs/specs/character.md` — 캐릭터 생성/프로필/레지스트리
   - `docs/specs/operation.md` — 작전(전투 RP/다운타임 RP)
   - `docs/specs/faction.md` — 진영 게시판
   - `docs/specs/mypage.md` — 마이페이지
   - `docs/specs/admin.md` — 관리자 패널, 배치 서버
4. `docs/folder-governance.md`

보충 자료:

- `docs/landing/LANDING-SPEC.md`
- `docs/landing/LANDING-COPY.md`

> 구 스펙 파일(`SERVICE-SPEC.md`, `API-SPEC.md`, `DB-SCHEMA.md`)은 `docs/archive/`로 이동됨.
> 기능별 스펙 파일(`specs/*.md`)이 프론트+백엔드+DB를 통합 관리한다.

---

## 2. 프로젝트 핵심 정의

- 장르: 포스트아포칼립틱 자캐(OC) 커뮤니티 + AI GM 운영 텍스트 TRPG
- 핵심 축: 세계관 몰입, 전투/서사 연동, 운영 일관성
- 금지: 세계관과 무관한 범용 판타지/현대어 톤 남용

---

## 3. 세계관 가드레일

### 절대 유지

- 헬리오스 코어 중심의 통제 사회 구도
- 공명율/꿈/진영 대립을 축으로 한 서사 긴장
- 시민 관점의 표면 서사와 숨겨진 진실의 분리

### 생성 시 금지

- 설정 근거 없는 신규 진영/시스템 임의 추가
- 코믹 밈 톤으로 핵심 서사 처리
- 기존 용어 체계와 충돌하는 명칭 도입

---

## 4. IA/용어 규칙

- 메뉴 라벨, 화면 명칭, 사용자 노출 용어는 **항상 최신 기능별 스펙 파일(`specs/*.md`) 기준**으로 맞춘다.
- 과거 문서의 구 라벨(예: 탭/화면 옛 이름)은 새 작업에서 재도입하지 않는다.
- 문서 간 용어 불일치 발견 시:
  1) 해당 기능 스펙 파일 우선 (`specs/*.md`)
  2) 프론트/API/DB 섹션 간 정합성 확인
  3) 필요 시 계획 문서에 충돌 메모 추가

---

## 5. 작업 원칙

---

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## 6. Git 규칙

- `main`/`master` 직접 커밋 금지
- 기본 흐름: `develop` 기반 feature branch
- 브랜치 네이밍 예시:
  - `feat/comprehensive-planning-v2`
  - `feat/dashboard-session-integration`
  - `fix/oauth-redirect-safety`
- 커밋 메시지는 한국어 + 구체적 변경 이유 포함
  - 예: `feat: 세션 IA 통합 — 전투/RP 노출 라벨과 라우팅 규칙 정리`

---

## 7. 기술 스택 (현행)

- 모노레포: Turborepo + pnpm workspaces
- 랜딩: Astro 5 + TypeScript + Tailwind CSS v4
- 대시보드: Next.js 15 App Router
- 공통: `packages/ui`, `packages/config`
- 인증/데이터: Supabase (Auth, PostgreSQL, Realtime)

---

## 8. UI/카피 규칙

- 기본 사용자 노출 텍스트는 한국어 우선
- 영어 라벨은 제품 IA/브랜딩에서 명시된 경우에만 사용
- 세계관 카피는 "정보 전달 + 분위기"를 동시에 만족해야 한다.
- **이모티콘(Emoji) 사용 금지**: 서비스 코드에서 이모티콘을 사용하지 않는다. Unicode 특수문자(←, ▸, ▼, ▲, ·, — 등)는 허용하되, 그림 이모티콘(⚔, 🎯, 🛡, 💫, ⚠, 👥 등)은 사용하지 않는다.

---

## 9. 문서 충돌 해결 규칙

- 우선순위:
  1. `docs/specs/*.md` (기능별 통합 스펙)
  2. `docs/folder-governance.md`
  3. `docs/plans/*.md`
- 각 스펙 파일 내부에서는: 화면 정의 → API 정의 → DB 스키마 순으로 우선
- 충돌 발견 시 즉시 메모하고, 같은 PR/브랜치에서 동기화한다.

---

## 10. Done 기준

아래 조건을 만족해야 작업 완료로 간주한다.

- 요청사항 반영 완료
- 관련 문서/코드 정합성 확보
- 검증 결과 보고 가능
- 다음 작업자가 이어받을 수 있는 상태
