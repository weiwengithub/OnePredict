"use client";

import { useTokenBalance } from "./useTokenBalance";

/** 直接查 USDH，默认 9 位精度 */
export function useUsdhBalance(options?: {
  address?: string;
  enabled?: boolean;
  pollMs?: number;
  fixed?: number;
}) {
  return useTokenBalance({
    coinType: process.env.NEXT_PUBLIC_USDH_TYPE || '',
    decimals: 9,
    enabled: options?.enabled ?? true,
    address: options?.address,
    pollMs: options?.pollMs ?? 0,
    fixed: options?.fixed ?? 2,
  });
}
