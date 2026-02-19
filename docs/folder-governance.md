# Folder Governance (Dashboard)

> 기준 브랜치: `develop`  
> 적용 범위: `apps/dashboard/src`

## 목적
- 파일 배치 기준을 고정해 탐색 비용을 줄인다.
- 기능 추가 시 책임 경계를 명확히 한다.

## 디렉터리 책임
- `app/*`: 라우트 엔트리, 서버/클라이언트 페이지, route handler만 둔다.
- `components/*`: 재사용 UI/기능 조합 컴포넌트를 둔다.
- `lib/*`: 외부 연동, 유틸, 환경변수, 인증 가드 등 비-UI 로직을 둔다.
- `hooks/*`: 컴포넌트 상태/동작 훅을 둔다.
- `test/*`: 테스트 부트스트랩/공통 테스트 설정을 둔다.

## 라우트와 컴포넌트 경계
- `app/(dashboard)/*/page.tsx`는 화면 조립과 데이터 로드에 집중한다.
- 복잡한 화면 조각은 반드시 `components/<domain>`으로 분리한다.
- `app`에서만 쓰는 작은 보조 함수는 해당 라우트 파일 내부에 유지한다.

## 도메인 폴더 규칙
- `components/home`: 홈 탭 전용 UI
- `components/registry`: 레지스트리 전용 UI
- `components/operation`: 전투/작전 전용 UI
- `components/admin`: 관리자 전용 UI
- `components/common`: 여러 도메인에서 공유하는 UI
- `components/ui`: 디자인 시스템 원자/분자 컴포넌트

## 중복 방지 규칙
- 같은 의미의 컴포넌트를 도메인별로 복제하지 않는다.
- 공통화 조건: 2개 이상 도메인에서 사용하는 UI/로직
- 공통화 위치: `components/common` 또는 `components/ui`
- 예외: 도메인 용어/권한 정책이 강하게 결합된 컴포넌트

## 네이밍 규칙
- 파일명은 컴포넌트명과 일치 (`PascalCase.tsx`)
- 테스트는 같은 디렉터리의 `__tests__/*.test.tsx`
- 도메인 인덱스 파일(`index.ts`)은 외부 공개 API만 export

## 변경 체크리스트
- 새 파일이 `app`와 `components` 경계를 위반하지 않는가?
- 기존 공통 컴포넌트 재사용 가능성을 먼저 검토했는가?
- 신규 도메인 폴더 추가 시 이 문서에 책임을 업데이트했는가?
