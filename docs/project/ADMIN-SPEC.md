# PROJECT SOLARIS - 관리자 패널 상세 스펙

## 개요

### 기술 스택
- **프레임워크**: Next.js 15 App Router
- **스타일링**: Tailwind CSS v4
- **UI 우선순위**: 데스크탑 우선 (일반 서비스는 모바일 퍼스트)
- **타입 안전성**: TypeScript 5.x

### 디자인 시스템

```css
/* 색상 팔레트 - 다크 SF 터미널 */
--bg-primary: #0a0a0f;        /* 메인 배경 */
--bg-secondary: #131318;      /* 카드 배경 */
--bg-tertiary: #1a1a22;       /* 호버 상태 */
--primary: #00d4ff;           /* 시안 - 주요 액션 */
--primary-dim: #0099bb;       /* 시안 어둡게 */
--accent: #dc2626;            /* 레드 - 경고/삭제 */
--text-primary: #e5e7eb;      /* 메인 텍스트 */
--text-secondary: #9ca3af;    /* 보조 텍스트 */
--text-tertiary: #6b7280;     /* 비활성 텍스트 */
--border: #27272a;            /* 테두리 */
--success: #10b981;           /* 승인 */
--warning: #f59e0b;           /* 주의 */
```

### 접근 권한
- **인증 체크**: Middleware 레벨에서 `/admin/*` 라우트 보호
- **권한 조건**: `users.role = 'admin'`
- **실패 처리**: 
  - 미인증 유저 → `/login?redirect=/admin`
  - 권한 없음 → `403` 에러 페이지 또는 메인 페이지로 리다이렉트

---

## 공통 컴포넌트

### Layout (`/admin/layout.tsx`)

**구조:**
```
┌─────────────────────────────────────────┐
│  Sidebar (240px)   │   Main Content     │
│                    │                    │
│  • Dashboard       │   Page Content     │
│  • Characters      │                    │
│  • News            │                    │
│  • Battles         │                    │
│  • RP Rooms        │                    │
│  • Users           │                    │
│  • Settings        │                    │
│                    │                    │
│  [Admin Name]      │                    │
│  [Logout]          │                    │
└─────────────────────────────────────────┘
```

**컴포넌트:**
- `<AdminSidebar />`: 네비게이션 메뉴 + 현재 관리자 정보
- `<AdminHeader />`: 페이지 제목 + Breadcrumb
- `<AdminShell />`: 전체 레이아웃 래퍼

**상태 관리:**
- 사이드바 collapsed 상태 (localStorage)
- 현재 경로 하이라이트

---

## 1. 시즌 대시보드 (`/admin/dashboard`)

### 화면 목적
시즌 전체 현황을 한눈에 파악하고, 시즌 시작/종료 등 핵심 운영 작업을 수행하는 허브 화면.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  SEASON 1: GENESIS                      [시즌 종료]     │
│  2025-01-01 ~ 진행 중                                   │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ 활성 유저  │  │ 승인 캐릭터│  │ 진행 전투 │          │
│  │   247     │  │    189    │  │    12     │          │
│  │  +12 ↑   │  │  +8 ↑     │  │   -3 ↓    │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ 완료 전투  │  │ 활성 RP방 │  │ 뉴스 발행 │          │
│  │   143     │  │    28     │  │    56     │          │
│  └───────────┘  └───────────┘  └───────────┘          │
├─────────────────────────────────────────────────────────┤
│  캐릭터 팩션 분포                                        │
│  ┌─────────────────────────────────────┐              │
│  │         [파이 차트]                  │              │
│  │  Helios: 45% (85명)                 │              │
│  │  Aegis: 35% (66명)                  │              │
│  │  Neutral: 20% (38명)                │              │
│  └─────────────────────────────────────┘              │
├─────────────────────────────────────────────────────────┤
│  평균 WILL 잔량 (팩션별)                                 │
│  Helios:  ████████░░  82/100                          │
│  Aegis:   ███████░░░  71/100                          │
│  Neutral: █████░░░░░  54/100                          │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<SeasonHeader />`: 시즌 정보 + 시작/종료 버튼
- `<StatCard />`: 개별 통계 카드 (6개)
- `<FactionPieChart />`: Recharts 또는 Chart.js 기반 파이차트
- `<WillBarChart />`: 팩션별 평균 WILL 막대 그래프

### 상태 관리

```typescript
interface DashboardState {
  season: {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    status: 'active' | 'ended';
  };
  stats: {
    activeUsers: number;
    approvedCharacters: number;
    activeBattles: number;
    completedBattles: number;
    activeRooms: number;
    publishedNews: number;
  };
  factionDistribution: {
    helios: number;
    aegis: number;
    neutral: number;
  };
  averageWill: {
    helios: number;
    aegis: number;
    neutral: number;
  };
}
```

**데이터 흐름:**
1. 페이지 마운트 → `useDashboardStats()` 훅으로 데이터 페칭
2. SWR/React Query로 5분마다 자동 갱신
3. 시즌 종료 버튼 클릭 → 확인 모달 → API 호출 → 페이지 새로고침

### 관련 API 엔드포인트

```typescript
// GET /api/admin/dashboard/stats
// Response: DashboardState

// POST /api/admin/seasons
// Body: { name, startDate }
// Response: { success, seasonId }

