import {apiClient, type ApiConfig} from "@/lib/api/client";
import {
  ResPage,
  ResMarketList,
  ResMarketPosition,
  ResMarketTradeHistory,
  ResTransactionHistory,
  ResContractRedeem,
  MarketOption,
  MarketDetailTradesOption
} from "@/lib/api/interface";

// 具体的API接口方法
export const apiService = {
  // 示例：获取预测数据
  getLoginNonce: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/loginNonce', data);
  },

  // 登录-签名认证登录
  zkLoginBySign: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/zkLoginBySign', data);
  },

  // 示例：创建预测
  loginBySign: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/loginBySign', data);
  },

  // 获取市场列表
  getMarketList: (data: {limit: number; offset: number},config?: ApiConfig) => {
    return apiClient.post<ResMarketList>('/api/market/list', data, config);
  },

  // 获取市场详情
  getMarketDetail: (marketId: string) => {
    return apiClient.post<MarketOption>('/api/market/detail', {marketId});
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

  // 获取用户交易历史记录
  getTransactionHistory: (userAddr: string) => {
    return apiClient.post<ResTransactionHistory>('/api/user/transaction/history', {userAddr});
  },

  // 提取奖励
  contractRedeem: (data: {coinType: string; marketId: string}) => {
    return apiClient.post<ResContractRedeem>('/api/contract/redeem', data);
  },

  // 示例：获取预测详情
  getPredictionDetail: (id: string) => {
    return apiClient.get(`/predictions/${id}`);
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
