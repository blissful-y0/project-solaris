import type { RoomMessage, RoomParticipant } from "./types";

/** 목 참가자 3명 (실제 등록 캐릭터 기반) */
export const mockParticipants: RoomParticipant[] = [
  {
    id: "p1",
    name: "아마츠키 레이",
    avatarUrl:
      "https://jasjvfkbprkzxhsnxstd.supabase.co/storage/v1/object/public/character-profile-images/028fdb95-f0b9-447f-b0b0-d664fba2e60e/EZvPWinVxXs6/1771413385812.webp",
  },
  {
    id: "p2",
    name: "루시엘 린",
    avatarUrl:
      "https://jasjvfkbprkzxhsnxstd.supabase.co/storage/v1/object/public/character-profile-images/15b2eb3f-00c7-499b-b7e4-63898fea6721/YFICsj_pXw6A/1771424083390.webp",
  }, // 나 (isMine)
  {
    id: "p3",
    name: "카이 안데르센",
  },
];

/** 목 채팅 로그 — 3명 참가 RP 대화 + 서사 반영 요청 1건 */
export const mockRoomMessages: RoomMessage[] = [
  {
    id: "msg-1",
    type: "system",
    content: "아마츠키 레이님이 방을 개설했습니다.",
    timestamp: "2026-02-18T20:00:00Z",
  },
  {
    id: "msg-2",
    type: "system",
    content: "루시엘 린님이 참가했습니다.",
    timestamp: "2026-02-18T20:00:30Z",
  },
  {
    id: "msg-3",
    type: "system",
    content: "카이 안데르센님이 참가했습니다.",
    timestamp: "2026-02-18T20:01:00Z",
  },
  {
    id: "msg-4",
    type: "narration",
    sender: mockParticipants[0],
    content:
      "아케이드의 네온 간판이 깜빡거리며 골목을 비춘다. 레이는 출입구 옆 벽에 기대선 채 주변을 살폈다. 순찰 시간이 지났는데도 보안국 병력의 기척이 없다.",
    timestamp: "2026-02-18T20:02:00Z",
    isMine: false,
  },
  {
    id: "msg-5",
    type: "narration",
    sender: mockParticipants[1],
    content:
      "루시엘은 간판 아래 서서 주변을 살폈다. 평소와 다른 적막이 골목을 감싸고 있었다. 손가락이 무의식적으로 허리춤의 단말기를 더듬었다.",
    timestamp: "2026-02-18T20:03:00Z",
    isMine: true,
  },
  {
    id: "msg-6",
    type: "narration",
    sender: mockParticipants[2],
    content:
      '"조용하군." 카이가 골목 끝을 가리키며 말했다. "3구역 센서가 전부 오프라인이야. 우연치곤 범위가 넓어."',
    timestamp: "2026-02-18T20:04:00Z",
    isMine: false,
  },
  {
    id: "msg-7",
    type: "narration",
    sender: mockParticipants[0],
    content:
      "레이가 고개를 끄덕였다. \"의도적인 사각지대야. 누군가 이 구역의 감시를 일부러 끊었어.\" 그녀의 시선이 골목 안쪽 어둠 속으로 향했다.",
    timestamp: "2026-02-18T20:05:00Z",
    isMine: false,
  },
  {
    id: "msg-8",
    type: "narration",
    sender: mockParticipants[1],
    content:
      "\"확인해 볼게.\" 루시엘이 단말기를 꺼내 주변 주파수를 스캔했다. 화면에 비정상적인 신호 패턴이 떠올랐다. \"...이건 헬리오스 표준 프로토콜이 아닌데.\"",
    timestamp: "2026-02-18T20:06:00Z",
    isMine: true,
  },
  {
    id: "msg-9",
    type: "narration",
    sender: mockParticipants[2],
    content:
      "카이가 루시엘의 단말기를 힐끗 보더니 눈을 가늘게 떴다. \"Static 주파수 대역과 비슷해. 근데 암호화 방식이 다르다.\" 그가 권총의 안전장치를 해제했다.",
    timestamp: "2026-02-18T20:07:00Z",
    isMine: false,
  },
  {
    id: "msg-10",
    type: "narrative_request",
    sender: mockParticipants[0],
    content: "아마츠키 레이가 서사 반영을 요청했습니다.",
    timestamp: "2026-02-18T20:08:00Z",
    isMine: false,
    narrativeRequest: {
      requesterId: "p1",
      rangeStart: "msg-4",
      rangeEnd: "msg-9",
      status: "pending",
    },
  },
  {
    id: "msg-11",
    type: "narration",
    sender: mockParticipants[2],
    content:
      "카이가 조용히 골목 안쪽으로 발걸음을 옮겼다. 벽면의 배관에서 새어 나오는 증기 사이로 희미한 빛이 보였다.",
    timestamp: "2026-02-18T20:10:00Z",
    isMine: false,
  },
];

/** 목 방 정보 */
export const mockRoomInfo = {
  id: "room-1",
  title: "중앙 아케이드 야간 순찰",
  participants: mockParticipants,
  createdAt: "2026-02-18T20:00:00Z",
};
