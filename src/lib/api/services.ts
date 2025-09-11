import { AxiosResponse } from 'axios';
import apiClient from './client';

// 通用响应类型
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code?: number;
  success: boolean;
}

// 分页响应类型
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 预测市场相关类型
export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  volume: number;
  endDate: string;
  status: 'active' | 'ended' | 'disputed';
  imageUrl?: string;
}

export interface MarketDetails extends PredictionMarket {
  chartData: Array<{
    date: string;
    probability: number;
    volume: number;
  }>;
  participants: number;
  totalStaked: number;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  avatar?: string;
  balance: number;
  rank: number;
  totalEarnings: number;
}

// API服务类
export class PredictionService {
  // 获取预测市场列表
  static async getMarkets(params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<PredictionMarket>> {
    const response: AxiosResponse<PaginatedResponse<PredictionMarket>> = await apiClient.get('/markets', {
      params,
    });
    return response.data;
  }

  // 获取单个市场详情
  static async getMarketDetails(id: string): Promise<ApiResponse<MarketDetails>> {
    const response: AxiosResponse<ApiResponse<MarketDetails>> = await apiClient.get(`/markets/${id}`);
    return response.data;
  }

  // 创建预测
  static async createPrediction(data: {
    marketId: string;
    amount: number;
    position: 'yes' | 'no';
  }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await apiClient.post('/predictions', data);
    return response.data;
  }

  // 获取市场趋势数据
  static async getMarketTrends(id: string, period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ApiResponse<Array<{
    timestamp: string;
    probability: number;
    volume: number;
  }>>> {
    const response = await apiClient.get(`/markets/${id}/trends`, {
      params: { period },
    });
    return response.data;
  }
}

export class UserService {
  // 获取用户信息
  static async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/user/profile');
    return response.data;
  }

  // 更新用户信息
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/user/profile', data);
    return response.data;
  }

  // 获取用户的预测历史
  static async getPredictionHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get('/user/predictions', { params });
    return response.data;
  }

  // 获取排行榜
  static async getLeaderboard(params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/leaderboard', { params });
    return response.data;
  }
}

export class AuthService {
  // 登录
  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  // 注册
  static async register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  // 登出
  static async logout(): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  // 刷新token
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
}

// 通用的HTTP方法封装
export class ApiService {
  static async get<T>(url: string, params?: any): Promise<T> {
    const response = await apiClient.get(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post(url, data);
    return response.data;
  }

  static async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put(url, data);
    return response.data;
  }

  static async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete(url);
    return response.data;
  }
}

export default {
  PredictionService,
  UserService,
  AuthService,
  ApiService,
};
