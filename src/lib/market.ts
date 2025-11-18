import { Transaction, type TransactionArgument } from "@onelabs/sui/transactions";
import { SuiClient, SuiObjectResponse } from "@onelabs/sui/client";

export interface MarketClientOptions {
  packageId: string;
  coinType: string;
  clockId?: string; // default '0x6'
  globalSeqId: string;
}

export interface ParamsInput {
  b: bigint | string | number;       // u128
  buyFeeBps: number;                 // u64
  sellFeeBps: number;                // u64
  winnerRakeBps: number;             // u64
  disputeWindowMs: number;           // u64
}

export interface MetaInput {
  title: string;
  description: string;
  imageUrl: string;
  outcomes: string[];
}

export interface CreateMarketArgs {
  marketAdminCapId: string;     // &marketAdminCap
  seedLiquidityCoinId: string;  // Coin<COIN> for seeding
  seedLiquidityAmount?: number | string | bigint;
  initProbsBps: number[];       // vector<u64>, should sum to 10000
  params: ParamsInput;
  meta: MetaInput;
}

export interface SignerLike {
  signAndExecuteTransaction: (args: { transaction: Transaction }) => Promise<any>;
}

export interface ExecOptions {
  signer?: SignerLike;
}

export interface BuyArgs {
  marketId: string;
  outcome: number;         // u64 index
  deltaShares: number;     // u64
  paymentCoinId: string;   // Coin<COIN>
}

export interface BuyByAmountArgs {
  marketId: string;
  outcome: number;
  paymentCoinId: string;   // Coin<COIN>
  amount: number | string | bigint; // Coin amount (u64)
  minSharesOut: number;    // u64
  mergedCoinIds?: string[];
}

export interface SellArgs {
  marketId: string;
  outcome: number;       // u64
  deltaShares: number;   // u64
  minCoinOut: number;    // u64
}

export interface RedeemArgs {
  marketId: string;
}

export interface AdminArgsBase {
  marketId: string;
  marketAdminCapId: string;
}

export interface ResolveArgs extends AdminArgsBase {
  winner: number; // u64
}

export interface MarketView {
  marketId: string;
  state: number;
  disputeWindowMs: number;
  b: string;
  buyFeeBps: number;
  sellFeeBps: number;
  winnerRakeBps: number;
  title: string;
  description: string;
  imageUrl: string;
  outcomes: string[];
  probs: string[];
  vaultValue: string;
  protocolVaultValue: string;
}

const BPS_SCALE = 10_000n;
export const LMSR_SCALE = 1_000_000_000_000n; // 1e12 precision
const LN2_SCALED = 693_147_180_560n; // ≈ ln(2) * 1e12
const MAX_U64 = (1n << 64n) - 1n;

function mulDivDown(a: bigint, b: bigint, d: bigint): bigint {
  if (d === 0n || a === 0n || b === 0n) return 0n;
  return (a * b) / d;
}

function mulDivUp(a: bigint, b: bigint, d: bigint): bigint {
  if (d === 0n || a === 0n || b === 0n) return 0n;
  const product = a * b;
  const quotient = product / d;
  const remainder = product % d;
  return remainder === 0n ? quotient : quotient + 1n;
}

function mulScaleDown(a: bigint, b: bigint): bigint {
  return mulDivDown(a, b, LMSR_SCALE);
}

function mulScaleUp(a: bigint, b: bigint): bigint {
  return mulDivUp(a, b, LMSR_SCALE);
}

function expScaled(x: bigint): bigint {
  if (x <= 0n) return LMSR_SCALE;
  const k = x / LN2_SCALED;
  const r = x - k * LN2_SCALED;

  const r1 = r;
  const r2 = mulScaleUp(r1, r);
  const r3 = mulScaleUp(r2, r);
  const r4 = mulScaleUp(r3, r);
  const r5 = mulScaleUp(r4, r);
  const r6 = mulScaleUp(r5, r);
  const r7 = mulScaleUp(r6, r);
  const r8 = mulScaleUp(r7, r);

  let s = LMSR_SCALE;
  s += r1;
  s += r2 / 2n;
  s += r3 / 6n;
  s += r4 / 24n;
  s += r5 / 120n;
  s += r6 / 720n;
  s += r7 / 5040n;
  s += r8 / 40320n;

  if (k <= 0n) return s;

  let out = s;
  let i = 0n;
  while (i < k) {
    out *= 2n;
    i += 1n;
  }
  return out;
}

