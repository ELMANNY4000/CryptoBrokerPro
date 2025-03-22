import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PortfolioAsset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TradingInterfaceProps {
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  simplified?: boolean;
  limitOrder?: boolean;
}

const TradingInterface = ({ 
  coinId, 
  symbol, 
  name, 
  currentPrice, 
  simplified = true,
  limitOrder = false
}: TradingInterfaceProps) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [percentageSelected, setPercentageSelected] = useState<number>(0);
  
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });
  
  const { data: portfolioAssets } = useQuery<PortfolioAsset[]>({
    queryKey: ["/api/portfolio"],
  });
  
  // Create new transaction
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: `${orderType === 'buy' ? 'Purchase' : 'Sale'} Successful`,
        description: `You ${orderType === 'buy' ? 'bought' : 'sold'} ${parseFloat(amount).toFixed(8)} ${symbol}`,
      });
      
      // Reset form
      setAmount('');
      setTotal('');
      setPercentageSelected(0);
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Find asset in portfolio
  const assetInPortfolio = portfolioAssets?.find(asset => asset.coinId === coinId);
  
  // Calculate available balance
  const availableBalance = 25000; // For this demo, using a fixed available balance
  
  // Calculate available amount of the selected asset
  const availableAmount = assetInPortfolio?.amount || 0;
  
  // Update total when amount or price changes
  useEffect(() => {
    if (amount && price) {
      const calculatedTotal = parseFloat(amount) * parseFloat(price);
      setTotal(calculatedTotal.toString());
    } else {
      setTotal('');
    }
  }, [amount, price]);
  
  // Update amount when total or price changes
  useEffect(() => {
    if (total && price && parseFloat(price) > 0) {
      const calculatedAmount = parseFloat(total) / parseFloat(price);
      setAmount(calculatedAmount.toString());
    }
  }, [total, price]);
  
  // Update price when currentPrice changes
  useEffect(() => {
    if (!limitOrder) {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, limitOrder]);
  
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setPercentageSelected(0);
  };
  
  const handleTotalChange = (value: string) => {
    setTotal(value);
    setPercentageSelected(0);
  };
  
  const handlePercentageClick = (percentage: number) => {
    setPercentageSelected(percentage);
    
    if (orderType === 'buy') {
      const maxTotal = availableBalance * (percentage / 100);
      setTotal(maxTotal.toString());
      if (parseFloat(price) > 0) {
        const calculatedAmount = maxTotal / parseFloat(price);
        setAmount(calculatedAmount.toString());
      }
    } else {
      const maxAmount = availableAmount * (percentage / 100);
      setAmount(maxAmount.toString());
      if (parseFloat(price) > 0) {
        const calculatedTotal = maxAmount * parseFloat(price);
        setTotal(calculatedTotal.toString());
      }
    }
  };
  
  const handleSubmit = () => {
    if (!amount || !price || !total) {
      toast({
        title: "Invalid Input",
        description: "Please provide valid amount and price",
        variant: "destructive",
      });
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price);
    const parsedTotal = parseFloat(total);
    
    if (isNaN(parsedAmount) || isNaN(parsedPrice) || parsedAmount <= 0 || parsedPrice <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please provide valid amount and price",
        variant: "destructive",
      });
      return;
    }
    
    if (orderType === 'buy' && parsedTotal > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to complete this purchase",
        variant: "destructive",
      });
      return;
    }
    
    if (orderType === 'sell' && parsedAmount > availableAmount) {
      toast({
        title: "Insufficient Assets",
        description: `You don't have enough ${symbol} to complete this sale`,
        variant: "destructive",
      });
      return;
    }
    
    // Create transaction payload
    const transactionData = {
      type: orderType,
      coinId,
      symbol,
      name,
      amount: orderType === 'buy' ? parsedAmount : -parsedAmount, // Negative for sells
      price: parsedPrice
    };
    
    createTransaction.mutate(transactionData);
  };
  
  const estimatedFee = parseFloat(total) * 0.003; // 0.3% fee
  
  return (
    <div className="bg-secondary rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-400">
        <h3 className="font-semibold text-lg">Mock Trading</h3>
      </div>
      <div className="p-4">
        <div className="flex border border-neutral-400 rounded overflow-hidden w-fit mb-4">
          <button 
            className={`px-6 py-2 text-sm ${
              orderType === 'buy' ? 'bg-positive text-white' : 'text-neutral-200 hover:bg-neutral-400'
            }`}
            onClick={() => setOrderType('buy')}
          >
            Buy
          </button>
          <button 
            className={`px-6 py-2 text-sm ${
              orderType === 'sell' ? 'bg-negative text-white' : 'text-neutral-200 hover:bg-neutral-400'
            }`}
            onClick={() => setOrderType('sell')}
          >
            Sell
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Price</label>
              <div className="relative">
                <Input
                  type="number"
                  className="w-full bg-neutral-500 border border-neutral-400 text-white rounded p-2 font-mono"
                  value={price}
                  onChange={(e) => limitOrder ? setPrice(e.target.value) : null}
                  disabled={!limitOrder}
                />
                <div className="absolute right-3 top-2.5 text-neutral-300">USDT</div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <div className="relative">
                <Input 
                  type="number"
                  className="w-full bg-neutral-500 border border-neutral-400 text-white rounded p-2 font-mono"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
                <div className="absolute right-3 top-2.5 text-neutral-300">{symbol}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Total</label>
              <div className="relative">
                <Input 
                  type="number"
                  className="w-full bg-neutral-500 border border-neutral-400 text-white rounded p-2 font-mono"
                  placeholder="0.00"
                  value={total}
                  onChange={(e) => handleTotalChange(e.target.value)}
                />
                <div className="absolute right-3 top-2.5 text-neutral-300">USDT</div>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-3">
              <button 
                className={`flex-1 py-1 text-xs border ${
                  percentageSelected === 25 ? 'bg-neutral-400' : ''
                } border-neutral-400 rounded hover:bg-neutral-400`}
                onClick={() => handlePercentageClick(25)}
              >
                25%
              </button>
              <button 
                className={`flex-1 py-1 text-xs border ${
                  percentageSelected === 50 ? 'bg-neutral-400' : ''
                } border-neutral-400 rounded hover:bg-neutral-400`}
                onClick={() => handlePercentageClick(50)}
              >
                50%
              </button>
              <button 
                className={`flex-1 py-1 text-xs border ${
                  percentageSelected === 75 ? 'bg-neutral-400' : ''
                } border-neutral-400 rounded hover:bg-neutral-400`}
                onClick={() => handlePercentageClick(75)}
              >
                75%
              </button>
              <button 
                className={`flex-1 py-1 text-xs border ${
                  percentageSelected === 100 ? 'bg-neutral-400' : ''
                } border-neutral-400 rounded hover:bg-neutral-400`}
                onClick={() => handlePercentageClick(100)}
              >
                100%
              </button>
            </div>
            
            <Button 
              className={`w-full ${
                orderType === 'buy' 
                  ? 'bg-positive hover:bg-positive/90' 
                  : 'bg-negative hover:bg-negative/90'
              } text-white py-3 rounded font-medium`}
              onClick={handleSubmit}
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? "Processing..." : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
            </Button>
          </div>
          
          {!simplified && (
            <div>
              <div className="bg-neutral-500 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium mb-2">Order Summary</h4>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-neutral-300">Available Balance</span>
                  <span className="text-xs font-medium">{orderType === 'buy' 
                    ? `${availableBalance.toLocaleString()} USDT` 
                    : `${availableAmount.toFixed(8)} ${symbol}`}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-neutral-300">Order Type</span>
                  <span className="text-xs font-medium">{limitOrder ? 'Limit' : 'Market'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-neutral-300">Estimated Fee</span>
                  <span className="text-xs font-medium">
                    {estimatedFee.toFixed(6)} USDT
                  </span>
                </div>
              </div>
              
              <div className="bg-neutral-500 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Market Depth</h4>
                <div className="space-y-1">
                  {/* Market depth visualization - using static layout with dynamic values */}
                  <div className="flex justify-between">
                    <span className="text-xs text-negative">{formatPrice(currentPrice * 1.002)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-negative h-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-xs">3.245 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-negative">{formatPrice(currentPrice * 1.001)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-negative h-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-xs">2.178 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-negative">{formatPrice(currentPrice * 1.0005)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-negative h-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-xs">1.564 BTC</span>
                  </div>
                  <div className="border-t border-neutral-400 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-xs text-positive">{formatPrice(currentPrice * 0.9995)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-positive h-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-xs">0.932 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-positive">{formatPrice(currentPrice * 0.999)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-positive h-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-xs">2.754 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-positive">{formatPrice(currentPrice * 0.998)}</span>
                    <div className="w-24 bg-neutral-400 rounded-sm overflow-hidden h-2">
                      <div className="bg-positive h-full" style={{ width: '50%' }}></div>
                    </div>
                    <span className="text-xs">3.891 BTC</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
