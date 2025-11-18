import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DevInspectResults } from '@onelabs/sui/client';
import { bcs, fromHEX, toHEX } from '@onelabs/bcs';
import { toast } from "sonner";
import BigNumber from 'bignumber.js';
import i18n from '@/lib/i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const onCopyToText = (text: string) => {
  const textField = document.createElement('textarea')
  textField.innerText = text
  document.body.appendChild(textField)
  textField.select()
  document.execCommand('copy')
  textField.remove()
  toast.success(i18n.t('common.copySuccessful'))
};

export const addPoint = (address:string, len = 5) => {
  return address ? address.substr(0, len) + '...' + address.substr(address.length - len,) : ''
}
export const numFormat = function (num: number | string) {
  const numString = num.toString().split(".");
  const arr = numString[0].split("").reverse();
  const res: string[] = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    if (i % 3 === 0 && i !== 0) {
      res.push(",");
    }
    res.push(arr[i]);
  }
  res.reverse();

  if (numString[1]) {
    return res.join("").concat("." + numString[1]);
  } else {
    return res.join("");
  }
}
const howManyZero = (num: number) => {
  if (num > 1) {
    return 0
  } else {
    let zeronum = 0
    for (let i = 0; i <= 18; i++) {
      if (Number(num) >= Number(Math.pow(10, 0 - i))) {
        zeronum = i
        break;
      }
    }
    return zeronum - 1
  }
}
export const toFixed = (amount: number | string, num: number) => {
  if (Number(amount) < 1) {
    if (num <= howManyZero(Number(amount))) {
      num = howManyZero(Number(amount)) + num;
    }
  }
  return Math.floor(Number(amount) * Math.pow(10, num)) / Math.pow(10, num)
}

// 添加千分号的现代方法
export const formatNumber = (num: number | string, decimals: number = 2): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

