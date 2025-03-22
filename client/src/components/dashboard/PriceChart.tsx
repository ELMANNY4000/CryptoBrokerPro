import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MarketChartData } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface PriceChartProps {
  coinId: string;
  symbol: string;
  price: number;
  height?: number;
}

const PriceChart = ({ coinId, symbol, price, height = 250 }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<string>("1");
  
  const { data: chartData, isLoading } = useQuery<MarketChartData>({
    queryKey: [`/api/crypto/${coinId}/chart`, { days: timeframe }],
    enabled: !!coinId,
  });
  
  const formatChartData = (data: MarketChartData | undefined) => {
    if (!data || !data.prices) return [];
    
    return data.prices.map(([timestamp, price]) => {
      const date = new Date(timestamp);
      return {
        time: date.toLocaleString(),
        price,
        timestamp,
      };
    });
  };
  
  const formattedData = formatChartData(chartData);
  
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === "1") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === "7" || timeframe === "30") {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getTimeframeLabel = (value: string) => {
    switch (value) {
      case "1": return "1h";
      case "7": return "24h";
      case "30": return "1w";
      case "90": return "1m";
      case "365": return "1y";
      default: return "24h";
    }
  };
  
  const getChartColor = () => {
    if (!formattedData || formattedData.length < 2) return "#3861FB";
    const firstPrice = formattedData[0].price;
    const lastPrice = formattedData[formattedData.length - 1].price;
    return lastPrice >= firstPrice ? "#00C087" : "#FF4D4F";
  };
  
  // Calculate price change and percentage
  const calculatePriceChange = () => {
    if (!formattedData || formattedData.length < 2) return { change: 0, percentage: 0 };
    const firstPrice = formattedData[0].price;
    const lastPrice = formattedData[formattedData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    return { change, percentage };
  };
  
  const { change, percentage } = calculatePriceChange();
  const isPositive = percentage >= 0;
  
  // Get min and max prices for the YAxis
  const minPrice = formattedData.length > 0 
    ? Math.min(...formattedData.map(d => d.price)) * 0.99
    : 0;
    
  const maxPrice = formattedData.length > 0 
    ? Math.max(...formattedData.map(d => d.price)) * 1.01
    : 0;
  
  // Get 24h high and low
  const dayHighPrice = chartData?.prices && chartData.prices.length > 0
    ? Math.max(...chartData.prices.map(([_, price]) => price))
    : 0;

  const dayLowPrice = chartData?.prices && chartData.prices.length > 0
    ? Math.min(...chartData.prices.map(([_, price]) => price))
    : 0;
    
  // Calculate 24h volume
  const volume = chartData?.total_volumes && chartData.total_volumes.length > 0
    ? chartData.total_volumes.reduce((sum, [_, vol]) => sum + vol, 0) / chartData.total_volumes.length
    : 0;
  
  return (
    <Card className="bg-secondary rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-400">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-semibold text-lg">{symbol}/USDT</h3>
            <span className={`ml-2 text-lg font-mono ${isPositive ? "text-positive" : "text-negative"}`}>
              {formatPrice(price)}
            </span>
            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold ${
              isPositive ? "text-positive bg-positive/10" : "text-negative bg-negative/10"
            } rounded`}>
              {isPositive ? "+" : ""}{percentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex mt-2 sm:mt-0">
            <div className="flex border border-neutral-400 rounded overflow-hidden">
              {["1", "7", "30", "90", "365"].map((value) => (
                <button
                  key={value}
                  className={`px-3 py-1 text-sm ${
                    timeframe === value 
                      ? "bg-primary text-white" 
                      : "text-neutral-200 hover:bg-neutral-400"
                  }`}
                  onClick={() => setTimeframe(value)}
                >
                  {getTimeframeLabel(value)}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="ml-2 p-1.5 border border-neutral-400 rounded hover:bg-neutral-400">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div style={{ height: `${height}px` }}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#282A36" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  tick={{ fill: '#A7B1BC' }}
                  axisLine={{ stroke: '#282A36' }}
                />
                <YAxis 
                  domain={[minPrice, maxPrice]}
                  tickFormatter={(value) => formatPrice(value, true)}
                  tick={{ fill: '#A7B1BC' }}
                  axisLine={{ stroke: '#282A36' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), "Price"]}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                  contentStyle={{ backgroundColor: '#1C1D24', border: '1px solid #282A36' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={getChartColor()} 
                  dot={false}
                  strokeWidth={2}
                />
                {/* Average price line */}
                {formattedData.length > 0 && (
                  <ReferenceLine 
                    y={formattedData.reduce((sum, item) => sum + item.price, 0) / formattedData.length} 
                    stroke="#6C7284" 
                    strokeDasharray="3 3"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p>No chart data available</p>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <div className="bg-neutral-500 rounded p-2">
          <div className="text-xs text-neutral-300">24h High</div>
          <div className="text-sm font-mono font-medium text-positive">
            {formatPrice(dayHighPrice)}
          </div>
        </div>
        <div className="bg-neutral-500 rounded p-2">
          <div className="text-xs text-neutral-300">24h Low</div>
          <div className="text-sm font-mono font-medium text-negative">
            {formatPrice(dayLowPrice)}
          </div>
        </div>
        <div className="bg-neutral-500 rounded p-2">
          <div className="text-xs text-neutral-300">24h Volume</div>
          <div className="text-sm font-mono font-medium">
            ${volume > 1000000000 
              ? `${(volume / 1000000000).toFixed(2)}B` 
              : volume > 1000000 
                ? `${(volume / 1000000).toFixed(2)}M` 
                : volume.toFixed(2)
            }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PriceChart;
