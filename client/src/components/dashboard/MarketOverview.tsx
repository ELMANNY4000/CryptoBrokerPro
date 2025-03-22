import { useCryptoData } from "@/hooks/useCryptoData";
import CoinIcon from "@/components/ui/CoinIcon";

interface MarketOverviewProps {
  onCoinSelect?: (coinId: string, symbol: string, name: string, price: number) => void;
}

const MarketOverview = ({ onCoinSelect }: MarketOverviewProps) => {
  const { data: cryptoCoins, isLoading, error } = useCryptoData();
  
  if (isLoading) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Market Overview</h2>
          <div className="flex items-center">
            <span className="text-sm text-neutral-200 mr-2">Loading market data...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-secondary rounded-lg p-4 shadow-md animate-pulse">
              <div className="h-12 bg-neutral-500 rounded-md mb-3"></div>
              <div className="h-6 bg-neutral-500 rounded-md mb-2"></div>
              <div className="h-10 bg-neutral-500 rounded-md"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Market Overview</h2>
        </div>
        
        <div className="bg-secondary rounded-lg p-4 shadow-md text-center text-negative">
          Error loading market data. Please try again later.
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Market Overview</h2>
        <div className="flex items-center">
          <span className="text-sm text-neutral-200 mr-2">Last updated:</span>
          <span className="text-sm font-medium">
            {new Date().toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cryptoCoins?.slice(0, 6).map((coin) => (
          <div 
            key={coin.id} 
            className="bg-secondary rounded-lg p-4 shadow-md cursor-pointer hover:bg-neutral-500 transition-colors"
            onClick={() => onCoinSelect?.(coin.id, coin.symbol.toUpperCase(), coin.name, coin.current_price)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CoinIcon symbol={coin.symbol.toUpperCase()} />
                <div className="ml-3">
                  <h3 className="font-semibold">{coin.name}</h3>
                  <span className="text-xs text-neutral-300">{coin.symbol.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline">
                <span className="text-lg font-mono font-medium">
                  ${coin.current_price.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
                  })}
                </span>
                <span 
                  className={`ml-2 text-sm font-medium ${
                    coin.price_change_percentage_24h >= 0 ? "trending-up" : "trending-down"
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 h-10 bg-neutral-500 rounded overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r 
                    ${coin.price_change_percentage_24h >= 0 
                      ? "from-primary/50 to-primary" 
                      : "from-negative/50 to-negative"
                    }`}
                  style={{ width: `${Math.max(Math.abs(coin.price_change_percentage_24h) * 2, 5)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarketOverview;
