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
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type SortBy = 'endTime' | 'tradeVolume' | '';

export type Direction = 'ASC' | 'DESC' | '';

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

export interface PredictionDetailInfo {
  coinType: string;
  createdMs: number;
  finalMs: number;
  marketId: string;
  metaJson: MarketMeta;
  outcomeYields: Record<string, string>;
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
  volume: string;
  volumeFormatted: string;
  winner: null;
  globalSequencerId: string;
}

export interface MarketOption {
  buyFee: number;
  channelCode: string;
  channelId: number;
  channelName: string;
  coinType: string;
  createBy: string;
  createTime: string;
  endTime: string;
  id: number;
  imageUrl: string;
  isDelete: boolean;
  marketDesc: string;
  marketId: string;
  marketName: string;
  marketParamsB: string;
  outcome: MarketOutcome[];
  packageId: string;
  sellFee: number;
  startTime: string;
  status: string;
  tags: string[]
  tradeVolume: string;
  updateBy: string;
  updateTime: string;
  vault: string;
  globalSequencerId: string;
  winnerId: string;
}

export interface MarketOutcome {
  name: string;
  outcomeId: number;
  prob: string;
  roi: string;
}

export interface ReqMarketList {
  pageSize: number;
  pageNum: number;
  status?: 'UpComing' | 'OnGoing' | 'Resolved' | 'Completed';
  orderByColumn?: 'endTime' | 'tradeVolume';
  orderDirection?: 'ASC' | 'DESC';
}

export interface ResMarketList {
  rows: MarketOption[];
  count: number;
  limit: number;
  offset: number;
}

export interface MarketPositionOption {
  bet: string;
  buyPrice: string;
  coinType: string;
  entryPrice: string;
  eventMs: number;
  marketId: string;
  marketImage: string;
  marketName: string;
  marketPrice: string;
  marketState: number;
  outcome: number;
  outcomeName: string;
  packageId: string;
  pnl: string;
  positionValue: string;
  shares: string;
  userAddr: string;
  winProfit: string;
  globalSequencerId: string;
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

export interface ResContractRedeem {
  transaction: any
}

export interface MarketDetailTradesOption {
  amount: string;
  deltaShares: string;
  eventMs: number;
  marketId: string;
  outcome: number;
  outcomeName: string;
  side: string;
  txDigest: string;
  userAddr: string;
}

export interface MemberInfo {
  channelCode: string;
  channelId: number;
  channelName: string;
  createBy: string;
  createTime: string;
  followMeCount: number;
  followProjectCount: number;
  id: number;
  isDelete: boolean;
  loginAddress: string;
  loginTime: string;
  meFollowCount: number;
  memberCode: string;
  nickName: string;
  registerTime: string;
  status: string;
  updateBy: string;
  updateTime: string;
  introduction: string;
}

export interface RankInfo {
  address: string;
  profit: number;
  sort: number;
  tradeCount: number;
  volume: number;
}

export interface ReqRankList {
  pageSize: number;
  pageNum: number;
  type: string;
  address: string;
}

export interface ResRankList {
  count: number;
  rows: [{
    loginUserRank: RankInfo;
    rankList: RankInfo[];
  }];
}

export interface BannerInfo {
  adName: string;
  bannerLink: string;
  channelCode: string;
  channelId: number;
  channelName: string;
  createBy: string;
  createTime: string;
  id: number;
  imageUrl: string;
  isDelete: boolean;
  sort: number;
  status: number;
  updateBy: string;
  updateTime: string;
  title?: string;
  description?: string;
}

export interface ResBannerList {
  count: number;
  rows: BannerInfo[];
}
