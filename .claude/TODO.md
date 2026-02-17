# TODO — 다음 작업 목록

> 마지막 업데이트: 2026-02-18

---

## 현재 상태

- **develop** 브랜치: PR #23 머지 완료 (홈 페이지 리디자인)
- 홈: CitizenIDCard + ResonanceTasks + BriefingFeed(PomiAd 삽입) 3섹션 구조
- 전체 목 데이터 기반 — Supabase API 연동 전 단계
- 테스트 244건 통과, 빌드 정상

---

## 우선순위 높음

### 1. 유저가 직접 수정한 파일 커밋 정리
- `CitizenIDCard.tsx` — `next/image` Image 컴포넌트로 변경됨 (유저 수정)
- `env.client.ts` — `as NodeJS.ProcessEnv` 캐스팅 제거됨 (유저 수정)
- `globals.css` — 3D flip 유틸리티 섹션 제거됨 (유저 수정, flip 기능 삭제에 따른 정리)
- `CitizenIDCard.test.tsx` — `next/image` mock 추가됨 (유저 수정)
- `package.json` — playwright 추가됨 (별도 작업)
- `docs/lore/` — 세계관 문서 (별도 작업)
- → 이 변경들을 적절히 커밋/브랜치 정리 필요

### 2. Supabase DB 스키마 + API 연동 시작
- `docs/project/DB-SCHEMA.md` 참조하여 테이블 생성
- characters 테이블: 캐릭터 생성 위자드 → 실제 DB 저장
- CitizenIDCard: 목 데이터 → 실제 유저 캐릭터 데이터로 교체
- ResonanceTasks: 목 데이터 → 실제 태스크 시스템 연동
- BriefingFeed: 목 데이터 → 뉴스 자동 생성 시스템 연동

### 3. 캐릭터 승인 시스템
- 캐릭터 생성 → "승인 대기" 상태로 DB 저장
- 어드민 승인 후 활성화
- `docs/project/ADMIN-SPEC.md` 참조

---

## 우선순위 중간

### 4. Operation 탭 구현 (전투/RP)
- SERVICE-SPEC의 Operation(Session) 탭 스펙 참조
- 전투 세션 생성/참여 UI
- RP 채널 목록 + 참여 UI
- HELIOS 전투 판정 연동 (AI GM)

### 5. Lore 탭 구현
- 세계관 열람 페이지
- `docs/lore/` 문서 기반 콘텐츠
- 검열 블록(████) 활용한 미공개 정보 표현

### 6. Registry 탭 구현 (캐릭터 도감)
- 승인된 캐릭터 목록 조회
- 캐릭터 상세 프로필 페이지
- 검색/필터 (진영, 능력 계열)

---

## 우선순위 낮음 / 나중에

### 7. Helios Core 탭
- HELIOS 시스템 상태 대시보드
- 공명율 통계, 도시 상태 모니터링

### 8. MY 페이지 고도화
- 현재 스텁 상태 → 실제 프로필 관리
- 캐릭터 수정, 설정 변경

### 9. Discord Bot 알림 연동
- 전투 도전/RP 참여 요청 알림
- 뉴스 발행 시 채널 알림

### 10. 뉴스 자동 생성 (Batch Server)
- Gemini Flash 기반 도시 뉴스 생성
- cron 스케줄 (하루 3~4건)
- HELIOS INTELLIGENCE FEED에 자동 반영

---

## DEV 유틸리티 정리 (배포 전)
- `page.tsx`의 DEV 토글 버튼 (`[DEV] 미등록/Bureau/Static`) — 배포 전 제거 또는 `?dev` 쿼리 파라미터로 전환
- `mock-citizen.ts`, `mock-tasks.ts`, `mock-briefings.ts` — API 연동 후 제거
