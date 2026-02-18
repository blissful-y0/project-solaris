# SERVICE-SPEC.md — PROJECT SOLARIS 웹서비스 기획서

> 이 문서는 Claude Code 및 개발 에이전트가 참조하는 서비스 전체 스펙이다.
> 랜딩 페이지(Astro 5)는 이미 완성. 이 문서는 대시보드(Next.js 15) 이후의 모든 기능을 다룬다.
> DB 설계 이유서(비개발자용): `docs/project/DB-ARCHITECTURE-RATIONALE.md`

---

## 1. 아키텍처 개요

```
[Landing - Astro 5]          apps/landing    (완성)
[Dashboard - Next.js 15]     apps/dashboard  (신규)
[Shared UI]                  packages/ui     (디자인 토큰, 공유 컴포넌트)

[Supabase]
  ├─ Auth (Discord OAuth)
  ├─ PostgreSQL (characters, battles, rooms, news, approvals)
  ├─ Realtime (전투/RP 세션 실시간 동기화)
  └─ Edge Functions (batch 트리거)

[Batch Server]
  ├─ Supabase DB 이벤트 감지
  ├─ Discord Bot으로 알림 푸시
  ├─ 도시 뉴스 자동 생성 (cron, 하루 3~4건, Gemini Flash)
  └─ 시즌 이벤트 트리거

[Discord Bot]
  └─ 알림 전용 (임베드 + 웹 딥링크). 유저 행위는 전부 웹에서.

[AI GM]
└─ 기능별 고정 라우팅 (메인 스토리=Opus, 전투 판정=Gemini Pro, 기타 기능은 운영 정책 기준)
```

### 기술 스택
- **프레임워크:** Next.js 15 (App Router)
- **모노레포:** Turborepo + pnpm
- **인증:** Supabase Auth + Discord OAuth
- **DB:** Supabase PostgreSQL + Realtime
- **AI:** 기능별 고정 라우팅 (`main_story`, `battle_judgment`, `lore_reflection`, `news_generation`)
- **알림:** Discord Bot (임베드 + 딥링크)
- **배포:** Vercel
- **디자인:** Tailwind CSS v4, 모바일 퍼스트

---

## 2. 디자인 시스템

### 컨셉
- **랜딩:** "처음 접속한 시민이 보는 헬리오스의 프로파간다"
- **대시보드:** "접속 인가된 시민의 업무 단말기" — 터미널 + HUD 하이브리드

### 디자인 토큰 (랜딩과 공유, packages/ui)
```css
--color-bg: #0a0a0f;
--color-primary: #00d4ff;       /* 시안 — 시스템, 보안국 */
--color-secondary: #93c5fd;     /* 라이트블루 — 보조 */
--color-accent: #dc2626;        /* 레드 — 경고, 스태틱, 긴급 */
--color-text: #e5e7eb;
--color-subtle: #1f2937;
--color-discord: #5865F2;

--font-sans: "Pretendard Variable", sans-serif;
/* 데이터 라벨, 시스템 메시지: 모노스페이스 */
```

### UI 톤 가이드
- 뉴스 카드: `BULLETIN_047 // SECTOR 7` 스타일 모노스페이스 헤더 + Pretendard 본문
- 검열 블록(████): 승인 대기 캐릭터 정보에 활용
- 전투 알림: 레드 깜빡임 배너
- 스캔라인/노이즈 오버레이: 랜딩보다 옅게 적용
- 애니메이션: 최소화 (정보 밀도 + 가독성 우선)

---

## 3. 모바일 퍼스트 레이아웃

### 네비게이션: 하단 탭 바 (5개)
| 탭 | 아이콘 | 화면 |
|---|---|---|
| Home | 피드 | 메인 대시보드 (개인 상태 + 공지 + 요약) |
| Lore | 북 | 세계관 입문 허브 (`/world`) |
| Operation | 검+채팅 | 전투/RP 통합 작전 허브 (통합 리스트) |
| Registry | 명부 | 러닝 멤버 실시간 프로필 목록 |
| Helios Core | 코어 | 스토리 브리핑/타임라인/운영 공지 |
| My | 프로필 | 상단 아바타 진입 마이페이지 + 설정 |

