"use client";

import { DowntimeRoom } from "@/components/room";
import {
  mockParticipants,
  mockRoomMessages,
  mockRoomInfo,
} from "@/components/room/mock-room-data";

/** DOWNTIME 채팅방 페이지 — 목 데이터 기반 */
export default function RoomPage() {
  return (
    <div className="fixed top-22 bottom-16 left-0 right-0 md:bottom-0">
      <div className="w-full max-w-7xl mx-auto h-full">
        <DowntimeRoom
          roomTitle={mockRoomInfo.title}
          participants={mockParticipants}
          initialMessages={mockRoomMessages}
          currentUserId="p2"
        />
      </div>
    </div>
  );
}
