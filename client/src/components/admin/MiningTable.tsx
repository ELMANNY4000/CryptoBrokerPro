import { MiningWorker, MiningReward } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice, formatNumber } from "@/lib/utils";
import { MINING_CONSTANTS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Activity } from "lucide-react";

interface MiningTableProps {
  workers: MiningWorker[];
  rewards: MiningReward[];
}

export function MiningTable({ workers, rewards }: MiningTableProps) {
  // Calculate total hashrate
  const totalHashrate = workers.reduce((total, worker) => total + (worker.isActive ? worker.hashrate : 0), 0);
  const totalRewards = rewards.reduce((total, reward) => total + reward.amount, 0);
  
  // Get most recent rewards
  const recentRewards = [...rewards]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  return (
    <Tabs defaultValue="workers">
      <TabsList>
        <TabsTrigger value="workers">Mining Workers</TabsTrigger>
        <TabsTrigger value="rewards">Rewards History</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="workers" className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Hashrate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No mining workers found
                </TableCell>
              </TableRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>{worker.id}</TableCell>
                  <TableCell>{worker.userId}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{formatNumber(worker.hashrate)} {MINING_CONSTANTS.HASHRATE_UNIT}</TableCell>
                  <TableCell>
                    {worker.isActive ? (
                      <Badge variant="outline" className="bg-green-900/20 text-green-500 border-0">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-neutral-700/20 text-neutral-400 border-0">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(worker.lastSeen)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="rewards" className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentRewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No mining rewards found
                </TableCell>
              </TableRow>
            ) : (
              recentRewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.id}</TableCell>
                  <TableCell>{reward.userId}</TableCell>
                  <TableCell>{reward.amount.toFixed(8)} BTC</TableCell>
                  <TableCell>{formatPrice(reward.amount * 84000)}</TableCell>
                  <TableCell>{formatDate(reward.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="stats" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hashrate</CardTitle>
              <Activity className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalHashrate)} {MINING_CONSTANTS.HASHRATE_UNIT}</div>
              <p className="text-xs text-neutral-500 mt-1">
                Across {workers.filter(w => w.isActive).length} active workers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
              <Coins className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRewards.toFixed(8)} BTC</div>
              <p className="text-xs text-neutral-500 mt-1">
                {rewards.length} rewards distributed
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}