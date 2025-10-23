// utils/bn.ts
import BigNumber from 'bignumber.js';

export type RoundingMode = BigNumber.RoundingMode;

// 统一把输入转 BigNumber
const BN = (n: number | string) => new BigNumber(n);

// --- 幂 ---
export function pow(base: number | string, exponent: number) {
  return BN(base).pow(exponent).toString();
}

// --- 乘法 ---
export function times(num1: number | string, num2: number | string, toFix?: number) {
  const v = BN(num1).times(num2);
  return toFix !== undefined ? v.toFixed(toFix, BigNumber.ROUND_DOWN) : v.toString();
}

// --- 加法 ---
export function plus(num1: number | string, num2: number | string, toFix?: number) {
  const v = BN(num1).plus(num2);
  return toFix !== undefined ? v.toFixed(toFix, BigNumber.ROUND_DOWN) : v.toString();
}

// --- 求和 ---
export function sum(numbers: (number | string)[], toFix?: number): string {
  if (numbers.length === 0) {
    return toFix !== undefined ? new BigNumber(0).toFixed(toFix, BigNumber.ROUND_DOWN) : '0';
  }
  const start = toFix !== undefined ? new BigNumber(0).toFixed(toFix, BigNumber.ROUND_DOWN) : '0';
  return numbers.reduce<string>((acc, cur) => plus(acc, cur), start);
}

// --- 是否相等 ---
export function equal(num1: number | string, num2: number | string) {
  return BN(num1).eq(num2);
}

// --- 除法 ---
export function divide(num1: number | string, num2: number | string, toFix?: number) {
  const v = BN(num1).div(num2);
  return toFix !== undefined ? v.toFixed(toFix, BigNumber.ROUND_DOWN) : v.toString();
}

// --- 大小比较 ---
export function gt(num1: number | string, num2: number | string) {
  return BN(num1).gt(num2);
}
export function gte(num1: number | string, num2: number | string) {
  return BN(num1).gte(num2);
}
export function lt(num1: number | string, num2: number | string) {
  return BN(num1).lt(num2);
}
export function lte(num1: number | string, num2: number | string) {
  return BN(num1).lte(num2);
}

// --- 减法 ---
export function minus(num1: number | string, num2: number | string, toFix?: number) {
  const v = BN(num1).minus(num2);
  return toFix !== undefined ? v.toFixed(toFix, BigNumber.ROUND_DOWN) : v.toString();
}

// --- 向上取整（返回整数字符串） ---
export function ceil(num: string | number) {
  return BN(num).integerValue(BigNumber.ROUND_CEIL).toFixed(0);
}

// --- 固定小数位（可指定舍入方式，默认向下） ---
export function fix(number: string, decimal?: number, optional: RoundingMode = BigNumber.ROUND_DOWN) {
  try {
    const v = BN(number);
    return decimal === undefined ? v.toString() : v.toFixed(decimal, optional);
  } catch {
    return number;
  }
}

// --- 最小单位 -> 可读 Token 数量 ---
export function toDisplayDenomAmount(number: string | number, decimal: number) {
  if (decimal === 0) return String(number);
  // 与原实现一致：按 decimal 位向下取整格式化
  return times(number, pow(10, -decimal), decimal);
}

// --- 可读 Token 数量 -> 最小单位 ---
export function toBaseDenomAmount(number: string | number, decimal: number) {
  if (decimal === 0) return String(number);
  // 原实现是 toFixed(0, ROUND_DOWN)
  const v = BN(number).times(BN(10).pow(decimal));
  return v.toFixed(0, BigNumber.ROUND_DOWN);
}

// --- 合法数字判定 ---
export function isNumber(number: string) {
  const v = BN(number);
  return v.isFinite() && !v.isNaN();
}

// --- 小数格式校验（最多 decimal 位） ---
export function isDecimal(number: string, decimal: number) {
  if (!isNumber(number)) return false;
  const regex = new RegExp(`^([1-9][0-9]*\\.?[0-9]{0,${decimal}}|0\\.[0-9]{0,${decimal}}|0)$`);
  return regex.test(number);
}

// --- 分位数（percentiles: 0-100 的百分位列表） ---
export function calculatePercentiles(numbers: number[], percentiles: number[]) {
  if (numbers.length === 0) return [];
  const sorted = numbers.slice().sort((a, b) => a - b);

  return percentiles.map((p) => {
    // index = ceil(p/100 * n) - 1
    const idx = BN(p).div(100).times(sorted.length).integerValue(BigNumber.ROUND_CEIL).minus(1).toNumber();
    const safe = Math.min(Math.max(idx, 0), sorted.length - 1);
    return sorted[safe];
  });
}

