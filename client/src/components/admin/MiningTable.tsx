import { MiningWorker, MiningReward } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

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
                  <TableCell>{worker.hashrate} MH/s</TableCell>
                  <TableCell>
                    <Badge variant={worker.isActive ? "default" : "destructive"}>
                      {worker.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(worker.lastSeen)}</TableCell>
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
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No mining rewards found
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.id}</TableCell>
                  <TableCell>{reward.userId}</TableCell>
                  <TableCell>{reward.amount.toFixed(8)}</TableCell>
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