// 简化的千分号方法
export const addCommas = (num: number | string): string => {
  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('en-US');
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export const formatTimeStr = (time: string): string => {
  return new Date(time).toLocaleDateString() + ' ' + new Date(time).toLocaleTimeString()
}
export const formatTime = (time: string): string => {
  return new Date(time).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' ' + new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
export const Address = bcs.fixedArray(32, bcs.u8()).transform({
  input: (id) => {
    if (typeof id === 'string') {
      return fromHEX(id);
    }
    throw new Error('Address input must be a hex string');
  },
  output: (id) => {
    const hex = toHEX(Uint8Array.from(id));
    return hex.startsWith('0x') ? hex : '0x' + hex;
  },
});
export const ID = Address;
export const RwaProjectInfo = bcs.struct('RwaProjectInfo', {
  rwa_key: bcs.vector(bcs.u8()),
  version: bcs.u64(),
  project_id: ID,
  bank_id: ID,
  ido_id: ID,
  admin: Address,
  financier: Address,
  price: bcs.u64(),
  minimum_buy_amount: bcs.u64(),
  freeze_until_sold_out: bcs.bool(),
  isSoldOut: bcs.bool(),
  total_supply: bcs.u64(),
  remaining_supply: bcs.u64(),
  total_revenue: bcs.u64(),
  remaining_revenue: bcs.u64(),
  dividend_batches: bcs.u64(),
  total_dividend_funds: bcs.u64(),
  pending_dividend_funds: bcs.u64(),
  allow_sale: bcs.bool()
});
export function parseRwaProjectInfo(result: DevInspectResults): unknown {
  const returnValues = result.results?.[0]?.returnValues;
  if (returnValues && returnValues.length > 0) {
    const [bcsBytes] = returnValues[0];
    const info = RwaProjectInfo.parse(new Uint8Array(bcsBytes));
    return info;
  } else {
    return undefined;
  }
}
export const UserDividendRecord = bcs.struct('UserDividendRecord', {
  rwa_token_owned: bcs.u64(),
  dividend_income: bcs.u64(),
});
export const UserDividendRecords = bcs.vector(UserDividendRecord);
export function parseRwaUserDividendRecords(result: DevInspectResults): unknown {
  if (result === undefined || result === null || result.results === undefined || result.results === null) {
    return undefined;
  }
  const results = result.results;
  const returnValues = results[results.length - 1]?.returnValues;
  if (returnValues && returnValues.length > 0) {
    const [bcsBytes] = returnValues[0];
    const info = UserDividendRecords.parse(new Uint8Array(bcsBytes));
    return info;
  } else {
    return undefined;
  }
}
/**
 * 判断用户是否拒绝交易
 * @param error 错误对象
 * @returns 是否用户拒绝
 */
export const isUserRejectedTransaction = (error: unknown): boolean => {
  const errorMessage = (error as any)?.message || (error as any)?.toString() || '';
  return (
    errorMessage.includes('reject') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('User cancelled') ||
    errorMessage.includes('Transaction rejected') ||
    errorMessage.includes('User rejected the transaction') ||
    errorMessage.includes('cancelled') ||
    errorMessage.includes('denied') ||
    errorMessage.includes('rejected') ||
    errorMessage.includes('User declined') ||
    errorMessage.includes('User aborted') ||
    errorMessage.includes('User closed') ||
    errorMessage.includes('Transaction cancelled') ||
    errorMessage.includes('Transaction denied')
  );
};

/**
 * 处理交易错误，区分用户拒绝和其他错误
 * @param error 错误对象
 * @param onUserRejected 用户拒绝时的回调
 * @param onOtherError 其他错误时的回调
 */
export const handleTransactionError = (
  error: unknown,
  onUserRejected?: () => void,
  onOtherError?: () => void
) => {
  if (isUserRejectedTransaction(error)) {
    onUserRejected?.();
  } else {
    onOtherError?.();
  }
};


export function getCoinOutWithFees(
  coinInVal: number | string,
  reserveInSize: number | string,
  reserveOutSize: number | string,
  feeBps: number | string,
  slippage: number | string,
): number {
  const amountIn = Number(coinInVal) || 0
  const reserveIn = Number(reserveInSize) || 0
  const reserveOut = Number(reserveOutSize) || 0
  const fee = Number(feeBps) || 0
  const slippageVal = Number(slippage) || 0
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0
  // fee in BPS (e.g. 30 = 0.30%)
  const feeMultiplier = (10000 - fee) / 10000
  const amountInAfterFee = amountIn * feeMultiplier
  if (amountInAfterFee <= 0) return 0
  const k = new BigNumber(reserveIn).multipliedBy(reserveOut).toNumber()
  const reserveInSize_after = new BigNumber(reserveIn).plus(amountInAfterFee).toNumber()
  const reserveOutSize_after = new BigNumber(k).dividedBy(reserveInSize_after).toNumber() //bignumber
  // x*y=k: out = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
  const out = new BigNumber(reserveOut).minus(reserveOutSize_after).multipliedBy(1-slippageVal).toNumber()
  return out > 0 ? out : 0
}
export function getCoinInWithFees(
  coinOutVal: number | string,
  reserveInSize: number | string,
  reserveOutSize: number | string,
  feeBps: number | string,
  slippage: number | string,
): number {
  const amountOut = Number(coinOutVal) || 0
  const reserveIn = Number(reserveInSize) || 0
  const reserveOut = Number(reserveOutSize) || 0
  const fee = Number(feeBps) || 0
  const slippageVal = Number(slippage) || 0
  if (amountOut <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0
  // fee in BPS (e.g. 30 = 0.30%)
  const feeMultiplier = (10000 + fee) / 10000
  const k = new BigNumber(reserveIn).multipliedBy(reserveOut).toNumber()
  const reserveInSize_after = new BigNumber(reserveIn).minus(amountOut).toNumber()
  const reserveOutSize_after = new BigNumber(k).dividedBy(reserveInSize_after).toNumber() //bignumber
  // x*y=k: out = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
  const out = new BigNumber(reserveOutSize_after).minus(reserveOut).multipliedBy(1+slippageVal).multipliedBy(feeMultiplier).toNumber()
  return out > 0 ? out : 0
}

export function formatShortDate(
  input: number | string | Date,
  timeZone: string = 'Asia/Kuala_Lumpur' // 或 'UTC'
) {
  // 兼容秒/毫秒级时间戳
  const ms = typeof input === 'number'
    ? (input < 1e12 ? input * 1000 : input)
    : new Date(input).getTime();

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',   // 'Sep'
    day: 'numeric',   // 30（不补零）
    year: 'numeric',  // 2025
    timeZone,
  }).format(new Date(ms));
}

export function timeAgoEn(input: string | number | Date, baseNow?: number) {
  // 1) 解析成时间戳（毫秒），优先按 UTC 解析
  const target = toUtcMillis(input);
  if (target == null || Number.isNaN(target)) return '';

  // 2) 当前时间（毫秒）
  const now = typeof baseNow === 'number' ? baseNow : Date.now();

  // 3) 计算差值
  let diff = now - target;          // >0 过去；<0 未来
  const future = diff < 0;
  diff = Math.abs(diff);

  // 4) 时间单位（毫秒）
  const SECOND = 1_000;
  const MINUTE = 60 * SECOND;
  const HOUR   = 60 * MINUTE;
  const DAY    = 24 * HOUR;

  // 小于 5 秒：just now
  if (diff < 5 * SECOND) return i18n.t('time.justNow');

  if (diff < MINUTE) {
    const n = Math.floor(diff / SECOND);
    return future
      ? i18n.t(n === 1 ? 'time.second_future_one' : 'time.second_future_other', { count: n })
      : i18n.t(n === 1 ? 'time.second_past_one'   : 'time.second_past_other',   { count: n });
  }

  if (diff < HOUR) {
    const n = Math.floor(diff / MINUTE);
    return future
      ? i18n.t(n === 1 ? 'time.minute_future_one' : 'time.minute_future_other', { count: n })
      : i18n.t(n === 1 ? 'time.minute_past_one'   : 'time.minute_past_other',   { count: n });
  }

  if (diff < DAY) {
    const n = Math.floor(diff / HOUR);
    return future
      ? i18n.t(n === 1 ? 'time.hour_future_one' : 'time.hour_future_other', { count: n })
      : i18n.t(n === 1 ? 'time.hour_past_one'   : 'time.hour_past_other',   { count: n });
  }

  const n = Math.floor(diff / DAY);
  return future
    ? i18n.t(n === 1 ? 'time.day_future_one' : 'time.day_future_other', { count: n })
    : i18n.t(n === 1 ? 'time.day_past_one'   : 'time.day_past_other',   { count: n });
}

/** 把各种输入统一解析为「毫秒时间戳」，默认按 UTC 处理常见无时区字符串 */
export function toUtcMillis(input: string | number | Date): number | null {
  if (input instanceof Date) return input.getTime();

  if (typeof input === 'number') {
    // 兼容秒/毫秒级时间戳（< 1e12 视为秒）
    return Math.abs(input) < 1e12 ? input * 1000 : input;
  }

  if (typeof input === 'string') {
    const s = input.trim();

    // 1) 匹配 "YYYY-MM-DD HH:mm:ss"（无时区） => 当成 UTC，加上 Z
    const m1 = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s);
    if (m1) return new Date(s.replace(' ', 'T') + 'Z').getTime();

    // 2) 标准 ISO 串但没有时区（"YYYY-MM-DDTHH:mm:ss"）=> 当成 UTC，加 Z
    const m2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s);
    if (m2) return new Date(s + 'Z').getTime();

    // 3) 其它情况（自带 Z 或 +08:00 等时区）交给 Date 解析
    const t = new Date(s).getTime();
    return Number.isNaN(t) ? null : t;
  }

  return null;
}

