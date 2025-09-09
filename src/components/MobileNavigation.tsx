"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Search,
  Bell,
  Menu,
  Home,
  TrendingUp,
  Clock,
  Plus,
  Building2,
  DollarSign,
  Bitcoin,
  Film,
  Trophy,
  User,
  Settings,
  Bookmark,
  Gift,
  BarChart3
} from "lucide-react";
import Link from 'next/link';

interface MobileNavigationProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
}

export default function MobileNavigation({
  onCategoryChange,
  activeCategory = "trending"
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Main pages navigation
  const mainPages = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3, href: "/leaderboard" },
    { id: "rewards", label: "Rewards", icon: Gift, href: "/rewards" }
  ];

  const categories = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "live", label: "Live", icon: Clock },
    { id: "new", label: "New", icon: Plus },
    { id: "politics", label: "Politics", icon: Building2 },
    { id: "economy", label: "Economy", icon: DollarSign },
    { id: "crypto", label: "Crypto", icon: Bitcoin },
    { id: "entertainment", label: "Entertainment", icon: Film },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "watchlist", label: "Watchlist", icon: Bookmark },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange?.(categoryId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Left: Menu and Logo */}
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Bayes Market</h2>

                  {/* Main Pages */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Navigation
                    </h3>
                    {mainPages.map((page) => {
                      const Icon = page.icon;
                      const isActive = activeCategory === page.id;

                      return (
                        <Link
                          key={page.id}
                          href={page.href}
                          onClick={() => setIsOpen(false)}
                          className={`
                            w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors
                            ${isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{page.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Categories
                    </h3>
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.id;

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category.id)}
                          className={`
                            w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors
                            ${isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Account Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Account
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-bold text-gray-900">Bayes Market</h1>
          </div>

          {/* Right: Balance and Notifications */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                0
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search predictions..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-3 gap-1">
          {mainPages.map((page) => {
            const Icon = page.icon;
            const isActive = activeCategory === page.id;

            return (
              <Link
                key={page.id}
                href={page.href}
                className={`
                  flex flex-col items-center justify-center py-3 px-1 transition-colors
                  ${isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{page.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
