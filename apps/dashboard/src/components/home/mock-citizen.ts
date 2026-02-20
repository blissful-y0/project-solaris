/** 시민 ID 카드 데이터 인터페이스 */
type ISODateString = `${number}-${number}-${number}`;

/** 시민 등록 상태 */
export type CitizenStatus = "pending" | "approved" | "rejected";

export interface CitizenData {
  characterId?: string; // DB characters.id — 아바타 업로드용
  name: string;
  faction: "Enforcer" | "Static";
  resonanceRate: number; // 0-100
  hp: { current: number; max: number };
  will: { current: number; max: number };
  citizenId: string; // "SCC-7291-0483" 형식
  avatarUrl: string | null;
  abilityClass: string; // 뒷면 표시용 — 역장/감응/변환/연산
  joinDate: ISODateString; // YYYY-MM-DD
  status?: CitizenStatus; // 미지정 시 approved 취급
}

/** 개발/테스트용 목 시민 데이터 */
export const mockCitizen: CitizenData = {
  name: "아마츠키 레이",
  faction: "Enforcer",
  resonanceRate: 87,
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  citizenId: "SCC-7291-0483",
  avatarUrl: null,
  abilityClass: "역장 (Field)",
  joinDate: "2026-01-15",
};
