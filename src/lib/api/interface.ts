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
  buyPrice: string;
  eventMs: number;
  marketId: string;
  outcome: number;
  shares: string;
  userAddr: string;
  question: string;
  price: string;
  entryPrice: string;
  marketPrice: string;
  betAmount: string;
  currentValue: string;
  pnl: string;
  toWin: string;
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
  outcome: number;
  payloadJson: {
    change: string;
    cost: string;
    delta: string;
    fee_trade: string;
    kind: number;
    market_id: string;
    min_shares_out: string;
    outcome: string;
    pay_in: string;
    probs: string[];
    protocol_vault_value: string;
    t_ms: string;
    total: string;
    vault_value: string;
    who: string;
  };
  side: string;
  total: string;
  txDigest: string;
  userAddr: string;
  question: string;
  price: string;
  type: string;
  tradePrice: string;
  value: string;
  date: string;
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
