/* ─── 전투 세션 목 데이터: 1v1 전투 3턴 채팅 로그 ─── */

import type {
  BattleParticipant,
  BattleSessionData,
  ChatMessage,
} from "./types";

/* ── 참가자 ── */

export const mockParticipants: BattleParticipant[] = [
  {
    id: "p1",
    name: "카이 안데르센",
    faction: "bureau",
    team: "ally",
    hp: { current: 49, max: 80 },
    will: { current: 193, max: 250 },
    abilities: [
      { id: "a1", name: "역장 전개", tier: "basic", costHp: 0, costWill: 5 },
      { id: "a2", name: "압축 역장", tier: "mid", costHp: 0, costWill: 12 },
      { id: "a3", name: "역장 폭쇄 — 거울", tier: "advanced", costHp: 0, costWill: 25 },
    ],
  },
  {
    id: "p2",
    name: "나디아 볼코프",
    faction: "static",
    team: "enemy",
    hp: { current: 52, max: 120 },
    will: { current: 138, max: 150 },
    abilities: [
      { id: "b1", name: "발화", tier: "basic", costHp: 15, costWill: 0 },
      { id: "b2", name: "열 전도", tier: "mid", costHp: 35, costWill: 0 },
      { id: "b3", name: "백열폭주 — 재", tier: "advanced", costHp: 55, costWill: 0 },
    ],
  },
];

/* ── 채팅 로그 (3턴) ── */

