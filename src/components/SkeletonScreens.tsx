import React, { useEffect } from 'react';

// 添加自定义CSS动画样式
const injectShimmerStyles = () => {
  const styleId = 'skeleton-shimmer-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-shimmer {
      animation: shimmer 1.5s infinite;
    }
  `;
  document.head.appendChild(style);
};

// 基础骨架屏组件
const SkeletonBox = ({ className = "", children }: { className?: string, children?: React.ReactNode }) => {
  useEffect(() => {
    injectShimmerStyles();
  }, []);

  return (
    <div className={`relative bg-white/5 rounded overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      {children}
    </div>
  );
};

// Positions标签页的骨架屏
export const PositionsSkeleton = () => {
  // 创建不同宽度的变化，使其看起来更真实
  const questionWidths = ['w-3/4', 'w-2/3', 'w-4/5'];
  const priceWidths = ['w-[100px]', 'w-[120px]', 'w-[90px]'];

  return (
    <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
          {/* Header */}
          <div className="flex items-center">
            <SkeletonBox className="w-[40px] h-[40px] rounded-full flex-shrink-0" />
            <div className="ml-[12px] flex-1 overflow-hidden">
              <SkeletonBox className={`h-[16px] ${questionWidths[index % questionWidths.length]} mb-[4px]`} />
              <SkeletonBox className={`h-[20px] ${priceWidths[index % priceWidths.length]} rounded-[4px]`} />
            </div>
            <SkeletonBox className="w-[16px] h-[16px] mx-[20px] flex-shrink-0" />
            <SkeletonBox className="h-[32px] w-[60px] rounded-[8px] flex-shrink-0" />
          </div>

          {/* First row of data */}
          <div className="mt-[24px] flex pt-[24px] border-t border-white/10">
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[80px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[40px]" />
              </div>
            </div>
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[90px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[50px]" />
              </div>
            </div>
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[40px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[50px]" />
              </div>
            </div>
          </div>

          {/* Second row of data */}
          <div className="mt-[16px] flex">
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[60px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[35px]" />
              </div>
            </div>
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[30px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[50px]" />
              </div>
            </div>
            <div className="flex-1">
              <SkeletonBox className="h-[12px] w-[50px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[50px]" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 底部加载完成提示的骨架屏 */}
      <div className="mt-[24px] flex justify-center">
        <SkeletonBox className="h-[24px] w-[120px]" />
      </div>
    </div>
  );
};

// Trades标签页的骨架屏
export const TradesSkeleton = () => {
  const questionWidths = ['w-4/5', 'w-3/4', 'w-5/6', 'w-2/3'];
  const priceWidths = ['w-[120px]', 'w-[100px]', 'w-[140px]', 'w-[110px]'];

  return (
    <div className="mt-[24px] flex-1 space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
          {/* Header */}
          <div className="flex">
            <SkeletonBox className="w-[40px] h-[40px] rounded-full flex-shrink-0" />
            <div className="ml-[12px] flex-1 overflow-hidden">
              <SkeletonBox className={`h-[16px] ${questionWidths[index % questionWidths.length]} mb-[4px]`} />
              <SkeletonBox className={`h-[20px] ${priceWidths[index % priceWidths.length]} rounded-[4px]`} />
            </div>
          </div>

          {/* Trade details */}
          <div className="mt-[24px] flex justify-between pt-[24px] border-t border-white/10">
            <div>
              <SkeletonBox className="h-[12px] w-[40px] mb-[8px]" />
              <SkeletonBox className="h-[16px] w-[45px]" />
            </div>
            <div>
              <SkeletonBox className="h-[12px] w-[45px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[40px]" />
              </div>
            </div>
            <div>
              <SkeletonBox className="h-[12px] w-[45px] mb-[8px]" />
              <div className="flex items-center">
                <SkeletonBox className="w-[16px] h-[16px] rounded mr-[4px]" />
                <SkeletonBox className="h-[16px] w-[50px]" />
              </div>
            </div>
            <div>
              <SkeletonBox className="h-[12px] w-[40px] mb-[8px]" />
              <SkeletonBox className="h-[16px] w-[70px]" />
            </div>
          </div>
        </div>
      ))}

      {/* 底部加载完成提示的骨架屏 */}
      <div className="mt-[24px] flex justify-center">
        <SkeletonBox className="h-[24px] w-[120px]" />
      </div>
    </div>
  );
};

// Transaction标签页的骨架屏
export const TransactionSkeleton = () => {
  const titleWidths = ['w-[120px]', 'w-[100px]', 'w-[140px]', 'w-[110px]', 'w-[130px]', 'w-[90px]'];
  const descWidths = ['w-[180px]', 'w-[160px]', 'w-[200px]', 'w-[150px]', 'w-[190px]', 'w-[170px]'];
  const amountWidths = ['w-[80px]', 'w-[70px]', 'w-[90px]', 'w-[75px]', 'w-[85px]', 'w-[95px]'];
  const dateWidths = ['w-[100px]', 'w-[90px]', 'w-[110px]', 'w-[95px]', 'w-[105px]', 'w-[85px]'];

  return (
    <div className="mt-[24px] flex-1">
      <div className="space-y-[24px] overflow-x-hidden overflow-y-auto scrollbar-none p-[24px] bg-[#04122B] rounded-[16px] border border-white/20">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center pb-[24px] border-b border-white/10 last:border-none last:pb-0">
            <div className="size-[32px] flex-none">
              <SkeletonBox className="w-[32px] h-[32px] rounded-full" />
            </div>
            <div className="mx-[12px] flex-1">
              <SkeletonBox className={`h-[16px] ${titleWidths[index % titleWidths.length]} mb-[6px]`} />
              <SkeletonBox className={`h-[16px] ${descWidths[index % descWidths.length]}`} />
            </div>
            <div className="flex-none text-right">
              <SkeletonBox className={`h-[16px] ${amountWidths[index % amountWidths.length]} mb-[6px] ml-auto`} />
              <SkeletonBox className={`h-[16px] ${dateWidths[index % dateWidths.length]} ml-auto`} />
            </div>
          </div>
        ))}
      </div>

      {/* 底部加载完成提示的骨架屏 */}
      <div className="mt-[24px] flex justify-center">
        <SkeletonBox className="h-[24px] w-[120px]" />
      </div>
    </div>
  );
};

// 空状态骨架屏（用于首次加载或无数据时）
export const EmptyStateSkeleton = ({ currentTab }: { currentTab: 'positions' | 'trades' | 'transaction' }) => {
  return (
    <div className="mt-[40px] flex flex-col items-center">
      <SkeletonBox className="w-[48px] h-[48px] rounded-lg mb-[12px]" />
      <SkeletonBox className="h-[24px] w-[120px]" />
    </div>
  );
};

// 通用骨架屏选择器
export const TabSkeleton = ({
  currentTab,
  variant = 'loading'
}: {
  currentTab: 'positions' | 'trades' | 'transaction';
  variant?: 'loading' | 'empty';
}) => {
  if (variant === 'empty') {
    return <EmptyStateSkeleton currentTab={currentTab} />;
  }

  switch (currentTab) {
    case 'positions':
      return <PositionsSkeleton />;
    case 'trades':
      return <TradesSkeleton />;
    case 'transaction':
      return <TransactionSkeleton />;
    default:
      return <PositionsSkeleton />;
  }
};
