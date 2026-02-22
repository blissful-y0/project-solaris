# AI GM 전투 경합 처리 로직

> '연산은 기계에게, 판정은 지능에게.' — 이 원칙이 무너지는 순간, 시스템은 독재가 되거나 무정부가 된다.

본 문서는 AI GM이 두 세력(또는 캐릭터) 간 전투 경합을 처리하는 전체 파이프라인을 정의한다. 설계의 핵심은 권력 분립(Separation of Powers)이다. 판정의 질적 결정은 LLM에게, 수치의 정량적 연산은 Edge Function에게 엄격히 분리한다.

---

## 1. 설계 철학: 권력 분립 원칙

전투 경합 처리에서 가장 위험한 설계는 '하나의 주체가 판정과 연산을 모두 수행하는 것'이다.

### 1-1. 왜 분리하는가

- LLM은 서사적 맥락을 이해하고 질적 판정(누가 우위인가, 어떤 결과가 서사적으로 타당한가)에 탁월하다.
- LLM은 산술 연산에 취약하다. HP 계산을 LLM에 맡기면 '35 - 12 = 21' 같은 오류가 발생한다.
- Edge Function은 트랜잭션 단위의 원자적 연산과 유효성 검증에 최적화되어 있다.
- 두 역할을 분리함으로써, 판정의 창의성과 연산의 정확성을 동시에 보장한다.

### 1-2. 권력 분립 구조

```
┌─────────────────────────────────────────────────┐
│              AI GM 전투 경합 처리                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [입법부] Phase 1: 유저 서술 수집 (Input)          │
│      ↓                                          │
│  [사법부] Phase 2: LLM 판정 (Judgement)           │
│      ↓  ← JSON 판정문만 출력. 수치 연산 금지.       │
│  [행정부] Phase 3: Edge Function 연산 (Execution) │
│      ↓  ← 판정문 기반 기계적 연산. 재량 금지.       │
│  [언론부] Phase 4: 결과 통합 묘사 (Narration)      │
│                                                 │
└─────────────────────────────────────────────────┘
```

> **핵심 제약:** Phase 2의 LLM은 절대 HP를 직접 계산하지 않는다. Phase 3의 Edge Function은 절대 판정 등급을 자의적으로 변경하지 않는다.

---

## 2. 프로세스 단계별 상세 설계

### Phase 1: 상호 서술 (Input)

**목적:** 양측 유저로부터 서사적 행동 선언을 수집한다.

각 유저는 자신의 캐릭터가 이 교전에서 '무엇을 하는지'를 자유 서술한다. 시스템은 이 서술을 있는 그대로 수집하며, 이 단계에서는 어떠한 판정도 수행하지 않는다.

수집 데이터 구조:

```json
{
  "encounter_id": "enc_20260218_001",
  "phase": "input",
  "participants": [
    {
      "id": "faction_security_bureau",
      "name": "보안국 기동타격대",
      "declaration": "건물 외벽을 따라 기동하며 열화상 스코프로 스태틱 해커의 위치를 특정, 전자기 교란탄을 선제 투사한다.",
      "current_stats": {
        "HP": 85,
        "WILL": 70,
        "RESOURCE": 60
      },
      "relevant_traits": ["군사훈련_Lv3", "전자전_Lv2"],
      "context": "이전 턴에서 정찰 드론으로 적 위치 파악 완료"
    },
    {
      "id": "faction_static",
      "name": "스태틱 해킹 셀",
      "declaration": "보안국의 통신망에 이미 침투한 백도어를 활성화하여 기동타격대의 HUD를 교란하고, 혼란 틈에 데이터 노드를 물리적으로 탈취한다.",
      "current_stats": {
        "HP": 60,
        "WILL": 90,
        "RESOURCE": 45
      },
      "relevant_traits": ["해킹_Lv4", "은신_Lv2"],
      "context": "2턴 전 통신망 침투 성공 상태"
    }
  ]
}
```

> **설계 원칙:** 서술은 '의도'이지 '결과'가 아니다. '적을 제압한다'가 아니라 '제압을 시도한다'의 관점에서 수집한다.

---

### Phase 2: LLM 경합 판정 (Judgement)

**목적:** 양측의 서술, 스탯, 특성, 상황 맥락을 종합하여 질적 판정을 내린다.

이 단계의 LLM은 '재판관'이다. 양측의 주장(서술)을 듣고, 증거(스탯·특성·맥락)를 검토하며, 판결문(JSON)을 작성한다. 단, 판결문에는 형량(수치 연산)을 포함하지 않는다. 오직 '유죄/무죄'(판정 등급)와 '양형 기준'(데미지 계수)만 명시한다.

LLM 프롬프트 핵심 지침:

