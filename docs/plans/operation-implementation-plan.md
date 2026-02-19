# Operation 통합 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Operation 허브 + 전투 세션 + DOWNTIME 채팅방 UI를 목 데이터 기반으로 구현한다.

**Architecture:** 3개 독립 브랜치로 병렬 구현. 허브(메인 페이지)는 도시어 카드형, 전투 세션은 순차 턴제 채팅 UI, DOWNTIME은 자유 서술 채팅. 모두 목 데이터 기반 (Supabase 연동은 별도 단계).

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS v4, Vitest, @testing-library/react

**Design Doc:** `docs/plans/2026-02-18-operation-hub-design.md`
**Combat Rules:** `docs/project/COMBAT-RULES.md`, `docs/project/COMBAT-ARCHITECTURE.md`
**Combat Resolution:** `docs/plans/2026-02-18-simple-combat-resolution-plan.md`

---

## 브랜치 구조

```
develop (base)
├── feat/operation-hub         ← Agent A: 허브 메인 페이지
├── feat/battle-session        ← Agent B: 전투 세션 채팅 UI
└── feat/downtime-room         ← Agent C: DOWNTIME 채팅방
```

---

# Agent A: Operation 허브 (`feat/operation-hub`)

## Task A-1: 타입 + 목 데이터 재정의

**Files:**
- Modify: `src/components/operation/types.ts`
- Modify: `src/components/operation/mock-operation-data.ts`

### Step 1: types.ts 재작성

```typescript
/** 작전 타입 */
export type OperationType = "operation" | "downtime";

/** 작전 상태 */
export type OperationStatus = "waiting" | "live" | "completed";

/** 팀 참가자 */
export interface TeamMember {
  id: string;
  name: string;
}

/** 작전 아이템 */
export interface OperationItem {
  id: string;
  title: string;
  type: OperationType;
  status: OperationStatus;
  teamA: TeamMember[];
  teamB: TeamMember[];
  host: TeamMember;
  summary: string;
  maxParticipants: number;
  createdAt: string; // ISO date
  isMainStory?: boolean;
}

/** 필터 값 */
export type TypeFilter = "all" | "operation" | "downtime";
export type StatusFilter = "all" | "waiting" | "live" | "completed";
```

### Step 2: mock-operation-data.ts 갱신

용어 변경 반영 (OPERATION/DOWNTIME), 2v2 데이터 포함, MAIN STORY 1건 포함.
목 데이터 8~10건: LIVE 2건, 대기 3건, 완료 3건, MAIN STORY 1건.

### Step 3: index.ts 업데이트

신규 타입/컴포넌트 export 추가.

### Step 4: 커밋

```
feat: Operation 타입 재정의 + 목 데이터 갱신 (OPERATION/DOWNTIME 용어)
```

---

## Task A-2: OperationCard 도시어 스타일 재작성

**Files:**
- Modify: `src/components/operation/OperationCard.tsx`
- Modify: `src/components/operation/__tests__/OperationCard.test.tsx`

### Step 1: 테스트 작성

- 상태별 stripe 색상 (LIVE=green, 대기=cyan, 완료=gray)
- OPERATION 카드: "A vs B" 참가자 표시
- DOWNTIME 카드: "호스트: 이름" 표시
- 타입 뱃지 (OPERATION/DOWNTIME)
- 완료 카드 opacity 처리
- CTA 버튼 텍스트 (입장/참가/열람)

### Step 2: 컴포넌트 구현

디자인 문서 Section 4 기반. 도시어 카드형:
- 좌측 stripe (`w-1`, 상태별 색상)
- 1행: 상태 인디케이터 + 타입 뱃지 + 제목
- 2행: 참가자 (OPERATION: teamA vs teamB, DOWNTIME: host)
- 3행: 요약 (line-clamp-1)
- 4행: 인원 + 경과시간 + CTA 버튼
- `bg-bg-secondary/80 border border-border`, `hover:border-primary/30`
- LIVE 상태 `● LIVE` 펄스 애니메이션

