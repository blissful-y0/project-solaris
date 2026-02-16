export interface SystemSection {
  heading: string;
  body: string;
}

export interface SystemInfo {
  code: string;
  title: string;
  glyph: string;
  description?: string;
  sections: SystemSection[];
  notionUrl?: string;
}

export const SYSTEMS: SystemInfo[] = [
  {
    code: "GM",
    glyph: "GM",
    title: "전투 관제 시스템",
    sections: [
      {
        heading: "판정 방식",
        body: "AI GM이 캐릭터의 스탯, 공명율, 상황 맥락을 종합하여 전투 결과를 판정합니다. 서술의 논리성과 창의성이 판정에 영향을 줍니다.",
      },
      {
        heading: "전투 흐름",
        body: "행동 선언 → AI 판정 → 결과 서술. 턴제로 진행되며, 각 턴마다 플레이어의 서술이 전투의 방향을 결정합니다.",
      },
    ],
  },
  {
    code: "SYNC",
    glyph: "SYNC",
    title: "공명율",
    sections: [],
  },
  {
    code: "ARC",
    glyph: "ARC",
    title: "사건 발생 시스템",

    sections: [],
  },
  {
    code: "OC",
    glyph: "OC",
    title: "캐릭터 생성",
    description: "당신만의 캐릭터를 만드세요",
    sections: [
      {
        heading: "캐릭터 시트",
        body: "기본 정보, 공명율, 진영 소속, 배경 스토리를 설정합니다. 세계관에 맞는 캐릭터를 구성하기 위한 가이드라인을 제공합니다.",
      },
      {
        heading: "가이드라인",
        body: "솔라리스 돔 내부의 시민이든, 외곽의 추방자든 — 세계관에 어울리는 배경을 가진 캐릭터를 만들어보세요.",
      },
    ],
  },
];
