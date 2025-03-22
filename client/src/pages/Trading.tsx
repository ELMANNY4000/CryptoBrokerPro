import { useState } from "react";
import { useCryptoData } from "@/hooks/useCryptoData";
import PriceChart from "@/components/dashboard/PriceChart";
import TradingInterface from "@/components/dashboard/TradingInterface";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

const Trading = () => {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState("BTC");
  const [selectedCoinName, setSelectedCoinName] = useState("Bitcoin");
  const [selectedCoinPrice, setSelectedCoinPrice] = useState(0);
  
  const { data: cryptoData, isLoading, error } = useCryptoData();
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const handleCoinSelect = (coin: any) => {
    setSelectedCoin(coin.id);
    setSelectedCoinSymbol(coin.symbol.toUpperCase());
    setSelectedCoinName(coin.name);
    setSelectedCoinPrice(coin.current_price);
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Trading Platform</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-secondary p-4 rounded-lg lg:col-span-1">
          <h3 className="text-lg font-medium mb-3">Market Coins</h3>
          <div className="h-[600px] overflow-y-auto custom-scrollbar">
            {cryptoData?.map((coin) => (
              <div 
                key={coin.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-500 ${
                  selectedCoin === coin.id ? "bg-neutral-500" : ""
                }`}
                onClick={() => handleCoinSelect(coin)}
              >
                <div className="flex items-center">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 mr-2" />
                  <div>
                    <p className="font-medium">{coin.symbol.toUpperCase()}</p>
                    <p className="text-xs text-neutral-300">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium">${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                  <p className={`text-xs ${
                    coin.price_change_percentage_24h >= 0 
                      ? "text-positive" 
                      : "text-negative"
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <PriceChart 
            coinId={selectedCoin} 
            symbol={selectedCoinSymbol} 
            price={selectedCoinPrice}
            height={300}
          />
          
          <Tabs defaultValue="market">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="market">Market Order</TabsTrigger>
              <TabsTrigger value="limit">Limit Order</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market" className="mt-4">
              <div className="bg-secondary rounded-lg p-6">
                <TradingInterface 
                  coinId={selectedCoin}
                  symbol={selectedCoinSymbol}
                  name={selectedCoinName}
                  currentPrice={selectedCoinPrice}
                  simplified={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="limit" className="mt-4">
              <div className="bg-secondary rounded-lg p-6">
                <p className="text-neutral-300 mb-2">Set the price at which you want to buy or sell</p>
                <TradingInterface 
                  coinId={selectedCoin}
                  symbol={selectedCoinSymbol}
                  name={selectedCoinName}
                  currentPrice={selectedCoinPrice}
                  simplified={false}
                  limitOrder={true}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Recent Trades</h3>
            
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-neutral-300 border-b border-neutral-400">
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Coin</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Value</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.filter(tx => tx.type === 'buy' || tx.type === 'sell').map((tx) => (
                      <tr key={tx.id} className="border-b border-neutral-500">
                        <td className={`py-3 ${tx.type === 'buy' ? 'text-positive' : 'text-negative'}`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </td>
                        <td className="py-3">{tx.symbol}</td>
                        <td className="py-3 font-mono">{Math.abs(tx.amount).toFixed(8)}</td>
                        <td className="py-3 font-mono">${tx.price.toFixed(2)}</td>
                        <td className="py-3 font-mono">${(Math.abs(tx.amount) * tx.price).toFixed(2)}</td>
                        <td className="py-3 text-sm text-neutral-300">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-300">No trades yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
