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
  PredictionDetailInfo,
  ResRankList,
  ResBannerList,
  type SortBy,
  type Direction, ReqRankList
} from "@/lib/api/interface";

// 具体的API接口方法
export const apiService = {
  // 获取市场列表
  getMarketList: (params: {
    pageSize: number;
    pageNum: number;
    status?: 'UpComing' | 'OnGoing' | 'Resolved' | 'Completed';
    orderByColumn?: SortBy;
    orderDirection?: Direction;
    projectName?: string;
  }, config?: ApiConfig) => {
    return apiClient.post<{ data: ResMarketList }>('/api/ext/market/list', params, config);
  },

  // 获取市场详情
  getMarketDetail: (marketId: string) => {
    return apiClient.post<MarketOption>('/api/ext/market/detail', {marketId});
  },

  // 获取市场交易记录
  getMarketDetailTrades: (data: {marketId: string; limit: number; offset: number}, config?: ApiConfig) => {
    return apiClient.post<ResPage<MarketDetailTradesOption>>('/api/market/detail/trades', data, config);
  },

  // 获取用户持仓
  getMarketPosition: (userAddr: string) => {
    return apiClient.post<ResMarketPosition>('/api/market/position', {userAddr});
  },

  // 获取历史交易记录
  getMarketTradeHistory: (userAddr: string) => {
    return apiClient.post<ResMarketTradeHistory>('/api/market/trade/history', {userAddr});
  },

  // 提取奖励
  contractRedeem: (data: {coinType: string; marketId: string}) => {
    return apiClient.post<ResContractRedeem>('/api/contract/redeem', data);
  },

  // 首页banner图查询
  getBannerList: (params?: { pageSize?: number; pageNum?: number }, config?: ApiConfig) => {
    return apiClient.post<{ data: ResBannerList }>('/api/ext/banner/list', params, config);
  },

  // 获取用户信息
  getMemberInfo: (data: Record<string, unknown>) => {
    return apiClient.post<MemberInfo>('/api/ext/member/current', data);
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
    return apiClient.post('/api/ext/member/login', data);
  },

  // 获取市场 K 线（概率曲线）
  getMarketKline: (data: { marketId: string; level: string }, config?: ApiConfig) => {
    return apiClient.post<{ data: Array<{ timestamp: string; outcomes: Array<{ outcomeName: string; prob: string; outcome: number }> }> }>('/api/market/detail/kline', data, config);
  },

  // 获取用户交易历史记录
  getTransactionHistory: (userAddr: string) => {
    return apiClient.post<ResTransactionHistory>('/api/user/transaction/history', {userAddr});
  },

  // 关注 人/项目
  addMemberFollow: (followType: 'People' | 'Project', followId: number) => {
    return apiClient.post('/api/ext/memberFollow/add', {followType, followId});
  },

  // 取消关注 人/项目
  delMemberFollow: (followType: 'People' | 'Project', followId: number) => {
    return apiClient.post('/api/ext/memberFollow/del', {followType, followId});
  },

  // 获取已关注项目
  getMarketFollowList: (params: {pageSize: number; pageNum: number;}, config?: ApiConfig) => {
    return apiClient.post<{ data: ResMarketList }>('/api/ext/market/myFollowList', params, config);
  },

  // 排行榜
  getRankList: (params: { pageSize: number; pageNum: number; type: string; }, config?: ApiConfig) => {
    return apiClient.post<ResRankList>('/api/ext/rank/list', params, config);
  },

  // 图片上传
  upload: (formData: FormData, config?: ApiConfig) => {
    return apiClient.post<ResRankList>('/api/ext/common/upload', formData, config);
  },

  // 示例：更新预测
  updatePrediction: (id: string, data: Record<string, unknown>) => {
    return apiClient.put(`/predictions/${id}`, data);
  },

  // 示例：获取排行榜
  getLeaderboard: (params?: { timeRange?: string; limit?: number }) => {
    return apiClient.get('/leaderboard', params);
  },

  // 示例：获取用户奖励
  getUserRewards: (userId: string) => {
    return apiClient.get(`/users/${userId}/rewards`);
  },

  // 示例：外部API代理请求
  getExternalData: (endpoint: string, params?: Record<string, unknown>) => {
    return apiClient.get(`/external/${endpoint}`, params);
  },
};

export default apiService;