function lnSeriesAbsUp(t: bigint): bigint {
  if (t === 0n) return 0n;
  const t2 = mulScaleUp(t, t);
  const t3 = mulScaleUp(t2, t);
  const t5 = mulScaleUp(t3, t2);
  const t7 = mulScaleUp(t5, t2);
  const t9 = mulScaleUp(t7, t2);
  const t11 = mulScaleUp(t9, t2);

  let sum = t;
  sum += t3 / 3n;
  sum += t5 / 5n;
  sum += t7 / 7n;
  sum += t9 / 9n;
  sum += t11 / 11n;
  return sum * 2n;
}

function lnSeriesAbsDown(t: bigint): bigint {
  if (t === 0n) return 0n;
  const t2 = mulScaleDown(t, t);
  const t3 = mulScaleDown(t2, t);
  const t5 = mulScaleDown(t3, t2);
  const t7 = mulScaleDown(t5, t2);
  const t9 = mulScaleDown(t7, t2);
  const t11 = mulScaleDown(t9, t2);

  let sum = t;
  sum += t3 / 3n;
  sum += t5 / 5n;
  sum += t7 / 7n;
  sum += t9 / 9n;
  sum += t11 / 11n;
  return sum * 2n;
}

function ln1pNegAbsDown(u: bigint): bigint {
  if (u <= 0n) return 0n;
  let clamped = u;
  if (clamped >= LMSR_SCALE) {
    clamped = LMSR_SCALE - 1n;
  }
  const denom = (2n * LMSR_SCALE) - clamped;
  if (denom <= 0n) return 0n;
  const t = mulDivDown(clamped, LMSR_SCALE, denom);
  return lnSeriesAbsDown(t);
}

function ln1pPosUp(y: bigint): bigint {
  if (y <= 0n) return 0n;
  const denom = (2n * LMSR_SCALE) + y;
  if (denom <= 0n) return 0n;
  const t = mulDivUp(y, LMSR_SCALE, denom);
  return lnSeriesAbsUp(t);
}

export function lmsrCostBuy(
  b: number | string | bigint,
  prob: number | string | bigint,
  deltaShares: number | string | bigint,
): bigint {
  const bBig = toBigIntNonNegative(b, 'b');
  const probBig = toBigIntNonNegative(prob, 'prob');
  const delta = toBigIntNonNegative(deltaShares, 'deltaShares');
  if (bBig === 0n || probBig === 0n || probBig >= LMSR_SCALE || delta === 0n) return 0n;

  const x = mulDivUp(delta, LMSR_SCALE, bBig);
  if (x <= 0n) return 0n;
  const z = expScaled(x);
  const dz = z - LMSR_SCALE;
  if (dz <= 0n) return 0n;
  const y = mulDivUp(probBig, dz, LMSR_SCALE);
  const ln = ln1pPosUp(y);
  if (ln <= 0n) return 0n;
  return mulDivUp(bBig, ln, LMSR_SCALE);
}

export function lmsrRefundSell(
  b: number | string | bigint,
  prob: number | string | bigint,
  deltaShares: number | string | bigint,
): bigint {
  const bBig = toBigIntNonNegative(b, 'b');
  const probBig = toBigIntNonNegative(prob, 'prob');
  const delta = toBigIntNonNegative(deltaShares, 'deltaShares');
  if (bBig === 0n || probBig === 0n || probBig >= LMSR_SCALE || delta === 0n) return 0n;

  const x = mulDivDown(delta, LMSR_SCALE, bBig);
  if (x <= 0n) return 0n;
  const z = expScaled(x);
  if (z <= 0n) return 0n;
  const invZ = mulDivUp(LMSR_SCALE, LMSR_SCALE, z);
  const oneMinusInvZ = LMSR_SCALE - (invZ > LMSR_SCALE ? LMSR_SCALE : invZ);
  if (oneMinusInvZ <= 0n) return 0n;
  const u = mulDivDown(probBig, oneMinusInvZ, LMSR_SCALE);
  const lnabs = ln1pNegAbsDown(u);
  if (lnabs <= 0n) return 0n;
  return mulDivDown(bBig, lnabs, LMSR_SCALE);
}

