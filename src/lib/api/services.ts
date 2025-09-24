import apiClient from "@/lib/api/client";
import {ResultData, ResMarketList} from "@/lib/api/interface";

// 具体的API接口方法
export const apiService = {
  // 示例：获取预测数据
  getLoginNonce: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/loginNonce', data);
  },

  // 示例：创建预测
  zkLoginBySign: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/zkLoginBySign', data);
  },

  // 示例：创建预测
  loginBySign: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/member/loginBySign', data);
  },

  // 示例：获取预测详情
  getPredictionDetail: (id: string) => {
    return apiClient.get(`/predictions/${id}`);
  },

  // 示例：创建预测
  createPrediction: (data: Record<string, unknown>) => {
    return apiClient.post('/predictions', data);
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

  // 示例：创建预测
  getMarketList: () => {
    return apiClient.post<ResMarketList>('/api/market/list');
  },
};

export default apiService;
