import { Card, Badge } from "@/components/ui";

/** 목 캐릭터 데이터 */
const MOCK_CHARACTERS = [
  { id: "1", name: "카이 안데르센", faction: "Bureau", ability: "역장(Field)", rank: "B" },
  { id: "2", name: "레이 노바크", faction: "Static", ability: "변환(Shift)", rank: "A" },
  { id: "3", name: "시온 파크", faction: "Bureau", ability: "연산(Compute)", rank: "C" },
  { id: "4", name: "나디아 볼코프", faction: "Static", ability: "감응(Empathy)", rank: "B" },
] as const;

export default function CharactersPage() {
  return (
    <div className="py-6">
      <p className="hud-label mb-2">REGISTRY</p>
      <h1 className="text-xl font-bold text-text mb-6">캐릭터 도감</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        {MOCK_CHARACTERS.map((char) => (
          <article key={char.id}>
            <Card hud>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-text">{char.name}</p>
                  <p className="text-xs text-text-secondary">{char.ability}</p>
                </div>
                <Badge
                  variant={char.faction === "Bureau" ? "default" : "danger"}
                >
                  {char.faction === "Bureau" ? "SBCS" : "STATIC"}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">Rank: {char.rank}</p>
            </Card>
          </article>
        ))}
      </div>
    </div>
  );
}
