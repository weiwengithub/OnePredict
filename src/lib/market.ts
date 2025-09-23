import {Transaction} from "@onelabs/sui/transactions";
import {SuiClient, SuiObjectResponse} from "@onelabs/sui/client";

export interface MarketClientOptions {
    packageId: string;
    coinType: string;
    clockId?: string; // default '0x6'
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
    protocolCutBps: number;
    title: string;
    description: string;
    imageUrl: string;
    outcomes: string[];
    probs: string[];
    vaultValue: string;
    protocolVaultValue: string;
}

export class MarketClient {
    public readonly clockId: string;

    constructor(public readonly client: SuiClient, public readonly opts: MarketClientOptions) {
        this.clockId = opts.clockId ?? '0x6';
    }

    // helpers
    private u64(tx: Transaction, v: number | string | bigint) {
        const n = typeof v === 'bigint' ? v : BigInt(v);
        return tx.pure.u64(n);
    }

    private addr(tx: Transaction, a: string) {
        return tx.pure.address(a);
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
    async buy(a: BuyArgs & ExecOptions) {
        const tx = await this.buildBuyTx(a);
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

        const params = fields.params ?? {};
        const meta = fields.meta ?? {};
        const probs = fields.p_probs ?? fields.probs ?? [];
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
            protocolCutBps: Number(params.protocol_cut_bps ?? 0),
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
