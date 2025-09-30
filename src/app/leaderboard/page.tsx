"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "@/components/MobileNavigation";
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import Image from "next/image";
import ExportIcon from "@/assets/icons/export.svg";
import DeclineIcon from "@/assets/icons/decline.svg";

type TimePeriod = 'all' | 'daily' | 'weekly' | 'monthly';
type SortField = 'pnl' | 'volume' | 'trades'

export default function Leaderboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>('weekly');
  const [currentSortField, setCurrentSortField] = useState<SortField>('pnl');

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to first page when period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentPeriod]);

  // Time period configurations
  const timePeriods = [
    { key: 'all' as TimePeriod, label: 'All', description: 'Today\'s Top Performers' },
    { key: 'daily' as TimePeriod, label: 'Daily', description: 'Today\'s Top Performers' },
    { key: 'weekly' as TimePeriod, label: 'Weekly', description: 'This Week\'s Champions' },
    { key: 'monthly' as TimePeriod, label: 'Monthly', description: 'Month\'s Leading Predictors' }
  ];

  // Generate period-specific leaderboard data
  const generatePeriodData = (period: TimePeriod) => {
    const firstNames = ["Alex", "Sarah", "Michael", "Jessica", "David", "Emma", "Ryan", "Lisa", "Kevin", "Amy",
                       "John", "Maria", "Daniel", "Sophie", "Chris", "Rachel", "Mark", "Anna", "Tom", "Emily",
                       "James", "Kate", "Peter", "Nicole", "Sam", "Lucy", "Ben", "Grace", "Matt", "Olivia",
                       "Josh", "Hannah", "Luke", "Chloe", "Adam", "Zoe", "Jake", "Mia", "Ryan", "Ella",
                       "Noah", "Ava", "Ethan", "Isabella", "Mason", "Charlotte", "Logan", "Amelia", "Lucas", "Harper"];

    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                      "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                      "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
                      "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
                      "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

    const avatars = [
      "https://ext.same-assets.com/1155254500/403630554.png",
      "https://ext.same-assets.com/1155254500/2433125264.png",
      "https://ext.same-assets.com/1155254500/4107709064.png",
      "https://ext.same-assets.com/1155254500/2551173646.bin",
      "https://ext.same-assets.com/1155254500/3415865673.bin",
      "https://ext.same-assets.com/1155254500/847220604.bin",
      "https://ext.same-assets.com/1155254500/420979322.bin",
      "https://ext.same-assets.com/1155254500/2944589987.bin",
      "https://ext.same-assets.com/1155254500/734502197.bin",
      "https://ext.same-assets.com/1155254500/93840700.bin"
    ];

    // Different base values for different periods
    const periodConfig = {
      all: { basePoints: 15000, maxPoints: 25000, userCount: 50 },
      daily: { basePoints: 500, maxPoints: 800, userCount: 30 },
      weekly: { basePoints: 1500, maxPoints: 2500, userCount: 45 },
      monthly: { basePoints: 5000, maxPoints: 8000, userCount: 50 },
    };

    const config = periodConfig[period];

    // Shuffle names for different periods to show ranking changes
    const shuffleSeed = period === 'daily' ? 1 : period === 'weekly' ? 2 : period === 'monthly' ? 3 : 4;
    const shuffledFirstNames = [...firstNames].sort(() => Math.sin(shuffleSeed) - 0.5);
    const shuffledLastNames = [...lastNames].sort(() => Math.cos(shuffleSeed) - 0.5);

    return Array.from({ length: config.userCount }, (_, index) => {
      const rank = index + 1;
      const pointsRange = config.maxPoints - config.basePoints;
      const basePoints = config.maxPoints - (rank * (pointsRange / config.userCount));
      const randomVariation = Math.floor(Math.random() * 100) - 50;
      const points = Math.max(config.basePoints, basePoints + randomVariation);

      const baseAccuracy = 98 - (rank * 0.4) + Math.random() * 2;
      const accuracy = Math.max(70, Math.min(98, baseAccuracy));

      const predictionMultiplier = period === 'daily' ? 0.2 : period === 'weekly' ? 0.5 : period === 'monthly' ? 1.5 : 4;
      const predictions = Math.floor((Math.random() * 30 + 20) * predictionMultiplier);

      return {
        rank,
        username: `${shuffledFirstNames[index % shuffledFirstNames.length]} ${shuffledLastNames[index % shuffledLastNames.length].charAt(0)}`,
        avatar: avatars[index % avatars.length],
        points,
        accuracy: `${accuracy.toFixed(1)}%`,
        totalPredictions: predictions,
        winStreak: Math.floor(Math.random() * 15)
      };
    });
  };

  const leaderboardData = generatePeriodData(currentPeriod);

  // Pagination logic
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = leaderboardData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setCurrentPeriod(period);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Image src="/images/icon/icon-leaderboard-first.png" alt="Search" width={24} height={24} />;
      case 2:
        return <Image src="/images/icon/icon-leaderboard-second.png" alt="Search" width={24} height={24} />;
      case 3:
        return <Image src="/images/icon/icon-leaderboard-thirdly.png" alt="Search" width={24} height={24} />;
      default:
        return <span className="h-[24px] leading-[24px] text-white text-center">{rank}</span>;
    }
  };

  // Time period selector component
  const TimePeriodSelector = () => {
    return (
      <div className="mt-[16px]">
        {/* Desktop version */}
        <div className="hidden md:flex items-center justify-center space-x-[8px]">
          {timePeriods.map((period) => (
            <Button
              key={period.key}
              variant="ghost"
              onClick={() => handlePeriodChange(period.key)}
              className={`h-[32px] px-[16px] py-[8px] rounded-[40px] text-[16px] font-medium transition-all duration-300 ${
                currentPeriod === period.key
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-white hover:text-black border border-white/20'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Mobile version */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            {timePeriods.map((period) => (
              <Button
                key={period.key}
                variant="ghost"
                onClick={() => handlePeriodChange(period.key)}
                className={`py-3 rounded-xl text-sm transition-all duration-300 ${
                  currentPeriod === period.key
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white hover:text-black border border-white/20'
                }`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051A3D] via-[#0D2347] to-[#051A3D] pb-[136px] md:pb-0">
      {/* Desktop Header */}
      <Header currentPage="leaderboard" />

      {/* Mobile Navigation */}
      <MobileNavigation
        activeCategory="leaderboard"
        onCategoryChange={() => {}}
      />

      {/* Main Content */}
      <main className="max-w-[1728px] mx-auto px-[40px] pt-[64px]">
        {/* Header Section */}
        <div className="text-center mt-[136px]">
          <div className="flex items-center justify-center">
            <div className="w-[96px] h-[96px] bg-[#483E27] rounded-[24px] flex items-center justify-center">
              <Image src="/images/leaderboard.png" alt="" width={48} height={48} />
            </div>
          </div>
          <div className="mt-[16px] text-[56px] text-white leading-[73px] tracking-tight">Leaderboard</div>
          <p className="mt-[16px] text-[#A5A6A8] text-[32px] mx-auto leading-[42px]">Top performers on Bayes Market prediction platform</p>
        </div>

        {/* Time Period Selector */}
        <TimePeriodSelector />

        {/* Leaderboard Table */}
        <div className="mt-[22px] max-w-[1020px] mx-auto bg-[#04122B] text-white/60 backdrop-blur-sm rounded-[32px] overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="bg-[#031026] pt-[23px] pb-[17px]">
            <div className="hidden md:flex text-[16px] tracking-wider">
              <div className="w-[84px] text-center">Rank</div>
              <div className="flex-1 px-[24px]">Trader</div>
              <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("pnl")}>
                <div className={`text-white ${currentSortField === "pnl" ? 'block' : 'hidden group-hover:block'}`}>
                  <DeclineIcon />
                </div>
                <span className={`ml-[4px] ${currentSortField === "pnl" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>PnL</span>
              </div>
              <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("volume")}>
                <div className={`text-white ${currentSortField === "volume" ? 'block' : 'hidden group-hover:block'}`}>
                  <DeclineIcon />
                </div>
                <span className={`ml-[4px] ${currentSortField === "volume" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>Volume</span>
              </div>
              <div className="w-[120px] group flex items-center justify-center cursor-pointer" onClick={() => setCurrentSortField("trades")}>
                <div className={`text-white ${currentSortField === "trades" ? 'block' : 'hidden group-hover:block'}`}>
                  <DeclineIcon />
                </div>
                <span className={`ml-[4px] ${currentSortField === "trades" ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>Trades</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/20">
            {currentUsers.map((user, index) => (
              <div
                key={`${currentPeriod}-${user.rank}`}
                className={`hover:bg-white/[0.03] transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'
                }`}
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center py-[12px]">
                  {/* Rank */}
                  <div className="w-[84px] flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Trader */}
                  <div className="flex-1 px-[24px] flex items-center text-white">
                    <Avatar className="w-[40px] h-[40px] ring-2 ring-white/10">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 font-bold">
                        {user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-[16px] inline-block text[16px]">{user.username}</span>
                    <span className="ml-[12px] mr-[24px] inline-block h-[16px] leading-[16px] px-[10px] border border-[#28C04E] bg-[rgba(40,192,78,0.5)]] rounded-[4px] text-[12px] text-[#28C04E]">Me</span>
                    <ExportIcon />
                  </div>

                  {/* PnL */}
                  <div className={`w-[120px] text-[16px] text-center ${user.points > 0 ? 'text-[#29C04E]' : user.points < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                    {user.points.toLocaleString()}
                  </div>

                  {/* Volume */}
                  <div className={`w-[120px] text-[16px] text-center ${user.points > 0 ? 'text-[#29C04E]' : user.points < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                    {user.points.toLocaleString()}
                  </div>

                  {/* Trades */}
                  <div className={`w-[120px] text-[16px] text-center ${user.points > 0 ? 'text-[#29C04E]' : user.points < 0 ? 'text-[#A63030]' : 'text-white'}`}>
                    {user.points.toLocaleString()}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(user.rank)}
                      <Avatar className="w-10 h-10 ring-2 ring-white/10">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold">
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-semibold">{user.username}</span>
                    </div>
                    <span className="text-white font-bold text-lg">{user.points.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-400/30 text-xs">
                        {user.accuracy}
                      </Badge>
                      <div className="text-white/40 text-xs mt-1">Accuracy</div>
                    </div>
                    <div>
                      <span className="text-white/80 font-semibold">{user.totalPredictions}</span>
                      <div className="text-white/40 text-xs mt-1">Predictions</div>
                    </div>
                    <div>
                      <Badge
                        className={`text-xs ${
                          user.winStreak > 5
                            ? 'bg-orange-500/15 text-orange-400 border-orange-400/30'
                            : user.winStreak > 0
                            ? 'bg-blue-500/15 text-blue-400 border-blue-400/30'
                            : 'bg-gray-500/15 text-gray-400 border-gray-400/30'
                        }`}
                      >
                        {user.winStreak}
                      </Badge>
                      <div className="text-white/40 text-xs mt-1">Win Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*分页组件*/}
        <div className="max-w-[1020px] mt-[24px] mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[5, 10, 20, 50]}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