### Step 3: 테스트 통과 확인 + 커밋

```
feat: OperationCard 도시어 스타일 재작성
```

---

## Task A-3: MainStoryBanner 컴포넌트

**Files:**
- Create: `src/components/operation/MainStoryBanner.tsx`
- Create: `src/components/operation/__tests__/MainStoryBanner.test.tsx`

### Step 1: 테스트 작성

- 이벤트 데이터 있을 때 렌더링
- null일 때 렌더링 안 함
- 제목, 설명, 참가자 수, 개설일 표시
- CTA 버튼 클릭 핸들러

### Step 2: 컴포넌트 구현

디자인 문서 Section 2 기반:
- `hud-corners` 클래스
- `border-primary/40`, `shadow-[0_0_20px_rgba(0,212,255,0.15)]`, `bg-primary/5`
- `⚡ MAIN STORY // ACTIVE` hud-label
- 메타: `참가자 N/M · D-X · YYYY.MM.DD 개설`
- `[작전 참가 ▸]` primary 버튼

### Step 3: 커밋

```
feat: MainStoryBanner — 운영자 이벤트 LIVE 배너
```

---

## Task A-4: CreateOperationModal 컴포넌트

**Files:**
- Create: `src/components/operation/CreateOperationModal.tsx`
- Create: `src/components/operation/__tests__/CreateOperationModal.test.tsx`

### Step 1: 테스트 작성

- 모달 열림/닫힘
- 타입 선택 (작전 개시 / 다운타임 개설)
- 작전 개시: 아군/적군 진영 필드 표시
- 다운타임 개설: 참가자 초대 필드 표시
- 제목/설명 입력
- 제출 버튼 핸들러

### Step 2: 컴포넌트 구현

디자인 문서 Section 5 기반. 기존 `Modal` 컴포넌트 사용.
타입 선택에 따라 조건부 필드:
- OPERATION: 아군(본인 고정 + 1명 추가), 적군(1~2명), 캐릭터 검색은 향후 연동
- DOWNTIME: 참가자 초대 (선택 사항)

### Step 3: 커밋

```
feat: CreateOperationModal — 작전 생성 모달 (OPERATION/DOWNTIME)
```

---

## Task A-5: OperationHub 리팩터 + 페이지 통합

**Files:**
- Modify: `src/components/operation/OperationHub.tsx`
- Modify: `src/app/(dashboard)/operation/page.tsx`
- Modify: `src/components/operation/__tests__/OperationHub.test.tsx`
- Modify: `src/components/operation/__tests__/OperationPage.test.tsx`
- Modify: `src/app/(dashboard)/operation/__tests__/page.test.tsx`

### Step 1: OperationHub 리팩터

- 필터 라벨 변경: ALL/OPERATION/DOWNTIME + 전체/대기/LIVE/완료
- `+ 새 작전` 버튼 → CreateOperationModal 연결
- MainStoryBanner 상단 배치 (isMainStory 데이터가 있을 때만)
- 그리드: `lg:grid-cols-2` (모바일 1열, 데스크탑 2열)
- 헤더: `OPERATION // TACTICAL HUB` + 채널 수

### Step 2: page.tsx 업데이트

- DEV 토글 유지 (승인 상태)
- AccessDenied 유지
- 목 데이터 전달

### Step 3: 전체 테스트 통과 확인 + 커밋

```
feat: OperationHub 리팩터 — 도시어 카드 + MAIN STORY + 필터 + 생성 모달
```

---

## Task A-6: 빌드 + 전체 테스트 확인

```bash
cd apps/dashboard && npx vitest run
pnpm --filter @solaris/dashboard build
```

모든 기존 테스트 + 신규 테스트 통과 확인.

---

# Agent B: 전투 세션 (`feat/battle-session`)

