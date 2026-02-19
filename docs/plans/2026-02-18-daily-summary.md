# 2026-02-18 작업 요약 (대화 기반)

## 오늘 완료한 것

### 1) 프론트
- 전투 세션 화면이 좌측/전체 높이를 꽉 채우지 않던 이슈 복구
- 복구 커밋: `ba33024`
- 변경 파일: `apps/dashboard/src/app/(dashboard)/operation/[id]/page.tsx`

### 2) 백엔드 (operation 전투 경합)
- 작업 브랜치: `feat/operation-backend`
- 원격 푸시 완료: `origin/feat/operation-backend`
- 기능 단위 커밋 3개:
  - `4d3c522` `feat(operation-db): 전투 경합 스키마·RPC 함수 도입 및 타입 반영`
  - `6ca6d66` `feat(operation-core): 전투 턴 연산 엔진과 resolve 조합 로직 구현`
  - `2a470e4` `feat(operation-api): 전투 제출·판정확정·종료 엔드포인트 구현`
- 테스트:
  - 엔진/제출 라우트/리졸브 라우트 테스트 통과 (10 tests)

## 현재 상태 판단

- **HTTP + DB 상태전이**는 구현됨
  - 순차 제출, 코스트 검증, 미제출 auto-fail, 턴 resolve, idempotency, 운영자 수동 종료
- **실시간 채팅/동기화(Realtime)**는 아직 미완
  - `operation_*` 기준 채널/이벤트 계약 문서 및 실제 구독 코드 부재

## 해야 할 일 (우선순위)

## P0 (바로 진행)
- [ ] `operation_*` 기준 Realtime 계약 문서 작성
  - 채널명, 이벤트 소스 테이블, payload, 클라이언트 반영 규칙 정의
- [ ] 전투 세션 실시간 동기화 구현
  - `operation_turn_submissions`, `operation_turns`, `operation_turn_effects`, `operation_encounters` 구독
  - 턴 상태/판정 결과/스탯 반영 UI 동기화
- [ ] 실시간 채팅 경로 확정
  - 전투 서술/판정 메시지를 어떤 테이블로 저장/구독할지 결정 (`operation_messages` 신설 여부 포함)

## P1 (다음)
- [ ] 프론트 JSON 스키마와 백엔드 응답 스키마 최종 정합
  - 필드명/nullable/enum 차이 정리
- [ ] GM 전용 전투방 생성 제한을 백엔드 권한으로 강제
  - 현재 MVP 정책 반영
- [ ] resolve/close API 에러코드 문서화 및 프론트 에러 UX 연결

## P2 (품질/운영)
- [ ] migration 적용/검증 체크리스트 정리 (로컬/스테이징)
- [ ] 운영 시나리오 테스트
  - 1:1, 2:2, 미제출 auto-fail, 코스트 부족, idempotency replay/conflict
- [ ] PR 생성 후 리뷰/머지 플로우 정리

## 내일 시작 순서 제안
1. Realtime 계약 문서 먼저 확정
2. 채널 구독 훅 + 세션 상태 반영 구현
3. 채팅 저장/구독 경로 확정 후 연결
4. 1:1/2:2 통합 테스트