// PATCH /api/admin/seasons/:id/end
// Response: { success }
```

### 사용자 인터랙션 플로우

1. **대시보드 진입**
   - 통계 데이터 로딩 (스켈레톤 UI)
   - 차트 애니메이션 (0.5초)

2. **시즌 종료 시나리오**
   ```
   [시즌 종료] 클릭
   → 확인 모달: "시즌을 종료하시겠습니까? 이 작업은 되돌릴 수 없습니다."
   → [취소] / [종료]
   → API 호출 중 로딩 스피너
   → 성공 토스트: "시즌 1이 종료되었습니다."
   → 대시보드 새로고침
   ```

3. **새 시즌 시작 시나리오**
   ```
   [새 시즌 시작] 버튼 (현재 시즌 없을 때만 표시)
   → 모달: 시즌 이름, 시작일 입력
   → [생성]
   → 성공 후 대시보드 갱신
   ```

---

## 2. 캐릭터 승인 큐 (`/admin/characters`)

### 화면 목적
제출된 캐릭터를 검토하고 승인/반려하는 워크플로우 화면. 시즌 운영의 핵심 게이트키퍼 역할.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  캐릭터 승인 큐                [필터: 전체 ▼]            │
├─────────────────────────────────────────────────────────┤
│  대기 중: 12건 | 수정 요청: 3건                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐       │
│  │ [프로필]  이름: 카엘 라이트블레이드             │       │
│  │  이미지   팩션: Helios  |  능력: 광속 조작      │       │
│  │           제출: 2025-01-15 14:23              │       │
│  │           상태: [pending]                     │       │
│  │                           [상세보기] [승인] [반려] │  │
│  └──────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────┐       │
│  │ [프로필]  이름: 에밀리 스트라이크               │       │
│  │  이미지   팩션: Aegis  |  능력: 전기 제어       │       │
│  │           제출: 2025-01-15 11:08              │       │
│  │           상태: [revision] "능력 코스트 재조정"│       │
│  │                           [상세보기] [승인] [반려] │  │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘

// 캐릭터 상세 모달
┌─────────────────────────────────────────────────────────┐
│  캐릭터 시트                                    [X]      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  카엘 라이트블레이드                        │
│  │ 프로필   │  팩션: Helios                              │
│  │ 이미지   │  능력 계열: 광속 조작                       │
│  └─────────┘  HP: 100  |  WILL: 100                     │
├─────────────────────────────────────────────────────────┤
│  능력                                                    │
│  ┌─────────────────────────────────────────────┐       │
│  │ [기본기] 빛의 검                              │       │
│  │ 코스트: 5 WILL  |  타입: 공격                │       │
│  │ 광속으로 형성한 검으로 베어낸다.              │       │
│  │ 약점: 어둠 속성 방어막에 무력화              │       │
│  └─────────────────────────────────────────────┘       │
│  [중급기] ... [상급기] ...                              │
├─────────────────────────────────────────────────────────┤
│  배경 서사                                               │
│  "카엘은 Helios의 전사로, 빛의 수호자를 자처한다..."   │
├─────────────────────────────────────────────────────────┤
│  제출 이력                                               │
│  • 2025-01-15 14:23 - 최초 제출                        │
│  • 2025-01-14 09:12 - 반려 (능력 불균형)               │
├─────────────────────────────────────────────────────────┤
│              [반려하기]          [승인하기]             │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<CharacterQueueCard />`: 대기열 카드 (목록 아이템)
- `<CharacterSheetModal />`: 전체 캐릭터 시트 모달
- `<ApprovalButton />`: 승인 버튼 (확인 필요)
- `<RejectButton />`: 반려 버튼 (사유 입력 필요)
- `<RejectReasonModal />`: 반려 사유 입력 모달

### 상태 관리

```typescript
interface CharacterQueueItem {
  id: string;
  name: string;
  faction: 'helios' | 'aegis' | 'neutral';
  powerType: string;
  status: 'pending' | 'revision';
  submittedAt: string;
  userId: string;
  profileImage?: string;
}

interface CharacterSheet extends CharacterQueueItem {
  hp: number;
  will: number;
  abilities: Ability[];
  merits?: Merit[];  // 비능력자인 경우
  background: string;
  history: SubmissionHistory[];
}

interface Ability {
  name: string;
  tier: 'basic' | 'intermediate' | 'advanced';
  cost: number;
  type: 'attack' | 'defense' | 'support' | 'utility';
  description: string;
  weakness: string;
}
```

**데이터 흐름:**
1. 목록 페칭 → SWR로 캐싱
2. 카드 클릭 → 상세 데이터 페칭 (별도 API)
3. 승인/반려 → Optimistic Update + API 호출
4. Discord 알림 트리거 (서버 사이드)

### 관련 API 엔드포인트

```typescript
// GET /api/admin/characters/queue
// Query: ?status=pending|revision
// Response: { characters: CharacterQueueItem[] }

// GET /api/admin/characters/:id
// Response: { character: CharacterSheet }

// POST /api/admin/characters/:id/approve
// Response: { success, notificationSent: boolean }

// POST /api/admin/characters/:id/reject
// Body: { reason: string }
// Response: { success, notificationSent: boolean }
```

**Discord 알림 페이로드:**
```typescript
// 승인 시
DM to user: "🎉 캐릭터 '${name}'이(가) 승인되었습니다! 이제 RP를 시작할 수 있습니다."

// 반려 시
DM to user: "❌ 캐릭터 '${name}'이(가) 반려되었습니다.\n사유: ${reason}\n수정 후 재제출하세요: ${link}"
```

### 사용자 인터랙션 플로우

1. **캐릭터 검토 플로우**
   ```
   대기열 확인
   → 카드 클릭
   → 모달에서 시트 전체 검토
     - 능력 밸런스 확인
     - 약점이 적절한지 확인
     - 서사가 세계관에 부합하는지 확인
   → 판단
   ```

2. **승인 시나리오**
   ```
   [승인하기] 클릭
   → 확인 모달: "이 캐릭터를 승인하시겠습니까?"
   → [확인]
   → 로딩 (Discord 알림 발송 중)
   → 성공 토스트: "카엘 라이트블레이드가 승인되었습니다."
   → 모달 닫힘, 목록에서 제거 (Optimistic)
   ```

3. **반려 시나리오**
   ```
   [반려하기] 클릭
   → 사유 입력 모달:
     "반려 사유를 입력하세요 (플레이어에게 전달됩니다)"
     [Textarea: 최소 20자]
     [취소] [반려]
   → [반려] (사유 입력 후)
   → 로딩
   → 성공 토스트: "반려 처리 완료. 수정 요청이 전달되었습니다."
   → 모달 닫힘, 상태 업데이트
   ```

