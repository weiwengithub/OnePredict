// 生成模拟的价格趋势数据
export function generatePriceTrend(
  initialPrice: number,
  days: number = 30,
  volatility: number = 0.1
) {
  const data = [];
  let currentPrice = initialPrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // 添加随机波动
    const change = (Math.random() - 0.5) * volatility * 2;
    currentPrice = Math.max(5, Math.min(95, currentPrice + change));

    data.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000) + 100
    });
  }

  return data;
}

// 预定义的市场数据
export const marketData = {
  "上海微電子是否會上市？": generatePriceTrend(41.78, 90, 3),
  "Will ETH Break ATH in 2025?": generatePriceTrend(56.74, 120, 4),
  "Will Keung To confirm a romantic relationship or scandal by 2025?": generatePriceTrend(55.53, 60, 2),
  "Klarna IPO 2025?": generatePriceTrend(57.42, 45, 5),
  "美國聯邦儲備局會在任何時間升息嗎？": generatePriceTrend(57.06, 180, 2),
  "Will Korea report that 2025 summer was the hottest?": generatePriceTrend(56.7, 75, 3),
  "Will Korean government publish new official findings on the Itaewon tragedy?": generatePriceTrend(54.65, 30, 4),
  "A cult is discovered to have played a role in the Itaewon tragedy?": generatePriceTrend(57.51, 25, 3),
  "Canada to officially recognize the State of Palestine by September?": generatePriceTrend(45.25, 150, 5),
  "Australia to officially recognize the State of Palestine this year?": generatePriceTrend(60.9, 100, 4),
  "9.0 magnitude earthquake anywhere this year?": generatePriceTrend(49.38, 200, 1),
  "Will BRICS add a new member by December 31?": generatePriceTrend(53.32, 80, 3),
};

// 获取最近几天的迷你数据（用于卡片显示）
export function getMiniTrendData(question: string) {
  const fullData = marketData[question as keyof typeof marketData];
  if (!fullData) return [];

  // 返回最近10天的数据
  return fullData.slice(-10);
}
