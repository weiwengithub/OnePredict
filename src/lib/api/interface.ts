// Request response parameters (excluding data)
import {number} from "echarts";
import {string} from "valibot";

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
  isFollow: boolean;
  marketDesc: string;
  marketId: string;
  marketName: string;
  marketParamsB: string;
  outcome: MarketOutcome[];
  packageId: string;
  projectId: number;
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
  traderCount: number;
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
  betAmount: number;
  channelId: number;
  coinType: string;
  createBy: string;
  createTime: string;
  currentOutcome: {
    name: string;
    outcomeId: number;
  };
  name: string;
  outcomeId: number;
  currentPrice: number;
  entryPrice: number;
  globalSequencerId: string;
  id: number;
  imageUrl: string;
  isRedeemed: number;
  marketDesc: string;
  marketId: string;
  marketName: string;
  memberId: number;
  packageId: string;
  pnl: number;
  positionValue: number;
  projectId: number;
  shares: number;
  status: string;
  tags: string[]
  traderCount: number;
  updateTime: string;
  userAddress: string;
  winProfit: number;
  winnerId: number;
}

export interface ResMarketPosition {
  rows: MarketPositionOption[];
  count: number;
}

export interface MarketTradeOption {
  amount: number;
  betOption: string;
  channelId: number;
  createBy: string;
  createTime: string;
  delta: number;
  entryPrice: number;
  feeTrade: number;
  id: number;
  isDelete: boolean;
  kind: number;
  marketId: string;
  marketImage: string;
  marketName: string;
  outcome: {
    name: string;
    outcomeId: number;
  }
  total: number;
  tradeTime: string;
  tradeType: string;
  traderCount: number;
  txDigest: string;
  userAddress: string;
}

export interface ResMarketTradeHistory {
  rows: MarketTradeOption[];
  count: number;
}

export interface TransactionOption {
  id: string;
  title: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
}

export interface TransactionInfo {
  address: string;
  channelCode: string;
  channelId: number;
  channelName: string;
  createBy: string;
  createTime: string;
  icon: string;
  id: number;
  isDelete: boolean;
  marketId: string;
  projectId: number;
  projectName: string;
  total: number;
  tradeTime: string;
  tradeType: string;
  txDigest: string;
}

export interface ResTransaction {
  count: number;
  rows: TransactionInfo[];
}

export interface BalanceChangeItem {
  amount: number;
  coinType: string;
  digest: string;
  icon: string;
  marketId: string;
  projectName: string;
  receiveAddress: string;
  sendAddress: string;
  tradeTime: number;
  tradeType: string;
}

export interface ResBalanceChange {
  hasNextPage: boolean;
  list: BalanceChangeItem[];
  nextcursor: string;
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
  amount: number;
  avatar: string;
  channelCode: number;
  channelId: number;
  channelName: string;
  createBy: string;
  createTime: string;
  deltaShares: number;
  entryPrice: number;
  eventMs: number;
  id: number;
  isDelete: boolean;
  marketId: string;
  nickName: string;
  outcome: {
    name: string;
    outcomeId: number;
  };
  remark: string;
  side: string;
  updateBy: string;
  updateTime: string;
  userAddress: string;
}

export interface MemberInfo {
  avatar: string;
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

export interface MemberCenter {
  avatar: string;
  commentCount: number;
  followBySessionMemberId: boolean;
  followMeCount: number;
  meFollowCount: number;
  nickName: string;
  pnlRank: number;
  tradeValueNoFee: number;
  loginAddress: string;
  introduction: string;
}

export interface RankInfo {
  address: string;
  avatar: string;
  channelCode: string;
  channelId: number;
  channelName: string;
  createTime: string;
  id: number;
  isDelete: boolean;
  memberCode: string;
  memberId: number;
  nickName: string;
  pnl: number;
  sort: number;
  statPeriod: string;
  summaryTime: string;
  tradeCount: number;
  tradeValueNoFee: number;
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
    currentUser?: RankInfo;
    // loginUserRank: RankInfo;
    // memberList: MemberInfo[];
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

export interface LoginInfo {
  channelCode: string;
  channelId: number;
  channelName: string;
  isLocked: boolean;
  loginAddress: string;
  memberId: number;
  token: string;
  tokenExpires: number;
}

export interface ResInviteInfo {
  avatar: string;
  inviteTime: string;
  loginAddress: string;
  memberId: number;
  nickName: string;
}

export interface ResInviteList {
  count: number;
  rows: ResInviteInfo[];
}

export interface DictInfo {
  label: string;
  labelEn: string;
  value: string;
}

export interface ProjectCommentListItem {
  avatar: string;
  channelCode: string;
  channelId: number;
  channelName: string;
  commentTime: string;
  content: string;
  createTime: string;
  id: number;
  isDelete: boolean;
  isMyPraise: number;
  marketId: string;
  memberId: number;
  nickName: string;
  praiseCount: number;
  projectId: number;
  replyCount: number;
  updateTime: string;
}

export interface ResProjectCommentList {
  count: number;
  rows: ProjectCommentListItem[];
}

export interface ReplyCommentItem {
  avatar: string;
  channelCode: string;
  channelId: number;
  channelName: string;
  commentId: number;
  content: string;
  createTime: string;
  id: number;
  memberId: number;
  nickName: string;
  projectId: number;
  replyTime: string;
  updateTime: string;
}

export interface ResProjectCommentReplyList {
  count: number;
  rows: ReplyCommentItem[];
}

export interface KlineInfo {
  channelId: number;
  klines: Kline[];
}

export interface Kline {
  timestamp: number;
  outcomes: KlineOutcome[];
}

export interface KlineOutcome {
  outcomeId: number;
  outcomeName: string;
  prob: string;
}

export interface MemberMoneyRecord {
  channelCode: string;
  channelId: number;
  channelName: string;
  createBy: string;
  createTime: string;
  feeAmount: number;
  fromMemberId: number;
  fromNickName: string;
  id: number;
  inviteRate: number;
  isDelete: boolean;
  memberId: number;
  nickName: string;
  projectId: number;
  projectName: string;
  totalAmount: number;
  type: string;
}

export interface ResMemberMoneyRecord {
  avaAmount: number;
  claimedAmount: number;
  count: number;
  rows: MemberMoneyRecord[];
  totalInviteAmount: number;
}
