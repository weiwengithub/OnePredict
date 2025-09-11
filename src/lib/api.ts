import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API基础配置
const API_CONFIG = {
  // 开发环境使用代理路径，生产环境使用完整URL
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建axios实例
const api: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    config.headers.CHANNEL = 'RWA';
    // 可以在这里添加认证token等
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url);

    // 处理常见错误
    if (error.response?.status === 401) {
      // 未授权，清除token并重定向到登录页
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // 禁止访问
      console.error('Access forbidden');
    } else if (error.response?.status === 500) {
      // 服务器错误
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

// 通用API方法
export const apiClient = {
  // GET请求
  get: <T = unknown>(url: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> => {
    return api.get(url, { params });
  },

  // POST请求
  post: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => {
    return api.post(url, data);
  },

  // PUT请求
  put: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => {
    return api.put(url, data);
  },

  // DELETE请求
  delete: <T = unknown>(url: string): Promise<AxiosResponse<T>> => {
    return api.delete(url);
  },

  // PATCH请求
  patch: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<AxiosResponse<T>> => {
    return api.patch(url, data);
  },
};

// 具体的API接口方法
export const apiService = {
  // 示例：获取预测数据
  getPredictions: (params?: { category?: string; page?: number; limit?: number }) => {
    return apiClient.get('/predictions', params);
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
  getExtProjectList: (data: Record<string, unknown>) => {
    return apiClient.post('/ext/project/list', data);
  },
};

export default api;