## Task B-1: 전투 세션 타입 + 목 데이터

**Files:**
- Create: `src/components/operation/session/types.ts`
- Create: `src/components/operation/session/mock-session-data.ts`

세션 전용 타입:
```typescript
export type ActionType = "attack" | "disrupt" | "defend" | "support";
export type JudgmentGrade = "success" | "partial" | "fail";
export type TurnPhase = "my_turn" | "waiting" | "both_submitted" | "judging" | "result";

export interface BattleParticipant {
  id: string;
  name: string;
  faction: "bureau" | "static" | "defector";
  hp: { current: number; max: number };
  will: { current: number; max: number };
  abilities: BattleAbility[];
}

export interface BattleAbility {
  id: string;
  name: string;
  tier: "basic" | "mid" | "advanced";
  costHp: number;
  costWill: number;
}

export interface ChatMessage {
  id: string;
  type: "narration" | "judgment" | "system";
  sender?: string;
  content: string;
  timestamp: string;
  isMine?: boolean;
  judgment?: JudgmentResult;
}

export interface JudgmentResult {
  gradeA: JudgmentGrade;
  gradeB: JudgmentGrade;
  scores: { narrative: number; tactical: number; cost: number; quality: number };
  statChanges: StatChange[];
  narration: string;
}

export interface StatChange {
  participantId: string;
  stat: "hp" | "will";
  before: number;
  after: number;
  reason: string; // "코스트" | "피해"
}
```

목 데이터: 1v1 전투 3턴분 채팅 로그 + 판정 결과.

### 커밋
```
feat: 전투 세션 타입 + 목 채팅 로그 데이터
```

---

## Task B-2: StatBar (HP/WILL 미니 바)

**Files:**
- Create: `src/components/operation/session/StatBar.tsx`
- Create: `src/components/operation/session/__tests__/StatBar.test.tsx`

1v1/2v2 참가자별 HP 바 + 탭 시 WILL 확장.
팀별 그룹핑 (아군/적군).

### 커밋
```
feat: StatBar — 전투 세션 HP/WILL 미니 바
```

---

## Task B-3: ChatLog (채팅 로그)

**Files:**
- Create: `src/components/operation/session/ChatLog.tsx`
- Create: `src/components/operation/session/__tests__/ChatLog.test.tsx`

메시지 타입별 렌더링:
- `narration` (isMine=true → 우측, false → 좌측)
- `judgment` → 중앙 GM 판정 카드 (JudgmentCard)
- `system` → 중앙 시스템 메시지

### 커밋
```
feat: ChatLog — 전투 채팅 로그 (서술 말풍선 + GM 판정)
```

---

## Task B-4: JudgmentCard (GM 판정 카드)

**Files:**
- Create: `src/components/operation/session/JudgmentCard.tsx`
- Create: `src/components/operation/session/__tests__/JudgmentCard.test.tsx`

판정 등급 표시 (Success/Partial/Fail), 점수, 스탯 변동, 서사.
시안 보더 + HUD 스타일, `⚡ HELIOS COMBAT SYSTEM` 라벨.

### 커밋
```
feat: JudgmentCard — AI GM 판정 결과 카드
```

---

## Task B-5: ActionInput (행동 선언 + 서술 입력)

**Files:**
- Create: `src/components/operation/session/ActionInput.tsx`
- Create: `src/components/operation/session/__tests__/ActionInput.test.tsx`

4종 action_type 선택, 능력 드롭다운, 대상 선택, 코스트 프리뷰, 자유 서술 입력.
코스트 부족 시 제출 비활성화 + 경고.

### 커밋
```
feat: ActionInput — 행동 선언(attack/disrupt/defend/support) + 서술 입력
```

---

## Task B-6: BattleSession 메인 + 페이지

**Files:**
- Create: `src/components/operation/session/BattleSession.tsx`
- Create: `src/components/operation/session/index.ts`
- Create: `src/app/(dashboard)/operation/[id]/page.tsx`
- Create: `src/components/operation/session/__tests__/BattleSession.test.tsx`