export interface PositionMetricsInput {
  b: number | string | bigint;
  prob: number | string | bigint;
  shares: number | string | bigint;
  totalSpent: number | string | bigint;
  totalReceived: number | string | bigint;
}

export interface PositionMetrics {
  positionValue: bigint;
  pnl: bigint;
  netExposure: bigint;
  averageEntryPrice: bigint | null;
}

export function computePositionMetrics(input: PositionMetricsInput): PositionMetrics {
  const shares = toBigIntNonNegative(input.shares, 'shares');
  const positionValue = lmsrRefundSell(input.b, input.prob, shares);
  const spent = toBigIntNonNegative(input.totalSpent, 'totalSpent');
  const received = toBigIntNonNegative(input.totalReceived, 'totalReceived');

  const pnl = positionValue + received - spent;
  const netExposure = spent > received ? spent - received : 0n;
  const averageEntryPrice = shares > 0n && netExposure > 0n ? netExposure / shares : null;

  return {
    positionValue,
    pnl,
    netExposure,
    averageEntryPrice,
  };
}

export interface SellQuoteInput {
  b: number | string | bigint;
  prob: number | string | bigint;
  deltaShares: number | string | bigint;
  sellFeeBps: number | string | bigint;
  currentShares: number | string | bigint;
}

export interface SellQuote {
  gross: bigint;
  fee: bigint;
  net: bigint;
  deltaShares: bigint;
  positionValue: bigint;
  profit: bigint;
}

export interface BuyQuoteInput {
  b: number | string | bigint;
  prob: number | string | bigint;
  amount: number | string | bigint;
  buyFeeBps: number | string | bigint;
  currentShares: number | string | bigint;
}

export interface BuyQuote {
  cost: bigint;
  fee: bigint;
  total: bigint;
  deltaShares: bigint;
  projectedShares: bigint;
  profit: bigint;
}

export interface SellPriceImpactLimitInput {
  b: number | string | bigint;
  prob: number | string | bigint;
  sellFeeBps: number | string | bigint;
  maxDecreaseBps: number | string | bigint;
}

export interface BuyPriceImpactLimitInput {
  b: number | string | bigint;
  prob: number | string | bigint;
  buyFeeBps: number | string | bigint;
  maxIncreaseBps: number | string | bigint;
}

function costCapFromBudget(payIn: bigint, feeBps: bigint): bigint {
  const denom = BPS_SCALE + feeBps;
  if (denom === 0n) return 0n;
  return mulDivDown(payIn, BPS_SCALE, denom);
}

function estimateDeltaFromCostCap(b: bigint, prob: bigint, costCap: bigint): bigint {
  if (b === 0n) return 0n;
  const x = mulDivDown(costCap, LMSR_SCALE, b);
  if (x === 0n) return 0n;
  const u = expScaled(x);
  const oneMinusProb = LMSR_SCALE - prob;
  if (u <= oneMinusProb || prob === 0n) {
    return 0n;
  }
  const ratio = mulDivDown(u - oneMinusProb, LMSR_SCALE, prob);
  const ratioAdj = ratio > LMSR_SCALE ? ratio - LMSR_SCALE : 0n;
  const ln = ln1pPosUp(ratioAdj);
  if (ln === 0n) return 0n;
  const delta = mulDivDown(b, ln, LMSR_SCALE);
  if (delta > MAX_U64) {
    throw new Error('delta exceeds u64 range');
  }
  return delta;
}

interface BuyCostFeeTotal {
  cost: bigint;
  fee: bigint;
  total: bigint;
}

function calcBuyCostFeeTotal(b: bigint, prob: bigint, delta: bigint, feeBps: bigint): BuyCostFeeTotal {
  if (delta === 0n) {
    return { cost: 0n, fee: 0n, total: 0n };
  }
  const cost = lmsrCostBuy(b, prob, delta);
  const fee = calcFeeAmount(cost, feeBps);
  return { cost, fee, total: cost + fee };
}

