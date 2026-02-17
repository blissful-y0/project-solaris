# PROJECT SOLARIS — Agent Operating Manual

## 0. 이 문서의 성격

이 문서는 "프로젝트 소개"가 아니라 **에이전트 운영 규약**이다.
작업 중 충돌이 생기면 이 문서와 `docs/project/*.md`를 우선 참조한다.

---

## 1. 필독 순서 (작업 시작 전)

아래 순서대로 읽고 시작한다.

1. `docs/WORLDBUILDING.md`
2. `docs/project/SERVICE-SPEC.md`
3. `docs/project/API-SPEC.md`
4. `docs/project/DB-SCHEMA.md`
5. `docs/project/ADMIN-SPEC.md`

보충 자료:

- `docs/LANDING-SPEC.md`
- `docs/LANDING-COPY.md`

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

- 메뉴 라벨, 화면 명칭, 사용자 노출 용어는 **항상 최신 `SERVICE-SPEC` 기준**으로 맞춘다.
- 과거 문서의 구 라벨(예: 탭/화면 옛 이름)은 새 작업에서 재도입하지 않는다.
- 문서 간 용어 불일치 발견 시:
  1) `SERVICE-SPEC` 우선
  2) `API-SPEC`/`DB-SCHEMA` 정합성 확인
  3) 필요 시 계획 문서에 충돌 메모 추가

---

## 5. 작업 원칙

### 문서 우선

- 구현 전 스펙/플랜 문서부터 갱신한다.
- 코드와 문서가 충돌하면 코드를 바로 바꾸기보다 기준 문서를 먼저 확정한다.

### 최소 변경

- 버그 수정은 최소 범위로 한다.
- 한 작업에서 주제 2개 이상 섞지 않는다.

### 검증

- 변경 후 가능한 범위에서 테스트/빌드/린트로 확인한다.
- 사전 존재 오류와 신규 오류를 분리해 보고한다.

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

---

## 9. 문서 충돌 해결 규칙

- 우선순위:
  1. `docs/project/SERVICE-SPEC.md`
  2. `docs/project/API-SPEC.md`
  3. `docs/project/DB-SCHEMA.md`
  4. `docs/project/ADMIN-SPEC.md`
  5. `docs/plans/*.md`
- 충돌 발견 시 즉시 메모하고, 같은 PR/브랜치에서 동기화한다.

---

## 10. Done 기준

아래 조건을 만족해야 작업 완료로 간주한다.

- 요청사항 반영 완료
- 관련 문서/코드 정합성 확보
- 검증 결과 보고 가능
- 다음 작업자가 이어받을 수 있는 상태
