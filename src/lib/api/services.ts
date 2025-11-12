import {apiClient, type ApiConfig} from "@/lib/api/client";
import {
  ResPage,
  ReqMarketList,
  ResMarketList,
  ResMarketPosition,
  ResMarketTradeHistory,
  ResTransactionHistory,
  ResContractRedeem,
  MarketOption,
  MarketDetailTradesOption,
  MemberInfo,
  MemberCenter,
  PredictionDetailInfo,
  ResRankList,
  ResBannerList,
  type SortBy,
  type Direction,
  ReqRankList,
  LoginInfo,
  ResInviteList,
  ResTransaction,
  ResBalanceChange,
  DictInfo,
  ResProjectCommentList,
  ResProjectCommentReplyList,
  KlineInfo,
  ResMemberMoneyRecord
} from "@/lib/api/interface";

// 具体的API接口方法
export const apiService = {
  // 获取市场列表
  getMarketList: (params: {
    pageSize: number;
    pageNum: number;
    tags?: string[];
    orderByColumn?: SortBy;
    orderDirection?: Direction;
    marketName?: string;
    address?: string;
  }, config?: ApiConfig) => {
    return apiClient.post<ResMarketList>('/api/ext/market/list', params, config);
  },

  // 获取市场详情
  getMarketDetail: (marketId: string) => {
    return apiClient.post<MarketOption>('/api/ext/market/detail', {marketId});
  },

  // 获取市场交易记录
  getMarketDetailTrades: (data: {marketId: string; pageSize: number; pageNum: number}, config?: ApiConfig) => {
    return apiClient.post<{count: number, rows: MarketDetailTradesOption[]}>('/api/ext/market/trade/history', data, config);
  },

  // 获取用户持仓
  getMarketPosition: (params: { userAddress?: string; memberId?: string; address: string }) => {
    return apiClient.post<ResMarketPosition>('/api/ext/market/position', params);
  },

  // 获取用户历史交易记录
  getMarketTradeHistory: (params: {userAddress: string; address: string}) => {
    return apiClient.post<ResMarketTradeHistory>('/api/ext/market/userTrade/history', params);
  },

  // 交易流水
  getTransactionHistory: (data: {projectId: string; address: string}) => {
    return apiClient.post<ResTransaction>('/api/ext/payRecord/list', data);
  },

  // 钱包余额变化列表
  getBalanceChangeList: (data: {pageSize: number; address: string}) => {
    return apiClient.post<ResBalanceChange>('/api/ext/balanceChange/list', data);
  },

  // 首页banner图查询
  getBannerList: (params?: { pageSize?: number; pageNum?: number }, config?: ApiConfig) => {
    return apiClient.post<ResBannerList>('/api/ext/banner/list', params, config);
  },

  // 获取用户信息
  getMemberInfo: (data: Record<string, unknown>) => {
    return apiClient.post<MemberInfo>('/api/ext/member/current', data);
  },
 // 获取用户信息
 getMemberCenter: (params: {memberId: string; address: string}) => {
  return apiClient.post<MemberCenter>('/api/ext/member/center', params);
},
  // 修改用户信息
  updateMemberInfo: (data: Record<string, unknown>) => {
    return apiClient.post('/api/ext/member/updateInfo', data);
  },

  // 示例：获取预测数据
  getLoginNonce: (data: Record<string, unknown>) => {
    return apiClient.post('/api/ext/member/loginNonce', data);
  },

  // 登录-签名认证登录
  memberLogin: (data: Record<string, unknown>) => {
    return apiClient.post<LoginInfo>('/api/ext/member/login', data);
  },

  // 获取市场 K 线（概率曲线）
  getMarketKline: (data: { marketId: string; level: string }, config?: ApiConfig) => {
    return apiClient.post<KlineInfo>('/api/ext/market/detail/kline', data, config);
  },

  // 获取用户交易历史记录
  // getTransactionHistory: (userAddr: string) => {
  //   return apiClient.post<ResTransactionHistory>('/api/user/transaction/history', {userAddr});
  // },

  // 关注 人/项目
  addMemberFollow: (params: {followType: 'People' | 'Project'; followId: number; address: string}) => {
    return apiClient.post('/api/ext/memberFollow/add', params);
  },

  // 取消关注 人/项目
  delMemberFollow: (params: {followType: 'People' | 'Project'; followId: number; address: string}) => {
    return apiClient.post('/api/ext/memberFollow/del', params);
  },

  // 获取已关注项目
  getMarketFollowList: (params: {pageSize: number; pageNum: number; address: string}, config?: ApiConfig) => {
    return apiClient.post<ResMarketList>('/api/ext/market/myFollowList', params, config);
  },

  // 排行榜
  getRankList: (params: { pageSize: number; pageNum: number; statPeriod: string; orderByColumn: string; orderDirection: string; address: string }, config?: ApiConfig) => {
    return apiClient.post<ResRankList>('/api/ext/rank/list', params, config);
  },

  // 图片上传
  upload: (formData: FormData, config?: ApiConfig) => {
    return apiClient.post<{url: string;}>('/api/ext/common/upload', formData, config);
  },

  // 我的邀请列表
  getMemberInviteList: (params: { pageSize: number; pageNum: number; address: string }) => {
    return apiClient.post<ResInviteList>('/api/ext/member/inviteList', params);
  },

  // 绑定邀请码
  bindByInviteCode: (params: { inviteCode: string; address: string }) => {
    return apiClient.post('/api/ext/member/bindByInviteCode', params);
  },

  // 查询商品类别
  getMetadataDictList: (params: { dictType: string }) => {
    return apiClient.post<DictInfo[]>('/api/metadata/dict/list', params);
  },

  // 文章详情（富文本）
  getArticleDetail: (data: { type: string }) => {
    return apiClient.post('/api/ext/article/detail', data);
  },

  // 留言列表
  getProjectCommentList: (params:  {pageSize: number; pageNum: number; address: string; projectId?: string; marketId?: string; memberId?: string;}) => {
    return apiClient.post<ResProjectCommentList>('/api/ext/projectComment/list', params);
  },

  // 新增留言
  createProjectComment: (params: {projectId: number; content: string; address: string}) => {
    return apiClient.post<DictInfo[]>('/api/ext/projectComment/create', params);
  },

  // 留言回复
  replyProjectComment: (params: { projectId: number, commentId: number, content: string, address: string}) => {
    return apiClient.post<DictInfo[]>('/api/ext/projectComment/reply', params);
  },

  // 回复列表
  getProjectCommentReplyList: (params: { pageNum: number; pageSize: number; commentId: number; memberId?: string }) => {
    return apiClient.post<ResProjectCommentReplyList>('/api/ext/projectComment/replyList', params);
  },

  // 留言点赞/取消
  praiseProjectComment: (params: { projectId: number, commentId: number, address: string}) => {
    return apiClient.post<DictInfo[]>('/api/ext/projectComment/praise', params);
  },

  // 查询收益
  getMemberMoneyRecord: (params: { pageNum: number; pageSize: number; address: string }) => {
    return apiClient.post<ResMemberMoneyRecord>('/api/ext/memberMoneyRecord/list', params);
  },

  // 查询收益
  claimMemberMoney: (params: { coinType: string; address: string }) => {
    return apiClient.post<ResMemberMoneyRecord>('/api/ext/memberMoney/claim', params);
  },
};

export default apiService;