function toDate(v: number | string | Date): Date {
  if (v instanceof Date) return v;
  if (typeof v === "number") {
    // 自适应秒/毫秒级时间戳
    const ms = v < 1e12 ? v * 1000 : v;
    return new Date(ms);
  }
  return new Date(v);
}

export function capitalizeFirst(str = "") {
  return str ? str[0].toUpperCase() + str.slice(1) : str;
}

export function capitalizeFirstLowerRest(str = "") {
  return str ? str[0].toUpperCase() + str.slice(1).toLowerCase() : str;
}


export function downloadDataUrl(dataUrl: string, filename = 'image.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function copyImageFromDataUrl(dataUrl: string) {
  // 把 dataURL 转 Blob
  const blob = await (await fetch(dataUrl)).blob();

  // 现代浏览器（需 HTTPS）
  if ('clipboard' in navigator && 'ClipboardItem' in window) {
    const item = new ClipboardItem({ [blob.type]: blob } as any);
    await (navigator as any).clipboard.write([item]);
    return true;
  }

  // Fallback：复制 dataURL 文本（不是图片本体）
  await navigator.clipboard.writeText(dataUrl);
  return false; // 告知是退化复制（仅复制了链接文本）
}

export function getLanguageLabel(text: string, lang: string) {
  try {
    const list = JSON.parse(text);
    const value = list.filter((item: {lang:string;label:string;}) => item.lang === lang);
    return value.length > 0 ? value[0].label : '';
  } catch (e) {
    console.log(e)
  }
}