4. **이력 조회**
   - 캐릭터 시트 모달 하단에 제출/반려 이력 타임라인
   - 반복 반려 시 주의 표시

---

## 3. 캐릭터 관리 (`/admin/characters/all`)

### 화면 목적
승인된 캐릭터를 포함한 전체 캐릭터 데이터베이스를 관리하고, 밸런스 조정 및 삭제 작업 수행.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  전체 캐릭터 관리                                        │
├─────────────────────────────────────────────────────────┤
│  [검색: 이름 입력...]  [팩션 ▼] [상태 ▼] [능력 계열 ▼] │
├─────────────────────────────────────────────────────────┤
│  총 189개 캐릭터 (Helios: 85 | Aegis: 66 | Neutral: 38) │
├─────────────────────────────────────────────────────────┤
│  이름              팩션    상태      WILL  마지막 활동    │
│  ──────────────────────────────────────────────────────│
│  카엘 라이트...    Helios  approved  82   2025-01-15   │
│                                        [보기] [수정] [삭제]│
│  ──────────────────────────────────────────────────────│
│  에밀리 스트...    Aegis   approved  71   2025-01-14   │
│                                        [보기] [수정] [삭제]│
│  ──────────────────────────────────────────────────────│
│  ...                                                    │
└─────────────────────────────────────────────────────────┘

// 수정 모달
┌─────────────────────────────────────────────────────────┐
│  캐릭터 수정: 카엘 라이트블레이드               [X]      │
├─────────────────────────────────────────────────────────┤
│  기본 정보                                               │
│  이름: [카엘 라이트블레이드]                            │
│  팩션: [Helios ▼]                                       │
│  HP: [100]  WILL: [82]                                  │
├─────────────────────────────────────────────────────────┤
│  능력 (밸런스 조정)                                      │
│  [기본기] 빛의 검                                        │
│  코스트: [5] WILL  (원래: 5)                            │
│  타입: [공격 ▼]                                         │
│  설명: [...]                                            │
│  약점: [...]                                            │
│  ──────────────────────────────────────────            │
│  [중급기] ...                                           │
├─────────────────────────────────────────────────────────┤
│  수정 사유 (선택):                                       │
│  [밸런스 패치: 기본기 코스트 조정]                      │
├─────────────────────────────────────────────────────────┤
│              [취소]                [저장]               │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<CharacterTable />`: 페이지네이션 지원 테이블
- `<CharacterFilters />`: 필터 UI (팩션, 상태, 능력 계열)
- `<CharacterEditModal />`: 수정 폼 모달
- `<DeleteConfirmModal />`: Soft delete 확인 모달

### 상태 관리

```typescript
interface CharacterListState {
  characters: Character[];
  filters: {
    search: string;
    faction: 'all' | 'helios' | 'aegis' | 'neutral';
    status: 'all' | 'pending' | 'approved' | 'rejected';
    powerType: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sort: {
    field: 'name' | 'faction' | 'will' | 'lastActive';
    order: 'asc' | 'desc';
  };
}
```

**데이터 흐름:**
1. 필터/검색 변경 → URL 쿼리 파라미터 업데이트 → API 재요청
2. 수정 → Optimistic Update → API 호출 → 성공/실패 처리
3. 삭제 → 확인 → API 호출 → 목록에서 제거

### 관련 API 엔드포인트

```typescript
// GET /api/admin/characters
// Query: ?page=1&pageSize=20&faction=helios&status=approved&search=카엘
// Response: { characters: Character[], total: number }

// PATCH /api/admin/characters/:id
// Body: Partial<Character> + { editReason?: string }
// Response: { success, character: Character }

// DELETE /api/admin/characters/:id (Soft delete)
// Response: { success }
```

### 사용자 인터랙션 플로우

1. **검색 및 필터링**
   ```
   검색어 입력 (디바운스 500ms)
   → URL 업데이트 (?search=카엘)
   → API 재요청
   → 결과 업데이트
   
