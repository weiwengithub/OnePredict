import {Transaction, type TransactionArgument} from "@onelabs/sui/transactions";
import {SuiClient, SuiObjectResponse} from "@onelabs/sui/client";

export interface MarketClientOptions {
  packageId: string;
  coinType: string;
  clockId?: string; // default '0x6'
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
  endTimeMs: number; // u64 epoch ms
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
  endTimeMs: number;
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

function toBigIntNonNegative(value: number | string | bigint, label: string): bigint {
  let result: bigint;
  if (typeof value === 'bigint') {
    result = value;
  } else if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(`${label} must be a finite integer`);
    }
    result = BigInt(value);
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) throw new Error(`${label} must be provided`);
    if (!/^-?\d+$/.test(trimmed)) {
      throw new Error(`${label} must be an integer string`);
    }
    result = BigInt(trimmed);
  } else {
    throw new Error(`${label} has unsupported type`);
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

export function calcTotalFromCost(cost: number | string | bigint, feeBps: number | string | bigint): bigint {
  const pureCost = toBigIntNonNegative(cost, 'cost');
  const fee = calcFeeAmount(pureCost, feeBps);
  return pureCost + fee;
}

export function calcCostFromTotal(total: number | string | bigint, feeBps: number | string | bigint): bigint {
  const totalAmount = toBigIntNonNegative(total, 'total');
  if (totalAmount === 0n) return 0n;
  const fee = normalizeFeeBps(feeBps);
  const denom = BPS_SCALE + fee;
  if (denom === 0n) return 0n;
  return (totalAmount * BPS_SCALE) / denom;
}

export function calcNetFromGross(gross: number | string | bigint, feeBps: number | string | bigint): bigint {
  const grossAmount = toBigIntNonNegative(gross, 'gross');
  if (grossAmount === 0n) return 0n;
  const fee = calcFeeAmount(grossAmount, feeBps);
  return grossAmount > fee ? grossAmount - fee : 0n;
}

export function calcGrossFromNet(net: number | string | bigint, feeBps: number | string | bigint): bigint {
  const netAmount = toBigIntNonNegative(net, 'net');
  if (netAmount === 0n) return 0n;
  const fee = normalizeFeeBps(feeBps);
  if (fee >= BPS_SCALE) {
    throw new Error('feeBps must be less than 10_000 to recover gross amount');
  }
  const denom = BPS_SCALE - fee;
  const numerator = netAmount * BPS_SCALE;
  return (numerator + denom - 1n) / denom;
}

export class MarketClient {
  public readonly clockId: string;

  constructor(public readonly client: SuiClient, public readonly opts: MarketClientOptions) {
    this.clockId = opts.clockId ?? '0x6';
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
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        throw new Error('amount must be provided');
      }
      return BigInt(trimmed);
    }
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
      arguments: [tx.object(a.marketId), tx.object(this.clockId)],
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
        this.u128(tx, a.params.b),
        this.u64(tx, a.params.buyFeeBps),
        this.u64(tx, a.params.sellFeeBps),
        this.u64(tx, a.params.winnerRakeBps),
        this.u64(tx, a.params.disputeWindowMs),
        this.str(tx, a.meta.title),
        this.str(tx, a.meta.description),
        this.str(tx, a.meta.imageUrl),
        this.vecStr(tx, a.meta.outcomes),
        this.u64(tx, a.meta.endTimeMs),
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
      arguments: [tx.object(a.marketId), tx.object(a.marketAdminCapId), tx.object(this.clockId)],
    });
    return tx;
  }

  async buildPauseTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::pause`,
      typeArguments: [this.opts.coinType],
      arguments: [tx.object(a.marketId), tx.object(a.marketAdminCapId), tx.object(this.clockId)],
    });
    return tx;
  }

  async buildResumeTx(a: AdminArgsBase): Promise<Transaction> {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.opts.packageId}::market::resume`,
      typeArguments: [this.opts.coinType],
      arguments: [tx.object(a.marketId), tx.object(a.marketAdminCapId), tx.object(this.clockId)],
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
      arguments: [tx.object(a.marketId), tx.object(a.marketAdminCapId), tx.object(this.clockId)],
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
      endTimeMs: Number(meta.end_time_ms ?? 0),
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
