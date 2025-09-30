"use client";

import { useTokenBalance } from "./useTokenBalance";

export const USDH_TYPE =
  "0x3d1ecd3dc3c8ecf8cb17978b6b5fe0b06704d4ed87cc37176a01510c45e21c92::usdh::USDH";

/** 直接查 USDH，默认 9 位精度 */
export function useUsdhBalance(options?: {
  address?: string;
  enabled?: boolean;
  pollMs?: number;
  fixed?: number;
}) {
  return useTokenBalance({
    coinType: USDH_TYPE,
    decimals: 9,
    enabled: options?.enabled ?? true,
    address: options?.address,
    pollMs: options?.pollMs ?? 0,
    fixed: options?.fixed ?? 2,
  });
}
