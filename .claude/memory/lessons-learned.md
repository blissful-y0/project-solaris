# Lessons Learned — 2026-02-16 System Popups

## 시행착오

### 1. 모달이 안 떠요 (가장 큰 삽질)
- **증상**: 카드 클릭 시 모달 대신 하단으로 스크롤됨
- **원인**: `.section-shell > *` 가 unlayered CSS로 `position: relative` 설정. Tailwind v4의 `fixed` 클래스는 `@layer utilities` 안에 있어서 cascade에서 짐.
- **해결**: `createPortal(jsx, document.body)` — DOM 트리 자체를 탈출
- **교훈**: Tailwind v4에서 `position` 관련 유틸리티가 안 먹히면 unlayered CSS부터 의심. 모달은 무조건 Portal.

### 2. 애니메이션 타이머 경합
- **증상**: 모달 열리는 도중 닫으면 다시 열림
- **원인**: `setTimeout(() => setPhase("expand"), 300)` 이 `setPhase("closing")` 이후에 실행되면서 덮어씀
- **해결**: `setPhase((prev) => prev === "closing" ? prev : "expand")` — functional update로 가드
- **교훈**: 여러 setTimeout이 상태를 건드릴 때는 항상 functional update 사용.

### 3. HUD 브래킷이 콘텐츠와 함께 밀림
- **증상**: 모달 콘텐츠가 길어지면 HUD 코너 브래킷이 하단으로 내려감
- **해결**: 모달을 고정 높이(`92vh`) + `flex flex-col`, 내부 콘텐츠에 `overflow-y-auto`
- **교훈**: 장식 요소가 있는 컨테이너는 높이 고정 + 내부 스크롤 패턴.

### 4. 채팅 버블 가독성
- **증상**: 밝은 배경(시안/블루) 위에 밝은 텍스트 → 안 보임
- **해결**: 밝은 bg → `rgba(0,0,0,0.8)` 텍스트, 어두운 bg → `rgba(255,255,255,0.9)` 텍스트
- **교훈**: 버블 색상과 텍스트 색상은 항상 대비 체크.

### 5. 유저의 직접 파일 수정
- **증상**: 커밋 후 `git diff`에 유저가 수정한 내용이 잔뜩 남아있음
- **원인**: 유저가 dev 서버 확인 후 직접 파일을 수정 (텍스트, 용어, 스타일)
- **교훈**: 커밋 전 반드시 `git status` + `git diff --stat` 확인. 유저 수정분을 별도 커밋으로 분리.

## 향후 주의사항

### 이 유저와 작업할 때
1. **텍스트는 유저가 결정함** — 세계관 문구를 내가 창작하지 말 것. 유저가 제공한 텍스트를 그대로 사용.
2. **반말체 일관성** — "~합니다" 가 아니라 "~한다" 체. 존댓말로 바꾸면 유저가 다시 고침.
3. **빠른 반영 > 완벽한 설계** — 유저는 눈으로 확인하고 즉시 수정 지시함. 한 번에 완벽하게 하려 하지 말고 빠르게 반복.
4. **커밋 전 diff 확인 필수** — 유저가 중간에 직접 파일 수정하는 경우가 잦음.
5. **모달 컴포넌트 추가 시** — SystemModal.tsx의 code 분기 + 기본 섹션 제외 조건 둘 다 업데이트 필요.

### 기술적 주의
1. **Tailwind v4 + unlayered CSS**: 새 CSS 규칙 추가 시 `@layer` 안에 넣거나, 유틸리티 클래스와 충돌하지 않는지 확인.
2. **Portal 필수**: 모달, 토스트 등 오버레이 UI는 반드시 `createPortal(jsx, document.body)`.
3. **애니메이션 cleanup**: setTimeout 체인 사용 시 반드시 cleanup 함수에서 clearTimeout. 상태 가드도 필수.
4. **CSS 키프레임 등록**: 새 애니메이션 추가 시 `global.css`에 키프레임 추가 + `prefers-reduced-motion` 대응 고려.
5. **description 필드**: systemData의 description은 optional. 커스텀 모달은 description 없이 title만 사용 가능.
