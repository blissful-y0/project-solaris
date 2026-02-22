/** ID 파라미터 검증 — UUID, nanoid, 숫자 ID 등 허용 */
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,36}$/;

export function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}
