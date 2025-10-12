"use client";

import React, {useState, useEffect, useRef} from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import PredictionIntegralModal from "@/components/PredictionIntegralModal";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchModal from "@/components/SearchModal";
import Signin from "@/components/Signin";
import { useUsdhBalance } from "@/hooks/useUsdhBalance";
import SearchIcon from "@/assets/icons/search.svg";
import NetworkIcon from "@/assets/icons/network.svg";
import ArrowDownIcon from '@/assets/icons/arrowDown.svg';
import CheckedIcon from "@/assets/icons/checked.svg";
import GoogleIcon from "@/assets/icons/google.svg";
import AppleIcon from "@/assets/icons/apple.svg";
import WalletIcon from "@/assets/icons/walletIcon.svg";
import {addPoint} from "@/lib/utils";
import ProfileIcon from "@/assets/icons/profile.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import { setSigninOpen } from "@/store";
import LogoutIcon from "@/assets/icons/logout.svg";
import {useCurrentAccount} from "@onelabs/dapp-kit";
import { useDispatch, useSelector } from 'react-redux';
import {RootState} from "@/lib/interface";

interface HeaderProps {
  currentPage?: 'home' | 'leaderboard' | 'rewards' | 'details';
}

export default function Header({ currentPage }: HeaderProps) {
  const dispatch = useDispatch();
  const [showIntegralModal, setShowIntegralModal] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [showTheme, setShowTheme] = useState(false);

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);

  const { balance: usdhBalance } = useUsdhBalance({
    // address: userAddress, // 可选：不传则自动解析
    pollMs: 0, // 可选：例如 5000 开启 5s 轮询
  });

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
    { key: 'home', label: t('header.home'), href: '/' },
    { key: 'leaderboard', label: t('header.leaderboard'), href: '/leaderboard' },
    { key: 'rewards', label: t('header.rewards'), href: '/rewards' }
  ];

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zkLoginData || currentAccount) {
      setShowIntegralModal(true);
    } else {
      dispatch(setSigninOpen(true))
    }
  };

  const showMenu = false;
  return (
    <>
      <header
        className="hidden md:block fixed top-0 left-0 right-0 z-50 h-[64px] transition-all duration-300 bg-[#04122B]"
      >
        <div className="max-w-[1728px] mx-auto px-[40px]">
          <div className="relative flex items-center justify-between transition-all duration-300 h-[64px]">
            {/* Left side - Logo */}
            <div className="flex items-center space-x-4 z-10">
              <Link href="/" className="block transition-transform hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="OnePredict"
                  width={195}
                  height={64}
                  className="transition-all duration-300"
                />
              </Link>
            </div>

            {/* Center - Navigation (绝对居中) */}
            {showMenu && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <nav className="flex gap-[40px] items-center justify-center">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`
                    h-[24px] leading-[24px] text-[16px] cursor-pointer transition-all duration-200
                    hover:text-[#477CFC] relative group whitespace-nowrap
                    ${activePage === item.key
                        ? 'text-[#477CFC] font-medium'
                        : 'text-white'
                      }
                  `}
                    >
                      {item.label}

                      {/* 活跃页面下划线 */}
                      {/*{activePage === item.key && (*/}
                      {/*  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#467DFF] rounded-full" />*/}
                      {/*)}*/}

                      {/* 悬停效果 */}
                      {/*<div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />*/}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Right side - User menu */}
            <div className="flex items-center gap-[8px] z-10">
              {/* USDH Balance */}
              <div className="flex items-center mr-[40px] cursor-pointer" onClick={(e) => handleButtonClick(e)}>
                <Image src="/images/icon/icon-token.png" alt="" width={20} height={20} />
                <span className="inline-block ml-[8px] h-[24px] leading-[24px] text-[24px] font-bold text-white/60 hover:text-white">{usdhBalance}</span>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className={`
                flex items-center justify-center size-[36px] border-[1px] border-solid border-white/60 text-white
                hover:border-white rounded-[20px] cursor-pointer transition-all duration-200
                hover:bg-white/5 hover:scale-105
              `}>
                <SearchIcon />
              </button>

              {/* Language Selector */}
              <div
                className="relative"
                onMouseEnter={() => {
                  setShowLanguageDropdown(true);
                }}
                onMouseLeave={() => {
                  setTimeout(() => {
                    setShowLanguageDropdown(false)
                  }, 200)
                }}
              >
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className={`
                  flex items-center h-[36px] border-[1px] border-solid border-white/60 text-white
                  hover:border-white rounded-[20px] pl-[16px] pr-[12px] cursor-pointer transition-all duration-200
                  hover:bg-white/5
                `}>
                  <NetworkIcon />
                  <span className="ml-[8px] mr-[12px] inline-block h-[24px] leading-[24px] text-[16px]">
                    {t('header.language')}
                  </span>
                  <ArrowDownIcon className="text-[16px] text-white/60" />
                </button>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="absolute top-[36px] w-full pt-[14px]">
                    <div className="bg-[#04122B] rounded-[16px] p-[12px] space-y-[12px]">
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
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              {showTheme && (
                <div className="ml-[8px]">
                  <ThemeToggle variant="dropdown" />
                </div>
              )}

              {/* Sign In Button */}
              <Signin />
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
        onShowDeposit={() => setShowDeposit(true)}
        onShowWithdraw={() => setShowWithdraw(true)}
        prediction={{
          question: 'string',
          chance: 0,
          volume: 'string',
          deadline: 'string',
          id: ''
        }}
      />

      {/* Deposit Modal */}
      <DepositModal open={showDeposit} onOpenChange={setShowDeposit} />

      {/* Withdraw Modal */}
      <WithdrawModal open={showWithdraw} onOpenChange={setShowWithdraw} />

      {/* Search Modal */}
      <SearchModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
      />
    </>
  );
}
