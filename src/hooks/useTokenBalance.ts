"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useCurrentAccount, useSuiClient } from "@onelabs/dapp-kit";
import BigNumber from "bignumber.js";
import { store } from "@/store";
import { ZkLoginData } from "@/lib/interface";
import {formatUnits} from "@/lib/numbers";

export type UseTokenBalanceOptions = {
  /** 手动传入地址；不传则自动从 dapp-kit / zkLogin 读取 */
  address?: string;
  /** Sui coinType，例如：0x...::usdh::USDH */
  coinType: string;
  /** 代币精度（小数位），默认为 9 */
  decimals?: number;
  /** 是否启用（可配合地址为空时禁用），默认 true */
  enabled?: boolean;
  /** 轮询间隔（毫秒）；0 或不传表示不轮询 */
  pollMs?: number;
  /** 格式化小数位，默认保留 2 位 */
  fixed?: number;
};

export type UseTokenBalanceResult = {
  /** 已格式化的人类可读余额，如 "12.34" */
  balance: string;
  /** 原始最小单位余额（链上返回的字符串） */
  rawBalance: string;
  /** 触发手动刷新 */
  refresh: () => Promise<void>;
  /** 加载中 */
  loading: boolean;
  /** 错误对象 */
  error: unknown;
  /** 实际查询所用地址（便于外部调试） */
  resolvedAddress: string | null;
};

export function useTokenBalance(opts: UseTokenBalanceOptions): UseTokenBalanceResult {
  const {
    address,
    coinType,
    decimals = 9,
    enabled = true,
    pollMs = 0,
    fixed = 2,
  } = opts;

  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const zkLoginData = store.getState().zkLoginData as ZkLoginData | null;

  const resolvedAddress = useMemo<string | null>(() => {
    return (
      address ||
      currentAccount?.address ||
      zkLoginData?.zkloginUserAddress ||
      null
    );
  }, [address, currentAccount?.address, zkLoginData]);

  const [rawBalance, setRawBalance] = useState<string>("0");
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const fetchOnce = useCallback(async () => {
    if (!enabled || !resolvedAddress) return;
    setLoading(true);
    setError(null);
    try {
      const { totalBalance } = await suiClient.getBalance({
        owner: resolvedAddress,
        coinType,
      });
      setRawBalance(totalBalance);
      const human = formatUnits(totalBalance, decimals, fixed);
      setBalance(human);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [enabled, resolvedAddress, coinType, decimals, fixed, suiClient]);

  // 首次 & 地址/参数变化时拉取
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!enabled || !resolvedAddress) return;
      await fetchOnce();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, resolvedAddress, coinType, decimals, fixed, fetchOnce]);

  // 轮询（可选）
  useEffect(() => {
    if (!enabled || !resolvedAddress || !pollMs) return;
    const id = setInterval(() => {
      fetchOnce();
    }, pollMs);
    return () => clearInterval(id);
  }, [enabled, resolvedAddress, pollMs, fetchOnce]);

  return {
    balance,
    rawBalance,
    refresh: fetchOnce,
    loading,
    error,
    resolvedAddress,
  };
}