### Lore 진입 동선
- Lore는 `/world` 독립 페이지로 제공
- 최초 1회 방문자는 `/world`를 먼저 노출하고 이후 Home 루프로 진입

### 데스크탑 대응
- 모바일 레이아웃 기본, md: 이상에서 사이드바 전환
- 전투/RP 채팅은 데스크탑에서 넓은 영역 활용

---

## 4. 화면 상세

### 4-1. 홈 / 대시보드 (`/dashboard`)

로그인 후 첫 화면. 위에서 아래로 스크롤.

1. **상단 고정 바:** "HELIOS CITIZEN TERMINAL" + 알림 벨 아이콘 (뱃지 카운트)
2. **내 캐릭터 미니 카드:**
   - 썸네일 + 이름 + 팩션 뱃지 + HP/WILL 바 (한 줄 압축)
   - 탭하면 캐릭터 탭으로 이동
   - 캐릭터 미생성 → "캐릭터 만들기" CTA
   - 승인 대기 중 → "승인 대기 중" + ████ 처리
3. **전투 알림 배너:** (있을 때만 노출)
   - "INCOMING COMBAT REQUEST" 레드 깜빡임
   - 전투 신청 / 내 턴 / 결과
4. **도시 뉴스 피드:**
   - `BULLETIN` 스타일 카드, 무한 스크롤
   - 각 카드: 모노스페이스 헤더 + 본문 2줄 미리보기 + 리액션 버튼 (이모지)
   - 유저 전투 결과가 뉴스에 반영됨
5. **최근 전투 하이라이트:**
   - 커뮤니티 전체 최근 전투 카드
   - GM 판정 한줄 요약 + 참가자
   - 탭하면 전투 아카이브로

### 4-2. 캐릭터 생성 위자드 (`/character/create`)

스텝 바이 스텝. 한 화면에 한 선택. 명시적 "다음" 버튼 (스와이프 금지).
계정당 캐릭터 1개.

**Step 1: 팩션 선택**
- 보안국 / 스태틱 / 비능력자 카드 3장
- 각 카드: 팩션명 + 한줄 설명 + 스탯 미리보기 (HP/WILL)
- 보안국: HP 80 / WILL 250
- 스태틱: HP 120 / WILL 150
- 비능력자: HP 100 / WILL 100

**Step 2: 능력 계열 선택** (비능력자면 스킵)
- 역장(Field) / 감응(Empathy) / 변환(Shift) / 연산(Compute) 카드 4장
- 각 카드: 계열명 + 한줄 설명 + 대표 키워드

**Step 3: 능력 설계**
- 능력명 입력
- 기본기 / 중급기 / 상급기 (아코디언 UI)
  - 각각: 이름, 설명, 약점/대가
- 비능력자: 5개 메리트 자동 부여, 이 스텝 스킵 또는 장비/전술 설명 입력

**Step 4: 캐릭터 프로필**
- 이름, 나이, 외형 설명
- 배경 서사 (텍스트에어리어)
- 프로필 이미지 업로드

**Step 5: 최종 확인**
- 전체 시트 미리보기
- "제출" → 관리자 승인 대기 상태 진입
- 승인/반려 결과는 Discord DM으로 알림

### 4-3. 캐릭터 프로필 (`/character/[id]`)

내 캐릭터 + 타인 캐릭터 공용. 타인 캐릭터는 **도감에서 클릭 시 모달**로 표시.

- 상단: 프로필 이미지 + 이름 + 팩션 뱃지
- HP/WILL 게이지 (가로 바, 현재값/최대값 **공개**)
- 능력 카드 3장 (기본기/중급기/상급기, 아코디언 접힘/펼침)
- 비능력자: 메리트 5개 카드로 표시
- 서사 기록 타임라인 (AI가 정리한 공식 이력)
- 전투 이력 리스트 (승/패/중단, 탭하면 아카이브로)

### 4-4. 캐릭터 도감 (`/characters`)

전체 캐릭터 브라우징.

- **필터:** 소속 기준 (보안국 / 스태틱 / 비능력자)
- 카드 그리드: 썸네일 + 이름 + 팩션 뱃지 + 능력 계열 태그
- **카드 클릭 → 모달로 캐릭터 프로필 표시** (페이지 이동 없음)
- 검색: 이름 검색

