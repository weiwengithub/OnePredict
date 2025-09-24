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
