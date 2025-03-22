import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { formatPrice, formatNumber, formatDate } from "@/lib/utils";
import { Users, Wallet, Clock, Coins, ArrowUp, ArrowDown } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalAssets: number;
    totalWorkers: number;
    totalRewards: number;
    recentTransactions: Transaction[];
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <p className="text-xs text-neutral-500 mt-1">Active accounts on platform</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Clock className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
            <p className="text-xs text-neutral-500 mt-1">Total transaction volume</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assets Tracked</CardTitle>
            <Wallet className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalAssets)}</div>
            <p className="text-xs text-neutral-500 mt-1">Portfolio assets tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mining Workers</CardTitle>
            <Coins className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalWorkers)}</div>
            <p className="text-xs text-neutral-500 mt-1">{formatNumber(stats.totalRewards)} rewards paid</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.length === 0 ? (
              <p className="text-sm text-neutral-500">No recent transactions</p>
            ) : (
              stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {tx.type === "buy" ? (
                      <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center text-green-500">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    ) : tx.type === "sell" ? (
                      <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center text-red-500">
                        <ArrowUp className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <Coins className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === "buy" 
                          ? `Bought ${tx.symbol}`
                          : tx.type === "sell"
                          ? `Sold ${tx.symbol}`
                          : `Mining reward ${tx.symbol}`
                        }
                      </p>
                      <p className="text-xs text-neutral-500">{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {tx.type === "buy" ? "-" : "+"}{formatPrice(tx.amount * tx.price)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {tx.amount.toFixed(6)} {tx.symbol}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}