### 4-5. 전투 로비 (`/battle`)

**게시판형.** 다른 사람의 전투 로그도 열람 가능.

- **게시물 목록:** 최신순, 상태별 필터 (모집 중 / 진행 중 / 완료)
- **게시물 생성:**
  - 제목 (선택)
  - 전투 대상 지목 (캐릭터 도감에서 선택)
  - 간단한 시나리오/상황 설명
  - "전투 신청" → 상대에게 Discord 알림
- **게시물 상세:**
  - 모집 중: 수락/거절 버튼 (상대만)
  - 진행 중: 전투 세션 입장 링크
  - 완료: 전투 로그 전체 열람 (아카이브)

### 4-6. 전투 세션 (`/battle/[id]`)

**카톡 형태 채팅 UI.**

#### 화면 구성
- **상단 바:** 전투 제목 + 참가자 2명 이름
- **HP/WILL 바:** 상단에 얇은 바 2줄 (나 + 상대). 탭하면 상세 확장
- **전투 로그:** 풀스크린 채팅
  - 내 서술: 오른쪽 말풍선
  - 상대 서술: 왼쪽 말풍선
  - GM 판정: 중앙 시스템 메시지 (시안 강조)
  - HP/WILL 변동: 판정 아래 자동 표시
- **하단 입력 영역:**
  - 텍스트 입력창 + 제출 버튼
  - 탭하면 풀스크린 에디터로 확장 (장문 서술용)
- **OOC 채팅:** 하단 시트(bottom sheet)로 올려서 사용. 전투 로그와 분리.

#### 턴 사이클
1. A 서술 작성 → 제출
2. B가 A의 서술을 읽고 → B 서술 작성 → 제출
3. 양측 서술 확정 화면 표시
4. **"판정 진행" 버튼 양측 모두 클릭** (합의)
5. AI GM 판정 실행 (Gemini Flash, 5~10초)
6. GM 판정문 + HP/WILL 변동 표시
7. 다음 턴 (선후 교대)

#### 서술 수정
- 합의 전 **1회 수정 허용**

#### 합의 거부
- OOC 채팅에서 조율

#### 타임아웃
- **10분.** 서술 제출, 합의 버튼 모두 동일.
- 타임아웃 초과 → **자동 패스** (GM이 소극적 행동으로 판정)

#### 전투 중단
- **"전투 중단" 버튼** → 한 쪽이 요청 → 상대가 수락하면 중단
- 일방적 중단 불가 (도주 방지)
- 상대가 24시간 내 수락/거절 안 하면 자동 중단
- 중단된 전투: "중단됨" 상태로 보존, 양측 합의 시 재개 가능

#### 전투 종료 조건
- HP 0 → 전투불능 (사망은 플레이어 동의 시에만)
- 양측 합의 항복/종료
- 중단 후 미재개

### 4-7. 일반 RP방 (`/room`)

#### 방 목록
- 활성 방 목록 + 새 방 만들기 버튼
- 방 제목, 참가자 수, 마지막 활동 시간

#### 방 생성
- 제목
- 설명 (상황 설정)
- 참가자 초대 (캐릭터 도감에서 선택, 또는 링크 공유)
- 인원 상한 없음

#### 방 내부 (카톡 형태)
- 참가자 서술: 말풍선 (캐릭터 이미지 + 이름)
- 시스템 메시지: 입장/퇴장, 서사 반영 알림

#### 서사 반영 기능
- **메시지 범위 선택:** 롱프레스 → "여기서부터" 마킹 → 스크롤 → "여기까지" 마킹
- **"서사 반영 요청" 버튼** → 참가자 전원 합의 (전원 동의 버튼 클릭)
- 전원 합의 시 → 선택된 구간의 대화 로그를 AI에게 전송
- AI가 서사 요약 추출 → 각 참가 캐릭터의 서사 기록 타임라인에 반영
- **스탯(HP/WILL) 변동 없음.** 서사 기록만.

#### 전투 전환
- RP 중 전투 발생 시 → **"전투방 생성" 버튼**
- 참가자 2명 지정 → 전투방 자동 생성 (전투 로비에도 등록)
- 전투 종료 후 결과가 일반방에 시스템 메시지로 돌아옴

