"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import {onCopyToText} from "@/lib/utils";
import {
  Gift,
  Users,
  Copy,
  Share2,
  CheckCircle,
  Clock,
  Trophy,
  Zap,
  Calendar,
  Target,
  Star,
  Coins
} from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import CopyIcon from "@/assets/icons/copy.svg";
import {useLanguage} from "@/contexts/LanguageContext";
import {useIsMobile} from "@/contexts/viewport";

export default function Rewards() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("invite");

  // Mock user data for invite circle
  const [inviteRecords, setInviteRecords] = useState([1,2,3,4,5]);

  const [rewards, setRewards] = useState([1,2,3,4,5,6]);

  // Daily tasks data
  const dailyTasks = [
    {
      id: 1,
      title: "完成3个预测",
      description: "在任意市场完成3个预测",
      reward: 100,
      progress: 2,
      total: 3,
      completed: false,
      icon: Target
    },
    {
      id: 2,
      title: "邀请1位好友",
      description: "通过邀请链接邀请新用户",
      reward: 500,
      progress: 0,
      total: 1,
      completed: false,
      icon: Users
    },
    {
      id: 3,
      title: "登录签到",
      description: "每日登录获得奖励",
      reward: 50,
      progress: 1,
      total: 1,
      completed: true,
      icon: Calendar
    },
    {
      id: 4,
      title: "分享预测",
      description: "分享1个有趣的预测到社交媒体",
      reward: 75,
      progress: 0,
      total: 1,
      completed: false,
      icon: Share2
    }
  ];

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText("https://onepredict.com/ref/ONEPRFT");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Calculate total points
  const totalPoints = 15750;
  const todayEarned = 125;

  return (
    <div className="min-h-screen bg-[#051A3D] pb-20 md:pb-0">
      {/* Header */}
      {isMobile ? (
        <MobileNavigation
          activeCategory="rewards"
          onCategoryChange={() => {}}
        />
      ) : (
        <Header currentPage="rewards" />
      )}

      {/* Main Content */}
      <main className={isMobile? 'w-full p-[16px]' : 'max-w-[1312px] mx-auto pt-[50px]'}>
        {/* Points Brand Section */}
        <div className="relative">
          <div className="h-[24px] leading-[24px] text-[18px] text-white font-bold">{t('rewards.myRewards')}</div>
          <div className="mt-[24px] flex items-center">
            <Image src="/images/icon/icon-token.png" alt="" width={52} height={52} className="size-[52px]" />
            <span className="ml-[12px] h-[40px] leading-[40px] text-[50px] text-white font-bold">0</span>
          </div>
          <div className="mt-[12px] leading-[24px] text-white text-[16px]">{t('rewards.onePredictPoints')}</div>
          <div className="mt-[32px] flex gap-[24px]">
            <div
              className={`h-[24px] leading-[24px] ${isMobile? 'text-[20px]' : 'text-[24px]'} font-bold ${currentTab === 'invite' ? 'text-white' : 'text-white/60'}`}
              onClick={() => {setCurrentTab('invite')}}
            >
              {t('rewards.inviteToEarn')}
            </div>
            <div
              className={`h-[24px] leading-[24px] ${isMobile? 'text-[20px]' : 'text-[24px]'} font-bold ${currentTab === 'rewards' ? 'text-white' : 'text-white/60'}`}
              onClick={() => {setCurrentTab('rewards')}}
            >
              {t('rewards.rewardsCenter')}
            </div>
          </div>
        </div>

        {currentTab === 'invite' && (
          <>
            <Card className={`${isMobile ? 'mt-[24px] bg-[#04122B]' : 'mt-[56px] bg-[linear-gradient(180deg,_#04122B_72.95%,_#051A3D_100%)]'} border-none rounded-[24px]`}>
              <CardContent className={`p-0 ${isMobile ? 'pb-[20px]' : 'pb-[86px]'}`}>
                {/* Circular User Layout */}
                <div className={`relative ${isMobile ? 'p-[12px]' : 'px-[38px] pt-[22px]'}`}>
                  {isMobile ? (
                    <>
                      <Image src="/images/inviteAddEarnMobile.png" alt="" width={318} height={108} className="w-full h-auto" />
                      <div className="w-full absolute left-0 top-[66px]">
                        <Image src="/images/rewards-points-mobile.png" alt="Points" width={78} height={78} className="mx-auto" />
                        <div className="text-[40px] text-white font-bold text-center">{t('rewards.inviteEarn')}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Image src="/images/inviteAddEarn.png" alt="" width={1235} height={287} className="w-full h-auto" />
                      <div className="w-full absolute left-0 top-[22px]">
                        <Image src="/images/rewards-points.png" alt="Points" width={200} height={200} className="mx-auto" />
                        <div className="mt-[16px] text-[40px] text-white font-bold text-center">{t('rewards.inviteEarn')}</div>
                      </div>
                    </>
                  )}
                </div>
                <p className={`${isMobile ? 'mt-[88px] leading-[24px] text-[16px] mx-[16px]' : 'mt-[-6px] leading-[40px] text-[20px]'} text-white text-center`}>{t('rewards.getRewarded')}</p>

                {/* Invite Code */}
                <div className={`max-w-[480px] ${isMobile ? 'mx-[16px]' : 'mx-auto'} mt-[12px] bg-[#051A3D] rounded-[16px] border border-white/20 pb-[10px]`}>
                  <div className="flex items-center justify-between bg-[#04122B] rounded-[16px] border-b border-white/20 px-[12px]">
                    <div className="h-[80px] pt-[12px]">
                      <div className="h-[12px] leading-[12px] text-[12px] text-white">{t('rewards.inviteCode')}</div>
                      <div className="mt-[16px] h-[20px] leading-[20px] text-[20px] bg-[linear-gradient(90deg,_#FC7266,_#FC884A)] bg-clip-text text-transparent">93GQPN</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onCopyToText(t('rewards.inviteFriendsCopyText', {code: '93GQPN'}))}
                      className="h-[42px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold px-[12px] rounded-[16px]"
                    >
                      {t('rewards.inviteFriends')}
                    </Button>
                  </div>

                  <div className="mt-[12px] flex items-center justify-between text-white px-[12px]">
                    <p className="flex-1 h-[18px] leading-[18px] text-[16px] pr-[12px] truncate">https://bayes.market/?code=93GQPN</p>
                    <div className="cursor-pointer" onClick={() => {onCopyToText('https://bayes.market/?code=93GQPN&v=1')}}>
                      <CopyIcon />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-[24px]">
                <div className="h-[24px] flex items-center gap-1 flex-nowrap">
                  <span className={`${isMobile ? 'text-[20px]' : 'text-[24px]'} text-white font-bold whitespace-nowrap`}>{t('rewards.inviteRecord')}</span>
                  <span className={`${isMobile ? 'text-[12px]' : 'text-[16px]'} text-white/60 font-bold whitespace-nowrap`}>{t('rewards.totalPerson', {count: inviteRecords.length})}</span>
                </div>
                {inviteRecords.length > 0 ? (
                  <div className="mt-[16px] space-y-[24px]">
                    <div className="h-[24px] flex justify-between leading-[24px] text-[16px] text-white/60 font-bold">
                      <span>{t('rewards.invitee')}</span><span>{t('rewards.date')}</span>
                    </div>
                    {inviteRecords.map((record, index) => (
                      <div key={index} className="flex pb-[16px] border-b border-white/10">
                        <div className="w-[40px] h-[40px] bg-[linear-gradient(90deg,_rgba(62,236,172,0.45)_0%,_rgba(238,116,225,0.45)_100%)] rounded-full"></div>
                        <div className="ml-[12px] flex-1">
                          <div className="leading-[16px] text-[16px] text-white font-bold truncate">nickname</div>
                          <div className="mt-[8px] leading-[16px] text-[16px] text-white/60 font-bold truncate">1234********.com</div>
                        </div>
                        <div className="mt-[24px] leading-[16px] text-[16px] text-white">8 hours ago</div>
                      </div>
                    ))}
                    <div className="mt-[40px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                  </div>
                ) : (
                  <div className="mt-[24px] min-h-[464px] flex flex-col items-center">
                    <div className="mt-[128px]">
                      <Image src="/images/empty.png" alt="Points" width={50} height={39} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 text-center">{t('common.nothing')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === 'rewards' && (
          <>
            <Card className={`${isMobile ? 'mt-[24px]' : 'mt-[40px]'} bg-[#04122B] border-none rounded-[24px]`}>
              <CardContent className={isMobile ? 'p-[16px]' : 'p-[24px]'}>
                {rewards.length > 0 ? (
                  <>
                    {isMobile ? (
                      <div className="space-y-[12px]">
                        <div className="flex leading-[16px] text-[16px] text-white/60">
                          <div className="flex-1">Invitee/project</div>
                          <div className="flex-1 text-right">Investment/bonus </div>
                        </div>
                        {rewards.map((reward, index) => (
                          <div key={index} className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[8px] border-b border-white/10">
                            <div className="flex-1">
                              <div className="leading-[16px] text-[16px] text-white font-bold truncate">nickname</div>
                              <div className="mt-[8px] leading-[16px] text-[16px] text-white/60 truncate">Will US–EU strike...</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-end gap-[20px]">
                                <div className="flex items-center justify-center gap-[8px]"><Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />100</div>
                                <div className="flex items-center justify-center gap-[8px]"><Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />10</div>
                              </div>
                              <div className="mt-[8px] leading-[16px] text-[16px] text-white/60 text-right">8 hours ago</div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-[32px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                      </div>
                    ) : (
                      <div className="space-y-[24px]">
                        <div className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[8px]">
                          <div className="flex-[2]">Invitee</div>
                          <div className="flex-[3] text-center">project</div>
                          <div className="flex-[3] text-center">Investment amount</div>
                          <div className="flex-[3] text-center">amount of bonus</div>
                          <div className="flex-[2] text-right">Date</div>
                        </div>
                        {rewards.map((reward, index) => (
                          <div key={index} className="flex leading-[16px] text-[16px] text-white/60 font-bold pb-[25px] border-b border-white/10">
                            <div className="flex-[2] truncate">nickname</div>
                            <div className="flex-[3] text-center truncate">Will US–EU strike...</div>
                            <div className="flex-[3] flex items-center justify-center gap-[8px]"><Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />100</div>
                            <div className="flex-[3] flex items-center justify-center gap-[8px]"><Image src="/images/icon/icon-token.png" alt="" width={16} height={16} />10</div>
                            <div className="flex-[2] text-right">8 hours ago</div>
                          </div>
                        ))}
                        <div className="mt-[32px] leading-[24px] text-[16px] text-white/60 font-bold text-center">{t('rewards.allItemsLoaded')}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-[24px] min-h-[364px] flex flex-col items-center">
                    <div className="mt-[128px]">
                      <Image src="/images/empty.png" alt="Points" width={50} height={39} />
                    </div>
                    <div className="mt-[12px] leading-[24px] text-[16px] text-white/60 text-center">{t('common.nothing')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      {!isMobile && <Footer />}
    </div>
  );
}
