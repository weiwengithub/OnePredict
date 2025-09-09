"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
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

export default function Rewards() {
  const [isMobile, setIsMobile] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("invite");

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock user data for invite circle
  const invitedUsers = [
    { id: 1, name: "Alex R", avatar: "https://ext.same-assets.com/1155254500/403630554.png" },
    { id: 2, name: "Sarah C", avatar: "https://ext.same-assets.com/1155254500/2433125264.png" },
    { id: 3, name: "Michael M", avatar: "https://ext.same-assets.com/1155254500/4107709064.png" },
    { id: 4, name: "Jessica C", avatar: "https://ext.same-assets.com/1155254500/2551173646.bin" },
    { id: 5, name: "David R", avatar: "https://ext.same-assets.com/1155254500/3415865673.bin" },
    { id: 6, name: "Emma H", avatar: "https://ext.same-assets.com/1155254500/847220604.bin" },
    { id: 7, name: "Ryan B", avatar: "https://ext.same-assets.com/1155254500/420979322.bin" },
    { id: 8, name: "Lisa N", avatar: "https://ext.same-assets.com/1155254500/2944589987.bin" }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-20 md:pb-0">
      {/* Desktop Header */}
      <Header currentPage="rewards" />

      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory="rewards"
        onCategoryChange={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-[1312px] mx-auto pt-[64px]">
        {/* Points Brand Section */}
        <div className="mt-[50px] flex justify-between">
          {/* Points Logo */}
          <div className="relative">
            <div className="h-[24px] leading-[24px] text-[18px] text-white font-bold">My Rewards</div>
            <div className="mt-[24px] flex items-center">
              <Image src="/images/icon/icon-Bitcoin.png" alt="Points" width={52} height={52} />
              <span className="ml-[12px] h-[40px] leading-[40px] text-[50px] text-white font-bold">0</span>
            </div>
            <div className="mt-[12px] max-w-[460px] leading-[24px] text-white text-[16px]">Bayes Points can be used for prediction trading and other future perks.</div>
            <div className="mt-[30px] flex gap-[24px]">
              <div
                className={`h-[24px] leading-[24px] text-[24px] font-bold ${currentTab === 'invite' ? 'text-white' : 'text-white/60'}`}
                onClick={() => {setCurrentTab('invite')}}
              >
                Invite to Earn
              </div>
              <div
                className={`h-[24px] leading-[24px] text-[24px] font-bold ${currentTab === 'rewards' ? 'text-white' : 'text-white/60'}`}
                onClick={() => {setCurrentTab('rewards')}}
              >
                Rewards Center
              </div>
            </div>
          </div>

          {/* User Points Stats */}
          <div className="mt-[49px]">
            <Image src="/images/rewards-points-bg.png" alt="Points" width={320} height={160} />
          </div>
        </div>

        {currentTab === 'invite' && (
          <>
            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-0 pb-[86px]">
                {/* Circular User Layout */}
                <div className="relative px-[38px] pt-[22px]">
                  <Image src="/images/inviteAddEarn.png" alt="" width={1235} height={287} className="w-full h-auto" />
                  <div className="w-full absolute top-[22px] left-0">
                    <Image src="/images/rewards-points.png" alt="Points" width={200} height={200} className="mx-auto" />
                    <div className="mt-[16px] text-[40px] text-white font-bold text-center">Invite & Earn</div>
                  </div>
                </div>
                <p className="mt-[-6px] h-[40px] leading-[40px] text-[20px] text-white text-center">Get rewarded when your friend signs up with your invite code.</p>

                {/* Invite Code */}
                <div className="max-w-[480px] mx-auto mt-[12px] bg-[#051A3D] rounded-[16px] border border-white/20 pb-[10px]">
                  <div className="flex items-center justify-between bg-[#04122B] rounded-[16px] border-b border-white/20 px-[12px]">
                    <div className="h-[80px] pt-[12px]">
                      <div className="h-[12px] leading-[12px] text-[12px] text-white">Invite Code</div>
                      <div className="mt-[16px] h-[20px] leading-[20px] text-[20px] bg-[linear-gradient(90deg,_#FC7266,_#FC884A)] bg-clip-text text-transparent">93GQPN</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="h-[42px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold px-[12px] rounded-[16px]"
                    >
                      Invite Friends
                    </Button>
                  </div>

                  <div className="mt-[12px] flex items-center justify-between text-white px-[12px]">
                    <p className="flex-1 h-[18px] leading-[18px] text-[16px] pr-[12px] truncate">https://bayes.market/?code=93GQPN</p>
                    <div className="cursor-pointer">
                      <CopyIcon />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="flex-1 py-[54px]">
                    <div className="h-[40px] leading-[40px] text-[16px] text-white/60 text-center">Total Invitees</div>
                    <div className="mt-[11px] h-[40px] leading-[40px] text-[24px] text-white font-bold text-center">0</div>
                  </div>
                  <div className="flex-1 py-[54px]">
                    <div className="h-[40px] leading-[40px] text-[16px] text-white/60 text-center">Invite Rewards</div>
                    <div className="mt-[11px] h-[40px] leading-[40px] text-[24px] text-white font-bold text-center">0 Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-[24px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">Rewards</div>
                <div className="mt-[24px] min-h-[464px] flex flex-col items-center">
                  <div className="mt-[128px] mb-[12px]">
                    <Image src="/images/rewards.png" alt="Points" width={88} height={88} />
                  </div>
                  <div className="h-[30px] leading-[30px] text-white/60 text-[16px]">No rewards yet.</div>
                  <div className="h-[30px] leading-[30px] text-white/60 text-[16px]">Start inviting to earn!</div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === 'rewards' && (
          <>
            <Card className="mt-[56px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-[24px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">Daily Tasks</div>
                <div className="mt-[24px] divide-y divide-white/40">
                  <div className="flex items-center pt-[10px] pb-[13px]">
                    <div className="bg-[#FFAC5D] rounded-[8px] p-[12px]">
                      <Image src="/images/icon/icon-daily-1.png" alt="Points" width={32} height={32} />
                    </div>
                    <div className="ml-[11px] flex-1">
                      <div className="h-[24px] leading-[24px] text-[20px] text-white">Made 5 trades</div>
                      <div className="mt-[8px] h-[16px] leading-[16px] text-[16px] text-white/60">Complete 5 trades today</div>
                    </div>
                    <div className="ml-[24px] h-[20px] leading-[20px] text-[20px] flex">
                      <span className="text-[#28C04E]">+10</span><span className="text-white/60">Points</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="ml-[24px] w-[100px] h-[40px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold text-center rounded-[16px]"
                    >
                      Go
                    </Button>
                  </div>
                  <div className="flex items-center pt-[10px] pb-[13px]">
                    <div className="bg-[#29C04E] rounded-[8px] p-[12px]">
                      <Image src="/images/icon/icon-daily-2.png" alt="Points" width={32} height={32} />
                    </div>
                    <div className="ml-[11px] flex-1">
                      <div className="h-[24px] leading-[24px] text-[20px] text-white">Trade in 5 Different Markets</div>
                      <div className="mt-[8px] h-[16px] leading-[16px] text-[16px] text-white/60">Each trade must be in a different market</div>
                    </div>
                    <div className="ml-[24px] h-[20px] leading-[20px] text-[20px] flex">
                      <span className="text-[#28C04E]">+10</span><span className="text-white/60">Points</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="ml-[24px] w-[100px] h-[40px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold text-center rounded-[16px]"
                    >
                      Go
                    </Button>
                  </div>
                  <div className="flex items-center pt-[10px] pb-[13px]">
                    <div className="bg-[#3F75FF] rounded-[8px] p-[12px]">
                      <Image src="/images/icon/icon-daily-3.png" alt="Points" width={32} height={32} />
                    </div>
                    <div className="ml-[11px] flex-1">
                      <div className="h-[24px] leading-[24px] text-[20px] text-white">Made 5 trades</div>
                      <div className="mt-[8px] h-[16px] leading-[16px] text-[16px] text-white/60">Complete 5 trades today</div>
                    </div>
                    <div className="ml-[24px] h-[20px] leading-[20px] text-[20px] flex">
                      <span className="text-[#28C04E]">+10</span><span className="text-white/60">Points</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="ml-[24px] w-[100px] h-[40px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold text-center rounded-[16px]"
                    >
                      Go
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-[32px] bg-[#04122B] border-none rounded-[24px]">
              <CardContent className="p-[24px]">
                <div className="h-[24px] leading-[24px] text-white text-[24px] font-bold">Daily Tasks</div>
                <div className="mt-[24px] divide-y divide-white/40">
                  <div className="flex items-center pt-[10px] pb-[13px]">
                    <div className="bg-[#5DCCFF] rounded-[8px] p-[12px]">
                      <Image src="/images/icon/icon-daily-4.png" alt="Points" width={32} height={32} />
                    </div>
                    <div className="ml-[11px] flex-1">
                      <div className="h-[24px] leading-[24px] text-[20px] text-white">First-Time Trade</div>
                      <div className="mt-[8px] h-[16px] leading-[16px] text-[16px] text-white/60">Complete 5 trades today</div>
                    </div>
                    <div className="ml-[24px] h-[20px] leading-[20px] text-[20px] flex">
                      <span className="text-[#28C04E]">+10</span><span className="text-white/60">Points</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyInviteCode}
                      className="ml-[24px] w-[100px] h-[40px] bg-white hover:bg-white text-[#010101] text-[16px] font-bold text-center rounded-[16px]"
                    >
                      Go
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
