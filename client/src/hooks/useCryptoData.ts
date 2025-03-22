import { useQuery } from "@tanstack/react-query";
import { CoinData } from "@shared/schema";

// Hook to fetch data for all top coins
export function useCryptoData(specificCoinId?: string) {
  const { data, isLoading, error } = useQuery<CoinData[]>({
    queryKey: ["/api/crypto/markets"],
    refetchInterval: 60000, // Refetch every minute
  });
  
  // If a specific coin ID is requested, filter the result
  if (specificCoinId && data) {
    const coinData = data.find(coin => coin.id === specificCoinId);
    return {
      data: coinData,
      isLoading,
      error
    };
  }
  
  return {
    data,
    isLoading,
    error
  };
}

// Hook to fetch chart data for a specific coin
export function useCryptoChartData(coinId: string, days: string = "1") {
  return useQuery({
    queryKey: [`/api/crypto/${coinId}/chart`, { days }],
    enabled: !!coinId,
    refetchInterval: 60000, // Refetch every minute
  });
}

// Hook to fetch detailed data for a specific coin
export function useCoinData(coinId: string) {
  return useQuery({
    queryKey: [`/api/crypto/${coinId}`],
    enabled: !!coinId,
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}
