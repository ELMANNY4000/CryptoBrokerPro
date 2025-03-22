import { usePortfolio } from "@/hooks/usePortfolio";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";
import { useState } from "react";
import CoinIcon from "@/components/ui/CoinIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#F7931A', '#627EEA', '#26A17B', '#F3BA2F', '#8DC351', '#345D9D', '#E84142', '#2775CA'];

const Portfolio = () => {
  const [timeRange, setTimeRange] = useState("1W");
  const { toast } = useToast();
  
  const { 
    portfolioAssets, 
    isLoading: isLoadingPortfolio, 
    totalPortfolioValue 
  } = usePortfolio();
  
  const { data: marketData, isLoading: isLoadingMarket } = useCryptoData();
  
  // Generate some mock historical data for the portfolio
  const generateHistoricalData = (days: number) => {
    const data = [];
    const now = new Date();
    let value = totalPortfolioValue || 10000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random fluctuation between -3% and +3%
      const change = (Math.random() * 6 - 3) / 100;
      value = value * (1 + change);
      
      data.push({
        date: date.toLocaleDateString(),
        value: value.toFixed(2)
      });
    }
    
    return data;
  };
  
  const getHistoricalData = () => {
    switch (timeRange) {
      case "1D": return generateHistoricalData(1);
      case "1W": return generateHistoricalData(7);
      case "1M": return generateHistoricalData(30);
      case "3M": return generateHistoricalData(90);
      case "1Y": return generateHistoricalData(365);
      default: return generateHistoricalData(7);
    }
  };
  
  const historicalData = getHistoricalData();
  const startValue = parseFloat(historicalData[0]?.value || "0");
  const endValue = parseFloat(historicalData[historicalData.length - 1]?.value || "0");
  const percentChange = ((endValue - startValue) / startValue) * 100;
  
  // Prepare data for pie chart
  const pieData = portfolioAssets?.map((asset, index) => {
    const marketAsset = marketData?.find(m => m.id === asset.coinId);
    return {
      name: asset.symbol,
      value: marketAsset ? asset.amount * marketAsset.current_price : 0,
      color: COLORS[index % COLORS.length]
    };
  });
  
  if (isLoadingPortfolio || isLoadingMarket) {
    return <div className="p-8 text-center">Loading portfolio data...</div>;
  }
  
  if (!portfolioAssets || portfolioAssets.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-6">Portfolio</h2>
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="mb-4">You don't have any assets in your portfolio yet.</p>
            <Button
              onClick={() => window.location.href = "/trading"}
            >
              Start Trading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Portfolio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs ${percentChange >= 0 ? "text-positive" : "text-negative"} mt-1`}>
              {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(2)}% ({timeRange})
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioAssets?.length}</div>
            <div className="text-xs text-neutral-300 mt-1">
              Cryptocurrencies in your portfolio
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioAssets && marketData && portfolioAssets.length > 0 ? (() => {
              const bestPerformer = marketData
                .filter(m => portfolioAssets.some(a => a.coinId === m.id))
                .reduce((best, current) => 
                  (current.price_change_percentage_24h > best.price_change_percentage_24h) ? current : best
                );
                
              return (
                <>
                  <div className="flex items-center">
                    <CoinIcon symbol={bestPerformer.symbol.toUpperCase()} size="sm" />
                    <div className="text-xl font-bold ml-2">{bestPerformer.symbol.toUpperCase()}</div>
                  </div>
                  <div className="text-xs text-positive mt-1">
                    +{bestPerformer.price_change_percentage_24h.toFixed(2)}% (24h)
                  </div>
                </>
              );
            })() : (
              <div className="text-sm text-neutral-300">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Portfolio Performance</CardTitle>
              <div className="flex border border-neutral-400 rounded overflow-hidden">
                {["1D", "1W", "1M", "3M", "1Y"].map((range) => (
                  <button
                    key={range}
                    className={`px-3 py-1 text-sm ${
                      timeRange === range 
                        ? "bg-primary text-white" 
                        : "text-neutral-200 hover:bg-neutral-500"
                    }`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <CardDescription>
              Value change over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#282A36" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#A7B1BC' }}
                  tickFormatter={(tick) => {
                    const date = new Date(tick);
                    return timeRange === "1D" 
                      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tick={{ fill: '#A7B1BC' }}
                  tickFormatter={(tick) => `$${tick}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${parseFloat(value as string).toFixed(2)}`, "Portfolio Value"]}
                  contentStyle={{ backgroundColor: '#1C1D24', border: '1px solid #282A36' }}
                  labelStyle={{ color: '#A7B1BC' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3861FB" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#3861FB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>
              Distribution of your assets
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${parseFloat(value as string).toFixed(2)}`, "Value"]}
                  contentStyle={{ backgroundColor: '#1C1D24', border: '1px solid #282A36' }}
                  labelStyle={{ color: '#A7B1BC' }}
                />
                <Legend 
                  formatter={(value) => <span style={{ color: '#F1F5F9' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              All cryptocurrencies in your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Assets</TabsTrigger>
                <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                <TabsTrigger value="losers">Top Losers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-neutral-300 border-b border-neutral-400">
                        <th className="pb-2">Asset</th>
                        <th className="pb-2">Price</th>
                        <th className="pb-2">24h</th>
                        <th className="pb-2">Holdings</th>
                        <th className="pb-2">Value</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioAssets?.map((asset) => {
                        const marketAsset = marketData?.find(m => m.id === asset.coinId);
                        
                        if (!marketAsset) return null;
                        
                        return (
                          <tr key={asset.id} className="border-b border-neutral-500">
                            <td className="py-3">
                              <div className="flex items-center">
                                <CoinIcon symbol={asset.symbol} />
                                <div className="ml-3">
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-xs text-neutral-300">{asset.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-mono">
                              ${marketAsset.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                            </td>
                            <td className={`py-3 ${
                              marketAsset.price_change_percentage_24h >= 0 
                                ? "text-positive" 
                                : "text-negative"
                            }`}>
                              {marketAsset.price_change_percentage_24h >= 0 ? "+" : ""}
                              {marketAsset.price_change_percentage_24h.toFixed(2)}%
                            </td>
                            <td className="py-3 font-mono">
                              {asset.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {asset.symbol}
                            </td>
                            <td className="py-3 font-mono">
                              ${(asset.amount * marketAsset.current_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => {
                                  toast({
                                    title: "Coming Soon",
                                    description: "This feature is not yet implemented.",
                                  });
                                }}>
                                  Buy
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                  toast({
                                    title: "Coming Soon",
                                    description: "This feature is not yet implemented.",
                                  });
                                }}>
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="gainers" className="mt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={portfolioAssets
                        ?.map(asset => {
                          const marketAsset = marketData?.find(m => m.id === asset.coinId);
                          return {
                            name: asset.symbol,
                            change: marketAsset?.price_change_percentage_24h || 0
                          };
                        })
                        .filter(item => item.change > 0)
                        .sort((a, b) => b.change - a.change)
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#282A36" />
                      <XAxis dataKey="name" tick={{ fill: '#A7B1BC' }} />
                      <YAxis 
                        tick={{ fill: '#A7B1BC' }}
                        tickFormatter={(tick) => `${tick}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${parseFloat(value as string).toFixed(2)}%`, "24h Change"]}
                        contentStyle={{ backgroundColor: '#1C1D24', border: '1px solid #282A36' }}
                        labelStyle={{ color: '#A7B1BC' }}
                      />
                      <Bar dataKey="change" fill="#00C087" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="losers" className="mt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={portfolioAssets
                        ?.map(asset => {
                          const marketAsset = marketData?.find(m => m.id === asset.coinId);
                          return {
                            name: asset.symbol,
                            change: marketAsset?.price_change_percentage_24h || 0
                          };
                        })
                        .filter(item => item.change < 0)
                        .sort((a, b) => a.change - b.change)
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#282A36" />
                      <XAxis dataKey="name" tick={{ fill: '#A7B1BC' }} />
                      <YAxis 
                        tick={{ fill: '#A7B1BC' }}
                        tickFormatter={(tick) => `${tick}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${parseFloat(value as string).toFixed(2)}%`, "24h Change"]}
                        contentStyle={{ backgroundColor: '#1C1D24', border: '1px solid #282A36' }}
                        labelStyle={{ color: '#A7B1BC' }}
                      />
                      <Bar dataKey="change" fill="#FF4D4F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