상단바 + StatBar + ChatLog + ActionInput 통합.
턴 상태 관리 (useState). 목 데이터 기반.

### 커밋
```
feat: BattleSession — 전투 세션 메인 페이지 통합
```

---

## Task B-7: 빌드 + 전체 테스트

```bash
cd apps/dashboard && npx vitest run
pnpm --filter @solaris/dashboard build
```

---

# Agent C: DOWNTIME 채팅방 (`feat/downtime-room`)

## Task C-1: DOWNTIME 타입 + 목 데이터

**Files:**
- Create: `src/components/room/types.ts`
- Create: `src/components/room/mock-room-data.ts`

```typescript
export interface RoomParticipant {
  id: string;
  name: string;
}

export interface RoomMessage {
  id: string;
  type: "narration" | "system" | "narrative_request";
  sender?: RoomParticipant;
  content: string;
  timestamp: string;
  isMine?: boolean;
  narrativeRequest?: NarrativeRequest;
}

export interface NarrativeRequest {
  requesterId: string;
  rangeStart: string; // message id
  rangeEnd: string;
  votes: Record<string, "reflect" | "skip" | "pending">;
  totalParticipants: number;
  status: "voting" | "approved" | "rejected";
}
```

목 데이터: 3명 참가 RP 대화 + 서사 반영 요청 1건.

### 커밋
```
feat: DOWNTIME 채팅방 타입 + 목 데이터
```

---

## Task C-2: RoomChatLog (채팅 로그)

**Files:**
- Create: `src/components/room/RoomChatLog.tsx`
- Create: `src/components/room/__tests__/RoomChatLog.test.tsx`

메시지 타입별 렌더링:
- `narration`: 내 서술(우측) / 타인 서술(좌측, 이름 헤더)
- `system`: 중앙 시스템 메시지 (입장/퇴장/전투결과)
- `narrative_request`: 서사 반영 투표 카드

### 커밋
```
feat: RoomChatLog — DOWNTIME 채팅 로그
```

---

## Task C-3: NarrativeVoteCard (서사 반영 투표)

**Files:**
- Create: `src/components/room/NarrativeVoteCard.tsx`
- Create: `src/components/room/__tests__/NarrativeVoteCard.test.tsx`

투표 시스템 메시지 카드:
- 참가자별 투표 상태 (✔ 반영 / ✖ 미반영 / 대기중)
- 미투표 시 [✔ 반영] [✖ 미반영] 버튼
- 전원 반영 → 성공 메시지
- 1명 미반영 → 취소 메시지

### 커밋
```
feat: NarrativeVoteCard — 서사 반영 건별 투표 UI
```

---

## Task C-4: DowntimeRoom 메인 + 페이지

**Files:**
- Create: `src/components/room/DowntimeRoom.tsx`
- Create: `src/components/room/index.ts`
- Create: `src/app/(dashboard)/room/[id]/page.tsx`
- Create: `src/components/room/__tests__/DowntimeRoom.test.tsx`

상단바(방 제목, 참가자 수, 메뉴) + RoomChatLog + 입력 영역.
입력 영역: 텍스트 입력 + [서사반영] + [⚔ 전투전환] 버튼.

### 커밋
```
feat: DowntimeRoom — DOWNTIME 채팅방 메인 페이지
```

---

## Task C-5: 빌드 + 전체 테스트

```bash
cd apps/dashboard && npx vitest run
pnpm --filter @solaris/dashboard build
```

---

# 검증 체크리스트

각 에이전트 작업 완료 후:

- [ ] `npx vitest run` 전체 통과
- [ ] `pnpm --filter @solaris/dashboard build` 성공
- [ ] 기존 테스트 깨지지 않음
- [ ] 디자인 문서와 용어/레이아웃 일치 확인
