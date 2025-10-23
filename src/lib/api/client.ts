import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios';

export type ApiConfig = Omit<AxiosRequestConfig, "url" | "method" | "data">;

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
    config.headers.CHANNEL = 'OnePredict';
    console.log('config.params', config.data)
    // 可以在这里添加认证token等
    const token = localStorage.getItem('predict-token') ? localStorage.getItem('predict-token') : null;
    if (token) {
      config.headers.Authorization = token;
    }

    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
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
  get: <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> => {
    return api.get(url, { params }) as Promise<T>;
  },

  // POST请求
  post: <T = unknown>(url: string, data?: any, config?: ApiConfig): Promise<T> => {
    return api.post(url, data, config) as Promise<T>;
  },

  // PUT请求
  put: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
    return api.put(url, data) as Promise<T>;
  },

  // DELETE请求
  delete: <T = unknown>(url: string): Promise<T> => {
    return api.delete(url) as Promise<T>;
  },

  // PATCH请求
  patch: <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
    return api.patch(url, data) as Promise<T>;
  },
};
