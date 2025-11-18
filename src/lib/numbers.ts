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
  const start = '0';
  const s = numbers.reduce<string>((acc, cur) => plus(acc, cur), start);
  return toFix !== undefined ? new BigNumber(s).toFixed(toFix, BigNumber.ROUND_DOWN) : s;
}

// --- 是否相等 ---
export function equal(num1: number | string, num2: number | string) {
  return BN(num1).isEqualTo(num2);
}

// --- 除法 ---
export function divide(num1: number | string, num2: number | string, toFix?: number) {
  const v = BN(num1).dividedBy(num2);
  return toFix !== undefined ? v.toFixed(toFix, BigNumber.ROUND_DOWN) : v.toString();
}

// --- 大于 ---
export function gt(num1: number | string, num2: number | string) {
  return BN(num1).isGreaterThan(num2);
}

// --- 大于等于 ---
export function gte(num1: number | string, num2: number | string) {
  return BN(num1).isGreaterThanOrEqualTo(num2);
}

// --- 小于 ---
export function lt(num1: number | string, num2: number | string) {
  return BN(num1).isLessThan(num2);
}

// --- 小于等于 ---
export function lte(num1: number | string, num2: number | string) {
  return BN(num1).isLessThanOrEqualTo(num2);
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
  const v = BN(number).div(BN(10).pow(decimal));
  return v.toFixed(decimal, BigNumber.ROUND_DOWN);
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
  try {
    const v = BN(number);
    return v.isFinite() && !v.isNaN();
  } catch {
    return false;
  }
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
export function formatUnits(value: string | number, decimals: number, precision?: number): string {
  if (value === '' || value === null || value === undefined) return '';
  const result = BN(value).div(BN(10).pow(decimals)).toString();
  return precision !== undefined ? truncateDecimals(result, precision) : result;
}

/**
 * 将 token 数量转为最小单位（向下取整为整数）
 */
export function parseUnits(value: string | number, decimals: number): string {
  if (value === '' || value === null || value === undefined) return '';
  return BN(value).times(BN(10).pow(decimals)).toFixed(0, BigNumber.ROUND_DOWN);
}

/**
 * 将字符串或 BigNumber 转为 bigint，若有小数则直接舍弃（向零截断）。
 * @throws 当值为 NaN / 非有限数时抛错
 */
export function toBigIntTrunc(value: string | BigNumber): bigint {
  const bn = BigNumber.isBigNumber(value) ? value : new BigNumber(value);

  if (!bn.isFinite() || bn.isNaN()) {
    throw new Error('toBigIntTrunc: invalid number');
  }

  // ROUND_DOWN 在 bignumber.js 中是“向零”取整，负数也会朝 0 截断
  const intStr = bn.integerValue(BigNumber.ROUND_DOWN).toFixed(0);
  return BigInt(intStr);
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

type AbbrevStyle = 'western' | 'cn';


/**
 * 千分位分隔符格式化
 */
type SeparatorOptions = {
  style?: AbbrevStyle;
  separator?: string
}
export function formatNumberWithSeparator(num: number | string, options: SeparatorOptions = {}): string {
  const {
    style = 'western',
    separator = ','
  } = options;
  const s = String(num);
  const [i, d] = s.split('.');
  const fi = style === 'cn' ? i.replace(/\B(?=(\d{4})+(?!\d))/g, separator) : i.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return d ? `${fi}.${d}` : fi;
}

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

  const num = abs / u.v;

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

/**
 * 数字舍入
 * @param value   要处理的数字
 * @param digits  保留的小数位(可为负，-1 表示到十位，-2 到百位…)
 * @param mode    舍入方式：
 *   - 'round'        四舍五入（默认）
 *   - 'floor'        向下取整
 *   - 'ceil'         向上取整
 *   - 'towardZero'   向零取整
 *   - 'awayFromZero' 远离零取整
 *   - 'halfEven'     银行家舍入（四舍六入，五看前一位奇偶）
 * @returns number
 */
export function roundDecimal(
  value: number | string,
  digits = 0,
  mode:
    | 'round'
    | 'floor'
    | 'ceil'
    | 'towardZero'
    | 'awayFromZero'
    | 'halfEven' = 'round'
): number {
  if(typeof value === 'string') value = Number(value);
  if (!Number.isFinite(value) || !Number.isInteger(digits)) return Number.NaN;

  // 快速路径：0 或 无需处理
  if (value === 0 || digits === 0 && mode === 'round') {
    switch (mode) {
      case 'floor': return Math.floor(value);
      case 'ceil': return Math.ceil(value);
      case 'towardZero': return value < 0 ? Math.ceil(value) : Math.floor(value);
      case 'awayFromZero': return value < 0 ? Math.floor(value) : Math.ceil(value);
      case 'halfEven': return halfEven(value, 0);
      default: return Math.round(value);
    }
  }

  // 通过指数移动减少浮点误差：x * 10^d  ->  + 'e' + d
  const shift = (num: number, exp: number) => Number(num + 'e' + exp);
  const unshift = (num: number, exp: number) => Number(num + 'e' + (-exp));

  // 通用：先把小数点右移，再做整数层面的取整，再移回
  switch (mode) {
    case 'round': {
      const shifted = shift(value, digits);
      return unshift(Math.round(shifted), digits);
    }
    case 'floor': {
      const shifted = shift(value, digits);
      return unshift(Math.floor(shifted), digits);
    }
    case 'ceil': {
      const shifted = shift(value, digits);
      return unshift(Math.ceil(shifted), digits);
    }
    case 'towardZero': {
      const shifted = shift(value, digits);
      const r = shifted < 0 ? Math.ceil(shifted) : Math.floor(shifted);
      return unshift(r, digits);
    }
    case 'awayFromZero': {
      const shifted = shift(value, digits);
      const r = shifted < 0 ? Math.floor(shifted) : Math.ceil(shifted);
      return unshift(r, digits);
    }
    case 'halfEven': {
      return halfEven(value, digits);
    }
    default:
      return Number.NaN;
  }

  // ---- 银行家舍入实现 ----
  function halfEven(num: number, d: number): number {
    const shifted = shift(num, d);            // 移位后的数（期望接近整数）
    const floorInt = Math.floor(shifted);
    const frac = shifted - floorInt;          // 小数部分
    // 处理 -0 的边界
    const isHalf = Math.abs(frac - 0.5) <= Number.EPSILON;

    if (isHalf) {
      // 正好 *.5：看“最近的偶数”
      const even = floorInt % 2 === 0 ? floorInt : floorInt + 1;
      return unshift(even, d);
    }
    // 其他情况：普通四舍五入即可
    return unshift(Math.round(shifted), d);
  }
}

/**
 * 把结果格式化为固定小数位的字符串（不会补科学计数法）
 * @example formatFixed(1.005, 2, 'halfEven') -> "1.00"
 */
export function formatFixed(
  value: number,
  digits = 2,
  mode:
    | 'round'
    | 'floor'
    | 'ceil'
    | 'towardZero'
    | 'awayFromZero'
    | 'halfEven' = 'round'
): string {
  const n = roundDecimal(value, digits, mode);
  if (!Number.isFinite(n)) return 'NaN';
  // 用 toFixed 仅用于补零展示；n 本身已按你设定的方式舍入
  return n.toFixed(Math.max(0, digits));
}

/**
 * 通用数字格式化
 * - 支持整数分组（groupSize 或 groupPattern）
 * - 支持小数分组（fractionGroupSize）
 * - 支持自定义分隔符/小数点符号
 * - 支持最少/最多小数位（最多位会四舍五入，half-up）
 */
export interface FormatNumberOptions {
  // 整数分组：固定步长（与 groupPattern 二选一；优先 groupPattern）
  groupSize?: number;                 // 默认 3 -> 1,234,567
  // 整数分组：模式数组（从右往左，第一段用 pattern[0]，后续重复最后一个）
  // 例如印度风格: [3, 2] => 12,34,567
  groupPattern?: number[];
  groupSeparator?: string;            // 默认 ","
  decimalSeparator?: string;          // 默认 "."

  // 小数位控制
  minFractionDigits?: number;         // 不足补 0
  maxFractionDigits?: number;         // 超出则四舍五入（half-up）

  // 小数分组（可选）
  fractionGroupSize?: number;         // 例如 3 -> 0.123 456 789
  fractionGroupSeparator?: string;    // 默认同 groupSeparator

  // 去除结尾 0
  trimTrailingZeros?: boolean;        // 默认 false
}

export function formatNumber(
  input: number | string | bigint,
  opts: FormatNumberOptions = {}
): string {
  const {
    groupSize = 3,
    groupPattern,
    groupSeparator = ",",
    decimalSeparator = ".",
    minFractionDigits,
    maxFractionDigits,
    fractionGroupSize,
    fractionGroupSeparator = groupSeparator,
    trimTrailingZeros = false,
  } = opts;

  if(input === '' || input === undefined || input === null) return '';

  // 1) 标准化成纯十进制字符串（无分隔、可能含小数/指数）
  let raw = normalizeToPlainString(input);
  if (raw === "NaN" || raw === "Infinity" || raw === "-Infinity") return raw;

  // 2) 拆分符号/整数/小数
  let sign = "";
  if (raw.startsWith("-")) {
    sign = "-";
    raw = raw.slice(1);
  }
  let [intPart, fracPart = ""] = raw.split(".");

  // 3) 小数位裁剪与四舍五入（half-up）
  if (typeof maxFractionDigits === "number" && maxFractionDigits >= 0) {
    ({ intPart, fracPart } = roundFractionHalfUp(intPart, fracPart, maxFractionDigits));
  }

  // 4) 小数位补齐/去零
  if (typeof minFractionDigits === "number" && minFractionDigits > 0) {
    while (fracPart.length < minFractionDigits) fracPart += "0";
  }
  if (trimTrailingZeros && fracPart) {
    fracPart = fracPart.replace(/0+$/, "");
  }

  // 5) 整数分组
  const groupedInt = groupInteger(intPart, groupPattern?.length ? groupPattern : groupSize, groupSeparator);

  // 6) 小数分组（可选）
  let groupedFrac = fracPart;
  if (fracPart && fractionGroupSize && fractionGroupSize > 0) {
    groupedFrac = groupFraction(fracPart, fractionGroupSize, fractionGroupSeparator);
  }

  // 7) 拼接
  return sign + (groupedInt || "0") + (groupedFrac ? (decimalSeparator + groupedFrac) : "");
}

/* -------------------- 内部工具函数 -------------------- */

// 将 number/bigint/string（含科学计数法）转为纯十进制字符串
function normalizeToPlainString(input: number | string | bigint): string {
  if (typeof input === "bigint") return input.toString();
  if (typeof input === "number") {
    if (!Number.isFinite(input)) return String(input);
    // 避免 toString() 出现指数：用 toExponential 再手动还原
    const s = input.toString();
    return s.includes("e") || s.includes("E") ? fromExponential(s) : s;
  }
  // string：去掉空格，若为指数形式也转
  const s = String(input).trim();
  if (!s) return "NaN";
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) return s; // 纯小数
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(s)) return fromExponential(s);
  // 其他形式（含分隔符等）尝试去除非数字/点/负号再判定
  const cleaned = s.replace(/[^0-9eE+.\-]/g, "");
  if (/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(cleaned)) {
    return cleaned.includes("e") || cleaned.includes("E") ? fromExponential(cleaned) : cleaned;
  }
  return "NaN";
}

