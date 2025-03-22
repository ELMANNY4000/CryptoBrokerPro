import { useQuery } from "@tanstack/react-query";
import { PortfolioAsset } from "@shared/schema";
import { useCryptoData } from "./useCryptoData";

export function usePortfolio() {
  // Fetch portfolio assets
  const { data: portfolioAssets, isLoading: isLoadingPortfolio, error } = useQuery<PortfolioAsset[]>({
    queryKey: ["/api/portfolio"],
  });
  
  // Fetch crypto market data
  const { data: cryptoData, isLoading: isLoadingMarket } = useCryptoData();
  
  // Calculate total portfolio value
  const calculateTotalValue = () => {
    if (!portfolioAssets || !cryptoData) return 0;
    
    return portfolioAssets.reduce((total, asset) => {
      const coinData = cryptoData.find(c => c.id === asset.coinId);
      if (coinData) {
        return total + (asset.amount * coinData.current_price);
      }
      return total;
    }, 0);
  };
  
  const totalPortfolioValue = calculateTotalValue();
  
  // Calculate asset allocation percentages
  const calculateAssetAllocation = () => {
    if (!portfolioAssets || !cryptoData || totalPortfolioValue === 0) return [];
    
    return portfolioAssets.map(asset => {
      const coinData = cryptoData.find(c => c.id === asset.coinId);
      if (coinData) {
        const value = asset.amount * coinData.current_price;
        return {
          ...asset,
          value,
          percentage: (value / totalPortfolioValue) * 100,
          priceChange: coinData.price_change_percentage_24h
        };
      }
      return {
        ...asset,
        value: 0,
        percentage: 0,
        priceChange: 0
      };
    });
  };
  
  const assetAllocation = calculateAssetAllocation();
  
  // Calculate overall portfolio performance (24h)
  const calculatePerformance = () => {
    if (!portfolioAssets || !cryptoData) return 0;
    
    let totalChange = 0;
    let totalValue = 0;
    
    portfolioAssets.forEach(asset => {
      const coinData = cryptoData.find(c => c.id === asset.coinId);
      if (coinData) {
        const value = asset.amount * coinData.current_price;
        totalValue += value;
        totalChange += (value * coinData.price_change_percentage_24h / 100);
      }
    });
    
    return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
  };
  
  const portfolioPerformance24h = calculatePerformance();
  
  return {
    portfolioAssets,
    assetAllocation,
    totalPortfolioValue,
    portfolioPerformance24h,
    isLoading: isLoadingPortfolio || isLoadingMarket,
    error
  };
}
