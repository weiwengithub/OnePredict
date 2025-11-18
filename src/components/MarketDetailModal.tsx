"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Volume, Users, TrendingUp, ExternalLink } from "lucide-react";
import DetailedChart from "./DetailedChart";
import { marketData } from "@/lib/chartData";

interface MarketDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chance: number;
}

export default function MarketDetailModal({
  open,
  onOpenChange,
  chance,
}: MarketDetailModalProps) {
  const question = '';
  const volume = '';
  const deadline = '';
  const category = '';
  const avatar = '';
  const isLive = false;
  const chartData = marketData[question as keyof typeof marketData] || [];
  const currentPrice = chartData[chartData.length - 1]?.value || chance;
  const previousPrice = chartData[chartData.length - 2]?.value || chance;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = Math.abs(priceChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16 ring-2 ring-gray-200">
              <AvatarImage src={avatar} alt="market avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-bold text-lg">
                {category.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {category}
                </Badge>
                {isLive && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                {question}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Current Probability</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">{currentPrice.toFixed(2)}%</span>
                <span className={`text-sm font-medium ${
                  priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceChange >= 0 ? '+' : '-'}{priceChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Volume className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Volume</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{volume}</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">Deadline</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{deadline}</span>
            </div>
          </div>

          {/* Detailed Chart */}
          <DetailedChart
            data={chartData}
            title="Price History"
            height={400}
          />

          {/* Trading Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Your Prediction</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">YES</span>
                  <span className="font-bold text-green-600">{currentPrice.toFixed(1)}¢</span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                  Buy YES
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">NO</span>
                  <span className="font-bold text-red-600">{(100 - currentPrice).toFixed(1)}¢</span>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3">
                  Buy NO
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Shares pay out $1.00 if you're correct, $0.00 if you're wrong.
            </p>
          </div>

          {/* Market Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Market Information</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{Math.floor(Math.random() * 500) + 100} traders</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Market created {Math.floor(Math.random() * 30) + 1} days ago</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
