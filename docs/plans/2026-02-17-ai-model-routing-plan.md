# AI 모델 기능별 고정 라우팅 플랜

> 작성일: 2026-02-17
> 범위: Admin 설정 + API 스펙 + 운영 정책 동기화

> 상태 업데이트: 이 문서는 `2026-02-17-comprehensive-planning-v2.md`의 하위 주제로 통합 관리한다.

## 목표

관리자에서 기능별로 AI 모델을 고정 선택할 수 있게 하고, 런타임에서 해당 정책을 일관되게 적용한다.

## 고정 기능 키

- `main_story`
- `battle_judgment`
- `lore_reflection`
- `news_generation`

## 기본 라우팅

- `main_story`: `claude-opus` (fallback: `claude-sonnet`)
- `battle_judgment`: `gemini-pro` (fallback: `gemini-flash`)
- `lore_reflection`: `gemini-flash` (fallback: `claude-sonnet`)
- `news_generation`: `gemini-flash` (fallback 없음)

## Admin 정책

- 경로: `/admin/settings/ai-models`
- API:
  - `GET /api/admin/settings/ai-model-routing`
  - `PUT /api/admin/settings/ai-model-routing`
- 검증:
  - 기능 키 고정
  - allowlist 외 모델 저장 금지
  - fallback 중복 금지
  - `version` 낙관적 잠금(409)

## 문서 동기화 체크

- `docs/project/API-SPEC.md`: 엔드포인트/응답/검증 규칙 반영
- `docs/project/ADMIN-SPEC.md`: 정책 화면/운영 가드레일 반영
- `docs/project/SERVICE-SPEC.md`: 아키텍처 AI 정책 문구 반영
- `docs/project/DB-SCHEMA.md`: `ai_model_routing` 확장안 반영

## 메모

현재 `develop` 문서 구조 기준에서 우선 정책을 고정했으며, 이후 `docs/project/*` 구조로 정리 시 동일 내용으로 재동기화한다.