1. 양측의 서술을 서사적 맥락에서 평가하라.
2. 각 행동의 성공 등급을 판정하라: Critical / Success / Partial / Failure / Critical Failure
3. 데미지 계수(multiplier)를 0.0~2.0 범위로 산출하라. 직접 HP를 계산하지 마라.
4. 판정 근거를 반드시 명시하라 (왜 이 등급인지).
5. 출력은 반드시 아래 JSON 스키마를 따르라.

판정 출력 스키마:

```json
{
  "encounter_id": "enc_20260218_001",
  "phase": "judgement",
  "judgement": {
    "narrative_summary": "보안국의 전자기 교란탄은 효과적이었으나, 스태틱은 이미 보안국 통신망에 침투한 상태였다...",
    "actions": [
      {
        "actor": "faction_security_bureau",
        "action": "전자기 교란탄 투사",
        "grade": "Partial",
        "multiplier": 0.6,
        "reasoning": "교란탄 자체는 유효하나, HUD 교란으로 조준 정확도 저하. 군사훈련 Lv3이 완전 실패를 방지.",
        "stat_targets": [
          {
            "target": "faction_static",
            "stat": "RESOURCE",
            "base_damage": 15
          }
        ]
      },
      {
        "actor": "faction_static",
        "action": "HUD 교란 및 데이터 노드 탈취 시도",
        "grade": "Success",
        "multiplier": 1.0,
        "reasoning": "사전 침투(2턴 전)가 결정적 우위 제공. 해킹 Lv4가 보안국 전자전 Lv2를 압도.",
        "stat_targets": [
          {
            "target": "faction_security_bureau",
            "stat": "WILL",
            "base_damage": 20
          },
          {
            "target": "faction_security_bureau",
            "stat": "RESOURCE",
            "base_damage": 10
          }
        ]
      }
    ]
  }
}
```

판정 등급 기준표:

| 등급 | multiplier | 의미 |
|------|-----------|------|
| Critical | 1.5 ~ 2.0 | 압도적 성공. 추가 효과 발생 가능. |
| Success | 1.0 | 의도한 대로 성공. |
| Partial | 0.4 ~ 0.8 | 부분 성공. 의도의 일부만 달성. |
| Failure | 0.0 | 실패. 데미지 없음. |
| Critical Failure | -0.5 ~ -1.0 | 역효과. 자신에게 피해 발생. |

---

### Phase 3: Edge Function 연산 (Execution)

**목적:** Phase 2의 판정 JSON을 입력받아, 트랜잭션 단위로 양측 스탯을 동시 업데이트한다.

이 단계는 순수한 기계적 연산이다. Edge Function은 판정 등급을 해석하거나 변경할 권한이 없다.

연산 공식:

```
final_damage = floor(base_damage × multiplier)
```

적용 규칙:

1. `final_damage`가 음수(Critical Failure)인 경우, actor 자신에게 적용
2. 스탯은 0 미만으로 내려가지 않음 (clamp to 0)
3. HP가 0이 되면 '무력화' 플래그 설정
4. WILL이 0이 되면 '의지 상실' 플래그 설정
5. 모든 변경은 단일 트랜잭션으로 처리 (원자성 보장)

Edge Function 의사 코드:

```typescript
async function executeJudgement(judgement: Judgement): Promise<ExecutionResult> {
  const tx = supabase.rpc('begin_transaction');

  try {
    const changes: StatChange[] = [];

    for (const action of judgement.actions) {
      for (const target of action.stat_targets) {
        const finalDamage = Math.floor(target.base_damage * action.multiplier);

        // Critical Failure: 자해 데미지
        const actualTarget = action.multiplier < 0 ? action.actor : target.target;
        const actualDamage = Math.abs(finalDamage);

        const currentStat = await getStatValue(actualTarget, target.stat);
        const newValue = Math.max(0, currentStat - actualDamage);

        changes.push({
          target: actualTarget,
          stat: target.stat,
          previous: currentStat,
          damage: actualDamage,
          new_value: newValue,
          flags: checkFlags(target.stat, newValue)
        });

        await updateStat(actualTarget, target.stat, newValue);
      }
    }

    await tx.commit();
    return { success: true, changes, encounter_id: judgement.encounter_id };

  } catch (error) {
    await tx.rollback();
    return { success: false, error: error.message };
  }
}
```

실행 결과 출력:

```json
{
  "encounter_id": "enc_20260218_001",
  "phase": "execution",
  "success": true,
  "changes": [
    {
      "target": "faction_static",
      "stat": "RESOURCE",
      "previous": 45,
      "damage": 9,
      "new_value": 36,
      "flags": []
    },
    {
      "target": "faction_security_bureau",
      "stat": "WILL",
      "previous": 70,
      "damage": 20,
      "new_value": 50,
      "flags": []
    },
    {
      "target": "faction_security_bureau",
      "stat": "RESOURCE",
      "previous": 60,
      "damage": 10,
      "new_value": 50,
      "flags": []
    }
  ],
  "post_state": {
    "faction_security_bureau": { "HP": 85, "WILL": 50, "RESOURCE": 50 },
    "faction_static": { "HP": 60, "WILL": 90, "RESOURCE": 36 }
  }
}
```

