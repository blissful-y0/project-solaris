"use client";

import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";

import { swrFetcher } from "./fetcher";

export type OffsetPage<T> = {
  data: T[];
  page?: {
    hasMore?: boolean;
    nextOffset?: number | null;
  };
};

type UseOffsetInfiniteOptions<T> = {
  baseUrl: string;
  limit: number;
  getItemId?: (item: T) => string;
  enabled?: boolean;
};

export function useOffsetInfinite<T>({
  baseUrl,
  limit,
  getItemId,
  enabled = true,
}: UseOffsetInfiniteOptions<T>) {
  const swr = useSWRInfinite<OffsetPage<T>>(
    (index, previousPageData) => {
      if (!enabled) return null;
      if (previousPageData && !previousPageData.page?.hasMore) return null;
      const offset = index * limit;
      return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`;
    },
    swrFetcher,
    {
      persistSize: true,
      revalidateFirstPage: true,
      revalidateOnFocus: false,
      dedupingInterval: 1500,
    },
  );

  const items = useMemo(() => {
    const merged = (swr.data ?? []).flatMap((page) => page.data ?? []);
    if (!getItemId) return merged;
    const byId = new Map<string, T>();
    for (const item of merged) byId.set(getItemId(item), item);
    return Array.from(byId.values());
  }, [swr.data, getItemId]);

  const hasMore = Boolean(swr.data?.[swr.data.length - 1]?.page?.hasMore);
  const loading = !swr.data && !swr.error;
  const loadingMore = swr.isValidating && swr.size > (swr.data?.length ?? 0);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    await swr.setSize((size) => size + 1);
  };

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    error: swr.error,
    mutate: swr.mutate,
    loadMore,
  };
}
