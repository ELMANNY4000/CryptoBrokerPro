import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Users, CreditCard, Wallet, Coins } from "lucide-react";
import { TRANSACTION_TYPES } from "@/lib/constants";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-neutral-500 mt-1">
              Registered accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-neutral-500 mt-1">
              All platform transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assets Tracked</CardTitle>
            <Wallet className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-neutral-500 mt-1">
              User portfolio assets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mining Workers</CardTitle>
            <Coins className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-neutral-500 mt-1">
              Active mining operations
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Coin</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Value (USD)</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No recent transactions
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.userId}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === TRANSACTION_TYPES.BUY ? "default" :
                        transaction.type === TRANSACTION_TYPES.SELL ? "destructive" :
                        transaction.type === TRANSACTION_TYPES.DEPOSIT ? "outline" : 
                        "outline"
                      }>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="uppercase">{transaction.coinId}</TableCell>
                    <TableCell>{transaction.amount.toFixed(6)}</TableCell>
                    <TableCell>{formatPrice(transaction.price * transaction.amount)}</TableCell>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}