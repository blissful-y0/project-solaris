import { describe, expect, it } from "vitest";
import { isValidId } from "../validate-id";

describe("isValidId", () => {
  it("일반 UUID를 허용한다", () => {
    expect(isValidId("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe(true);
  });

  it("nanoid 형식을 허용한다", () => {
    expect(isValidId("V1StGXR8_Z5jdHi6B-myT")).toBe(true);
  });

  it("숫자 ID를 허용한다", () => {
    expect(isValidId("12345")).toBe(true);
  });

  it("빈 문자열을 거부한다", () => {
    expect(isValidId("")).toBe(false);
  });

  it("36자 초과를 거부한다", () => {
    expect(isValidId("a".repeat(37))).toBe(false);
  });

  it("특수문자를 거부한다", () => {
    expect(isValidId("id; DROP TABLE")).toBe(false);
    expect(isValidId("../../../etc/passwd")).toBe(false);
    expect(isValidId("id<script>")).toBe(false);
  });
});
