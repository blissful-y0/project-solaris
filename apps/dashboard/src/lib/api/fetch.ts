// 클라이언트 사이드 공통 fetch 래퍼
// 401 리다이렉트, 에러 정규화, 글로벌 로딩 스피너 제어를 한 곳에서 처리한다.

type ApiOptions = RequestInit & {
  /** 전역 로딩 스피너 비활성화 */
  skipGlobalLoading?: boolean;
};

type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

export async function apiFetch<T>(
  url: string,
  options?: ApiOptions,
): Promise<ApiResult<T>> {
  const headers = new Headers(options?.headers);
  if (options?.skipGlobalLoading) {
    headers.set("x-no-global-loading", "true");
  }

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = "/login";
        return { ok: false, error: "UNAUTHENTICATED", status: 401 };
      }

      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: body?.error ?? `HTTP_${res.status}`,
        status: res.status,
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, status: res.status };
  } catch (err) {
    // AbortError는 호출 측에서 처리해야 하므로 re-throw
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "NETWORK_ERROR",
      status: 0,
    };
  }
}
