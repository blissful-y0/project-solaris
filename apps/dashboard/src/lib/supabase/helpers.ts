import type { PostgrestError } from "@supabase/supabase-js";

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: PostgrestError };

export function getUserFriendlyError(error: PostgrestError): string {
  if (error.code === "23505") return "이미 등록된 캐릭터가 있습니다.";
  if (error.code === "23503") return "참조 데이터를 찾을 수 없습니다.";
  if (error.code === "42501") return "권한이 없습니다.";
  if (error.code === "23514") return "입력 값이 제약 조건을 만족하지 않습니다.";
  if (error.code === "22P02") return "입력 형식이 올바르지 않습니다.";
  if (error.code === "PGRST116") return "데이터를 찾을 수 없습니다.";
  return "알 수 없는 오류가 발생했습니다.";
}