### 4-8. 진영별 기밀 게시판 (`/faction`)

진영 소속 캐릭터만 접근 가능한 비공개 게시판.

- **보안국 게시판:** 헬리오스 하달 명령, 작전 브리핑, 내부 보고. 톤: 공식적, 시안 강조.
- **스태틱 게시판:** 잠입 계획, 정보 공유, 은밀 모의. 톤: 거친, 레드 강조.
- **비능력자:** 스태틱 소속이므로 스태틱 게시판 접근 가능.
- **전향자:** 스태틱 게시판 접근 가능.

**게시물 구조:**
- 제목 + 본문 (마크다운)
- 댓글
- 고정(pin) 기능 (관리자 또는 자동 생성 명령/뉴스)
- 자동 생성 콘텐츠: Batch 서버가 시즌 진행에 따라 진영별 "명령" 또는 "정보"를 자동 생성해서 고정 게시물로 등록

**접근 제어:**
- RLS로 `characters.faction` 기반 필터링
- 상대 진영 게시판은 존재 자체를 노출하지 않음 (404)

### 4-9. 캐릭터 관계도 (`/character/[id]` 내부)

캐릭터 프로필 모달/페이지 안에 "관계" 섹션 추가.

- **수동 입력:** "캐릭터 추가" → 도감에서 선택 → 관계 태그 입력 (자유 텍스트: "동맹", "경계 중", "원수", "연인" 등)
- **표시:** 관계 대상 캐릭터 썸네일 + 이름 + 관계 태그
- **상호성:** A가 B를 "동맹"으로 등록하면 B의 프로필에도 "A → 동맹" 표시 (단, B가 수정/삭제 가능)
- **Phase 2 확장:** AI가 RP 서사 반영 시 관계 태그를 자동 제안. 수동 수정 가능.

### 4-10. Solaris Ticker (대시보드 상단)

대시보드 최상단에 가로로 흘러가는 실시간 시보.

- **형식:** `[21:05] 보안국 제3구역 검문 강화 — [21:10] 중층 구역 의문의 폭발음 보고 — [21:15] 에너지 그리드 출력 3% 상승`
- **소스:**
  - Batch 서버가 1~2시간 간격으로 Gemini Flash로 자동 생성
  - 전투 결과 반영 ("남측 구역에서 대규모 공명 반응 감지")
  - 관리자 수동 입력
- **UI:** 모노스페이스 폰트, 시안 텍스트, 왼쪽으로 천천히 흘러가는 marquee 스타일 (CSS animation)
- **DB:** `ticker_entries` 테이블 (content, source_type, created_at). 최근 24시간 항목만 표시.
- **모바일:** 한 줄 고정, 텍스트가 좌측으로 스크롤

### 4-11. 전투 관전 모드 (`/battle/[id]?spectate=true`)

진행 중인 전투를 제3자가 실시간으로 열람 가능.

- **접근:** 전투 로비에서 "진행 중" 상태의 전투 클릭 → 관전 모드 입장
- **UI:** 전투 세션과 동일한 채팅 UI. 단, 입력창 없음. 읽기 전용.
- **실시간:** Supabase Realtime으로 새 턴/판정 즉시 반영
- **관전자 수:** 상단 바에 관전자 수 표시 (선택사항)
- **OOC:** 관전자에게는 OOC 채팅 비공개

### 4-12. 마이페이지 (`/my`)

- **내 캐릭터 시트** (편집 가능, 수정 시 재승인 필요 여부는 관리자 설정)
- **전투 이력:** 전적 (승/패/중단) + 각 전투 아카이브 링크
- **서사 기록:** AI가 정리한 내 캐릭터의 공식 타임라인
- **알림 설정:** Discord 알림 on/off (전투 신청, 승인, 뉴스 등 항목별)
- **계정 설정:** Discord 연동 상태, 프로필 이미지 변경

### 4-9. 관리자 패널 (`/admin`)

관리자 전용. 일반 유저 접근 불가.

- **캐릭터 승인 큐:**
  - 캐릭터 시트 전체 보기 + 승인/반려(사유 입력) 버튼
  - 반려 시 사유가 Discord DM으로 전송 + 수정 페이지 딥링크
