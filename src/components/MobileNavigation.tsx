"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {Menu} from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import {useDispatch, useSelector} from 'react-redux';
import {useCurrentAccount, useDisconnectWallet} from "@onelabs/dapp-kit";
import {useUsdhBalance} from "@/hooks/useUsdhBalance";
import {useRouter} from "next/navigation";
import {clearLoginData, setSigninOpen} from "@/store";
import {RootState} from "@/lib/interface";
import PredictionIntegralModal from "@/components/PredictionIntegralModal";
import SearchModal from "@/components/SearchModal";
import Signin from "@/components/Signin";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from '@/contexts/ThemeContext';
import HomeIcon from "@/assets/icons/menu/home.svg";
import SearchIcon from "@/assets/icons/menu/search.svg";
import AssetsIcon from "@/assets/icons/menu/assets.svg";
import MoreIcon from "@/assets/icons/menu/more.svg";
import NotificationIcon from "@/assets/icons/menu/notification.svg";
import LeaderboardIcon from "@/assets/icons/menu/leaderboard.svg";
import RewardIcon from "@/assets/icons/menu/rewards.svg";
import ProfileIcon from "@/assets/icons/menu/profile.svg";
import SettingIcon from "@/assets/icons/menu/settings.svg";
import LanguagesIcon from "@/assets/icons/menu/languages.svg";
import DarkIcon from "@/assets/icons/menu/dark.svg";
import LightIcon from "@/assets/icons/menu/light.svg";
import SystemIcon from "@/assets/icons/menu/system.svg";
import LogoutIcon from "@/assets/icons/menu/logout.svg";
import ArrowIcon from "@/assets/icons/menu/arrow.svg";
import CheckedIcon from "@/assets/icons/menu/checked.svg";

interface MobileNavigationProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
}

