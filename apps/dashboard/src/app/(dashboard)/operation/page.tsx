import { Card, Badge } from "@/components/ui";

type RoomType = "전투" | "RP";
type RoomStatus = "대기중" | "진행중";

interface OperationRoom {
  id: string;
  title: string;
  type: RoomType;
  status: RoomStatus;
  participants: number;
  maxParticipants: number;
  host: string;
  description: string;
}

/** 목 작전 채팅방 데이터 */
const MOCK_ROOMS: OperationRoom[] = [
  {
    id: "op-001",
    title: "구역 7-B 정찰 작전",
    type: "전투",
    status: "대기중",
    participants: 2,
    maxParticipants: 4,
    host: "카이 안데르센",
    description: "외곽 구역 비동조 신호 탐지. 정찰 및 무력화 임무.",
  },
  {
    id: "op-002",
    title: "중앙 아케이드 야간 순찰",
    type: "RP",
    status: "진행중",
    participants: 3,
    maxParticipants: 6,
    host: "나디아 볼코프",
    description: "민간 구역 순찰 중 발생하는 일상적 교류.",
  },
  {
    id: "op-003",
    title: "지하 통로 토벌전",
    type: "전투",
    status: "진행중",
    participants: 4,
    maxParticipants: 4,
    host: "레이 노바크",
    description: "지하 통로에 은거 중인 적대 세력 소탕.",
  },
  {
    id: "op-004",
    title: "보안국 내부 면담",
    type: "RP",
    status: "대기중",
    participants: 1,
    maxParticipants: 3,
    host: "시온 파크",
    description: "SBCS 내부 기밀 면담. 초대 필요.",
  },
  {
    id: "op-005",
    title: "외곽 검문소 야간 교대",
    type: "RP",
    status: "대기중",
    participants: 0,
    maxParticipants: 4,
    host: "HELIOS",
    description: "외곽 검문소 교대 근무 중 발생하는 에피소드.",
  },
];

export default function OperationPage() {
  return (
    <div className="py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label mb-2">OPERATION</p>
          <h1 className="text-xl font-bold text-text">작전 목록</h1>
        </div>
        <p className="text-xs text-text-secondary">
          {MOCK_ROOMS.length}개 작전 진행 중
        </p>
      </div>

      {/* 데스크탑: 2열 그리드 / 모바일: 단일 열 */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_ROOMS.map((room) => (
          <article key={room.id}>
            <Card hud className="h-full">
              <div className="flex flex-col h-full">
                {/* 상단: 타입 뱃지 + 상태 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={room.type === "전투" ? "info" : "warning"}
                    >
                      {room.type}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${
                        room.status === "진행중"
                          ? "text-success"
                          : "text-text-secondary"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-primary">
                    {room.participants}/{room.maxParticipants}
                  </p>
                </div>

                {/* 제목 + 설명 */}
                <p className="font-semibold text-text mb-1">
                  {room.title}
                </p>
                <p className="text-xs text-text-secondary line-clamp-2 flex-1">
                  {room.description}
                </p>

                {/* 하단: 호스트 */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    호스트: <span className="text-text">{room.host}</span>
                  </p>
                </div>
              </div>
            </Card>
          </article>
        ))}
      </div>
    </div>
  );
}
