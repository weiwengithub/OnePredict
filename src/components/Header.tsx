"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  currentPage?: 'home' | 'leaderboard' | 'rewards' | 'details';
}

export default function Header({ currentPage }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // 根据当前路径自动检测页面
  const getCurrentPage = () => {
    if (currentPage) return currentPage;

    if (pathname === '/') return 'home';
    if (pathname.startsWith('/leaderboard')) return 'leaderboard';
    if (pathname.startsWith('/rewards')) return 'rewards';
    if (pathname.startsWith('/details')) return 'details';
    return 'home';
  };

  const activePage = getCurrentPage();

  // 滚动检测
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
    { key: 'rewards', label: 'Rewards', href: '/rewards' }
  ];

  return (
    <header
      className={`
        hidden md:block fixed top-0 left-0 right-0 z-50 h-[64px] transition-all duration-300
        ${isScrolled
          ? 'bg-[#04122B]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-[#04122B]'
        }
      `}
    >
      <div className="max-w-[1728px] mx-auto px-[40px]">
        <div className="flex items-center justify-between transition-all duration-300">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="block transition-transform hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="OnePredict"
                width={195}
                height={64}
                className={`transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}
              />
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="flex-1 max-w-md mx-8">
            <nav className="flex gap-[40px]">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`
                    h-[24px] leading-[24px] text-[16px] cursor-pointer transition-all duration-200
                    hover:text-white relative group
                    ${activePage === item.key
                      ? 'text-white font-medium'
                      : 'text-white/60'
                    }
                  `}
                >
                  {item.label}

                  {/* 活跃页面下划线 */}
                  {activePage === item.key && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#467DFF] rounded-full" />
                  )}

                  {/* 悬停效果 */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center">
            {/* USDH Balance */}
            <div className="mr-[48px]">
              <div className="h-[16px] leading-[16px] text-[12px] text-white/40">USDH</div>
              <div className="mt-[4px] flex items-center space-x-[2px]">
                <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                <span className="inline-block h-[16px] leading-[16px] text-[16px] font-bold text-white/60">0</span>
              </div>
            </div>

            {/* Search Button */}
            <button className={`
              flex items-center justify-center size-[36px] border-[1px] border-solid border-white/20
              hover:border-white rounded-[20px] cursor-pointer transition-all duration-200
              hover:bg-white/5 hover:scale-105
            `}>
              <Image src="/images/icon/icon-search.png" alt="Search" width={16} height={16} />
            </button>

            {/* Language Selector */}
            <button className={`
              ml-[8px] flex items-center h-[36px] border-[1px] border-solid border-white/20
              hover:border-white rounded-[20px] px-[16px] cursor-pointer transition-all duration-200
              hover:bg-white/5
            `}>
              <Image src="/images/icon/icon-language.png" alt="Language" width={16} height={16} />
              <span className="ml-[8px] mr-[12px] inline-block h-[24px] leading-[24px] text-[16px] text-white/20">English</span>
              <Image src="/images/icon/icon-arrows-down.png" alt="" width={8} height={4} />
            </button>

            {/* Theme Toggle */}
            <div className="ml-[8px]">
              <ThemeToggle variant="dropdown" />
            </div>

            {/* Sign In Button */}
            <Button
              variant="ghost"
              className={`
                ml-[8px] h-[36px] px-[24px] bg-[#467DFF] text-white hover:bg-[#467DFF]
                hover:text-white rounded-[20px] font-medium transition-all duration-200
                hover:shadow-lg hover:shadow-[#467DFF]/25 hover:scale-105
                ${isScrolled ? 'scale-95' : 'scale-100'}
              `}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* 渐变边框效果（滚动时显示） */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </header>
  );
}
