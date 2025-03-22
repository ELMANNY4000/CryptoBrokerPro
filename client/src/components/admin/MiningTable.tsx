import { MiningWorker, MiningReward } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";

interface MiningTableProps {
  workers: MiningWorker[];
  rewards: MiningReward[];
}

export function MiningTable({ workers, rewards }: MiningTableProps) {
  return (
    <Tabs defaultValue="workers">
      <TabsList>
        <TabsTrigger value="workers">Mining Workers</TabsTrigger>
        <TabsTrigger value="rewards">Mining Rewards</TabsTrigger>
      </TabsList>
      
      <TabsContent value="workers" className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Hashrate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Efficiency</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No mining workers found
                </TableCell>
              </TableRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>{worker.id}</TableCell>
                  <TableCell>{worker.userId}</TableCell>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.hashrate} MH/s</TableCell>
                  <TableCell>
                    <Badge variant={worker.active ? "success" : "destructive"}>
                      {worker.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{worker.efficiency}%</TableCell>
                  <TableCell>{formatDate(worker.lastActivity)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="rewards" className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount (BTC)</TableHead>
              <TableHead>Value (USD)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No mining rewards found
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.id}</TableCell>
                  <TableCell>{reward.userId}</TableCell>
                  <TableCell>{reward.amount.toFixed(8)}</TableCell>
                  <TableCell>{formatPrice(reward.valueUsd)}</TableCell>
                  <TableCell>{formatDate(reward.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}