export default function MobileNavigation({
  onCategoryChange,
  activeCategory = "home"
}: MobileNavigationProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const [showIntegralModal, setShowIntegralModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectLanguage, setSelectLanguage] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  const currentAccount = useCurrentAccount();
  const zkLoginData = useSelector((state: RootState) => state.zkLoginData);
  const { mutate: disconnect } = useDisconnectWallet();
  const { balance: usdhBalance } = useUsdhBalance({
    // address: userAddress, // 可选：不传则自动解析
    pollMs: 0, // 可选：例如 5000 开启 5s 轮询
  });

  const [showTheme, setShowTheme] = useState(false);

  // Main pages navigation
  const mainPages = [
    { id: "home", label: t('header.forYou'), icon: HomeIcon, href: "/" },
    { id: "search", label: t('header.search'), icon: SearchIcon, href: "/leaderboard" },
    { id: "assets", label: t('header.assets'), icon: AssetsIcon, href: "/rewards" },
    { id: "more", label: t('header.more'), icon: MoreIcon, href: "/rewards" }
  ];

  const handleButtonClick = () => {
    if (zkLoginData || currentAccount) {
      setShowIntegralModal(true);
    } else {
      dispatch(setSigninOpen(true))
    }
  };

  const handleMenuClick = (id: string) => {
    switch (id) {
      case "home":
        router.push("/");
        break;
      case "search":
        setShowSearchModal(true);
        break;
      case "assets":
        handleButtonClick()
        break;
      case "more":
        setIsOpen(true);
        break;
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange?.(categoryId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="h-[48px] bg-[#051A3D] border-b border-white/10 px-[16px] sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left: Menu and Logo */}
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-[#051A3D]">
                <div className="px-[16px] py-[22px]">
                  <Signin />

                  <div
                    className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                    onClick={() => {
                      if (zkLoginData || currentAccount) {
                        // router.push("/setting")
                      } else {
                        setIsOpen(false);
                        dispatch(setSigninOpen(true))
                      }
                    }}
                  >
                    <NotificationIcon className="text-[16px] text-white" />
                    <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.notification')}</div>
                  </div>

                  <div
                    className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                    onClick={() => {
                      router.push("/leaderboard")
                    }}
                  >
                    <LeaderboardIcon className="text-[16px] text-white" />
                    <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.leaderboard')}</div>
                  </div>

                  <div
                    className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                    onClick={() => {
                      if (zkLoginData || currentAccount) {
                        router.push("/rewards")
                      } else {
                        setIsOpen(false);
                        dispatch(setSigninOpen(true))
                      }
                    }}
                  >
                    <RewardIcon className="text-[16px] text-white" />
                    <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.rewards')}</div>
                  </div>

                  {(zkLoginData || currentAccount) && (
                    <>
                      <div
                        className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                        onClick={() => {
                          router.push("/profile")
                        }}
                      >
                        <ProfileIcon className="text-[16px] text-white" />
                        <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.profile')}</div>
                      </div>

                      <div
                        className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                        onClick={() => {
                          router.push("/setting")
                        }}
                      >
                        <SettingIcon className="text-[16px] text-white" />
                        <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.settings')}</div>
                      </div>
                    </>
                  )}

                  <div>
                    <div
                      className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                      onClick={() => setSelectLanguage(!selectLanguage)}
                    >
                      <LanguagesIcon className="text-[16px] text-white" />
                      <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.languages')}</div>
                      <ArrowIcon className={`text-[16px] text-white/60 transition-transform duration-300 ease-out ${selectLanguage ? 'rotate-180' : ''}`} />
                    </div>
                    {selectLanguage && (
                      <>
                        <div
                          className="ml-[16px] h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                          onClick={() => setLanguage('en')}
                        >
                          <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">English</div>
                          {language === 'en' && <CheckedIcon className="text-[16px] text-white/60" />}
                        </div>
                        <div
                          className="ml-[16px] h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                          onClick={() => setLanguage('zh')}
                        >
                          <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">简体中文</div>
                          {language === 'zh' && <CheckedIcon className="text-[16px] text-white/60" />}
                        </div>
                      </>
                    )}
                  </div>

                  {showTheme && (
                    <div>
                      <div
                        className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                        onClick={() => setSelectMode(!selectMode)}
                      >
                        {theme === 'dark' && (
                          <>
                            <DarkIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.darkMode')}</div>
                          </>
                        )}
                        {theme === 'light' && (
                          <>
                            <LightIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.lightMode')}</div>
                          </>
                        )}
                        {theme === 'system' && (
                          <>
                            <SystemIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.systemMode')}</div>
                          </>
                        )}
                        <ArrowIcon className={`text-[16px] text-white/60 transition-transform duration-300 ease-out ${selectMode ? 'rotate-180' : ''}`} />
                      </div>
                      {selectMode && (
                        <>
                          <div
                            className="ml-[32px] h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                            onClick={() => setTheme('dark')}
                          >
                            <DarkIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.darkMode')}</div>
                            {theme === 'dark' && <CheckedIcon className="text-[16px] text-white/60" />}
                          </div>
                          <div
                            className="ml-[32px] h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                            onClick={() => setTheme('light')}
                          >
                            <LightIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.lightMode')}</div>
                            {theme === 'light' && <CheckedIcon className="text-[16px] text-white/60" />}
                          </div>
                          <div
                            className="ml-[32px] h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                            onClick={() => setTheme('system')}
                          >
                            <SystemIcon className="text-[16px] text-white" />
                            <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.systemMode')}</div>
                            {theme === 'system' && <CheckedIcon className="text-[16px] text-white/60" />}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {(zkLoginData || currentAccount) && (
                    <div
                      className="h-[48px] flex items-center rounded-[12px] hover:bg-white/20 pl-[24px] pr-[16px]"
                      onClick={() => {
                        if(zkLoginData){
                          dispatch(clearLoginData())
                          disconnect()
                          window.location.reload()
                        }else{
                          disconnect()
                        }
                      }}
                    >
                      <LogoutIcon className="text-[16px] text-white" />
                      <div className="flex-1 h-[24px] leading-[24px] text-[16px] text-white px-[24px]">{t('header.logout')}</div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="block transition-transform hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="OnePredict"
                width={195}
                height={64}
                className="w-auto h-[48px] transition-all duration-300"
              />
            </Link>
          </div>

          {/* Right: Balance and Notifications */}
          <div className="flex items-center cursor-pointer" onClick={handleButtonClick}>
            <Image src="/images/icon/icon-token.png" alt="" width={20} height={20} />
            <span className="inline-block ml-[8px] h-[24px] leading-[24px] text-[24px] font-bold text-white/60 hover:text-white">{usdhBalance}</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#051A3D] border-t border-white/10 z-40">
        <div className="grid grid-cols-4">
          {mainPages.map((page) => {
            const Icon = page.icon;
            const isActive = activeCategory === page.id;

            return (
              <div
                key={page.id}
                className={`
                  flex flex-col items-center justify-center py-[14px] transition-colors
                  ${isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                  }
                `}
                onClick={() => handleMenuClick(page.id)}
              >
                <Icon className="text-[20px]" />
                <span className="mt-[8px] text-[12px] font-bold">{page.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trading Modal */}
      <PredictionIntegralModal
        isOpen={showIntegralModal}
        onClose={() => setShowIntegralModal(false)}
      />

      {/* Search Modal */}
      <SearchModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
      />
    </>
  );
}