> **예외 처리:** 트랜잭션 실패 시 전체 롤백. 부분 적용은 절대 허용하지 않는다. '보안국은 피해를 입었는데 스태틱은 무사한' 비대칭 상태는 시스템 무결성을 파괴한다.

---

### Phase 4: 결과 확정 및 통합 묘사 (Narration)

**목적:** 확정된 수치 변동을 기반으로, 인과관계가 명확한 서사를 생성한다.

이 단계의 LLM은 '기자'다. 판결(Phase 2)과 집행 결과(Phase 3)를 받아, 독자(유저)에게 '무슨 일이 일어났는지'를 전달한다. 중요한 것은 이 서사가 확정 수치에 종속된다는 점이다. 서사가 수치를 만드는 것이 아니라, 수치가 서사를 제약한다.

Narration LLM 프롬프트 핵심 지침:

1. Phase 3의 확정 수치를 정확히 반영하라.
2. 판정 등급에 따라 묘사의 강도를 조절하라.
3. 패배 측에도 서사적 존엄을 부여하라 (일방적 조롱 금지).
4. 수치 변동을 자연스럽게 서사에 녹여라.

등급별 묘사 톤 가이드:

| 등급 | 묘사 톤 |
|------|---------|
| Critical | 압도적, 결정적, 돌이킬 수 없는 |
| Success | 확실한, 의도대로, 계획 통りの |
| Partial | 아슬아슬한, 불완전한, 대가를 치른 |
| Failure | 빗나간, 허탈한, 무위로 돌아간 |
| Critical Failure | 치명적 실수, 역풍, 자충수 |

통합 묘사 출력 예시:

> 스태틱의 해커가 키보드 위에서 손가락을 움직이는 순간, 보안국 기동타격대원들의 HUD가 일제히 붉은 노이즈로 뒤덮였다. 2턴 전 심어둔 백도어가 마침내 그 이빨을 드러낸 것이다. [WILL -20 → 50] 조준점이 흐트러지고, 지휘 통신에 잡음이 섞였다. [RESOURCE -10 → 50]
>
> 그럼에도 보안국은 무너지지 않았다. 군사훈련이 체화된 기동타격대는 HUD 없이도 열화상 스코프의 잔상 데이터를 기반으로 교란탄을 투사했다. 완벽하지는 않았다 — 하지만 스태틱의 중계 장비 일부를 타격하는 데는 성공했다. [스태틱 RESOURCE -9 → 36]
>
> 데이터 노드를 향해 뛰어가는 스태틱 요원의 등 뒤로, 교란탄의 잔향이 푸른 전기 아크를 그리며 사라졌다.

---

## 3. 종합 데이터 플로우 요약

```
User A 서술 ──┐
               ├─→ [Phase 1: Input 수집]
User B 서술 ──┘          │
                         ▼
              [Phase 2: LLM 판정]
              (판정 등급 + 계수 산출)
                         │
                    JSON 판정문
                         │
                         ▼
              [Phase 3: Edge Function]
              (트랜잭션 기반 수치 연산)
                         │
                   확정 수치 변동
                         │
                         ▼
              [Phase 4: LLM 묘사]
              (수치 기반 서사 생성)
                         │
                         ▼
              유저에게 결과 전달
```

---

## 4. 설계 제약 및 불변식 (Invariants)

1. LLM은 절대 사칙연산을 수행하지 않는다. `base_damage`와 `multiplier`만 출력한다.
2. Edge Function은 절대 판정 등급을 해석하거나 변경하지 않는다.
3. 모든 스탯 변경은 단일 트랜잭션이다. 부분 적용은 시스템 버그로 간주한다.
4. Narration은 Phase 3의 확정 수치에 종속된다. 서사적 편의를 위한 수치 왜곡은 금지한다.
5. Critical Failure의 자해 데미지는 예외 없이 적용한다. 서사적 면제 없음.
6. HP/WILL 0 도달 시 플래그는 즉시 설정되며, 다음 Phase 4에서 반드시 서사에 반영한다.

> 이 시스템은 '공정한 게임'을 위한 것이 아니다. '설득력 있는 서사'를 위한 것이다. 공정성은 규칙의 일관된 적용에서 온다. 서사의 설득력은 인과관계의 명확성에서 온다. 이 두 가지를 동시에 달성하기 위해, 우리는 권력을 분립한다.
