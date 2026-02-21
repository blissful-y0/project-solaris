import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RoomMessage } from "./types";

/**
 * Room 메시지 단일 소스 스토어
 *
 * 왜 필요한가?
 * - 초기 메시지, 전송 응답, Realtime 이벤트가 각각 따로 들어오면
 *   중복/순서 꼬임/이름 누락 같은 버그가 발생하기 쉽다.
 * - 이 훅은 "메시지 upsert" 하나로만 상태를 갱신해
 *   화면이 항상 같은 규칙으로 렌더되게 만든다.
 */
export function useRoomMessages(operationId: string | undefined, initialMessages: RoomMessage[]) {
  const [messagesById, setMessagesById] = useState<Map<string, RoomMessage>>(
    () => new Map(initialMessages.map((message) => [message.id, message])),
  );
  const [orderedIds, setOrderedIds] = useState<string[]>(() => initialMessages.map((message) => message.id));

  const initializedOperationIdRef = useRef<string | undefined>(operationId);

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

  const messages = useMemo(
    () => orderedIds.map((id) => messagesById.get(id)).filter((message): message is RoomMessage => Boolean(message)),
    [messagesById, orderedIds],
  );

  return {
    messages,
    upsertMessage,
  };
}
