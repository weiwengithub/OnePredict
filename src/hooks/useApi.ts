import { useState, useEffect, useCallback } from 'react';
import { PredictionService, UserService, AuthService } from '@/lib/api/services';

// 通用API状态接口
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 获取预测市场列表
export function useMarkets(params?: any) {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchMarkets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await PredictionService.getMarkets(params);
      setState({ data: response.data, loading: false, error: null });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch markets',
      }));
    }
  }, [params]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { ...state, refetch: fetchMarkets };
}

// 获取用户信息
export function useUser() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await UserService.getProfile();
      setState({ data: response.data, loading: false, error: null });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Failed to fetch user',
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { ...state, refetch: fetchUser };
}

// 认证hooks
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } catch (error: any) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, loading, error };
}
