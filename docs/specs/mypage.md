# MyPage — 마이페이지

> 내 캐릭터 관리, 전투 이력, 서사 기록, 설정.

---

## 화면 (프론트엔드)

### 마이페이지 (`/my`)

- **내 캐릭터 시트** (편집 가능, 수정 시 재승인 필요 여부는 관리자 설정)
- **전투 이력:** 전적 (승/패/중단) + 각 전투 아카이브 링크
- **서사 기록:** AI가 정리한 내 캐릭터의 공식 타임라인
- **알림 설정:** Discord 알림 on/off (전투 신청, 승인, 뉴스 등 항목별)
- **계정 설정:** Discord 연동 상태, 프로필 이미지 변경

---

## API (백엔드)

> 마이페이지 전용 API는 없음. 기존 API 조합으로 구성:
> - `GET /api/characters/me` — 내 캐릭터 정보
> - `PATCH /api/characters/:id` — 캐릭터 수정
> - `GET /api/characters/:id/lore` — 서사 타임라인
> - `PATCH /api/auth/me` — 알림 설정 변경

---

## DB 스키마

> 마이페이지 전용 테이블 없음. `characters`, `character_lore`, `users.notification_settings` 활용.
