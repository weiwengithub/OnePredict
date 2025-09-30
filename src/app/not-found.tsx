"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';

// 404页面图标组件
const NotFoundIcon = () => (
  <svg
    className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-.974-5.709-2.291M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function NotFound() {
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // 记录404事件用于分析
    console.log('404 page accessed:', window.location.pathname);
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center">
          <NotFoundIcon />

          {/* 404 标题 */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>

          {/* 错误描述 */}
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t ? t('notFound.title') : '页面未找到'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {t ? t('notFound.description') : '抱歉，您访问的页面不存在或已被移动。请检查URL是否正确，或返回首页继续浏览。'}
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {t ? t('notFound.goHome') : '返回首页'}
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1 sm:flex-none px-6 py-2"
            >
              {t ? t('notFound.goBack') : '返回上页'}
            </Button>
          </div>

          {/* 快速导航链接 */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t ? t('notFound.quickLinks') : '或者访问以下页面：'}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {t ? t('nav.home') : '首页'}
              </Link>

              <Link
                href="/leaderboard"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {t ? t('nav.leaderboard') : '排行榜'}
              </Link>

              <Link
                href="/rewards"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {t ? t('nav.rewards') : '奖励'}
              </Link>

              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                {t ? t('nav.profile') : '个人资料'}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