function findAffordableDelta(
  b: bigint,
  prob: bigint,
  deltaGuess: bigint,
  budget: bigint,
  feeBps: bigint,
): bigint {
  let low = 0n;
  let high = deltaGuess === 0n ? 1n : deltaGuess;
  if (high > MAX_U64) {
    high = MAX_U64;
  }
  let { total: highTotal } = calcBuyCostFeeTotal(b, prob, high, feeBps);

  if (highTotal <= budget) {
    low = high;
    let candidate = high;
    let stretch = 1n;
    while (candidate !== MAX_U64) {
      const avail = MAX_U64 - candidate;
      if (avail === 0n) break;
      const add = avail < stretch ? avail : stretch;
      if (add === 0n) break;
      const next = candidate + add;
      const res = calcBuyCostFeeTotal(b, prob, next, feeBps);
      if (res.total <= budget) {
        candidate = next;
        low = next;
        highTotal = res.total;
        stretch = stretch <= (MAX_U64 / 2n) ? stretch * 2n : MAX_U64;
        continue;
      }
      high = next;
      highTotal = res.total;
      break;
    }
    if (highTotal <= budget) {
      return low;
    }
  }

  let left = low;
  let right = high;
  while (left < right) {
    const mid = left + ((right - left + 1n) / 2n);
    const res = calcBuyCostFeeTotal(b, prob, mid, feeBps);
    if (res.total <= budget) {
      left = mid;
    } else {
      right = mid - 1n;
    }
  }
  return left;
}

// 买报价：返回净成本、手续费、总支付（内扣，即传入预算），本次新增份额与买入后份额
export function calcBuyQuote(input: BuyQuoteInput): BuyQuote {
  const amount = toBigIntNonNegative(input.amount, 'amount');
  if (amount === 0n) {
    throw new Error('amount must be positive');
  }
  const current = toBigIntNonNegative(input.currentShares, 'currentShares');
  const b = toBigIntNonNegative(input.b, 'b');
  if (b === 0n) {
    throw new Error('b must be positive');
  }
  const prob = toBigIntNonNegative(input.prob, 'prob');
  if (prob === 0n || prob >= LMSR_SCALE) {
    throw new Error('prob must be within (0, 1e12)');
  }

  const feeBps = normalizeFeeBps(input.buyFeeBps);
  const costCap = costCapFromBudget(amount, feeBps);
  if (costCap === 0n) {
    throw new Error('amount insufficient after fees');
  }

  const deltaGuess = estimateDeltaFromCostCap(b, prob, costCap);
  const delta = findAffordableDelta(b, prob, deltaGuess, amount, feeBps);
  if (delta === 0n) {
    throw new Error('amount insufficient for any shares');
  }

  const { cost, fee, total: spent } = calcBuyCostFeeTotal(b, prob, delta, feeBps);
  if (spent > amount) {
    throw new Error('quote exceeds available amount');
  }

  const profit = delta > cost ? delta - cost : 0n;
  return {
    cost,
    fee,
    total: amount, // 内扣：传入多少就从该预算里扣成本与手续费
    deltaShares: delta,
    projectedShares: current + delta,
    profit,
  };
}

export function calcMaxBuyAmountForPriceImpact(input: BuyPriceImpactLimitInput): bigint {
  const bBig = toBigIntNonNegative(input.b, 'b');
  const probBig = toBigIntNonNegative(input.prob, 'prob');
  const feeBps = normalizeFeeBps(input.buyFeeBps);
  const maxBps = toBigIntNonNegative(input.maxIncreaseBps, 'maxIncreaseBps');

  if (bBig === 0n || probBig === 0n || probBig >= LMSR_SCALE || maxBps === 0n) {
    return 0n;
  }

  if (probBig === 0n) return 0n;
  const maxAllowableIncrease = mulDivDown(LMSR_SCALE - probBig, BPS_SCALE, probBig);
  const effectiveBps = maxBps > maxAllowableIncrease ? maxAllowableIncrease : maxBps;
  if (effectiveBps === 0n) return 0n;

  const increase = mulDivDown(probBig, effectiveBps, BPS_SCALE);
  if (increase === 0n) return 0n;
  const target = probBig + increase;
  if (target >= LMSR_SCALE) return 0n;

  const numerator = target - probBig;
  const denominator = LMSR_SCALE - target;
  if (numerator <= 0n || denominator === 0n) return 0n;

  const y = mulDivDown(numerator, LMSR_SCALE, denominator); // scaled
  if (y === 0n) return 0n;

  const ln = ln1pPosUp(y);
  if (ln === 0n) return 0n;

  const cost = mulDivUp(bBig, ln, LMSR_SCALE);
  const fee = calcFeeAmount(cost, feeBps);
  return cost + fee;
}

