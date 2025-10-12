// Request response parameters (excluding data)
export interface Result {
  code: number;
  msg: string;
}

// Request response parameters (including data)
export interface ResultData<T = any> extends Result {
  data: T;
}

// paging request parameters
export interface ReqPage {
  count?: number;
  limit?: number;
}

// paging response parameters
export interface ResPage<T> {
  item: T[];
  count: number;
  limit: number;
  offset: number;
}

export interface MarketMeta {
  description: string;
  end_time_ms: string;
  image_url: string;
  outcomes: string[]
  title: string;
}

export interface MarketParams {
  b: string;
  buy_fee_bps: string;
  dispute_window_ms: string;
  protocol_cut_bps: string;
  sell_fee_bps: string;
  winner_rake_bps: string;
}

export interface MarketOption {
  coinType: string;
  createdMs: number;
  finalMs: number;
  marketId: string;
  metaJson: MarketMeta;
  outcomeYields: {
    YES: string;
    NO: string;
  }
  pProbsJson: string[];
  packageId: string;
  paramsJson: MarketParams;
  pausedMs: number;
  protocolVault: string;
  resolvedMs: number;
  startedMs: number;
  state: number;
  txCreated: string;
  updatedMs: number;
  vault: string;
  winner: null;
}

export interface ResMarketList {
  item: MarketOption[];
  count: number;
  limit: number;
  offset: number;
}

export interface MarketPositionOption {
  bet: string;
  buyPrice: string;
  entryPrice: string;
  eventMs: number;
  marketId: string;
  marketImage: string;
  marketName: string;
  marketPrice: string;
  outcome: number;
  outcomeName: string;
  pnl: string;
  positionValue: string;
  shares: string;
  userAddr: string;
  winProfit: string;
}

export interface ResMarketPosition {
  items: MarketPositionOption[];
  count: number;
  userAddr: string;
}

export interface MarketTradeOption {
  amount: string;
  change: string;
  createdMs: number;
  deltaShares: string;
  eventMs: number;
  eventSeq: number;
  fee: string;
  kind: number;
  marketId: string;
  marketImage: string;
  marketName: string;
  outcome: number;
  payloadJson: {
    delta: string;
    fee_trade: string;
    gross: string;
    kind: number;
    market_id: string;
    outcome: string;
    probs: string[];
    protocol_vault_value: string;
    refund: string;
    t_ms: string;
    vault_value: string;
    who: string;
  }
  side: string;
  total: string;
  txDigest: string;
  userAddr: string;
}

export interface ResMarketTradeHistory {
  items: MarketTradeOption[];
  count: number;
  limit: number;
  offset: number;
  marketId: null;
  userAddr: string;
}

export interface TransactionOption {
  id: string;
  title: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
}

export interface ResTransactionHistory {
  items: TransactionOption[];
  count: number;
  limit: number;
  offset: number;
}
