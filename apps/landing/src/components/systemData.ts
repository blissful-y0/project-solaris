export interface SystemSection {
  heading: string;
  body: string;
}

export interface SystemInfo {
  code: string;
  title: string;
  glyph: string;
  description: string;
  sections: SystemSection[];
  notionUrl?: string;
}

export const SYSTEMS: SystemInfo[] = [
  {
    code: "GM",
    glyph: "GM",
    title: "헬리오스 전투 관제 시스템",
    description: "서술 논리를 기반으로 AI가 전투 결과를 판단합니다",
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
    description: "Resonance Rate",
    sections: [
      {
        heading: "공명율 등급",
        body: "0-39 일반 | 40-59 감응 | 60-79 각성 | 80+ 초월. 공명율이 높을수록 강력한 능력을 사용할 수 있지만, 인간성을 잃어갈 위험이 따릅니다.",
      },
      {
        heading: "스킬 체계",
        body: "공명율 등급에 따라 해금되는 스킬이 결정됩니다. 각 진영별 고유 스킬 트리가 존재하며, 선택에 따라 캐릭터의 전투 스타일이 달라집니다.",
      },
    ],
  },
  {
    code: "ARC",
    glyph: "ARC",
    title: "시즌제 스토리",
    description: "당신의 선택이 도시의 운명을 바꾼다",
    sections: [
      {
        heading: "시즌 구조",
        body: "시즌마다 메인 스토리 아크가 진행됩니다. 주요 이벤트와 분기점에서 플레이어들의 선택이 스토리의 방향을 결정합니다.",
      },
      {
        heading: "참여 방식",
        body: "캐릭터의 행동이 세계에 반영됩니다. 진영 선택, 임무 수행, 다른 캐릭터와의 관계가 시즌 스토리에 영향을 미칩니다.",
      },
    ],
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
