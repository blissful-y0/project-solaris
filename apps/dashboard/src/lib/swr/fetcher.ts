import { apiFetch } from "@/lib/api/fetch";

export class ApiFetchError extends Error {
  status: number;
  code: string;

  constructor(code: string, status: number) {
    super(code);
    this.name = "ApiFetchError";
    this.code = code;
    this.status = status;
  }
}

export function isApiFetchError(error: unknown): error is ApiFetchError {
  return error instanceof ApiFetchError;
}

export async function swrFetcher<T>(url: string): Promise<T> {
  const result = await apiFetch<T>(url, { skipGlobalLoading: true });
  if (!result.ok) {
    throw new ApiFetchError(result.error, result.status);
  }
  return result.data;
}