- **밸런스 관리:**
  - 특정 캐릭터 능력 코스트 조정 요청
  - 전체 능력 계열별 코스트 가이드라인 수정
- **GM 바이어스 슬라이더:**
  - 시즌 진행도에 따라 보안국 편향 % 조절
  - 시즌 초반 +5% → 중반 +15% → 후반 노골적
- **뉴스 관리:**
  - 자동 생성 뉴스 미리보기 + 수정/발행/삭제
  - 수동 뉴스 작성
- **시즌 대시보드:**
  - 활성 유저 수, 진행 중 전투 수, 평균 WILL 잔량
  - 시즌 시작/종료 트리거

---

## 5. 전투 시스템 규칙 (AI GM 참조용)

### 스탯
- **HP:** 물리적 상태. 회복 가능 (전투 간 휴식/치료/씬 전환).
- **WILL:** 정신적 한계치. **영구 비회복.** 시즌 내내 감소만.

### 진영별 초기값
| 진영 | HP | WILL |
|---|---|---|
| 보안국 (동조형, 공명율 80+) | 80 | 250 |
| 스태틱 (비동조형, 공명율 15 미만) | 120 | 150 |
| 비능력자 (공명율 15~79) | 100 | 100 |
| 전향자 (보안국→스태틱) | 100 | 200 |

### 능력 유형
- **하모닉스 프로토콜 (Harmonics Protocol):** 보안국 전용. WILL 소모.
- **오버드라이브 (Overdrive):** 스태틱 전용. HP 소모.

### 능력 계열 (4개)
1. **역장 (Field):** 공간/물리 법칙 간섭. 중력 조작, 방어막, 공간 왜곡, 충격파.
2. **감응 (Empathy):** 타인의 정신/감각 간섭. 감정 읽기, 환각 투사, 정신 간섭.
3. **변환 (Shift):** 신체/물질 성질 변환. 신체 강화, 물질 변성, 형태 변이, 재생.
4. **연산 (Compute):** 정보 처리/예측. 해킹, 확률 예측, 전술 시뮬, 시스템 간섭. 보안국 특화. 스태틱 사용 시 HP+WILL 이중 코스트.

### 능력 코스트 가이드라인
| 등급 | 하모닉스 (WILL) | 오버드라이브 (HP) |
|---|---|---|
| 기본기 | 3~5 | 15~20 |
| 중급기 | 8~15 | 30~40 |
| 상급기 | 20~30 | 50~60 |

### 연산(Compute) 특수 규칙
비동조형 사용 시 HP 코스트에 추가 WILL 소모: 기본기 +2, 중급기 +5, 상급기 +10.

### 비능력자 전투원
- HP 100 / WILL 100. WILL은 정신 공격 방어막으로만 기능.
- 전투 방식: 장비, 전술, 환경 활용.
- **고유 메리트 5개:**
  1. 헬리오스 투명 (Invisible to Helios) — 감지망 미분류
  2. 장비 특화 (Hardware Specialist) — 공명 간섭 없이 중화기/EMP/공명 교란기 운용
  3. 냉정한 판단 (Cold Reading) — WILL 감소해도 판단력 불변, GM 전술 판정 관대
  4. 침투 전문가 (Infiltrator) — 도시 내 잠입 작전 이점
  5. 정신 내성 (Null Mind) — 감응 계열 2배 코스트, 효과 반감

### GM 바이어스 (Helios Bias)
- AI GM은 헬리오스 산하이므로 보안국에 미묘하게 유리한 판정.
- 시즌 초반: +5% | 중반: +15% | 후반: 노골적 편향
- 관리자 패널에서 슬라이더로 조절.

### 판정 기준
1. 서술 합리성 (높음) — 능력 한계 내 논리적 행동
2. 전술적 판단 (높음) — 환경 활용, 약점 공략
3. 대가 반영 (중간) — 능력 반동 성실 묘사
4. 누적 피로 (중간) — 이전 턴 부상/소모 반영

### 사망
- **플레이어 동의 시에만.** HP 0 = 전투불능, 사망 아님.

---

## 6. Discord 알림 시스템

### 알림 종류 (전부 임베드 + 웹 딥링크)

