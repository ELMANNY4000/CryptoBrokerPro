import { useQuery } from "@tanstack/react-query";
import { PortfolioAsset } from "@shared/schema";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePortfolio } from "@/hooks/usePortfolio";
import CoinIcon from "@/components/ui/CoinIcon";
import { formatPrice } from "@/lib/utils";

const PortfolioSummary = () => {
  const { portfolioAssets, isLoading: isLoadingPortfolio, totalPortfolioValue } = usePortfolio();
  const { data: cryptoData, isLoading: isLoadingMarket } = useCryptoData();
  
  if (isLoadingPortfolio || isLoadingMarket) {
    return (
      <div className="bg-secondary rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-4 border-b border-neutral-400">
          <div className="h-6 bg-neutral-500 rounded w-1/2"></div>
        </div>
        <div className="p-4">
          <div className="h-10 bg-neutral-500 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-neutral-500 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-neutral-500 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate 24h change
  const calculatePortfolioChange = () => {
    if (!portfolioAssets || !cryptoData) return 0;
    
    let changePercentage = 0;
    let totalValue = 0;
    
    portfolioAssets.forEach(asset => {
      const marketInfo = cryptoData.find(c => c.id === asset.coinId);
      if (marketInfo) {
        const assetValue = asset.amount * marketInfo.current_price;
        totalValue += assetValue;
        
        // Add weighted contribution to overall change
        changePercentage += (marketInfo.price_change_percentage_24h * assetValue);
      }
    });
    
    // Normalize by total value to get weighted average
    return totalValue > 0 ? changePercentage / totalValue : 0;
  };
  
  const portfolioChangePercentage = calculatePortfolioChange();
  
  // Calculate asset distribution percentages
  const calculateDistribution = () => {
    if (!portfolioAssets || !cryptoData || !totalPortfolioValue) return [];
    
    return portfolioAssets.map(asset => {
      const marketInfo = cryptoData.find(c => c.id === asset.coinId);
      if (marketInfo) {
        const value = asset.amount * marketInfo.current_price;
        const percentage = (value / totalPortfolioValue) * 100;
        return {
          symbol: asset.symbol,
          percentage
        };
      }
      return { symbol: asset.symbol, percentage: 0 };
    });
  };
  
  const assetDistribution = calculateDistribution();
  
  // Get colors for each asset
  const getCoinColor = (symbol: string) => {
    switch(symbol.toUpperCase()) {
      case 'BTC': return '#F7931A';
      case 'ETH': return '#627EEA';
      case 'USDT': return '#26A17B';
      case 'BNB': return '#F3BA2F';
      case 'XRP': return '#8DC351';
      case 'ADA': return '#345D9D';
      default: return '#A7B1BC';
    }
  };
  
  return (
    <div className="bg-secondary rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-400">
        <h3 className="font-semibold text-lg">Your Portfolio</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-neutral-300">Total Value</div>
            <div className="text-xl font-medium">
              ${totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className={`px-2 py-1 ${
            portfolioChangePercentage >= 0 
              ? 'bg-positive/10 text-positive' 
              : 'bg-negative/10 text-negative'
          } text-xs font-medium rounded`}>
            {portfolioChangePercentage >= 0 ? '+' : ''}
            {portfolioChangePercentage.toFixed(2)}% (24h)
          </div>
        </div>
        
        <div className="mb-4">
          <div className="bg-neutral-500 h-2 rounded-full overflow-hidden">
            <div className="flex h-full">
              {assetDistribution.map((asset, index) => (
                <div 
                  key={index}
                  className="h-full" 
                  style={{ 
                    width: `${asset.percentage}%`, 
                    backgroundColor: getCoinColor(asset.symbol),
                    minWidth: asset.percentage > 0 ? '1%' : '0'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {portfolioAssets?.map((asset, index) => {
            const marketInfo = cryptoData?.find(c => c.id === asset.coinId);
            const value = marketInfo ? asset.amount * marketInfo.current_price : 0;
            const changePercentage = marketInfo?.price_change_percentage_24h || 0;
            
            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-400">
                <div className="flex items-center">
                  <CoinIcon symbol={asset.symbol} />
                  <div className="ml-3">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-xs text-neutral-300">{asset.amount.toFixed(6)} {asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-xs ${changePercentage >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