/**
 * 将最小单位转为可读的 Token 数量
 * @param value - 最小单位数值
 * @param decimals - 精度
 * @param precision - 保留的小数位数
 */
export function formatUnits(value: string | number, decimals: number, precision: number): string {
  if (!value && value !== 0) return '';
  const result = BN(value).div(BN(10).pow(decimals)).toString();
  return precision ? truncateDecimals(result, precision) : result;
}

/**
 * 将 token 数量转为最小单位（向下取整为整数）
 */
export function parseUnits(value: string | number, decimals: number): string {
  if (!value && value !== 0) return '';
  return BN(value).times(BN(10).pow(decimals)).toFixed(0, BigNumber.ROUND_DOWN);
}

/**
 * 截取字符串小数位
 */
export function truncateDecimals(str: string | number, decimalPlaces: number): string {
  const s = typeof str === 'string' ? str : String(str);
  if (!s.includes('.')) return s;
  const [i, d] = s.split('.');
  const truncated = d.slice(0, decimalPlaces);
  return truncated ? `${i}.${truncated}` : i;
}

/**
 * 千分位分隔符格式化
 */
export function formatNumberWithSeparator(num: number | string, separator = ','): string {
  const s = String(num);
  const [i, d] = s.split('.');
  const fi = i.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return d ? `${fi}.${d}` : fi;
}

type AbbrevStyle = 'western' | 'cn';
type FormatOptions = {
  decimals?: number;       // 最多保留小数位，默认 1
  minDecimals?: number;    // 最少保留小数位，默认 0
  trimZeros?: boolean;     // 去掉小数尾随 0，默认 true
  locale?: string | false; // 本地化分组，如 'en-US'/'zh-CN'；false 表示不分组，默认 false
  style?: AbbrevStyle;     // 'western' => K/M/B/T；'cn' => 万/亿/兆，默认 'western'
  threshold?: number;      // 触发缩写的阈值，默认 1000（中文样式默认 10000）
};

export function abbreviateNumber(
  input: number | string | null | undefined,
  options: FormatOptions = {}
): string {
  if (input === null || input === undefined || input === '' as any) return '';

  const n = typeof input === 'string' ? Number(input) : input;
  if (!Number.isFinite(n)) return String(input);

  const {
    style = 'western',
    decimals = 1,
    minDecimals = 0,
    trimZeros = true,
    locale = false,
  } = options;

  const threshold = options.threshold ?? (style === 'cn' ? 10000 : 1000);

  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  // 单位表
  const units =
    style === 'cn'
      ? [
        { v: 1e12, s: '兆' }, // 1,000,000,000,000
        { v: 1e8, s: '亿' },  // 100,000,000
        { v: 1e4, s: '万' },  // 10,000
      ]
      : [
        { v: 1e12, s: 'T' },
        { v: 1e9, s: 'B' },
        { v: 1e6, s: 'M' },
        { v: 1e3, s: 'K' },
      ];

  // 小于阈值：直接返回（可选分组）
  if (abs < threshold) {
    return locale
      ? new Intl.NumberFormat(locale).format(n)
      : String(n);
  }

  // 找到合适单位
  const u = units.find(u => abs >= u.v) ?? units[units.length - 1];

  const num = n / u.v;

  // 格式化小数位
  const clamp = (x: number, min: number, max: number) =>
    Math.max(min, Math.min(max, x));
  const maxFrac = clamp(decimals, 0, 10);

  // 先 toFixed，再可选去 0
  let str = num.toFixed(maxFrac);
  if (trimZeros && maxFrac > 0) {
    str = str.replace(/\.?0+$/, ''); // 去除尾随 0 和可能的点
  }

  // 至少保留 minDecimals
  if (minDecimals > 0) {
    const [i, f = ''] = str.split('.');
    const need = Math.max(0, minDecimals - f.length);
    if (need > 0) str = i + '.' + (f + '0'.repeat(need));
  }

  // 对整数部分做本地化分组（仅对数字部分，不含单位）
  if (locale) {
    const [intPart, fracPart] = str.split('.');
    const grouped = new Intl.NumberFormat(locale).format(Number(intPart));
    str = fracPart ? `${grouped}.${fracPart}` : grouped;
  }

  return `${sign}${str}${u.s}`;
}

