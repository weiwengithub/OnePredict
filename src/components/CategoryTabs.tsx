"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Plus, Building2, DollarSign, Bitcoin, Film, Trophy, Calendar, BarChart3, Bookmark } from "lucide-react";

const categories = [
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "live", label: "Live", icon: Clock },
  { id: "new", label: "New", icon: Plus },
  { id: "politics", label: "Politics", icon: Building2 },
  { id: "economy", label: "Economy", icon: DollarSign },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "entertainment", label: "Entertainment", icon: Film },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "expire-time", label: "Expire Time", icon: Calendar },
  { id: "volume", label: "Volume", icon: BarChart3 },
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("trending");

  return (
    <div className="flex flex-wrap gap-[36px] mb-[36px]">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <Button
            key={category.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors
              ${isActive
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
