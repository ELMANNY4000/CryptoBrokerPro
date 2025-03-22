import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  ExternalLink, 
  DollarSign 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Wallet = () => {
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { totalPortfolioValue } = usePortfolio();
  
  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Wallet</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
            <CardDescription>
              Your crypto wallet information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-sm text-neutral-300 mb-1">Wallet Address</p>
                <div className="bg-neutral-500 rounded p-3 flex justify-between items-center">
                  <span className="text-sm font-mono truncate">
                    {user?.walletAddress || "Loading..."}
                  </span>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyWalletAddress}
                    >
                      <Copy className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-300 mb-1">Available Balance</p>
                  <div className="bg-neutral-500 rounded p-3">
                    <p className="text-lg font-medium">${totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</p>
                    <p className="text-xs text-neutral-300">Total portfolio value</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-300 mb-1">Account Status</p>
                  <div className="bg-neutral-500 rounded p-3">
                    <p className="text-lg font-medium">Active</p>
                    <p className="text-xs text-neutral-300">Paper trading enabled</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="deposit">
              <TabsList className="grid grid-cols-2 w-[400px]">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deposit" className="mt-4">
                <div className="bg-neutral-500 rounded-lg p-4">
                  <p className="text-sm mb-4">Deposit crypto to your wallet by sending to your wallet address.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Currency</label>
                      <select className="w-full bg-neutral-400 border border-neutral-300 text-white rounded p-2">
                        <option>Bitcoin (BTC)</option>
                        <option>Ethereum (ETH)</option>
                        <option>Tether (USDT)</option>
                        <option>Binance Coin (BNB)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Deposit Address</label>
                      <div className="bg-neutral-400 rounded p-3 flex justify-between items-center">
                        <span className="text-sm font-mono truncate">
                          {user?.walletAddress || "Loading..."}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={copyWalletAddress}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-400 rounded-lg p-3">
                      <p className="text-sm text-neutral-200">
                        <strong>Note:</strong> This is a paper trading platform. No actual cryptocurrency transactions will occur. This interface simulates the deposit experience.
                      </p>
                    </div>
                    
                    <Button className="w-full">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Simulate Deposit
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="withdraw" className="mt-4">
                <div className="bg-neutral-500 rounded-lg p-4">
                  <p className="text-sm mb-4">Withdraw crypto from your wallet.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Currency</label>
                      <select className="w-full bg-neutral-400 border border-neutral-300 text-white rounded p-2">
                        <option>Bitcoin (BTC)</option>
                        <option>Ethereum (ETH)</option>
                        <option>Tether (USDT)</option>
                        <option>Binance Coin (BNB)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Destination Address</label>
                      <Input 
                        placeholder="Enter destination wallet address"
                        className="bg-neutral-400 border-neutral-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="bg-neutral-400 border-neutral-300"
                      />
                    </div>
                    
                    <div className="bg-neutral-400 rounded-lg p-3">
                      <p className="text-sm text-neutral-200">
                        <strong>Note:</strong> This is a paper trading platform. No actual cryptocurrency transactions will occur. This interface simulates the withdrawal experience.
                      </p>
                    </div>
                    
                    <Button className="w-full">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Simulate Withdrawal
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest wallet activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-neutral-400">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full 
                        ${tx.type === 'buy' || tx.type === 'mining_reward' 
                            ? 'bg-positive/20 text-positive' 
                            : tx.type === 'sell' 
                              ? 'bg-negative/20 text-negative' 
                              : 'bg-primary/20 text-primary'
                        } 
                        flex items-center justify-center`}
                      >
                        {tx.type === 'buy' || tx.type === 'mining_reward' ? (
                          <ArrowDown className="h-5 w-5" />
                        ) : tx.type === 'sell' ? (
                          <ArrowUp className="h-5 w-5" />
                        ) : (
                          <DollarSign className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">
                          {tx.type === 'buy' 
                            ? 'Bought' 
                            : tx.type === 'sell' 
                            ? 'Sold' 
                            : tx.type === 'mining_reward'
                            ? 'Mining Reward'
                            : 'Transaction'} {tx.symbol}
                        </div>
                        <div className="text-xs text-neutral-300">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium 
                        ${tx.type === 'buy' || tx.type === 'mining_reward' 
                          ? 'text-positive' 
                          : tx.type === 'sell' 
                          ? 'text-negative' 
                          : ''
                        }`}
                      >
                        {tx.type === 'buy' || tx.type === 'mining_reward' ? '+' : tx.type === 'sell' ? '-' : ''}
                        {Math.abs(tx.amount).toFixed(8)} {tx.symbol}
                      </div>
                      <div className="text-xs">
                        ${(Math.abs(tx.amount) * tx.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-300">
                No transactions yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Transactions</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