// 恢复指数记法为普通字符串
function fromExponential(expStr: string): string {
  const m = expStr.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!m) return expStr;
  const sign = m[1] || "";
  const int = m[2] || "0";
  const frac = m[3] || "";
  const exp = Number.parseInt(m[4], 10);

  if (exp === 0) return sign + (int + (frac ? "." + frac : ""));

  // 合并为纯数字串再移动小数点
  const digits = (int + frac).replace(/^0+/, "") || "0";
  const pointIndex = int.length + exp;

  if (pointIndex <= 0) {
    // 小数点在最左侧之前 -> 0.xxx
    return sign + "0." + "0".repeat(-pointIndex) + digits;
  } else if (pointIndex >= digits.length) {
    // 小数点在末尾之后 -> 123400
    return sign + digits + "0".repeat(pointIndex - digits.length);
  } else {
    // 中间 -> 12.34
    return sign + digits.slice(0, pointIndex) + "." + digits.slice(pointIndex);
  }
}

// 四舍五入到固定小数位（half-up，基于字符串）
function roundFractionHalfUp(intPart: string, fracPart: string, d: number) {
  if (d === 0) {
    // 看第 1 位小数是否 >=5
    if ((fracPart[0] ?? "0") >= "5") {
      intPart = addOneToInteger(intPart);
    }
    fracPart = "";
    return { intPart, fracPart };
  }

  if (fracPart.length <= d) {
    // 不足位，不需要四舍五入
    return { intPart, fracPart };
  }

  const keep = fracPart.slice(0, d);
  const next = fracPart[d];

  if (next >= "5") {
    // 从 keep 的最后一位开始进位
    const arr = keep.split("");
    let i = arr.length - 1;
    while (i >= 0) {
      if (arr[i] !== "9") {
        arr[i] = String((arr[i].charCodeAt(0) - 48 + 1) as number);
        break;
      } else {
        arr[i] = "0";
        i--;
      }
    }
    if (i < 0) {
      // 小数全 9 进位到整数
      intPart = addOneToInteger(intPart);
      fracPart = "0".repeat(d);
    } else {
      fracPart = arr.join("") + ""; // 裁剪到 d 位
    }
  } else {
    fracPart = keep;
  }

  return { intPart, fracPart };
}

