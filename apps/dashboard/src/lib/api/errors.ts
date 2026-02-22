import { NextResponse } from "next/server";

export const API_ERRORS = {
  UNAUTHENTICATED: { status: 401, code: "UNAUTHENTICATED" },
  FORBIDDEN: { status: 403, code: "FORBIDDEN" },
  NOT_FOUND: { status: 404, code: "NOT_FOUND" },
  BAD_REQUEST: { status: 400, code: "BAD_REQUEST" },
  INVALID_ID: { status: 400, code: "INVALID_ID" },
  INTERNAL: { status: 500, code: "INTERNAL_ERROR" },
} as const;

export function apiError(key: keyof typeof API_ERRORS, message?: string) {
  const { status, code } = API_ERRORS[key];
  return NextResponse.json(
    message ? { error: code, message } : { error: code },
    { status },
  );
}
