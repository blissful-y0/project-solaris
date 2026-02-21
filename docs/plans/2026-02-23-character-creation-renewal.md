# 캐릭터 생성 리뉴얼 TODO

> 2026-02-22 발견된 버그 및 개선사항 정리

---

## 1. 최대 글자 수 UI 명시

**문제**: 서버에 검증 로직은 있지만 사용자에게 제한이 보이지 않음. 긴 텍스트 작성 후 제출 시 에러.

**현재 서버 검증** (`src/app/actions/character.ts`):
- 캐릭터 이름: 2~30자
- 능력 이름: 1~40자
- 능력 설명: 1~500자
- 외형/뒷이야기: 제한 없음 (필요 시 추가)

**작업**:
- [ ] 각 입력 필드에 실시간 글자 수 카운터 표시 (예: `12/30`)
- [ ] maxLength 속성 또는 커스텀 검증으로 초과 입력 방지
- [ ] 외형/뒷이야기 최대 길이 정책 확정 후 적용

**관련 파일**:
- `src/app/actions/character.ts` — `validateDraft()` 함수
- `src/components/character/` — 위자드 스텝 컴포넌트들

---

## 2. 줄바꿈 보존 및 표시

**문제**: textarea에서 줄바꿈 입력 → DB 저장 시 `\n` 유지 여부 불확실 → 프로필/상세 UI에서 줄바꿈 무시됨.

**영향 필드**:
- 외형 (appearance)
- 뒷이야기 (backstory)
- 능력 설명 (description)
- 능력 약점 (weakness)

**작업**:
- [ ] textarea 입력 → DB INSERT 시 줄바꿈(`\n`) 보존 확인
- [ ] 프로필 상세 UI에서 `whitespace-pre-wrap` 또는 `<br>` 변환 적용
- [ ] Registry 캐릭터 상세 페이지에서도 동일 처리
- [ ] 캐릭터 생성 위자드 확인(StepConfirm) 단계에서도 줄바꿈 미리보기 반영

**관련 파일**:
- `src/components/character/` — 위자드 + 확인 스텝
- `src/app/(dashboard)/registry/[id]/` — 캐릭터 상세 페이지
- DB 쿼리/API 응답에서 텍스트 이스케이핑 여부 확인

---

## 3. 자동 저장(useDraftSave) UI 떨림

**문제**: localStorage 자동 저장 시 UI가 흔들리는 현상. 디바운스(500ms) 저장마다 `isSaved` 상태가 `false→true`로 토글되면서 리렌더가 발생하고, draft 객체가 매번 새 참조를 생성해 effect가 반복 트리거될 가능성.

**추정 원인**:
- `useDraftSave`의 `setIsSaved(false)` → 500ms 후 `setIsSaved(true)` → 부모 리렌더
- draft 객체가 매 렌더마다 새 참조 → useEffect 의존성 변경 → 무한 저장/리렌더 루프 가능성
- 저장 상태 표시 UI가 레이아웃 시프트를 유발할 수 있음

**작업**:
- [ ] draft 객체 참조 안정화 (JSON.stringify 비교 또는 useMemo)
- [ ] isSaved 상태 변경이 불필요한 리렌더를 유발하지 않도록 격리
- [ ] 저장 인디케이터가 레이아웃 시프트 없이 표시되도록 수정

**관련 파일**:
- `src/hooks/useDraftSave.ts` — 디바운스 저장 훅
- `src/components/character-create/WizardShell.tsx` — 위자드 셸 (useDraftSave 사용처)

---

## 체크리스트

- [ ] 글자 수 카운터 컴포넌트 구현
- [ ] 위자드 각 스텝에 카운터 적용
- [ ] 줄바꿈 보존 확인 (DB round-trip 테스트)
- [ ] 프로필 UI whitespace-pre-wrap 적용
- [ ] 위자드 확인 단계 줄바꿈 미리보기
- [ ] 자동 저장 UI 떨림 수정
- [ ] 테스트 추가