// 整数字符串 +1
function addOneToInteger(intPart: string): string {
  let carry = 1;
  const arr = intPart.split("");
  for (let i = arr.length - 1; i >= 0; i--) {
    const n = arr[i].charCodeAt(0) - 48 + carry;
    if (n >= 10) {
      arr[i] = String(n - 10);
      carry = 1;
    } else {
      arr[i] = String(n);
      carry = 0;
      break;
    }
  }
  return (carry ? "1" : "") + arr.join("");
}

// 整数分组：支持 groupSize 或 groupPattern
function groupInteger(
  intPart: string,
  sizeOrPattern: number | number[],
  sep: string
): string {
  if (intPart === "") return "";
  if (intPart === "0") return "0";

  const digits = intPart.replace(/^0+/, "") || "0";
  const out: string[] = [];
  let i = digits.length;

  // 统一成 pattern
  const pattern = Array.isArray(sizeOrPattern) ? sizeOrPattern.slice() : [sizeOrPattern];
  const firstSize = pattern[0] || 3;
  const repeatSize = pattern[1] || pattern[0] || 3;

  // 先拿第一段（最右端 firstSize）
  let take = firstSize;
  let first = true;

  while (i > 0) {
    const start = Math.max(0, i - take);
    out.push(digits.slice(start, i));
    i = start;
    // 第一段后，改用 repeatSize
    if (first) {
      first = false;
      take = repeatSize;
    }
  }

  return out.reverse().join(sep);
}

// 小数分组：从左向右每 fractionGroupSize 位插入分隔符
function groupFraction(fracPart: string, size: number, sep: string): string {
  if (!fracPart) return "";
  const out: string[] = [];
  for (let i = 0; i < fracPart.length; i += size) {
    out.push(fracPart.slice(i, i + size));
  }
  return out.join(sep);
}
