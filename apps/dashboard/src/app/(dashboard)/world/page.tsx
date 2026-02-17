import { Card } from "@/components/ui";

/** 세계관 섹션 목 데이터 */
const LORE_SECTIONS = [
  {
    id: "city",
    label: "CITY OF SOLARIS",
    title: "도시 개요",
    description: "멸망 이후 재건된 도시 SOLARIS. HELIOS가 관장하는 통제 사회의 구조와 일상.",
    status: "열람 가능",
  },
  {
    id: "factions",
    label: "FACTIONS",
    title: "진영",
    description: "Solaris Bureau of Civic Security(SBCS)와 Static. 두 세력의 대립 구도.",
    status: "열람 가능",
  },
  {
    id: "abilities",
    label: "ABILITY SYSTEM",
    title: "능력 체계",
    description: "하모닉스 프로토콜과 오버드라이브. 역장, 감응, 변환, 연산의 4계열 분류.",
    status: "열람 가능",
  },
  {
    id: "helios",
    label: "HELIOS",
    title: "HELIOS 시스템",
    description: "도시를 관장하는 AI. 뉴스, 전투 판정, 시민 관리의 주체.",
    status: "제한 열람",
  },
  {
    id: "life",
    label: "DAILY LIFE",
    title: "일상과 문화",
    description: "SOLARIS 시민들의 일상. 구역 구분, 통행 규칙, 문화 시설.",
    status: "준비 중",
  },
  {
    id: "history",
    label: "ARCHIVES",
    title: "기록 보관소",
    description: "멸망 이전의 기록과 재건 과정. 공식 역사와 숨겨진 진실.",
    status: "준비 중",
  },
] as const;

export default function WorldPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <p className="hud-label mb-2">LORE DATABASE</p>
        <h1 className="text-xl font-bold text-text">세계관 허브</h1>
        <p className="text-sm text-text-secondary mt-2">
          SOLARIS 세계관 데이터베이스. 도시의 기록에 접근합니다.
        </p>
      </div>

      {/* 데스크탑: 2열 / 모바일: 1열 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LORE_SECTIONS.map((section) => (
          <article key={section.id}>
            <Card hud className="h-full">
              <div className="flex flex-col h-full">
                <p className="hud-label mb-2 text-primary">{section.label}</p>
                <h2 className="text-lg font-bold text-text mb-2">{section.title}</h2>
                <p className="text-xs text-text-secondary line-clamp-2 flex-1">
                  {section.description}
                </p>
                <div className="mt-3 pt-3 border-t border-border">
                  <span
                    className={`text-xs font-medium ${
                      section.status === "열람 가능"
                        ? "text-success"
                        : section.status === "제한 열람"
                          ? "text-warning"
                          : "text-text-secondary"
                    }`}
                  >
                    {section.status}
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
