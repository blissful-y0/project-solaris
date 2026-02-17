/** 시민 ID 카드 데이터 인터페이스 */
export interface CitizenData {
  name: string;
  faction: "Bureau" | "Static";
  resonanceRate: number; // 0-100
  hp: { current: number; max: number };
  will: { current: number; max: number };
  citizenId: string; // "SCC-7291-0483" 형식
  avatarUrl: string | null;
  abilityClass: string; // 뒷면 표시용 — 역장/감응/변환/연산
  joinDate: string; // 뒷면 표시용
}

/** 개발/테스트용 목 시민 데이터 */
export const mockCitizen: CitizenData = {
  name: "카이 서연",
  faction: "Bureau",
  resonanceRate: 87,
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  citizenId: "SCC-7291-0483",
  avatarUrl: null,
  abilityClass: "역장 (Field)",
  joinDate: "2026-01-15",
};