| 이벤트 | 알림 내용 | 딥링크 |
|---|---|---|
| 캐릭터 승인 | "캐릭터 [이름]이 승인되었습니다" | /character/[id] |
| 캐릭터 반려 | "수정이 필요합니다: [사유]" | /character/create (수정 모드) |
| 전투 신청 | "[상대]가 전투를 신청했습니다" | /battle/[id] (수락/거절) |
| 내 턴 도래 | "전투 [제목]에서 당신의 차례입니다" | /battle/[id] |
| 전투 결과 | "전투 종료: [결과 요약]" | /battle/[id]/archive |
| 전투 중단 요청 | "[상대]가 전투 중단을 요청했습니다" | /battle/[id] |
| RP 초대 | "[방 이름]에 초대되었습니다" | /room/[id] |
| 서사 반영 요청 | "[방]에서 서사 반영 동의가 필요합니다" | /room/[id] |
| 도시 뉴스 | 뉴스 제목 + 미리보기 | /dashboard |
| 시즌 이벤트 | 시즌 관련 공지 | /dashboard |

---

## 7. DB 스키마 (초안)

```sql
-- 유저 (Supabase Auth와 연동)
users (
  id uuid PK (= auth.users.id),
  discord_id text UNIQUE,
  discord_username text,
  role enum('user', 'admin') DEFAULT 'user',
  created_at timestamptz,
  updated_at timestamptz
)

-- 캐릭터 (계정당 1개)
characters (
  id uuid PK,
  user_id uuid FK → users.id UNIQUE,
  name text NOT NULL,
  faction enum('bureau', 'static', 'civilian'),
  ability_class enum('field', 'empathy', 'shift', 'compute') NULL, -- civilian은 NULL
  hp_max int NOT NULL,
  hp_current int NOT NULL,
  will_max int NOT NULL,
  will_current int NOT NULL,
  profile_image_url text,
  appearance text,
  backstory text,
  status enum('pending', 'approved', 'rejected', 'revision') DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz,
  updated_at timestamptz
)

-- 능력 (캐릭터당 3개: basic, mid, advanced)
abilities (
  id uuid PK,
  character_id uuid FK → characters.id,
  tier enum('basic', 'mid', 'advanced'),
  name text NOT NULL,
  description text NOT NULL,
  weakness text NOT NULL,
  cost_type enum('will', 'hp'),
  cost_amount int NOT NULL,
  created_at timestamptz
)

-- 전투 게시물/세션
battles (
  id uuid PK,
  title text,
  description text,
  challenger_id uuid FK → characters.id,
  defender_id uuid FK → characters.id,
  status enum('open', 'accepted', 'in_progress', 'paused', 'completed', 'cancelled'),
  current_turn uuid FK → characters.id,  -- 현재 서술 차례
  turn_number int DEFAULT 0,
  turn_deadline timestamptz,              -- 10분 타임아웃
  result jsonb,                           -- {winner, summary, hp_changes, will_changes}
  pause_requested_by uuid FK → characters.id,
  created_at timestamptz,
  updated_at timestamptz
)

-- 전투 턴 로그
battle_turns (
  id uuid PK,
  battle_id uuid FK → battles.id,
  turn_number int,
  attacker_id uuid FK → characters.id,    -- 선 서술자
  attacker_text text,
  attacker_submitted_at timestamptz,
  attacker_edited boolean DEFAULT false,
  defender_id uuid FK → characters.id,    -- 후 서술자
  defender_text text,
  defender_submitted_at timestamptz,
  defender_edited boolean DEFAULT false,
  attacker_agreed boolean DEFAULT false,
  defender_agreed boolean DEFAULT false,
  gm_judgment text,                       -- AI GM 판정문
  hp_changes jsonb,                       -- {attacker: -20, defender: -15}
  will_changes jsonb,
  judged_at timestamptz,
  created_at timestamptz
)

-- OOC 채팅 (전투방)
battle_ooc (
  id uuid PK,
  battle_id uuid FK → battles.id,
  character_id uuid FK → characters.id,
  message text,
  created_at timestamptz
)

-- 일반 RP방
rooms (
  id uuid PK,
  title text NOT NULL,
  description text,
  created_by uuid FK → users.id,
  status enum('active', 'archived') DEFAULT 'active',
  created_at timestamptz,
  updated_at timestamptz
)

-- RP방 참가자
room_participants (
  room_id uuid FK → rooms.id,
  character_id uuid FK → characters.id,
  joined_at timestamptz,
  PRIMARY KEY (room_id, character_id)
)

-- RP 메시지
room_messages (
  id uuid PK,
  room_id uuid FK → rooms.id,
  character_id uuid FK → characters.id NULL, -- NULL이면 시스템 메시지
  message text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz
)

-- 서사 반영 요청
lore_requests (
  id uuid PK,
  room_id uuid FK → rooms.id,
  requested_by uuid FK → characters.id,
  message_range_start uuid FK → room_messages.id,
  message_range_end uuid FK → room_messages.id,
  status enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  ai_summary text,                        -- AI가 생성한 서사 요약
  created_at timestamptz
)

-- 서사 반영 동의
lore_request_votes (
  lore_request_id uuid FK → lore_requests.id,
  character_id uuid FK → characters.id,
  agreed boolean,
  voted_at timestamptz,
  PRIMARY KEY (lore_request_id, character_id)
)

-- 캐릭터 서사 타임라인
character_lore (
  id uuid PK,
  character_id uuid FK → characters.id,
  source_type enum('battle', 'room', 'admin'),  -- 출처
  source_id uuid,                                -- battle.id 또는 lore_request.id
  summary text NOT NULL,                          -- AI 생성 요약
  created_at timestamptz
)

-- 도시 뉴스
news (
  id uuid PK,
  bulletin_number int,                    -- BULLETIN_047
  title text NOT NULL,
  content text NOT NULL,
  source_type enum('auto', 'manual', 'battle'),
  source_id uuid,                         -- 전투 결과 기반 뉴스면 battle.id
  status enum('draft', 'published') DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz
)

-- 뉴스 리액션
news_reactions (
  news_id uuid FK → news.id,
  user_id uuid FK → users.id,
  emoji text NOT NULL,
  created_at timestamptz,
  PRIMARY KEY (news_id, user_id)
)

-- 알림 로그
notifications (
  id uuid PK,
  user_id uuid FK → users.id,
  type text NOT NULL,                     -- 'battle_request', 'approval', etc.
  title text,
  body text,
  deep_link text,
  sent_via enum('discord', 'web', 'both'),
  read boolean DEFAULT false,
  created_at timestamptz
)

-- 비능력자 메리트 (정적 데이터, seed)
civilian_merits (
  id text PK,                             -- 'invisible', 'hardware', etc.
  name_ko text,
  name_en text,
  description text
)
```

