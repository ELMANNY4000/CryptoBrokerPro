import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction, User } from "@shared/schema";
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
  DollarSign,
  CheckCircle,
  CreditCard,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { COIN_COLORS } from "@/lib/constants";

const Wallet = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [depositMethod, setDepositMethod] = useState<"crypto" | "card">("crypto");
  const [depositStep, setDepositStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: ""
  });
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { totalPortfolioValue, portfolioAssets } = usePortfolio();
  
  // Simulated mutation for deposit
  const depositMutation = useMutation({
    mutationFn: async (data: { 
      coinId: string; 
      symbol: string; 
      amount: number; 
      method: string;
    }) => {
      // Simulate API call latency
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transaction: {
              id: Math.floor(Math.random() * 1000),
              type: "deposit",
              amount: data.amount,
              coinId: data.coinId,
              symbol: data.symbol,
              price: data.coinId === "bitcoin" ? 84000 : 
                     data.coinId === "ethereum" ? 2000 :
                     data.coinId === "tether" ? 1 : 400,
              timestamp: new Date().toISOString()
            }
          });
        }, 1500);
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      
      toast({
        title: "Deposit Successful",
        description: `${depositAmount} ${selectedCurrency} has been added to your wallet`,
        variant: "default",
      });
      
      setProcessingDeposit(false);
      setDepositAmount("");
      setDepositStep(1);
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        name: ""
      });
    }
  });
  
  // Simulated mutation for withdrawal
  const withdrawMutation = useMutation({
    mutationFn: async (data: { 
      coinId: string; 
      symbol: string; 
      amount: number; 
      address: string;
    }) => {
      // Simulate API call latency
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if user has enough funds
          const asset = portfolioAssets?.find(a => a.symbol === data.symbol);
          
          if (!asset || asset.amount < data.amount) {
            reject(new Error("Insufficient funds"));
            return;
          }
          
          resolve({
            success: true,
            transaction: {
              id: Math.floor(Math.random() * 1000),
              type: "withdrawal",
              amount: -data.amount,
              coinId: data.coinId,
              symbol: data.symbol,
              price: data.coinId === "bitcoin" ? 84000 : 
                     data.coinId === "ethereum" ? 2000 :
                     data.coinId === "tether" ? 1 : 400,
              timestamp: new Date().toISOString()
            }
          });
        }, 1500);
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      
      toast({
        title: "Withdrawal Successful",
        description: `${withdrawAmount} ${selectedCurrency} has been sent to the specified address`,
        variant: "default",
      });
      
      setProcessingWithdrawal(false);
      setWithdrawAmount("");
      setDestAddress("");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setProcessingWithdrawal(false);
    }
  });
  
  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }
    
    if (depositMethod === "card" && depositStep === 1) {
      setDepositStep(2);
      return;
    }
    
    if (depositMethod === "card" && depositStep === 2) {
      // Validate card details
      if (
        !cardDetails.cardNumber || 
        !cardDetails.expiryDate || 
        !cardDetails.cvv || 
        !cardDetails.name
      ) {
        toast({
          title: "Missing Details",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
    }
    
    setProcessingDeposit(true);
    
    // Map currency symbol to coinId
    const coinId = selectedCurrency === "BTC" ? "bitcoin" : 
                  selectedCurrency === "ETH" ? "ethereum" :
                  selectedCurrency === "USDT" ? "tether" : "binancecoin";
    
    depositMutation.mutate({
      coinId,
      symbol: selectedCurrency,
      amount: Number(depositAmount),
      method: depositMethod
    });
  };
  
  const handleWithdrawal = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }
    
    if (!destAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a destination address",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingWithdrawal(true);
    
    // Map currency symbol to coinId
    const coinId = selectedCurrency === "BTC" ? "bitcoin" : 
                  selectedCurrency === "ETH" ? "ethereum" :
                  selectedCurrency === "USDT" ? "tether" : "binancecoin";
    
    withdrawMutation.mutate({
      coinId,
      symbol: selectedCurrency,
      amount: Number(withdrawAmount),
      address: destAddress
    });
  };
  
  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
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
                <motion.div 
                  className="bg-neutral-800 rounded-lg p-4 shadow-lg"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="mb-4 flex items-center space-x-2">
                    <Button 
                      variant={depositMethod === "crypto" ? "default" : "outline"}
                      className="w-1/2"
                      onClick={() => {
                        setDepositMethod("crypto");
                        setDepositStep(1);
                      }}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Crypto
                    </Button>
                    <Button 
                      variant={depositMethod === "card" ? "default" : "outline"}
                      className="w-1/2"
                      onClick={() => {
                        setDepositMethod("card");
                        setDepositStep(1);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Card
                    </Button>
                  </div>
                  
                  {depositMethod === "crypto" ? (
                    <motion.div 
                      className="space-y-4"
                      key="crypto-deposit"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium mb-1">Select Currency</label>
                        <select 
                          className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md p-2"
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                        >
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">Tether (USDT)</option>
                          <option value="BNB">Binance Coin (BNB)</option>
                        </select>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium mb-1">Your Deposit Address</label>
                        <div className="bg-neutral-700 border border-neutral-600 rounded-md p-3 flex justify-between items-center">
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
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium mb-1">Amount to Deposit</label>
                        <div className="relative">
                          <Input 
                            type="number"
                            placeholder="0.00"
                            className="bg-neutral-700 border-neutral-600 pl-10"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                          <div className="absolute left-3 top-3 text-neutral-400">
                            {selectedCurrency}
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-neutral-700 rounded-lg p-3"
                        variants={itemVariants}
                      >
                        <p className="text-sm text-neutral-300">
                          <strong>Note:</strong> This is a paper trading platform. No actual cryptocurrency transactions will occur. This interface simulates the deposit experience.
                        </p>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Button 
                          className="w-full" 
                          onClick={handleDeposit}
                          disabled={processingDeposit}
                        >
                          {processingDeposit ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-2 h-4 w-4" />
                              Simulate Deposit
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : depositStep === 1 ? (
                    <motion.div 
                      className="space-y-4"
                      key="card-deposit-step1"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium mb-1">Select Currency</label>
                        <select 
                          className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md p-2"
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value)}
                        >
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">Tether (USDT)</option>
                          <option value="BNB">Binance Coin (BNB)</option>
                        </select>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium mb-1">Amount to Deposit</label>
                        <div className="relative">
                          <Input 
                            type="number"
                            placeholder="0.00"
                            className="bg-neutral-700 border-neutral-600 pl-10"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                          <div className="absolute left-3 top-3 text-neutral-400">
                            {selectedCurrency}
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-neutral-700 rounded-lg p-3"
                        variants={itemVariants}
                      >
                        <p className="text-sm text-neutral-300">
                          <strong>Note:</strong> This is a paper trading platform. No actual cryptocurrency transactions will occur. This interface simulates the credit card purchase experience.
                        </p>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Button 
                          className="w-full" 
                          onClick={handleDeposit}
                          disabled={processingDeposit}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Continue to Payment
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      key="card-deposit-step2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div 
                        className="bg-neutral-600 p-4 rounded-lg mb-4"
                        variants={itemVariants}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-neutral-300">Buying</p>
                            <p className="text-base font-medium">{depositAmount} {selectedCurrency}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-300">Total</p>
                            <p className="text-base font-medium">
                              ${(Number(depositAmount) * (selectedCurrency === "BTC" ? 84000 : 
                              selectedCurrency === "ETH" ? 2000 :
                              selectedCurrency === "USDT" ? 1 : 400)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div className="space-y-3" variants={itemVariants}>
                        <label className="block text-sm font-medium">Card Information</label>
                        <Input 
                          placeholder="Card Number" 
                          className="bg-neutral-700 border-neutral-600"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            placeholder="MM/YY" 
                            className="bg-neutral-700 border-neutral-600"
                            value={cardDetails.expiryDate}
                            onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                          />
                          <Input 
                            placeholder="CVV" 
                            className="bg-neutral-700 border-neutral-600"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          />
                        </div>
                        
                        <Input 
                          placeholder="Name on Card" 
                          className="bg-neutral-700 border-neutral-600"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        />
                      </motion.div>
                      
                      <motion.div className="flex flex-col space-y-2" variants={itemVariants}>
                        <Button 
                          className="w-full" 
                          onClick={handleDeposit}
                          disabled={processingDeposit}
                        >
                          {processingDeposit ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing Payment...
                            </>
                          ) : (
                            "Complete Purchase"
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setDepositStep(1)}
                          disabled={processingDeposit}
                        >
                          Back
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="withdraw" className="mt-4">
                <motion.div 
                  className="bg-neutral-800 rounded-lg p-4 shadow-lg"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium mb-1">Select Currency</label>
                      <select 
                        className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-md p-2"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="BNB">Binance Coin (BNB)</option>
                      </select>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium mb-1">Destination Address</label>
                      <Input 
                        placeholder="Enter destination wallet address"
                        className="bg-neutral-700 border-neutral-600 font-mono text-sm"
                        value={destAddress}
                        onChange={(e) => setDestAddress(e.target.value)}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium mb-1">Amount to Withdraw</label>
                      <div className="relative">
                        <Input 
                          type="number"
                          placeholder="0.00"
                          className="bg-neutral-700 border-neutral-600 pl-10"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                        <div className="absolute left-3 top-3 text-neutral-400">
                          {selectedCurrency}
                        </div>
                      </div>
                    </motion.div>
                    
                    {portfolioAssets?.find(a => a.symbol === selectedCurrency) && (
                      <motion.div variants={itemVariants} className="flex justify-between items-center text-sm text-neutral-300 px-1">
                        <span>Available:</span>
                        <span className="font-medium">
                          {portfolioAssets.find(a => a.symbol === selectedCurrency)?.amount.toFixed(8)} {selectedCurrency}
                        </span>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="bg-neutral-700 rounded-lg p-3"
                      variants={itemVariants}
                    >
                      <p className="text-sm text-neutral-300">
                        <strong>Note:</strong> This is a paper trading platform. No actual cryptocurrency transactions will occur. This interface simulates the withdrawal experience.
                      </p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Button 
                        className="w-full" 
                        onClick={handleWithdrawal}
                        disabled={processingWithdrawal}
                      >
                        {processingWithdrawal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Simulate Withdrawal
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
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
