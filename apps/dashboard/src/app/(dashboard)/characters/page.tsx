import { Card, Badge } from "@/components/ui";

/** 목 캐릭터 데이터 */
const MOCK_CHARACTERS = [
  {
    id: "1",
    name: "카이 안데르센",
    faction: "Bureau" as const,
    ability: "역장(Field)",
    rank: "B",
    status: "활동 중",
    description: "외곽 구역 전담 요원. 냉철한 판단력으로 알려져 있다.",
  },
  {
    id: "2",
    name: "레이 노바크",
    faction: "Static" as const,
    ability: "변환(Shift)",
    rank: "A",
    status: "활동 중",
    description: "지하 네트워크의 핵심 인물. 변환 능력의 달인.",
  },
  {
    id: "3",
    name: "시온 파크",
    faction: "Bureau" as const,
    ability: "연산(Compute)",
    rank: "C",
    status: "대기",
    description: "데이터 분석 전문. HELIOS 시스템과의 높은 공명율을 보인다.",
  },
  {
    id: "4",
    name: "나디아 볼코프",
    faction: "Static" as const,
    ability: "감응(Empathy)",
    rank: "B",
    status: "활동 중",
    description: "감응 계열 최고 수준의 오퍼레이터. 정보 수집 담당.",
  },
  {
    id: "5",
    name: "제로",
    faction: "Static" as const,
    ability: "역장(Field)",
    rank: "A",
    status: "미확인",
    description: "신원 불명. 외곽에서 목격 보고만 존재.",
  },
  {
    id: "6",
    name: "유진 하",
    faction: "Bureau" as const,
    ability: "감응(Empathy)",
    rank: "B",
    status: "활동 중",
    description: "민간 구역 담당 조율관. 시민 대응 최전선.",
  },
];

export default function CharactersPage() {
  return (
    <div className="py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="hud-label mb-2">REGISTRY</p>
          <h1 className="text-xl font-bold text-text">캐릭터 도감</h1>
        </div>
        <p className="text-xs text-text-secondary">
          등록 오퍼레이터 {MOCK_CHARACTERS.length}명
        </p>
      </div>

      {/* 데스크탑: 3열 / 태블릿: 2열 / 모바일: 1열 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CHARACTERS.map((char) => (
          <article key={char.id}>
            <Card hud className="h-full">
              <div className="flex flex-col h-full">
                {/* 상단: 뱃지 + 랭크 */}
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={char.faction === "Bureau" ? "info" : "danger"}
                  >
                    {char.faction === "Bureau" ? "SBCS" : "STATIC"}
                  </Badge>
                  <span className="text-xs font-mono text-text-secondary">
                    RANK {char.rank}
                  </span>
                </div>

                {/* 이름 + 능력 */}
                <p className="font-semibold text-text text-lg">{char.name}</p>
                <p className="text-xs text-primary mt-1">{char.ability}</p>

                {/* 설명 */}
                <p className="text-xs text-text-secondary mt-2 line-clamp-2 flex-1">
                  {char.description}
                </p>

                {/* 하단: 상태 */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-secondary">상태</span>
                  <span
                    className={`text-xs font-medium ${
                      char.status === "활동 중"
                        ? "text-success"
                        : char.status === "미확인"
                          ? "text-accent"
                          : "text-text-secondary"
                    }`}
                  >
                    {char.status}
                  </span>
                </div>
              </div>
            </Card>
          </article>
        ))}
      </div>
    </div>
  );
}