export const mockMessages: ChatMessage[] = [
  /* ─ 오프닝 나레이션: 전투 개시 전 상황 묘사 ─ */
  {
    id: "msg-opening",
    type: "gm_narration",
    content:
      "구역 7-B, 폐열 배관 구간. 녹슨 파이프 사이로 증기가 새어나오고, 천장 조명은 간헐적으로 명멸한다. 두 사람의 발소리가 좁은 통로에 울려 퍼진다.",
    timestamp: "2026-02-18T13:59:00Z",
  },

  /* ─ TURN 1 ─ */
  {
    id: "msg-0",
    type: "system",
    content: "TURN 1",
    timestamp: "2026-02-18T14:00:00Z",
  },

  /* ─ 턴 1 ─ */
  {
    id: "msg-1",
    type: "narration",
    senderId: "p2",
    senderName: "나디아 볼코프",
    content:
      "증기가 터지는 순간 재는 배관에서 손을 놓고 낙하했다. 왼쪽 어깨에 뜨거운 증기가 스쳤지만 이 정도 열은 몸이 알아서 흡수한다. 착지하며 오른손을 바닥에 짚자 전도관의 금속 표면이 손바닥 아래에서 적열색으로 달아올랐다.",
    timestamp: "2026-02-18T14:01:00Z",
    isMine: false,
    action: {
      actionType: "attack",
      abilityName: "열 전도",
      targetName: "카이 안데르센",
    },
  },
  {
    id: "msg-2",
    type: "narration",
    senderId: "p1",
    senderName: "카이 안데르센",
    content:
      "접촉 감지와 동시에 거울은 왼쪽 전도관 뒤로 몸을 낮췄다. 헬리오스의 연산이 머릿속으로 흘러들어온다. 오른손을 펼쳐 통로 중앙에 3미터 폭의 역장 벽을 전개했다. 반투명한 푸른 막이 통로를 양분한다.",
    timestamp: "2026-02-18T14:02:00Z",
    isMine: true,
    action: {
      actionType: "defend",
      abilityName: "역장 전개",
      targetName: "카이 안데르센",
    },
  },
  {
    id: "msg-3",
    type: "judgment",
    content: "",
    timestamp: "2026-02-18T14:03:00Z",
    judgment: {
      turn: 1,
      participantResults: [
        { participantId: "p1", participantName: "카이", grade: "partial", scores: { narrative: 7, tactical: 6, cost: 7, quality: 7 } },
        { participantId: "p2", participantName: "나디아", grade: "success", scores: { narrative: 8, tactical: 7, cost: 6, quality: 8 } },
      ],
      statChanges: [
        { participantId: "p1", participantName: "카이", stat: "hp", before: 80, after: 65, reason: "피해" },
        { participantId: "p1", participantName: "카이", stat: "will", before: 250, after: 245, reason: "코스트" },
        { participantId: "p2", participantName: "나디아", stat: "hp", before: 120, after: 85, reason: "코스트" },
      ],
    },
  },
  {
    id: "msg-3n",
    type: "gm_narration",
    content: "열이 역장 하단을 침투해 거울의 발밑이 달아오른다. 자세가 흐트러진 찰나에 역장 벽의 일부가 요동치지만, 완전히 붕괴하지는 않았다. 재 역시 이중 발화의 반동으로 무릎이 꺾이며 추격 불가 상태에 빠졌다.",
    timestamp: "2026-02-18T14:03:01Z",
  },

  /* ─ 턴 2 ─ */
  {
    id: "msg-4",
    type: "system",
    content: "TURN 2",
    timestamp: "2026-02-18T14:04:00Z",
  },
  {
    id: "msg-5",
    type: "narration",
    senderId: "p1",
    senderName: "카이 안데르센",
    content:
      "거울은 흐트러진 자세를 바로잡으며 역장의 파편을 양손에 압축했다. 헬리오스가 최적 궤도를 계산하는 동안 달아오른 바닥을 발로 밀어 뒤로 미끄러졌다. 압축 역장을 재의 발밑으로 투사 — 폭쇄가 아니라 지면 자체를 뒤흔들어 중심을 무너뜨리는 교란이다.",
    timestamp: "2026-02-18T14:05:00Z",
    isMine: true,
    action: {
      actionType: "attack",
      abilityName: "압축 역장",
      targetName: "나디아 볼코프",
    },
  },
  {
    id: "msg-6",
    type: "narration",
    senderId: "p2",
    senderName: "나디아 볼코프",
    content:
      "바닥이 흔들리는 순간 재는 오히려 앞으로 뛰어들었다. 발화가 발끝에서 터지며 추진력을 만든다. 코피가 흘러내리지만 멈출 수 없다. 불꽃 부스트로 역장 파편 너머까지 도달해 거울의 역장 유지 범위 안으로 침투 — 근접전으로 전환한다.",
    timestamp: "2026-02-18T14:06:00Z",
    isMine: false,
    action: {
      actionType: "attack",
      abilityName: "발화",
      targetName: "카이 안데르센",
    },
  },
  {
    id: "msg-7",
    type: "judgment",
    content: "",
    timestamp: "2026-02-18T14:07:00Z",
    judgment: {
      turn: 2,
      participantResults: [
        { participantId: "p1", participantName: "카이", grade: "success", scores: { narrative: 9, tactical: 9, cost: 7, quality: 8 } },
        { participantId: "p2", participantName: "나디아", grade: "partial", scores: { narrative: 8, tactical: 7, cost: 6, quality: 7 } },
      ],
      statChanges: [
        { participantId: "p1", participantName: "카이", stat: "will", before: 245, after: 233, reason: "코스트" },
        { participantId: "p2", participantName: "나디아", stat: "hp", before: 85, after: 52, reason: "피해" },
        { participantId: "p2", participantName: "나디아", stat: "hp", before: 52, after: 52, reason: "코스트" },
        { participantId: "p1", participantName: "카이", stat: "hp", before: 65, after: 49, reason: "피해" },
      ],
    },
  },
  {
    id: "msg-7n",
    type: "gm_narration",
    content: "압축 역장이 지면을 뒤흔들며 재의 발밑이 갈라졌다. 그러나 재는 불꽃 추진으로 공중을 가로질러 거울에게 돌진했다. 근접 거리에서 역장의 정밀도가 떨어지고, 뜨거운 주먹이 거울의 옆구리를 스쳤다. 거울은 역장 파편으로 충격을 분산했지만 완전히 막지는 못했다.",
    timestamp: "2026-02-18T14:07:01Z",
  },

  /* ─ 턴 3 ─ */
  {
    id: "msg-8",
    type: "system",
    content: "TURN 3",
    timestamp: "2026-02-18T14:08:00Z",
  },
  {
    id: "msg-9",
    type: "narration",
    senderId: "p2",
    senderName: "나디아 볼코프",
    content:
      "재는 뒤로 물러서며 숨을 고른다. 왼쪽 무릎이 떨리고 시야가 흐려진다. 마지막 한 번. 바닥에 웅크린 자세에서 양손의 열을 한 점에 모아 거울의 역장 중심부를 향해 분출했다. 오버드라이브 한계 — 이게 안 되면 끝이다.",
    timestamp: "2026-02-18T14:09:00Z",
    isMine: false,
    action: {
      actionType: "attack",
      abilityName: "백열폭주 — 재",
      targetName: "카이 안데르센",
    },
  },
  {
    id: "msg-10",
    type: "narration",
    senderId: "p1",
    senderName: "카이 안데르센",
    content:
      "거울은 열파를 감지하고 양손을 앞으로 내밀었다. 역장 벽을 삼중으로 겹쳐 세운다. 헬리오스의 연산 보조가 떨리는 손가락 끝을 안정시키며 역장의 두께를 최적화한다. WILL이 빠르게 소모되지만 여기서 뚫리면 끝이다.",
    timestamp: "2026-02-18T14:10:00Z",
    isMine: true,
    action: {
      actionType: "defend",
      abilityName: "역장 폭쇄 — 거울",
      targetName: "카이 안데르센",
    },
  },
  {
    id: "msg-11",
    type: "judgment",
    content: "",
    timestamp: "2026-02-18T14:11:00Z",
    judgment: {
      turn: 3,
      participantResults: [
        { participantId: "p1", participantName: "카이", grade: "success", scores: { narrative: 9, tactical: 8, cost: 9, quality: 9 } },
        { participantId: "p2", participantName: "나디아", grade: "fail", scores: { narrative: 7, tactical: 5, cost: 8, quality: 7 } },
      ],
      statChanges: [
        { participantId: "p1", participantName: "카이", stat: "will", before: 233, after: 193, reason: "코스트" },
        { participantId: "p2", participantName: "나디아", stat: "hp", before: 52, after: 52, reason: "피해" },
        { participantId: "p2", participantName: "나디아", stat: "will", before: 150, after: 138, reason: "반동" },
      ],
    },
  },
  {
    id: "msg-11n",
    type: "gm_narration",
    content: "백열의 불꽃이 삼중 역장에 충돌했다. 첫 번째 역장이 산산이 부서지고, 두 번째가 금이 가며 요동쳤다. 하지만 세 번째 역장이 버텼다. 헬리오스의 연산이 마지막 순간 역장의 곡률을 조정해 열을 측면으로 분산시켰다. 재는 모든 열을 쏟아부은 뒤 무릎이 꺾이며 바닥에 쓰러졌다. 오버드라이브의 반동이 전신을 휩쓸고 있다.",
    timestamp: "2026-02-18T14:11:01Z",
  },
];

/* ── 전투 세션 통합 데이터 ── */

export const mockBattleSession: BattleSessionData = {
  id: "op-001",
  title: "구역 7-B 정찰 작전",
  currentTurn: 3,
  phase: "my_turn",
  participants: mockParticipants,
  messages: mockMessages,
  myParticipantId: "p1",
};