export function calcMaxSellForPriceImpact(input: SellPriceImpactLimitInput): { deltaShares: bigint; gross: bigint; net: bigint } {
  const bBig = toBigIntNonNegative(input.b, 'b');
  const probBig = toBigIntNonNegative(input.prob, 'prob');
  const feeBps = normalizeFeeBps(input.sellFeeBps);
  const maxBps = toBigIntNonNegative(input.maxDecreaseBps, 'maxDecreaseBps');

  if (bBig === 0n || probBig === 0n || probBig >= LMSR_SCALE || maxBps === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const decrease = mulDivDown(probBig, maxBps, BPS_SCALE);
  if (decrease === 0n || decrease >= probBig) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const target = probBig - decrease;
  if (target === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const numerator = probBig * (LMSR_SCALE - target);
  const denominator = target * (LMSR_SCALE - probBig);
  if (denominator === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const zScaled = mulDivDown(numerator, LMSR_SCALE, denominator);
  if (zScaled <= LMSR_SCALE) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const y = zScaled - LMSR_SCALE;
  if (y <= 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const ln = ln1pPosUp(y);
  if (ln === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const delta = mulDivDown(bBig, ln, LMSR_SCALE);
  if (delta === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const gross = lmsrRefundSell(bBig, probBig, delta);
  if (gross === 0n) {
    return { deltaShares: 0n, gross: 0n, net: 0n };
  }

  const fee = calcFeeAmount(gross, feeBps);
  const net = gross > fee ? gross - fee : 0n;
  return { deltaShares: delta, gross, net };
}

// 卖报价：返回退款、手续费、净额以及当前仓位价值
export function calcSellQuote(input: SellQuoteInput): SellQuote {
  const delta = toBigIntNonNegative(input.deltaShares, 'deltaShares');
  const current = toBigIntNonNegative(input.currentShares, 'currentShares');
  if (delta > current) {
    throw new Error('deltaShares cannot exceed currentShares');
  }

  const gross = lmsrRefundSell(input.b, input.prob, delta);
  const fee = calcFeeAmount(gross, input.sellFeeBps);
  const net = gross > fee ? gross - fee : 0n;
  const grossPosition = current === 0n
    ? 0n
    : current === delta
      ? gross
      : lmsrRefundSell(input.b, input.prob, current);
  const feePosition = calcFeeAmount(grossPosition, input.sellFeeBps);
  const positionValue = grossPosition > feePosition ? grossPosition - feePosition : 0n;
  const profit = net;
  return { gross, fee, net, deltaShares: delta, positionValue, profit };
}

function toBigIntNonNegative(value: number | string | bigint, label: string): bigint {
  let result: bigint;
  if (typeof value === 'bigint') {
    result = value;
  } else if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(`${label} must be a finite integer`);
    }
    result = BigInt(value);
  } else {
    {
      const trimmed = value.trim();
      {
        if (!trimmed) throw new Error(`${label} must be provided`);
        {
          if (!/^-?\d+$/.test(trimmed)) {
            throw new Error(`${label} must be an integer string`);
          }
          result = BigInt(trimmed);
        }
      }
    }
  }
  if (result < 0n) {
    throw new Error(`${label} must be non-negative`);
  }
  return result;
}

function normalizeFeeBps(feeBps: number | string | bigint): bigint {
  const fee = toBigIntNonNegative(feeBps, 'feeBps');
  return fee > BPS_SCALE ? BPS_SCALE : fee;
}

export function calcFeeAmount(base: number | string | bigint, feeBps: number | string | bigint): bigint {
  const amount = toBigIntNonNegative(base, 'base');
  if (amount === 0n) return 0n;
  const fee = normalizeFeeBps(feeBps);
  if (fee === 0n) return 0n;
  return (amount * fee) / BPS_SCALE;
}

export function calcTotalFromCost(cost: number | string | bigint, _feeBps: number | string | bigint): bigint {
  // 内扣：前端只需支付合约报价的成本，手续费在合约内处理
  return toBigIntNonNegative(cost, 'cost');
}

export function calcCostFromTotal(total: number | string | bigint, _feeBps: number | string | bigint): bigint {
  return toBigIntNonNegative(total, 'total');
}

export function calcNetFromGross(gross: number | string | bigint, feeBps: number | string | bigint): bigint {
  const grossBig = toBigIntNonNegative(gross, 'gross');
  if (grossBig === 0n) return 0n;
  const fee = calcFeeAmount(grossBig, feeBps);
  return grossBig > fee ? grossBig - fee : 0n;
}

export function calcGrossFromNet(net: number | string | bigint, feeBps: number | string | bigint): bigint {
  const netBig = toBigIntNonNegative(net, 'net');
  if (netBig === 0n) return 0n;
  const normalizedFee = normalizeFeeBps(feeBps);
  if (normalizedFee === 0n) {
    return netBig;
  }
  if (normalizedFee >= BPS_SCALE) {
    throw new Error('feeBps must be less than 100% to derive gross amount from net');
  }
  const denom = BPS_SCALE - normalizedFee;
  let gross = mulDivUp(netBig, BPS_SCALE, denom);
  const netFromGross = (amount: bigint) => amount - ((amount * normalizedFee) / BPS_SCALE);

  while (netFromGross(gross) < netBig) {
    gross += 1n;
  }
  while (gross > 0n) {
    const prev = gross - 1n;
    if (netFromGross(prev) < netBig) {
      break;
    }
    gross = prev;
  }
  return gross;
}

export class MarketClient {
  public readonly clockId: string;
  public readonly globalSeqId: string;

  constructor(public readonly client: SuiClient, public readonly opts: MarketClientOptions) {
    this.clockId = opts.clockId ?? '0x6';
    this.globalSeqId = opts.globalSeqId;
  }

  static calcFeeAmount(base: number | string | bigint, feeBps: number | string | bigint): bigint {
    return calcFeeAmount(base, feeBps);
  }

  static calcTotalFromCost(cost: number | string | bigint, feeBps: number | string | bigint): bigint {
    return calcTotalFromCost(cost, feeBps);
  }

  static calcCostFromTotal(total: number | string | bigint, feeBps: number | string | bigint): bigint {
    return calcCostFromTotal(total, feeBps);
  }

  static calcNetFromGross(gross: number | string | bigint, feeBps: number | string | bigint): bigint {
    return calcNetFromGross(gross, feeBps);
  }

  static calcGrossFromNet(net: number | string | bigint, feeBps: number | string | bigint): bigint {
    return calcGrossFromNet(net, feeBps);
  }

  // helpers
  private u64(tx: Transaction, v: number | string | bigint) {
    const n = typeof v === 'bigint' ? v : BigInt(v);
    return tx.pure.u64(n);
  }

  private addr(tx: Transaction, a: string) {
    return tx.pure.address(a);
  }

  private u128(tx: Transaction, v: number | string | bigint) {
    const n = typeof v === 'bigint' ? v : BigInt(v);
    return tx.pure.u128(n);
  }

  private str(tx: Transaction, s: string) {
    return tx.pure.string(s);
  }

  private normalizeAmount(value: number | string | bigint): bigint {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || !Number.isInteger(value)) {
        throw new Error('amount must be a finite integer');
      }
      return BigInt(value);
    }
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('amount must be provided');
    }
    return BigInt(trimmed);
    throw new Error('invalid amount');
  }

  private vecU64(tx: Transaction, arr: Array<number | string | bigint>) {
    return tx.pure.vector('u64', arr.map(x => (typeof x === 'bigint' ? x : BigInt(x))));
  }

  private vecStr(tx: Transaction, arr: string[]) {
    return tx.pure.vector('string', arr);
  }


  // ---- Trading ----
  async buildBuyTx(a: BuyArgs): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::buy`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        this.u64(tx, a.outcome),
        this.u64(tx, a.deltaShares),
        tx.object(a.paymentCoinId),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildBuyByAmountTx(a: BuyByAmountArgs): Promise<Transaction> {
    const tx = new Transaction();

    const amount = this.normalizeAmount(a.amount);
    if (amount <= 0n) {
      throw new Error('amount must be positive');
    }

    const paymentSource = tx.object(a.paymentCoinId);
    if (a.mergedCoinIds && a.mergedCoinIds.length > 0) {
      tx.mergeCoins(
        paymentSource,
        a.mergedCoinIds.map((id) => tx.object(id)),
      );
    }
    const [paymentBudget] = tx.splitCoins(paymentSource, [this.u64(tx, amount)]);

    tx.moveCall({
      target: `${this.opts.packageId}::market::buy_by_amount`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        this.u64(tx, a.outcome),
        paymentBudget,
        this.u64(tx, a.minSharesOut),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildSellTx(a: SellArgs): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::sell`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        this.u64(tx, a.outcome),
        this.u64(tx, a.deltaShares),
        this.u64(tx, a.minCoinOut),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildRedeemTx(a: RedeemArgs): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::redeem`,
      typeArguments: [this.opts.coinType],
      arguments: [tx.object(a.marketId), tx.object(this.globalSeqId), tx.object(this.clockId)],
    });
    return tx;
  }

  // ---- Admin lifecycle ----
  // create
  async buildCreateMarketEntryTx(a: CreateMarketArgs): Promise<Transaction> {
    const tx = new Transaction();

    const adminCap = tx.object(a.marketAdminCapId);
    const seedSource = tx.object(a.seedLiquidityCoinId);
    const seedLiquidity: TransactionArgument = (() => {
      if (a.seedLiquidityAmount === undefined) {
        return seedSource;
      }
      const [splitCoin] = tx.splitCoins(seedSource, [this.u64(tx, a.seedLiquidityAmount)]);
      return splitCoin;
    })();

    tx.moveCall({
      target: `${this.opts.packageId}::market::create_market`,
      typeArguments: [this.opts.coinType],
      arguments: [
        adminCap,
        tx.object(this.globalSeqId),
        this.u128(tx, a.params.b),
        this.u64(tx, a.params.buyFeeBps),
        this.u64(tx, a.params.sellFeeBps),
        this.u64(tx, a.params.winnerRakeBps),
        this.u64(tx, a.params.disputeWindowMs),
        this.str(tx, a.meta.title),
        this.str(tx, a.meta.description),
        this.str(tx, a.meta.imageUrl),
        this.vecStr(tx, a.meta.outcomes),
        seedLiquidity,
        this.vecU64(tx, a.initProbsBps),
        tx.object(this.clockId),
      ],
    });

    return tx;
  }


  async buildStartTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::start`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        tx.object(a.marketAdminCapId),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildPauseTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::pause`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        tx.object(a.marketAdminCapId),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildResumeTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::resume`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        tx.object(a.marketAdminCapId),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildResolveTx(a: ResolveArgs): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::resolve`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        tx.object(a.marketAdminCapId),
        this.u64(tx, a.winner),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildFinalizeTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::finalize`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(this.globalSeqId),
        tx.object(a.marketAdminCapId),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  async buildWithdrawProtocolFeesTx(a: AdminArgsBase & { to: string }): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::withdraw_protocol_fees`,
      typeArguments: [this.opts.coinType],
      arguments: [
        tx.object(a.marketId),
        tx.object(a.marketAdminCapId),
        this.addr(tx, a.to),
        tx.object(this.clockId),
      ],
    });
    return tx;
  }

  // ---- Execute convenience ----
  async createMarketEntry(a: CreateMarketArgs & ExecOptions) {
    const tx = await this.buildCreateMarketEntryTx(a as CreateMarketArgs);
    if (!a.signer) return tx;
    return a.signer.signAndExecuteTransaction({ transaction: tx });
  }

  async buy(a: BuyArgs & ExecOptions) {
    const tx = await this.buildBuyTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async buyByAmount(a: BuyByAmountArgs & ExecOptions) {
    const tx = await this.buildBuyByAmountTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async sell(a: SellArgs & ExecOptions) {
    const tx = await this.buildSellTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async redeem(a: RedeemArgs & ExecOptions) {
    const tx = await this.buildRedeemTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async start(a: AdminArgsBase & ExecOptions) {
    const tx = await this.buildStartTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async pause(a: AdminArgsBase & ExecOptions) {
    const tx = await this.buildPauseTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async resume(a: AdminArgsBase & ExecOptions) {
    const tx = await this.buildResumeTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async resolve(a: ResolveArgs & ExecOptions) {
    const tx = await this.buildResolveTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async finalize(a: AdminArgsBase & ExecOptions) {
    const tx = await this.buildFinalizeTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  async withdrawProtocolFees(a: (AdminArgsBase & { to: string }) & ExecOptions) {
    const tx = await this.buildWithdrawProtocolFeesTx(a);
    return a.signer ? a.signer.signAndExecuteTransaction({ transaction: tx }) : tx;
  }

  // ---- Reads ----
  async fetchMarketObject(marketId: string): Promise<SuiObjectResponse> {
    return this.client.getObject({ id: marketId, options: { showContent: true, showDisplay: true } });
  }

  async fetchMarketView(marketId: string): Promise<MarketView> {
    const resp = await this.fetchMarketObject(marketId);
    const content = unwrapMoveObjectContent(resp, marketId);
    const fields = ensureRecord(content.fields, 'market.fields');
    const params = extractStructFields(fields.params);
    const meta = extractStructFields(fields.meta);
    return {
      marketId,
      state: toNumber(fields.state, 0),
      disputeWindowMs: toNumber(params.dispute_window_ms, 0),
      b: toStringValue(params.b, '0'),
      buyFeeBps: toNumber(params.buy_fee_bps, 0),
      sellFeeBps: toNumber(params.sell_fee_bps, 0),
      winnerRakeBps: toNumber(params.winner_rake_bps, 0),
      title: toStringValue(meta.title, ''),
      description: toStringValue(meta.description, ''),
      imageUrl: toStringValue(meta.image_url, ''),
      outcomes: toStringArray(meta.outcomes),
      probs: toStringArray(fields.p_probs),
      vaultValue: readBalanceValue(fields.vault),
      protocolVaultValue: readBalanceValue(fields.protocol_vault),
    };
  }
}

type MoveObjectContent = {
  dataType: 'moveObject';
  type: string;
  fields: Record<string, unknown>;
};

function unwrapMoveObjectContent(
  response: SuiObjectResponse,
  context: string,
): MoveObjectContent {
  const content = response?.data?.content;
  if (!content || typeof content !== 'object' || (content as any).dataType !== 'moveObject') {
    throw new Error(`Object ${context} is not a moveObject`);
  }
  return content as MoveObjectContent;
}

function ensureRecord(value: unknown, label: string): Record<string, any> {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid ${label}`);
  }
  return value as Record<string, any>;
}

function extractStructFields(value: unknown): Record<string, any> {
  if (value && typeof value === 'object') {
    const fields = (value as any).fields;
    if (fields && typeof fields === 'object') {
      return fields as Record<string, any>;
    }
  }
  return {};
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toStringValue(value: unknown, fallback: string): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => toStringValue(item, '')).filter((item) => item.length > 0);
}

function readBalanceValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '0';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '0';
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'object') {
    const obj = value as any;
    if (obj && typeof obj === 'object') {
      if (typeof obj.value === 'string' || typeof obj.value === 'number' || typeof obj.value === 'bigint') {
        return toStringValue(obj.value, '0');
      }
      if (obj.fields && typeof obj.fields === 'object') {
        const fields = obj.fields;
        if ('value' in fields) {
          return toStringValue(fields.value, '0');
        }
        if ('balance' in fields) {
          return toStringValue(fields.balance, '0');
        }
      }
    }
  }
  return '0';
}
