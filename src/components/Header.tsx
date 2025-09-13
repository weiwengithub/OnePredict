"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import PredictionIntegralModal from "@/components/PredictionIntegralModal";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchModal from "@/components/SearchModal";
import Signin from "@/components/Signin";
import SearchIcon from "@/assets/icons/search.svg";
import NetworkIcon from "@/assets/icons/network.svg";
import SelectIcon from "@/assets/icons/select-icon.svg";
import CheckedIcon from "@/assets/icons/checked.svg";

interface HeaderProps {
  currentPage?: 'home' | 'leaderboard' | 'rewards' | 'details';
}

export default function Header({ currentPage }: HeaderProps) {
  const [showIntegralModal, setShowIntegralModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

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

  // 点击外部关闭语言下拉菜单
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (showLanguageDropdown) {
  //       setShowLanguageDropdown(false);
  //     }
  //   };
  //
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [showLanguageDropdown]);

  const navigationItems = [
    { key: 'home', label: t('header.home'), href: '/' },
    { key: 'leaderboard', label: t('header.leaderboard'), href: '/leaderboard' },
    { key: 'rewards', label: t('header.rewards'), href: '/rewards' }
  ];

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowIntegralModal(true);
  };

  return (
    <>
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
              <div className="group mr-[48px] cursor-pointer" onClick={(e) => handleButtonClick(e)}>
                <div className="h-[16px] leading-[16px] text-[12px] text-white/40 group-hover:text-white">USDH</div>
                <div className="mt-[4px] flex items-center space-x-[2px]">
                  <Image src="/images/icon/icon-token.png" alt="" width={12} height={12} />
                  <span className="inline-block h-[16px] leading-[16px] text-[16px] font-bold text-white/60 group-hover:text-white">0</span>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className={`
                flex items-center justify-center size-[36px] border-[1px] border-solid border-white/20 text-white/20
                hover:border-white hover:text-white rounded-[20px] cursor-pointer transition-all duration-200
                hover:bg-white/5 hover:scale-105
              `}>
                <SearchIcon />
              </button>

              {/* Language Selector */}
              <div className="relative ml-[8px]">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className={`
                  flex items-center h-[36px] border-[1px] border-solid border-white/20 text-white/20
                  hover:border-white hover:text-white rounded-[20px] pl-[16px] pr-[12px] cursor-pointer transition-all duration-200
                  hover:bg-white/5
                `}>
                  <NetworkIcon />
                  <span className="ml-[8px] mr-[12px] inline-block h-[24px] leading-[24px] text-[16px]">
                    {t('header.language')}
                  </span>
                  <SelectIcon className="text-[8px]" />
                </button>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-[#04122B] border border-[#051A3D] rounded-[8px] px-[5px] py-[8px] space-y-[8px] z-50 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage('en');
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full h-[24px] flex items-center justify-between px-[7px] text-[16px] bg-[#01173C] rounded-[8px] transition-colors ${
                        language === 'en' ? 'text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <span>English</span>
                      {language === 'en' && <CheckedIcon className="text-[12px]" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage('zh');
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full h-[24px] flex items-center justify-between px-[7px] text-[16px] bg-[#01173C] rounded-[8px] transition-colors ${
                        language === 'zh' ? 'text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <span>简体中文</span>
                      {language === 'zh' && <CheckedIcon className="text-[12px]" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="ml-[8px]">
                <ThemeToggle variant="dropdown" />
              </div>

              {/* Sign In Button */}
              <Signin />
              {/*<Button*/}
              {/*  variant="ghost"*/}
              {/*  className={`*/}
              {/*  ml-[8px] h-[36px] px-[24px] bg-[#467DFF] text-white hover:bg-[#467DFF]*/}
              {/*  hover:text-white rounded-[20px] font-medium transition-all duration-200*/}
              {/*  hover:shadow-lg hover:shadow-[#467DFF]/25 hover:scale-105*/}
              {/*  ${isScrolled ? 'scale-95' : 'scale-100'}*/}
              {/*`}*/}
              {/*  onClick={() => router.push('/profile')}*/}
              {/*>*/}
              {/*  {t('header.signin')}*/}
              {/*</Button>*/}
            </div>
          </div>
        </div>

        {/* 渐变边框效果（滚动时显示） */}
        {isScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </header>

      {/* Trading Modal */}
      <PredictionIntegralModal
        isOpen={showIntegralModal}
        onClose={() => setShowIntegralModal(false)}
        prediction={{
          question: 'string',
          chance: 0,
          volume: 'string',
          deadline: 'string',
          id: ''
        }}
      />

      {/* Search Modal */}
      <SearchModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
      />
    </>
  );
}
