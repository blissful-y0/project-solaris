/** DOWNTIME 채팅방 참가자 */
export interface RoomParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

/** 채팅 메시지 타입 */
export type RoomMessageType = "narration" | "system" | "narrative_request";

/** 채팅 메시지 */
export interface RoomMessage {
  id: string;
  type: RoomMessageType;
  sender?: RoomParticipant;
  content: string;
  timestamp: string;
  isMine?: boolean;
  narrativeRequest?: NarrativeRequest;
}

/** 서사 반영 요청 상태 (관리자 검토) */
export type NarrativeRequestStatus = "pending" | "approved" | "rejected";

/** 서사 반영 요청 */
export interface NarrativeRequest {
  requesterId: string;
  rangeStart: string;
  rangeEnd: string;
  status: NarrativeRequestStatus;
}