---

## 8. MVP 스코프 (시즌 0)

### 필수 (Phase 1) — 런칭 필수
1. Discord OAuth 로그인
2. 캐릭터 생성 위자드 + 캐릭터 프로필
3. 관리자 승인 패널
4. **Home 대시보드** (개인 상태 + 커뮤니티 요약)
5. **Lore 허브** (`/world`, 개요/사회구조/공명율과 능력체계/능력분류/대립구도/배틀룰)
6. **Operation 통합 허브** (전투/RP 통합 리스트 + 공통 세션 UX)
7. **Registry** (실시간 상태 + 모달 프로필)
8. **Helios Core** (스토리 브리핑 + 전개 타임라인)
9. **진영별 기밀 게시판** (보안국/스태틱 전용 공간, 상대 진영 접근 불가)
10. **캐릭터 관계도** (수동 입력 — 도감 모달 내 "타인과의 관계" 메모 칸)
11. **Solaris Ticker** (대시보드 상단 실시간 시보 — "21:05 보안국 제3구역 검문 강화" 등 자동 생성 텍스트 흘러가는 연출)
12. Discord 알림 봇 (승인/반려 + 전투 + 뉴스)
13. **인프라:** Realtime 채널 설계, 이미지 스토리지(Supabase Storage), OG 메타태그, 커서 기반 페이지네이션, Rate Limiting

### Phase 2 — 런칭 후 1~2주
13. 전투 로그 공유 (트위터/디코 공유 카드 — AI GM의 결정적 장면을 이미지 카드로 생성)
14. 캐릭터 관계도 AI 자동 태그 (RP 분석 → "현재 [경계 중]" 등 관계 태그 자동 부여, 수동 수정 가능)
15. 전투 → 뉴스 자동 반영
16. GM 바이어스 슬라이더
17. 시즌 대시보드 (통계)
18. 전투방 ↔ 일반방 전환 플로우

