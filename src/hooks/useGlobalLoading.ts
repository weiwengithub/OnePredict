import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '@/store';

/**
 * 全局Loading控制的自定义Hook
 * 用于在组件中方便地控制全局loading状态
 */
export function useGlobalLoading() {
  const dispatch = useDispatch();

  const show = useCallback((message?: string) => {
    dispatch(showLoading(message));
  }, [dispatch]);

  const hide = useCallback(() => {
    dispatch(hideLoading());
  }, [dispatch]);

  /**
   * 包装一个异步函数，自动显示/隐藏loading
   * @param asyncFn 异步函数
   * @param loadingMessage 可选的loading提示信息
   */
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    try {
      show(loadingMessage);
      const result = await asyncFn();
      hide();
      return result;
    } catch (error) {
      hide();
      throw error;
    }
  }, [show, hide]);

  return {
    show,
    hide,
    withLoading
  };
}
