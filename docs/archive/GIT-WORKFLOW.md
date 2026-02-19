# Git 관리 전략 (Project Solaris)

## 목표
- 기준 브랜치를 명확히 유지한다.
- 기능 작업을 worktree로 분리해 충돌을 줄인다.
- 머지 완료 브랜치를 주기적으로 정리한다.

## 기본 원칙
- 장기 유지 브랜치: `main`, `develop`
- 기능 작업 브랜치: `feat/*`, `fix/*`, `chore/*`
- 루트 워크트리(`project-solaris`)는 기본적으로 `develop`만 사용한다.
- 실제 개발/검증은 `.worktrees/<task-branch>/`에서 진행한다.
- **worktree 경로는 프로젝트 내부 `.worktrees/`로 통일한다.**
- `~/.../project-solaris-worktrees` 같은 외부 worktree 경로는 신규 생성하지 않는다.

## 권장 작업 흐름
1. 최신 동기화
```bash
git checkout develop
git pull --ff-only
```

2. 기능 브랜치 + worktree 생성
```bash
git worktree add .worktrees/feat-<topic> -b feat/<topic> develop
cd .worktrees/feat-<topic>
```

3. 작업/테스트/커밋
```bash
pnpm --filter @solaris/dashboard test
pnpm --filter @solaris/dashboard build
git add .
git commit -m "feat: ..."
```

4. 원격 푸시 + PR
```bash
git push -u origin feat/<topic>
gh pr create --base develop --head feat/<topic>
```

5. 머지 후 정리
```bash
gh pr merge <PR_NUMBER> --squash --delete-branch
git fetch --prune
git worktree prune
```

6. 외부 worktree를 `.worktrees/`로 정리(1회 마이그레이션)
```bash
git worktree list
# 외부 경로 worktree를 확인한 뒤, 브랜치 기준으로 내부 .worktrees로 재생성
git worktree add .worktrees/<branch-name> <branch-name>
# 기존 외부 worktree 제거
git worktree remove <old-worktree-path>
```

## 정리 기준
- 즉시 삭제 대상:
  - 이미 `develop`에 머지된 로컬 기능 브랜치
  - 사용 종료된 worktree 디렉터리
- 유지 대상:
  - 진행 중 PR 브랜치
  - 릴리스/핫픽스 대응 예정 브랜치

## 주간 유지보수 루틴
```bash
git fetch --prune
git branch --merged develop
git worktree list
git worktree prune
```

## 운영 팁
- 브랜치 base가 잘못되면 rebase보다 "올바른 base에서 새 브랜치 생성 + 체리픽/재작업"이 안전하다.
- 한 브랜치에는 한 주제만 넣는다.
- PR 병합 전 마지막 검증은 항상 실행한다.
- 여러 worktree를 동시에 사용할 때도 기준 저장소 루트는 항상 `develop`으로 유지한다.
