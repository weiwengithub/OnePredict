"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useTokenBalance } from "./useTokenBalance";
import { store, setUsdhBalance, type RootState } from "@/store";

// 全局存储 refresh 方法，使得可以从任何地方调用
let globalRefreshFn: (() => Promise<void>) | null = null;

export const UsdhBalanceHelper = {
  /** 从任何地方调用此方法来刷新 USDH 余额 */
  refresh: async () => {
    if (globalRefreshFn) {
      await globalRefreshFn();
    } else {
      console.warn('USDH balance refresh not available. Make sure useUsdhBalance is mounted.');
    }
  },
  /** 获取当前存储的余额（不触发查询） */
  getBalance: () => {
    return store.getState().usdhBalance;
  },
};

/** 直接查 USDH，默认 9 位精度，并自动保存到全局 store */
export function useUsdhBalance(options?: {
  address?: string;
  enabled?: boolean;
  pollMs?: number;
  fixed?: number;
}) {
  const result = useTokenBalance({
    coinType: process.env.NEXT_PUBLIC_USDH_TYPE || '',
    decimals: 9,
    enabled: options?.enabled ?? true,
    address: options?.address,
    pollMs: options?.pollMs ?? 0,
    fixed: options?.fixed ?? 2,
  });

  // 每次余额更新时，同步到 store
  useEffect(() => {
    if (result.balance && result.rawBalance) {
      store.dispatch(setUsdhBalance({
        balance: result.balance,
        rawBalance: result.rawBalance,
      }));
    }
  }, [result.balance, result.rawBalance]);

  // 注册全局 refresh 方法
  useEffect(() => {
    globalRefreshFn = result.refresh;
    return () => {
      globalRefreshFn = null;
    };
  }, [result.refresh]);

  return result;
}

/**
 * 从 Redux store 中读取 USDH 余额
 * 配合 useUsdhBalance 使用，可以在任何组件中访问余额而无需重新查询
 */
export function useUsdhBalanceFromStore() {
  const usdhBalance = useSelector((state: RootState) => state.usdhBalance);

  // 提供一个刷新方法
  const refresh = useCallback(async () => {
    await UsdhBalanceHelper.refresh();
  }, []);

  return {
    balance: usdhBalance.balance,
    rawBalance: usdhBalance.rawBalance,
    refresh,
  };
}