   팩션 필터 선택
   → URL 업데이트 (?faction=helios)
   → API 재요청
   ```

2. **캐릭터 수정**
   ```
   [수정] 클릭
   → 수정 모달 열림 (현재 데이터 프리필)
   → 능력 코스트 변경 (5 → 7)
   → 수정 사유 입력 (선택)
   → [저장]
   → Optimistic Update (테이블 즉시 반영)
   → API 호출
   → 성공 토스트: "캐릭터가 수정되었습니다."
   → 모달 닫힘
   ```

3. **캐릭터 삭제 (Soft delete)**
   ```
   [삭제] 클릭
   → 확인 모달: "이 캐릭터를 삭제하시겠습니까? (복구 가능)"
   → [삭제]
   → API 호출
   → 성공 후 테이블에서 제거
   → 토스트: "캐릭터가 삭제되었습니다."
   ```

4. **밸런스 조정 워크플로우**
   - 관리자가 특정 능력이 OP라고 판단
   - 수정 모달에서 코스트 상향 (5 → 8)
   - 수정 사유: "밸런스 패치 v1.2"
   - 저장 시 해당 캐릭터의 플레이어에게 Discord DM 발송 (선택적)

---

## 4. 뉴스 관리 (`/admin/news`)

### 화면 목적
게임 내 뉴스(BULLETIN)를 작성, 편집, 발행하는 CMS. 자동 생성된 뉴스 검토 + 수동 작성 지원.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  뉴스 관리                           [+ 새 뉴스 작성]    │
├─────────────────────────────────────────────────────────┤
│  [전체] [초안] [발행됨]          [검색...]              │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐       │
│  │ BULLETIN-042  [draft]                        │       │
│  │ "Helios 요원, 3구역 전투에서 승리"            │       │
│  │ 자동 생성 • 2025-01-15 18:32                 │       │
│  │                    [미리보기] [수정] [발행] [삭제] │ │
│  └──────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────┐       │
│  │ BULLETIN-041  [published]                    │       │
│  │ "Aegis, 신규 방어 시스템 가동"                │       │
│  │ 수동 작성 • 2025-01-14 09:00                 │       │
│  │                    [보기] [수정] [삭제]            │ │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘

// 뉴스 작성/수정 모달
┌─────────────────────────────────────────────────────────┐
│  새 뉴스 작성                                   [X]      │
├─────────────────────────────────────────────────────────┤
│  BULLETIN 번호: [자동 채번: 043]                        │
│  제목: [________________________________]              │
│  태그: [전투] [Helios] [+추가]                          │
├─────────────────────────────────────────────────────────┤
│  본문 (Markdown 지원):                                  │
│  ┌─────────────────────────────────────────────┐       │
│  │                                              │       │
│  │  [Rich Text Editor 또는 Markdown Editor]    │       │
│  │                                              │       │
│  │                                              │       │
│  └─────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│  미리보기:                                               │
│  [렌더링된 뉴스 카드 프리뷰]                            │
├─────────────────────────────────────────────────────────┤
│  발행 시 Discord 알림 전송: [✓]                         │
├─────────────────────────────────────────────────────────┤
│        [임시저장]        [발행하기]                     │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<NewsList />`: 뉴스 목록 (카드 형식)
- `<NewsEditor />`: 작성/수정 모달 (Markdown 에디터)
- `<NewsPreview />`: 실시간 프리뷰
- `<PublishButton />`: 발행 버튼 (Discord 알림 옵션 포함)

### 상태 관리

```typescript
interface News {
  id: string;
  bulletinNumber: number;  // BULLETIN-042
  title: string;
  content: string;  // Markdown
  tags: string[];
  status: 'draft' | 'published';
  type: 'auto' | 'manual';
  battleId?: string;  // 자동 생성 뉴스인 경우
  createdAt: string;
  publishedAt?: string;
}

interface NewsEditorState {
  title: string;
  content: string;
  tags: string[];
  sendDiscordNotification: boolean;
}
```

**데이터 흐름:**
1. 목록 페칭 → 상태별 탭으로 필터링
2. 작성 → 임시저장(draft) 또는 즉시 발행
3. 발행 → status='published' + Discord 알림 (옵션)
4. 자동 생성 뉴스 → 전투 종료 시 서버 사이드에서 draft 생성 → 관리자 검토 후 발행

### 관련 API 엔드포인트

```typescript
// GET /api/admin/news
// Query: ?status=draft|published
// Response: { news: News[] }

// POST /api/admin/news
// Body: { title, content, tags }
// Response: { success, news: News }

// PATCH /api/admin/news/:id
// Body: Partial<News>
// Response: { success, news: News }

// POST /api/admin/news/:id/publish
// Body: { sendDiscordNotification: boolean }
// Response: { success, notificationSent: boolean }

// DELETE /api/admin/news/:id
// Response: { success }
```

**Discord 알림 페이로드:**
```typescript
// 뉴스 발행 시 (공개 채널)
Channel message: 
"📰 **새 뉴스가 발행되었습니다!**
BULLETIN-042: Helios 요원, 3구역 전투에서 승리
[자세히 보기](https://solaris.com/news/042)"
```

### 사용자 인터랙션 플로우

1. **수동 뉴스 작성**
   ```
   [+ 새 뉴스 작성] 클릭
   → 에디터 모달 열림
   → BULLETIN 번호 자동 채번 (043)
   → 제목 입력: "Aegis 본부, 신규 요원 모집 시작"
   → 본문 작성 (Markdown)
   → 태그 추가: [Aegis] [모집]
   → 실시간 프리뷰 확인
   → [발행하기]
   → Discord 알림 옵션 체크 확인
   → 로딩
   → 성공 토스트: "BULLETIN-043이 발행되었습니다."
   → 모달 닫힘, 목록 갱신
   ```

2. **자동 생성 뉴스 검토**
   ```
   Draft 탭 클릭
   → 자동 생성 뉴스 목록 확인
   → BULLETIN-042 [미리보기] 클릭
   → 모달에서 내용 검토
     - AI가 전투 로그 기반으로 생성한 기사
     - "Helios 요원 카엘이 Aegis 요원 에밀리를 물리쳤다..."
   → 내용 수정 필요 → [수정]
   → 문구 다듬기
   → [발행하기]
   ```

3. **발행된 뉴스 수정**
   ```
   Published 탭 → BULLETIN-041 [수정] 클릭
   → 에디터에서 오타 수정
   → [저장] (status는 published 유지)
   → 토스트: "뉴스가 수정되었습니다."
   ```

4. **뉴스 삭제**
   ```
   [삭제] 클릭
   → 확인 모달: "이 뉴스를 삭제하시겠습니까?"
   → [삭제]
   → 목록에서 제거
   ```

---

## 5. GM 바이어스 설정 (`/admin/settings/gm`)

### 화면 목적
AI GM의 판정에 적용되는 Helios 편향 수치를 조정하여 시즌 진행에 따라 스토리 흐름을 제어.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  GM 바이어스 설정                                        │
├─────────────────────────────────────────────────────────┤
│  Helios Bias                                            │
│  현재: +15%                                             │
│                                                         │
│  0% ──────●─────────────────────────── 50%            │
│  중립      ↑ 현재                         노골적         │
│                                                         │
│  권장 설정:                                             │
│  • 시즌 초반: +5%  (중립에 가깝게)                      │
│  • 시즌 중반: +15% (현재 설정)                          │
│  • 시즌 후반: +25~50% (스토리 가속)                    │
├─────────────────────────────────────────────────────────┤
│  설명:                                                   │
│  Helios Bias가 높을수록 AI GM이 전투 판정 시 Helios   │
│  진영에 유리하게 판정합니다. 0%는 완전 중립, 50%는     │
│  매우 노골적인 편향입니다.                              │
│                                                         │
│  ⚠️ 주의: 너무 높은 바이어스는 플레이어 불만을 초래할  │
│  수 있습니다. 시즌 후반에만 사용하세요.                │
├─────────────────────────────────────────────────────────┤
│  변경 이력                                               │
│  • 2025-01-15 10:30 - 15% (김관리자) "시즌 중반 진입"  │
│  • 2025-01-10 09:00 - 10% (김관리자)                   │
│  • 2025-01-01 00:00 - 5%  (시스템) "시즌 시작"        │
├─────────────────────────────────────────────────────────┤
│  변경 사유 (선택):                                       │
│  [시즌 중반 돌입, Helios 약세 보정]                     │
│                                                         │
│              [취소]                [저장]               │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<BiasSlider />`: Range input 슬라이더 (0~50)
- `<BiasHistory />`: 변경 이력 타임라인
- `<BiasRecommendations />`: 단계별 권장 설정 가이드

### 상태 관리

```typescript
interface GMBiasSetting {
  currentBias: number;  // 0~50
  history: BiasChangeLog[];
}

interface BiasChangeLog {
  id: string;
  bias: number;
  changedBy: string;  // 관리자 이름
  reason?: string;
  timestamp: string;
}
```

**데이터 흐름:**
1. 페이지 마운트 → 현재 바이어스 + 이력 페칭
2. 슬라이더 조작 → 로컬 상태 업데이트 (즉시 반영 안 함)
3. [저장] 클릭 → API 호출 → AI GM 프롬프트 업데이트
4. 이력 로그에 추가

### 관련 API 엔드포인트

```typescript
// GET /api/admin/settings/gm-bias
// Response: { bias: number, history: BiasChangeLog[] }

// POST /api/admin/settings/gm-bias
// Body: { bias: number, reason?: string }
// Response: { success, bias: number }
```

**AI GM 프롬프트 적용:**
```typescript
// 전투 판정 시 시스템 프롬프트에 삽입
`Current Helios Bias: ${bias}%
When making judgments, slightly favor Helios faction by this percentage.
This should be subtle and maintain gameplay fairness.`
```

### 사용자 인터랙션 플로우

1. **바이어스 조정**
   ```
   설정 페이지 진입
   → 현재 바이어스 확인 (15%)
   → 슬라이더 조작 (15% → 25%)
   → 하단 안내 텍스트 업데이트: "시즌 후반 권장"
   → 변경 사유 입력: "Helios 연패 보정"
   → [저장]
   → 확인 모달: "바이어스를 25%로 변경하시겠습니까? 즉시 모든 전투에 적용됩니다."
   → [확인]
   → API 호출
   → 성공 토스트: "GM 바이어스가 25%로 변경되었습니다."
   → 이력에 추가됨
   ```

2. **이력 조회**
   - 페이지 하단 타임라인 스크롤
   - 각 변경 시점의 바이어스 값 + 사유 확인
   - 관리자별 변경 패턴 파악

3. **권장 설정 참고**
   - 우측 "권장 설정" 패널 확인
   - 현재 시즌 진행도에 따른 가이드 제공

### 5.1 AI 모델 정책 (`/admin/settings/ai-models`)

### 화면 목적
기능별 고정 AI 모델 라우팅을 운영 중단 없이 조정하고, 변경 이력을 감사 가능하게 관리.

### 관련 API 엔드포인트

```typescript
// GET /api/admin/settings/ai-model-routing
// Response: { routing, allowed_models }

// PUT /api/admin/settings/ai-model-routing
// Body: { version: number, routes, reason?: string }
// Response: { success: true, routing }
```

### 운영 가드레일

- 기능 키 고정: `main_story`, `battle_judgment`, `lore_reflection`, `news_generation`
- allowlist 외 모델 저장 금지
- fallback에 primary 중복 금지
- 버전 충돌(409) 시 최신값 재조회 후 저장

---

## 6. 전투 관리 (`/admin/battles`)

### 화면 목적
진행 중이거나 완료된 모든 전투를 모니터링하고, 필요 시 개입(중단, 판정 오버라이드).

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  전투 관리                                               │
├─────────────────────────────────────────────────────────┤
│  [전체] [진행 중] [완료] [중단됨]                        │
├─────────────────────────────────────────────────────────┤
│  ID     참여자               상태       시작 시간    액션 │
│  ──────────────────────────────────────────────────────│
│  #1234  카엘 vs 에밀리       진행중     15:23       [보기]│
│         (Helios vs Aegis)                    [중단] [관여]│
│  ──────────────────────────────────────────────────────│
│  #1233  제인 vs AI           완료       14:10       [보기]│
│         (Neutral vs NPC)     승리                        │
│  ──────────────────────────────────────────────────────│
│  ...                                                    │
└─────────────────────────────────────────────────────────┘

// 전투 상세 모달
┌─────────────────────────────────────────────────────────┐
│  전투 #1234: 카엘 vs 에밀리                     [X]      │
├─────────────────────────────────────────────────────────┤
│  상태: 진행 중 (3턴째)                                  │
│  시작: 2025-01-15 15:23                                │
│  장소: 3구역 폐허                                       │
├─────────────────────────────────────────────────────────┤
│  참여자:                                                │
│  • 카엘 (Helios) - HP: 85/100, WILL: 60/100           │
│  • 에밀리 (Aegis) - HP: 70/100, WILL: 55/100          │
├─────────────────────────────────────────────────────────┤
│  전투 로그:                                             │
│  ┌─────────────────────────────────────────────┐       │
│  │ [턴 1] 카엘: "빛의 검" 사용 (5 WILL)          │       │
│  │   → GM 판정: 명중. 에밀리 20 HP 피해          │       │
│  │                                              │       │
│  │ [턴 2] 에밀리: "전기 충격" 사용 (7 WILL)      │       │
│  │   → GM 판정: 적중. 카엘 15 HP 피해            │       │
│  │                                              │       │
│  │ [턴 3] 카엘: "광속 돌진" 사용 (10 WILL)       │       │
│  │   → GM 판정: 회피 실패. 에밀리 30 HP 피해     │       │
│  └─────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│  관리자 개입 (긴급 상황용)                              │
│  판정 오버라이드: [턴 선택 ▼] [새 판정 입력...]        │
│  전투 강제 종료: [중단하기]                             │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<BattleTable />`: 전투 목록 테이블
- `<BattleDetailModal />`: 전투 상세 + 로그 뷰어
- `<BattleLog />`: 턴별 액션 로그 (읽기 전용)
- `<AdminInterventionPanel />`: 관리자 개입 UI (극단적 상황용)

### 상태 관리

```typescript
interface Battle {
  id: string;
  participants: BattleParticipant[];
  status: 'ongoing' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt?: string;
  location: string;
  currentTurn: number;
  winner?: string;
}

interface BattleParticipant {
  characterId: string;
  characterName: string;
  faction: string;
  currentHp: number;
  maxHp: number;
  currentWill: number;
  maxWill: number;
}

interface BattleTurn {
  turnNumber: number;
  actorId: string;
  action: string;
  gmJudgment: string;
  result: string;
  timestamp: string;
}
```

**데이터 흐름:**
1. 목록 페칭 → 상태별 필터링
2. 상세 모달 → 실시간 업데이트 (WebSocket 또는 폴링)
3. 강제 중단 → API 호출 → 전투 상태 'cancelled'로 변경
4. 판정 오버라이드 → 특정 턴의 GM 판정을 수동으로 변경

### 관련 API 엔드포인트

```typescript
// GET /api/admin/battles
// Query: ?status=ongoing|completed|cancelled
// Response: { battles: Battle[] }

// GET /api/admin/battles/:id
// Response: { battle: Battle, log: BattleTurn[] }

// POST /api/admin/battles/:id/cancel
// Body: { reason: string }
// Response: { success }

// POST /api/admin/battles/:id/override-judgment
// Body: { turnNumber: number, newJudgment: string }
// Response: { success }
```

### 사용자 인터랙션 플로우

1. **전투 모니터링**
   ```
   전투 관리 페이지 진입
   → [진행 중] 탭 클릭
   → 실시간 전투 12건 확인
   → #1234 [보기] 클릭
   → 전투 로그 확인 (3턴째 진행 중)
   → 특이사항 없음 → 모달 닫기
   ```

2. **전투 강제 중단 (긴급 상황)**
   ```
   전투 #1234에서 플레이어가 버그 악용 의심
   → [중단] 클릭
   → 확인 모달: "이 전투를 강제 종료하시겠습니까?"
   → 사유 입력: "버그 악용 의심, 재심 필요"
   → [중단하기]
   → API 호출
   → 전투 상태 'cancelled'로 변경
   → 참여자들에게 Discord DM 발송: "전투가 관리자에 의해 중단되었습니다."
   ```

3. **판정 오버라이드 (극단적 상황)**
   ```
   전투 로그 검토 중 GM 판정 오류 발견
   → 턴 2에서 "명중"으로 판정되었으나, 명백히 회피 가능한 상황
   → [턴 2 선택]
   → 새 판정 입력: "에밀리가 전기 장막으로 카엘의 공격을 회피했다."
   → [적용]
   → 확인 모달: "이 판정을 수정하시겠습니까? 전투 결과에 영향을 줄 수 있습니다."
   → [확인]
   → 로그 업데이트
   → 참여자들에게 알림: "관리자가 판정을 수정했습니다."
   ```

---

## 7. RP방 관리 (`/admin/rooms`)

### 화면 목적
유저들이 생성한 RP(롤플레이) 방을 관리하고, 부적절한 콘텐츠 모니터링 및 강제 종료.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  RP방 관리                                               │
├─────────────────────────────────────────────────────────┤
│  [활성] [아카이브]                    [검색: 방 이름...] │
├─────────────────────────────────────────────────────────┤
│  총 28개 활성 방                                         │
├─────────────────────────────────────────────────────────┤
│  방 이름          참여자       메시지   생성일      액션  │
│  ──────────────────────────────────────────────────────│
│  3구역 카페       카엘, 에밀리  127    2025-01-15  [보기]│
│                                              [로그] [종료]│
│  ──────────────────────────────────────────────────────│
│  Helios 본부      제인, 루크   89     2025-01-14  [보기]│
│                                              [로그] [종료]│
│  ──────────────────────────────────────────────────────│
│  ...                                                    │
└─────────────────────────────────────────────────────────┘

// RP방 로그 모달
┌─────────────────────────────────────────────────────────┐
│  RP방 로그: 3구역 카페                          [X]      │
├─────────────────────────────────────────────────────────┤
│  참여자: 카엘 (Helios), 에밀리 (Aegis)                 │
│  생성: 2025-01-15 12:30                                │
│  메시지 수: 127                                         │
├─────────────────────────────────────────────────────────┤
│  메시지 로그:                                           │
│  ┌─────────────────────────────────────────────┐       │
│  │ [12:35] 카엘: "커피 한 잔 주세요."            │       │
│  │ [12:36] 에밀리: "여긴 위험한 구역이에요."     │       │
│  │ [12:37] 카엘: "알고 있어요. 하지만..."       │       │
│  │ ...                                          │       │
│  └─────────────────────────────────────────────┘       │
│                                        [↓ 더 보기]      │
├─────────────────────────────────────────────────────────┤
│  ⚠️ 부적절한 내용 발견 시:                              │
│  [신고 내용 입력...]                    [경고 발송]     │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<RoomTable />`: RP방 목록 테이블
- `<RoomLogModal />`: 메시지 로그 뷰어
- `<ArchiveButton />`: 강제 아카이브(종료) 버튼
- `<WarningPanel />`: 부적절한 콘텐츠 대응 UI

### 상태 관리

```typescript
interface RPRoom {
  id: string;
  name: string;
  participants: string[];  // 캐릭터 이름 배열
  messageCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  lastActivityAt: string;
}

interface RPMessage {
  id: string;
  roomId: string;
  characterId: string;
  characterName: string;
  content: string;
  timestamp: string;
}
```

**데이터 흐름:**
1. 목록 페칭 → 활성/아카이브 탭으로 필터링
2. 로그 모달 → 메시지 페이지네이션 (최신 50개씩)
3. 강제 종료 → status='archived', 참여자들에게 알림

### 관련 API 엔드포인트

```typescript
// GET /api/admin/rooms
// Query: ?status=active|archived
// Response: { rooms: RPRoom[] }

// GET /api/admin/rooms/:id/messages
// Query: ?page=1&limit=50
// Response: { messages: RPMessage[], total: number }

// POST /api/admin/rooms/:id/archive
// Body: { reason?: string }
// Response: { success }
```

### 사용자 인터랙션 플로우

1. **RP방 모니터링**
   ```
   RP방 관리 페이지 진입
   → 활성 방 목록 확인
   → "3구역 카페" [로그] 클릭
   → 메시지 로그 스크롤
   → 특이사항 없음 → 모달 닫기
   ```

2. **부적절한 콘텐츠 발견**
   ```
   로그 검토 중 욕설/혐오 발언 발견
   → 신고 내용 입력: "혐오 발언 포함"
   → [경고 발송] 클릭
   → 해당 참여자들에게 Discord DM: "부적절한 콘텐츠가 감지되었습니다. 재발 시 제재될 수 있습니다."
   → 로그에 경고 기록
   ```

3. **RP방 강제 종료**
   ```
   규칙 위반 방 발견
   → [종료] 클릭
   → 확인 모달: "이 방을 종료하시겠습니까?"
   → 사유 입력: "규칙 위반 (메타게이밍)"
   → [종료]
   → status='archived'로 변경
   → 참여자들에게 알림: "방이 관리자에 의해 종료되었습니다."
   ```

---

## 8. 유저 관리 (`/admin/users`)

### 화면 목적
전체 유저 계정을 관리하고, 권한 변경 및 제재(ban/unban) 작업 수행.

### UI 컴포넌트 구성

```
┌─────────────────────────────────────────────────────────┐
│  유저 관리                                               │
├─────────────────────────────────────────────────────────┤
│  [검색: Discord 이름 또는 ID...]  [역할 ▼] [상태 ▼]    │
├─────────────────────────────────────────────────────────┤
│  총 247명 (활성: 245 | 제재: 2)                         │
├─────────────────────────────────────────────────────────┤
│  Discord 이름   ID           역할    상태    가입일  액션│
│  ──────────────────────────────────────────────────────│
│  Player#1234   u_001        user    활성    01-01  [보기]│
│                                              [편집] [제재]│
│  ──────────────────────────────────────────────────────│
│  Admin#5678    u_002        admin   활성    01-01  [보기]│
│                                              [편집]       │
│  ──────────────────────────────────────────────────────│
│  Banned#9999   u_003        user    제재    01-10  [보기]│
│                                              [해제]       │
│  ──────────────────────────────────────────────────────│
│  ...                                                    │
└─────────────────────────────────────────────────────────┘

// 유저 편집 모달
┌─────────────────────────────────────────────────────────┐
│  유저 편집: Player#1234                         [X]      │
├─────────────────────────────────────────────────────────┤
│  Discord ID: 123456789012345678                        │
│  Discord 이름: Player#1234                             │
│  가입일: 2025-01-01                                    │
├─────────────────────────────────────────────────────────┤
│  역할: [user ▼] → [admin]                              │
│  ⚠️ 관리자 권한을 부여하시겠습니까?                     │
├─────────────────────────────────────────────────────────┤
│  소유 캐릭터:                                           │
│  • 카엘 라이트블레이드 (Helios, approved)              │
│  • 제인 스미스 (Neutral, pending)                      │
├─────────────────────────────────────────────────────────┤
│  활동 이력:                                             │
│  • 마지막 로그인: 2025-01-15 18:00                    │
│  • 전투 참여: 23회                                     │
│  • RP방 생성: 5회                                      │
├─────────────────────────────────────────────────────────┤
│              [취소]                [저장]               │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트:**
- `<UserTable />`: 유저 목록 테이블
- `<UserEditModal />`: 유저 정보 편집 모달
- `<BanButton />`: 제재 버튼 (사유 입력 필요)
- `<UnbanButton />`: 제재 해제 버튼

### 상태 관리

```typescript
interface User {
  id: string;
  discordId: string;
  discordName: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  createdAt: string;
  lastLoginAt: string;
}

interface UserDetail extends User {
  characters: {
    id: string;
    name: string;
    faction: string;
    status: string;
  }[];
  stats: {
    battleCount: number;
    roomCount: number;
  };
}
```

**데이터 흐름:**
1. 목록 페칭 → 검색/필터로 좁히기
2. 편집 모달 → 역할 변경 또는 제재
3. Ban → status='banned', Discord 서버에서 킥 (선택적)
4. Unban → status='active'로 복구

### 관련 API 엔드포인트

```typescript
// GET /api/admin/users
// Query: ?search=Player&role=user&status=active
// Response: { users: User[], total: number }

// GET /api/admin/users/:id
// Response: { user: UserDetail }

// PATCH /api/admin/users/:id
// Body: { role?: 'user' | 'admin' }
// Response: { success, user: User }

// POST /api/admin/users/:id/ban
// Body: { reason: string }
// Response: { success }

// POST /api/admin/users/:id/unban
// Response: { success }
```

### 사용자 인터랙션 플로우

1. **유저 검색**
   ```
   검색창에 "Player#1234" 입력
   → 디바운스 후 API 호출
   → 결과 1건 표시
   → [보기] 클릭 → 유저 상세 모달
   ```

2. **관리자 권한 부여**
   ```
   유저 "Player#1234" [편집] 클릭
   → 역할 드롭다운: user → admin 선택
   → 경고 메시지: "관리자 권한을 부여하시겠습니까?"
   → [저장]
   → 확인 모달: "이 유저에게 관리자 권한을 부여합니다."
   → [확인]
   → API 호출
   → 성공 토스트: "Player#1234가 관리자로 승격되었습니다."
   → Discord DM 발송: "관리자 권한이 부여되었습니다."
   ```

3. **유저 제재 (Ban)**
   ```
   악성 유저 발견
   → [제재] 클릭
   → 사유 입력 모달: "이유를 입력하세요 (유저에게 전달됩니다)"
   → 입력: "지속적인 규칙 위반 및 욕설"
   → [제재]
   → 확인 모달: "이 유저를 제재하시겠습니까?"
   → [확인]
   → API 호출
   → status='banned'로 변경
   → Discord 서버에서 킥 (옵션)
   → Discord DM: "규칙 위반으로 인해 제재되었습니다. 사유: ..."
   → 토스트: "유저가 제재되었습니다."
   ```

4. **제재 해제 (Unban)**
   ```
   제재된 유저 목록 확인
   → "Banned#9999" [해제] 클릭
   → 확인 모달: "제재를 해제하시겠습니까?"
   → [해제]
   → API 호출
   → status='active'로 변경
   → Discord DM: "제재가 해제되었습니다. 규칙을 준수해주세요."
   → 토스트: "제재가 해제되었습니다."
   ```

---

## 공통 기술 구현

### 인증 미들웨어 (`middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // /admin/* 경로 보호
  if (pathname.startsWith('/admin')) {
    const session = getSession(request); // JWT 또는 세션 쿠키
    
    if (!session) {
      // 미인증 유저 → 로그인 페이지로
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    
    if (session.role !== 'admin') {
      // 권한 없음 → 403 페이지
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

### 공통 UI 라이브러리

**버튼 컴포넌트:**
```tsx
// components/admin/Button.tsx
export function Button({ 
  variant = 'primary', 
  children, 
  onClick,
  disabled 
}: ButtonProps) {
  const baseClass = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClass = {
    primary: 'bg-primary hover:bg-primary-dim text-black',
    danger: 'bg-accent hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-bg-tertiary text-text-primary border border-border',
  }[variant];
  
  return (
    <button 
      className={`${baseClass} ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**모달 컴포넌트:**
```tsx
// components/admin/Modal.tsx
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**토스트 알림:**
```tsx
// hooks/useToast.ts
import { toast } from 'sonner'; // 또는 react-hot-toast

export function useToast() {
  return {
    success: (message: string) => toast.success(message, { 
      style: { background: '#131318', color: '#10b981' } 
    }),
    error: (message: string) => toast.error(message, { 
      style: { background: '#131318', color: '#dc2626' } 
    }),
    info: (message: string) => toast.info(message, { 
      style: { background: '#131318', color: '#00d4ff' } 
    }),
  };
}
```

### 상태 관리 (SWR)

```typescript
// hooks/useDashboardStats.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useDashboardStats() {
  const { data, error, mutate } = useSWR('/api/admin/dashboard/stats', fetcher, {
    refreshInterval: 300000, // 5분마다 자동 갱신
  });
  
  return {
    stats: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```

### Discord 알림 통합

```typescript
// lib/discord.ts
export async function sendDiscordDM(userId: string, message: string) {
  const response = await fetch(`${process.env.DISCORD_API_URL}/users/@me/channels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipient_id: userId }),
  });
  
  const { id: channelId } = await response.json();
  
  await fetch(`${process.env.DISCORD_API_URL}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: message }),
  });
}
```

---

## 배포 및 환경 설정

### 환경 변수 (`.env`)

```bash
# Database
DATABASE_URL=postgresql://...

# Discord
DISCORD_BOT_TOKEN=...
DISCORD_API_URL=https://discord.com/api/v10

# Auth
JWT_SECRET=...
SESSION_SECRET=...

# AI Providers
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 보안 고려사항

1. **권한 체크**: 모든 `/api/admin/*` 엔드포인트에서 서버 사이드 권한 체크 필수
2. **Rate Limiting**: 관리자 액션(승인, 반려, 제재)에 대한 속도 제한
3. **Audit Log**: 모든 관리자 액션을 DB에 기록 (누가, 언제, 무엇을)
4. **CSRF Protection**: Next.js 기본 CSRF 토큰 사용
5. **Input Validation**: Zod 등으로 입력 데이터 검증

---

## 성능 최적화

1. **페이지네이션**: 긴 목록은 서버 사이드 페이지네이션
2. **Virtual Scrolling**: 전투 로그처럼 매우 긴 목록은 가상 스크롤 적용
3. **이미지 최적화**: Next.js `<Image />` 컴포넌트 사용
4. **코드 스플리팅**: 관리자 패널은 lazy load
5. **SWR Caching**: API 응답 캐싱으로 불필요한 요청 감소

---

## 접근성 (a11y)

1. **키보드 네비게이션**: 모든 버튼/링크 키보드 접근 가능
2. **ARIA 레이블**: 스크린 리더를 위한 레이블 추가
3. **색상 대비**: WCAG AA 기준 충족 (다크 배경에 시안/레드)
4. **포커스 인디케이터**: 탭 이동 시 명확한 포커스 표시

---

## 마무리

이 스펙은 **PROJECT SOLARIS 관리자 패널의 전체 화면과 기능을 상세히 정의**합니다. 각 화면은 독립적으로 구현 가능하며, 공통 컴포넌트와 훅을 재사용하여 일관된 UX를 제공합니다.

**구현 우선순위 제안:**
1. 시즌 대시보드 (전체 현황 파악)
2. 캐릭터 승인 큐 (게임 진입의 게이트키퍼)
3. 전투 관리 (실시간 모니터링)
4. GM 바이어스 설정 (스토리 제어)
5. AI 모델 정책 (기능별 고정 라우팅 운영)
6. 뉴스 관리 (콘텐츠 발행)
7. 캐릭터 관리 (밸런스 조정)
8. RP방 관리 (콘텐츠 모니터링)
9. 유저 관리 (제재 등 마지막 수단)

**Next Steps:**
- Figma 디자인 프로토타입 제작
- API 스키마 정의 (OpenAPI/Swagger)
- 데이터베이스 마이그레이션 스크립트 작성
- 컴포넌트 스토리북 구축
