# Operations Phase 1 세팅 체크리스트 (나중에 하면 되는 것만)

## 1) Supabase 마이그레이션 적용
- 할 일:
  - `apps/dashboard/supabase/migrations/014_create_operations_phase1.sql` 적용
- 왜 필요?
  - 이번에 만든 API(`GET /api/operations`, `GET /api/operations/[id]`, `POST /api/operations/[id]/messages`)는
    `operations`, `operation_participants`, `operation_messages` 테이블을 전제로 동작한다.

## 2) 최소 시드 데이터 넣기 (수동/스크립트)
- 할 일:
  - `operations` 1건(downtime)
  - `operation_participants` 2~3건(host + member)
  - `operation_messages` 2~3건(system/narration)
- 왜 필요?
  - 프론트에서 방 진입 시 빈 화면이 아니라 실제 목록/상세/메시지 렌더링을 바로 확인할 수 있다.

## 3) Realtime Publication 확인
- 할 일:
  - Supabase Realtime에서 `operation_messages` 테이블 INSERT 이벤트가 발행되는지 확인
- 왜 필요?
  - `DowntimeRoom`이 `operation_id=eq.{id}` 필터로 실시간 구독하도록 구현되어 있다.
  - Publication 누락 시 메시지 전송 후 상대 화면에 즉시 반영되지 않는다.

## 4) (선택) RLS 정책 강화
- 할 일:
  - 현재 1차는 인증 사용자 완화 정책(`*_authenticated_all`)으로 열어둠
  - 운영 전에는 "참가자만 읽기/쓰기" 정책으로 세분화
- 왜 필요?
  - 개발 속도 우선으로 완화했기 때문에, 운영 보안 수준에서는 최소 권한 정책이 필요하다.

## 5) 프론트 페이지 실제 API 연결
- 할 일:
  - `apps/dashboard/src/app/(dashboard)/operation/[id]/page.tsx`가 아직 mock 데이터를 사용 중이므로
    `/api/operations/[id]` 응답을 받아 `DowntimeRoom` props로 매핑
  - 연결 시 `operationId`를 꼭 넘겨서 API 전송/Realtime 모드를 활성화
- 왜 필요?
  - 지금 `DowntimeRoom` 자체는 실시간/전송 로직이 준비됐지만,
    페이지 레벨에서 아직 mock만 쓰면 실제 서버 데이터 경로가 열리지 않는다.

## 6) 운영 점검 체크
- 할 일:
  - 메시지 전송 API 실패 로그 모니터링 (`FAILED_TO_SEND_MESSAGE`, `FAILED_TO_FETCH_CHARACTER`)
  - Next.js 이미지 quality 경고(테스트 로그 노출) 추후 정리
- 왜 필요?
  - 초기 운영에서 가장 먼저 문제나는 지점이 인증/권한 + 실시간 반영 누락이기 때문.

---

## 7) 추가 구현 TODO (다음 작업 우선순위)

### 7-1. `operation/[id]` 페이지 실 API 연결 (최우선)
- 할 일:
  - `apps/dashboard/src/app/(dashboard)/operation/[id]/page.tsx`에서 mock 상세 데이터를 제거하고
    `GET /api/operations/[id]` 응답으로 렌더링하도록 교체
  - `DowntimeRoom`에 `operationId`를 전달해 API 전송/Realtime 구독을 활성화
- 완료 기준:
  - 페이지 진입 시 DB 메시지가 렌더링되고, 메시지 전송이 실 DB + 실시간으로 반영됨

### 7-2. OperationHub 목록 API 연동
- 할 일:
  - `apps/dashboard/src/components/operation/OperationHub.tsx`에서 `mockOperations` 대신
    `GET /api/operations` 호출 결과를 사용
  - 타입/상태 필터를 쿼리(`type`, `status`)와 동기화
- 완료 기준:
  - 허브 필터 변경 시 실제 API 목록이 즉시 갱신됨

### 7-3. lore 요청/투표 API 구현
- 할 일:
  - `POST /api/operations/[id]/lore-requests`
  - `POST /api/operations/[id]/lore-requests/[requestId]/vote`
  - 단일 트랜잭션 처리 + 에러 코드 명세 반영
- 완료 기준:
  - 요청 생성/투표/상태 전환(`voting -> approved|rejected`)이 DB + Realtime 이벤트로 동작

### 7-4. RLS 운영 정책 강화
- 할 일:
  - 현재 완화 정책(`*_authenticated_all`)을 “참가자/관리자 최소 권한”으로 세분화
  - 특히 `operation_messages`, `lore_request_votes` 쓰기 권한을 operation 참여자 기준으로 제한
- 완료 기준:
  - 비참여자는 조회/투표/메시지 전송이 차단되고, 참여자는 정상 동작

### 7-5. 메시지 rate limit 적용
- 할 일:
  - `POST /api/operations/[id]/messages`에 분당 제한(문서 기준) 적용
  - 초과 시 명시적인 에러 코드 반환
- 완료 기준:
  - 과도 전송이 서버에서 안정적으로 차단되고 클라이언트에 일관된 에러가 전달됨

---

## 이번 구현에서 선택한 방향 (요약)
- 기존 `operation_encounters` 스키마와 충돌을 피하려고, Phase1용 `operations` 계열 신규 테이블을 분리 생성했다.
- Realtime 구독은 반드시 operation 단위로 제한하려고 `operation_id` 필터를 강제했다.
- 메시지 중복 반영을 막기 위해 클라이언트에서 `message.id` dedupe를 넣었다.
