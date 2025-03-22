import { useState } from "react";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PriceChart from "@/components/dashboard/PriceChart";
import TradingInterface from "@/components/dashboard/TradingInterface";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import MiningStats from "@/components/dashboard/MiningStats";
import WalletSummary from "@/components/dashboard/WalletSummary";
import { useCryptoData } from "@/hooks/useCryptoData";

const Dashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState("BTC");
  const [selectedCoinName, setSelectedCoinName] = useState("Bitcoin");
  const [selectedCoinPrice, setSelectedCoinPrice] = useState(0);
  
  const { isLoading, error } = useCryptoData();
  
  const handleCoinSelect = (coinId: string, symbol: string, name: string, price: number) => {
    setSelectedCoin(coinId);
    setSelectedCoinSymbol(symbol);
    setSelectedCoinName(name);
    setSelectedCoinPrice(price);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading cryptocurrency data...</div>;
  }
  
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading cryptocurrency data. Please try again later.
      </div>
    );
  }
  
  return (
    <>
      <MarketOverview onCoinSelect={handleCoinSelect} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart 
            coinId={selectedCoin} 
            symbol={selectedCoinSymbol} 
            price={selectedCoinPrice} 
          />
          
          <TradingInterface 
            coinId={selectedCoin}
            symbol={selectedCoinSymbol}
            name={selectedCoinName}
            currentPrice={selectedCoinPrice}
          />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <PortfolioSummary />
          <MiningStats />
          <WalletSummary />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
