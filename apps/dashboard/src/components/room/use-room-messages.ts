import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { RoomMessage, RoomParticipant } from "./types";

/**
 * Room 메시지 단일 소스 스토어 + Supabase Realtime 구독
 *
 * - 초기 메시지, 전송 응답, Realtime 이벤트를 모두 upsert 하나로 처리
 * - operation_messages INSERT 이벤트 수신 시 참가자 목록으로 sender 해석
 * - participants는 ref로 관리해 구독 재생성 없이 최신 값 유지
 */
export function useRoomMessages(
  operationId: string | undefined,
  initialMessages: RoomMessage[],
  participants: RoomParticipant[],
  currentCharacterId: string,
) {
  const [messagesById, setMessagesById] = useState<Map<string, RoomMessage>>(
    () => new Map(initialMessages.map((message) => [message.id, message])),
  );
  const [orderedIds, setOrderedIds] = useState<string[]>(() => initialMessages.map((message) => message.id));

  const initializedOperationIdRef = useRef<string | undefined>(operationId);
  const participantsRef = useRef(participants);

  // participants가 바뀌면 ref 갱신 (구독 재생성 없이 최신 값 유지)
  useEffect(() => {
    participantsRef.current = participants;

    // 참가자 정보가 늦게 도착한 경우 기존 메시지 sender를 보정한다.
    setMessagesById((prev) => {
      let changed = false;
      const next = new Map(prev);

      for (const [id, message] of prev.entries()) {
        const senderId = message.sender?.id;
        if (!senderId) continue;

        const participant = participants.find((p) => p.id === senderId);
        if (!participant) continue;

        const needsUpdate =
          message.sender?.name !== participant.name ||
          message.sender?.avatarUrl !== participant.avatarUrl;

        if (needsUpdate) {
          next.set(id, { ...message, sender: participant });
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [participants]);

  // operation이 바뀌는 경우에만 스토어를 리셋한다.
  useEffect(() => {
    if (initializedOperationIdRef.current === operationId) return;

    initializedOperationIdRef.current = operationId;
    setMessagesById(new Map(initialMessages.map((message) => [message.id, message])));
    setOrderedIds(initialMessages.map((message) => message.id));
  }, [operationId, initialMessages]);

  const upsertMessage = useCallback((message: RoomMessage) => {
    setMessagesById((prev) => {
      const next = new Map(prev);
      next.set(message.id, message);
      return next;
    });

    setOrderedIds((prev) => {
      if (prev.includes(message.id)) return prev;
      return [...prev, message.id];
    });
  }, []);

  // Supabase Realtime 구독 — operation_messages INSERT
  useEffect(() => {
    if (!operationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`operation_messages:${operationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "operation_messages",
          filter: `operation_id=eq.${operationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            operation_id: string;
            type: string;
            content: string;
            created_at: string;
            sender_character_id?: string | null;
          };

          // 다른 operation의 메시지는 무시
          if (row.operation_id !== operationId) return;

          const sender = row.sender_character_id
            ? participantsRef.current.find((p) => p.id === row.sender_character_id)
            : undefined;

          const message: RoomMessage = {
            id: row.id,
            type: (row.type ?? "narration") as RoomMessage["type"],
            sender:
              sender ??
              (row.sender_character_id
                ? { id: row.sender_character_id, name: "알 수 없음" }
                : undefined),
            content: row.content,
            timestamp: row.created_at,
            isMine: row.sender_character_id === currentCharacterId,
          };

          upsertMessage(message);
        },
      )
      .subscribe((status, err) => {
        console.log("[Realtime] status:", status, err ?? "");
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [operationId, currentCharacterId, upsertMessage]);

  const messages = useMemo(
    () => orderedIds.map((id) => messagesById.get(id)).filter((message): message is RoomMessage => Boolean(message)),
    [messagesById, orderedIds],
  );

  return {
    messages,
    upsertMessage,
  };
}
