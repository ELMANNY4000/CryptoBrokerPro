import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { usePortfolio } from "@/hooks/usePortfolio";
import { ArrowUp, ArrowDown, Copy, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const WalletSummary = () => {
  const { toast } = useToast();
  const { totalPortfolioValue } = usePortfolio();
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/user"],
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 3 }],
  });
  
  if (isLoadingUser || isLoadingTransactions) {
    return (
      <div className="bg-secondary rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-4 border-b border-neutral-400">
          <div className="h-6 bg-neutral-500 rounded w-1/4"></div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-14 bg-neutral-500 rounded w-1/2"></div>
            <div className="h-8 bg-neutral-500 rounded w-1/4"></div>
          </div>
          <div className="h-16 bg-neutral-500 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-500 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Wallet Address Copied",
        description: "Address copied to clipboard",
      });
    }
  };
  
  return (
    <div className="bg-secondary rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-400">
        <h3 className="font-semibold text-lg">Wallet</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-neutral-300">Available Balance</div>
            <div className="text-lg font-medium">
              ${totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-sm"
              onClick={() => window.location.href = '/wallet'}
            >
              Deposit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 py-1.5 border border-neutral-400 text-white rounded text-sm hover:bg-neutral-400"
              onClick={() => window.location.href = '/wallet'}
            >
              Withdraw
            </Button>
          </div>
        </div>
        
        <div className="border border-neutral-400 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-2">
            <Clipboard className="h-5 w-5 text-neutral-300 mr-2" />
            <span className="text-sm font-medium">Wallet Address</span>
          </div>
          <div className="bg-neutral-400 rounded p-2 flex justify-between items-center">
            <span className="text-xs font-mono truncate">
              {user?.walletAddress || "Loading..."}
            </span>
            <Button variant="ghost" size="sm" onClick={copyWalletAddress}>
              <Copy className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
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
                      ) : (
                        <ArrowUp className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">
                        {tx.type === 'buy' 
                          ? 'Received' 
                          : tx.type === 'sell' 
                          ? 'Sent' 
                          : 'Mining Reward'} {tx.symbol}
                      </div>
                      <div className="text-xs text-neutral-300">
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      tx.type === 'buy' || tx.type === 'mining_reward' 
                        ? 'text-positive' 
                        : 'text-negative'
                    }`}>
                      {tx.type === 'buy' || tx.type === 'mining_reward' ? '+' : '-'}
                      {Math.abs(tx.amount).toFixed(6)} {tx.symbol}
                    </div>
                    <div className="text-xs">
                      ${(Math.abs(tx.amount) * tx.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-neutral-300">
                No recent transactions
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full bg-neutral-400 hover:bg-neutral-400/90 text-white py-2 rounded font-medium"
          onClick={() => window.location.href = '/wallet'}
        >
          View All Transactions
        </Button>
      </div>
    </div>
  );
};

export default WalletSummary;