### Phase 3 — 시즌 0 중반 (유저 행동 데이터 축적 후)
19. **소모성 아이템 + 인벤토리** (HP 회복 아이템, AI 판정 보너스 등. WILL 회복 아이템은 핵심 설계 원칙 위반이므로 불가)
20. **크레딧 재화 시스템** (획득 경로, 아이템 가격, 밸런스 설계 필요)
21. 전투 아카이브 소셜 기능 (댓글, 추천)

---

## 9. 인프라 스펙

### Supabase Realtime 구독 패턴
| 채널 | 테이블 | 이벤트 | 용도 |
|---|---|---|---|
| `battle:{id}` | battle_turns | INSERT, UPDATE | 새 서술/판정 실시간 반영 |
| `battle:{id}` | battles | UPDATE | 상태 변경 (합의, 턴 교대, 종료) |
| `battle-ooc:{id}` | battle_ooc | INSERT | OOC 채팅 실시간 |
| `room:{id}` | room_messages | INSERT | RP 메시지 실시간 |
| `room:{id}` | rooms | UPDATE | 방 상태 변경 |
| `notifications:{userId}` | notifications | INSERT | 실시간 알림 벨 |
| `ticker` | ticker_entries | INSERT | Solaris Ticker 실시간 |

### 이미지 스토리지 (Supabase Storage)
- **버킷:** `avatars` (캐릭터 프로필 이미지)
- **경로:** `avatars/{character_id}/{filename}`
- **사이즈 제한:** 최대 5MB
- **포맷:** JPG, PNG, WebP
- **리사이징:** 업로드 시 Edge Function으로 썸네일(128x128) + 중간(512x512) 자동 생성
- **RLS:** 누구나 읽기, 본인 캐릭터만 쓰기

### 캐릭터 수정 후 재승인
- **능력 수정 (이름, 설명, 약점, 코스트):** 재승인 필요 → status='revision'
- **프로필 수정 (외형, 배경, 이미지):** 자동 통과, 재승인 불필요
- **팩션/능력 계열 변경:** 불가 (캐릭터 삭제 후 재생성만 허용)

### OG 메타태그
- **캐릭터 프로필:** `og:title`=캐릭터 이름, `og:description`=팩션+능력계열, `og:image`=프로필 이미지
- **전투 아카이브:** `og:title`="[A] vs [B]", `og:description`=GM 판정 한줄 요약, `og:image`=SOLARIS 로고
- **뉴스:** `og:title`=BULLETIN 제목, `og:description`=본문 미리보기
- 구현: Next.js `generateMetadata` 활용

### 페이지네이션
- **채팅 (전투/RP):** 커서 기반 (created_at 기준, 최신→과거 방향)
- **뉴스 피드:** 커서 기반 (published_at)
- **전투 로비:** 오프셋 기반 (페이지 번호)
- **캐릭터 도감:** 오프셋 기반
- **기본 페이지 사이즈:** 20 (채팅 50)

### Rate Limiting
| 엔드포인트 | 제한 |
|---|---|
| AI GM 판정 | 분당 10회 (전투당) |
| 메시지 전송 (전투/RP) | 분당 30회 |
| 캐릭터 생성 | 시간당 3회 |
| 뉴스 리액션 | 분당 20회 |
| 전투 신청 | 시간당 10회 |
| 일반 API | 분당 60회 |

---

## 10. 참고 문서

- **세계관:** Notion `309ad415-c040-81b8-8334-c7973a5dddd8` (10개 자식 페이지)
- **전투 규칙서:** Notion `30aad415-c040-8183-8753-c17a4ab7ea3a` (SYSTEM RULEBOOK)
- **랜딩 스펙:** `docs/LANDING-SPEC.md` (레포 내)
- **랜딩 카피:** `docs/LANDING-COPY.md` (레포 내)
- **세계관 요약:** `docs/WORLDBUILDING.md` (레포 내)
- **CC 가이드:** `CLAUDE.md` (레포 루트)
