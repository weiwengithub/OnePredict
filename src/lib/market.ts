import {Transaction, type TransactionArgument} from "@onelabs/sui/transactions";
import {SuiClient, SuiObjectResponse} from "@onelabs/sui/client";

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

function mulDivNearest(a: bigint, b: bigint, d: bigint): bigint {
    if (d === 0n || a === 0n || b === 0n) return 0n;
    const product = a * b;
    const half = d / 2n;
    if (product >= 0n) {
        return (product + half) / d;
    }
    return (product - half) / d;
}

function mulScaleNearest(a: bigint, b: bigint): bigint {
    return mulDivNearest(a, b, LMSR_SCALE);
}

function expScaled(x: bigint): bigint {
    if (x <= 0n) return LMSR_SCALE;
    const k = x / LN2_SCALED;
    const r = x - k * LN2_SCALED;

    const r1 = r;
    const r2 = mulScaleNearest(r1, r);
    const r3 = mulScaleNearest(r2, r);
    const r4 = mulScaleNearest(r3, r);
    const r5 = mulScaleNearest(r4, r);
    const r6 = mulScaleNearest(r5, r);
    const r7 = mulScaleNearest(r6, r);
    const r8 = mulScaleNearest(r7, r);

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

function lnSeriesAbs(t: bigint): bigint {
    if (t === 0n) return 0n;
    const t2 = mulScaleNearest(t, t);
    const t3 = mulScaleNearest(t2, t);
    const t5 = mulScaleNearest(t3, t2);
    const t7 = mulScaleNearest(t5, t2);
    const t9 = mulScaleNearest(t7, t2);
    const t11 = mulScaleNearest(t9, t2);

    let sum = t;
    sum += t3 / 3n;
    sum += t5 / 5n;
    sum += t7 / 7n;
    sum += t9 / 9n;
    sum += t11 / 11n;
    return sum * 2n;
}

function ln1pNegAbs(u: bigint): bigint {
    if (u <= 0n) return 0n;
    let clamped = u;
    if (clamped >= LMSR_SCALE) {
        clamped = LMSR_SCALE - 1n;
    }
    const denom = (2n * LMSR_SCALE) - clamped;
    if (denom <= 0n) return 0n;
    const t = mulDivNearest(clamped, LMSR_SCALE, denom);
    return lnSeriesAbs(t);
}

function ln1pPos(y: bigint): bigint {
    if (y <= 0n) return 0n;
    const denom = (2n * LMSR_SCALE) + y;
    if (denom <= 0n) return 0n;
    const t = mulDivNearest(y, LMSR_SCALE, denom);
    return lnSeriesAbs(t);
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

    const x = mulDivNearest(delta, LMSR_SCALE, bBig);
    if (x <= 0n) return 0n;
    const z = expScaled(x);
    const dz = z - LMSR_SCALE;
    if (dz <= 0n) return 0n;
    const y = mulDivNearest(probBig, dz, LMSR_SCALE);
    const ln = ln1pPos(y);
    if (ln <= 0n) return 0n;
    return mulDivNearest(bBig, ln, LMSR_SCALE);
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

    const x = mulDivNearest(delta, LMSR_SCALE, bBig);
    if (x <= 0n) return 0n;
    const z = expScaled(x);
    if (z <= 0n) return 0n;
    const invZ = mulDivNearest(LMSR_SCALE, LMSR_SCALE, z);
    const oneMinusInvZ = LMSR_SCALE - (invZ > LMSR_SCALE ? LMSR_SCALE : invZ);
    if (oneMinusInvZ <= 0n) return 0n;
    const u = mulDivNearest(probBig, oneMinusInvZ, LMSR_SCALE);
    const lnabs = ln1pNegAbs(u);
    if (lnabs <= 0n) return 0n;
    return mulDivNearest(bBig, lnabs, LMSR_SCALE);
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
}

// 买报价：返回净成本、手续费、总支付、本次新增份额与买入后份额
export function calcBuyQuote(input: BuyQuoteInput): BuyQuote {
    const amount = toBigIntNonNegative(input.amount, 'amount');
    const current = toBigIntNonNegative(input.currentShares, 'currentShares');
    if (amount === 0n) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const b = toBigIntNonNegative(input.b, 'b');
    const prob = toBigIntNonNegative(input.prob, 'prob');
    if (b === 0n || prob === 0n || prob >= LMSR_SCALE) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const feeBps = normalizeFeeBps(input.buyFeeBps);
    const denom = BPS_SCALE + feeBps;
    if (denom === 0n) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const costCap = (amount * BPS_SCALE) / denom;
    if (costCap === 0n) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const x = mulDivNearest(costCap, LMSR_SCALE, b);
    const u = expScaled(x);
    const oneMinusProb = LMSR_SCALE - prob;
    if (u <= oneMinusProb) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const ratio = mulDivNearest(u - oneMinusProb, LMSR_SCALE, prob);
    const ratioAdj = ratio > LMSR_SCALE ? ratio - LMSR_SCALE : 0n;
    const ln = ln1pPos(ratioAdj);
    if (ln === 0n) {
        return { cost: 0n, fee: 0n, total: 0n, deltaShares: 0n, projectedShares: current };
    }

    const delta = mulDivNearest(b, ln, LMSR_SCALE);
    const cost = lmsrCostBuy(b, prob, delta);
    const fee = calcFeeAmount(cost, feeBps);
    const total = cost + fee;
    if (total > amount) {
        throw new Error('amount insufficient for computed shares');
    }

    return {
        cost,
        fee,
        total,
        deltaShares: delta,
        projectedShares: current + delta,
    };
}

// 卖报价：返回退款、手续费、净额以及当前仓位价值
export function calcSellQuote(input: SellQuoteInput): SellQuote {
    const delta = toBigIntNonNegative(input.deltaShares, 'deltaShares');
    const current = toBigIntNonNegative(input.currentShares, 'currentShares');
    if (delta > current) {
        throw new Error('deltaShares cannot exceed currentShares');
    }

    const gross = lmsrRefundSell(input.b, input.prob, delta);
    if (gross === 0n) {
        return { gross: 0n, fee: 0n, net: 0n, deltaShares: delta, positionValue: 0n };
    }
    const fee = calcFeeAmount(gross, input.sellFeeBps);
    const net = gross > fee ? gross - fee : 0n;
    const grossPosition = current === 0n
        ? 0n
        : current === delta
            ? gross
            : lmsrRefundSell(input.b, input.prob, current);
    const feePosition = calcFeeAmount(grossPosition, input.sellFeeBps);
    const positionValue = grossPosition > feePosition ? grossPosition - feePosition : 0n;
    return { gross, fee, net, deltaShares: delta, positionValue };
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
    // Fees are now handled within the contract, so the external payer only covers the quoted cost.
    return toBigIntNonNegative(cost, 'cost');
}

export function calcCostFromTotal(total: number | string | bigint, _feeBps: number | string | bigint): bigint {
    return toBigIntNonNegative(total, 'total');
}

export function calcNetFromGross(gross: number | string | bigint, _feeBps: number | string | bigint): bigint {
    return toBigIntNonNegative(gross, 'gross');
}

export function calcGrossFromNet(net: number | string | bigint, _feeBps: number | string | bigint): bigint {
    return toBigIntNonNegative(net, 'net');
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
        return a.signer.signAndExecuteTransaction({transaction: tx});
    }

    async buy(a: BuyArgs & ExecOptions) {
        const tx = await this.buildBuyTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async buyByAmount(a: BuyByAmountArgs & ExecOptions) {
        const tx = await this.buildBuyByAmountTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async sell(a: SellArgs & ExecOptions) {
        const tx = await this.buildSellTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async redeem(a: RedeemArgs & ExecOptions) {
        const tx = await this.buildRedeemTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async start(a: AdminArgsBase & ExecOptions) {
        const tx = await this.buildStartTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async pause(a: AdminArgsBase & ExecOptions) {
        const tx = await this.buildPauseTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async resume(a: AdminArgsBase & ExecOptions) {
        const tx = await this.buildResumeTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async resolve(a: ResolveArgs & ExecOptions) {
        const tx = await this.buildResolveTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async finalize(a: AdminArgsBase & ExecOptions) {
        const tx = await this.buildFinalizeTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    async withdrawProtocolFees(a: (AdminArgsBase & { to: string }) & ExecOptions) {
        const tx = await this.buildWithdrawProtocolFeesTx(a);
        return a.signer ? a.signer.signAndExecuteTransaction({transaction: tx}) : tx;
    }

    // ---- Reads ----
    async fetchMarketObject(marketId: string): Promise<SuiObjectResponse> {
        return this.client.getObject({id: marketId, options: {showContent: true, showDisplay: true}});
    }

    async fetchMarketView(marketId: string): Promise<MarketView> {
        const resp = await this.fetchMarketObject(marketId);
        const content: any = resp.data?.content;
        if (!content || content.dataType !== 'moveObject') throw new Error('Not a moveObject');
        const fields = content.fields;

        const params = fields.params?.fields ?? {};
        const meta = fields.meta?.fields ?? {};
        const probs = fields.p_probs ?? [];
        const toStrArray = (xs: any[]) => (Array.isArray(xs) ? xs.map((v) => String(v)) : []);

        return {
            marketId,
            state: Number(fields.state ?? 0),
            disputeWindowMs: Number(params.dispute_window_ms ?? 0),
            b: String(params.b ?? '0'),
            buyFeeBps: Number(params.buy_fee_bps ?? 0),
            sellFeeBps: Number(params.sell_fee_bps ?? 0),
            winnerRakeBps: Number(params.winner_rake_bps ?? 0),
            title: String(meta.title ?? ''),
            description: String(meta.description ?? ''),
            imageUrl: String(meta.image_url ?? ''),
            outcomes: Array.isArray(meta.outcomes) ? meta.outcomes.map((s: any) => String(s)) : [],
            probs: toStrArray(probs),
            vaultValue: String(fields.vault?.fields?.value ?? '0'),
            protocolVaultValue: String(fields.protocol_vault?.fields?.value ?? '0'),
        };
    }
}
