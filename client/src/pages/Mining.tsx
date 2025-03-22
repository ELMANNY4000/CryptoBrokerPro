import { useQuery } from "@tanstack/react-query";
import { MiningWorker, MiningReward } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Zap, Plus, Play, Pause, BarChart, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCryptoData } from "@/hooks/useCryptoData";

const Mining = () => {
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerHashrate, setNewWorkerHashrate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { data: bitcoinData } = useCryptoData("bitcoin");
  
  const { data: workers, isLoading: isLoadingWorkers, refetch: refetchWorkers } = useQuery<MiningWorker[]>({
    queryKey: ["/api/mining/workers"]
  });
  
  const { data: rewards, isLoading: isLoadingRewards, refetch: refetchRewards } = useQuery<MiningReward[]>({
    queryKey: ["/api/mining/rewards"]
  });
  
  const handleAddWorker = async () => {
    if (!newWorkerName || !newWorkerHashrate) {
      toast({
        title: "Error",
        description: "Please provide both a name and hashrate for the worker",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/mining/workers", {
        name: newWorkerName,
        hashrate: parseFloat(newWorkerHashrate),
        isActive: true
      });
      
      toast({
        title: "Success",
        description: "Mining worker added successfully",
      });
      
      setNewWorkerName("");
      setNewWorkerHashrate("");
      setDialogOpen(false);
      refetchWorkers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mining worker",
        variant: "destructive"
      });
    }
  };
  
  const toggleWorkerStatus = async (worker: MiningWorker) => {
    try {
      await apiRequest("PATCH", `/api/mining/workers/${worker.id}`, {
        isActive: !worker.isActive
      });
      
      toast({
        title: "Success",
        description: `Worker ${worker.isActive ? "paused" : "started"}`,
      });
      
      refetchWorkers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update worker status",
        variant: "destructive"
      });
    }
  };
  
  const simulateMiningReward = async () => {
    if (!workers || !bitcoinData) return;
    
    const activeWorkers = workers.filter(w => w.isActive);
    if (activeWorkers.length === 0) {
      toast({
        title: "No active workers",
        description: "You need at least one active worker to mine",
        variant: "destructive"
      });
      return;
    }
    
    const totalHashrate = activeWorkers.reduce((sum, worker) => sum + worker.hashrate, 0);
    
    // Simple simulation - hashrate affects reward amount
    const rewardAmount = (totalHashrate / 1000) * 0.00001 * Math.random();
    
    try {
      await apiRequest("POST", "/api/mining/rewards", {
        amount: rewardAmount,
        price: bitcoinData.current_price || 30000 // Fallback price if API data isn't available
      });
      
      toast({
        title: "Mining Reward!",
        description: `You earned ${rewardAmount.toFixed(8)} BTC`,
      });
      
      refetchRewards();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process mining reward",
        variant: "destructive"
      });
    }
  };
  
  const totalHashrate = workers?.reduce((sum, worker) => {
    return worker.isActive ? sum + worker.hashrate : sum;
  }, 0) || 0;
  
  const activeWorkerCount = workers?.filter(w => w.isActive).length || 0;
  
  const totalRewards24h = rewards?.reduce((sum, reward) => {
    const rewardDate = new Date(reward.timestamp);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return rewardDate >= oneDayAgo ? sum + reward.amount : sum;
  }, 0) || 0;
  
  const totalRewards7d = rewards?.reduce((sum, reward) => {
    const rewardDate = new Date(reward.timestamp);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return rewardDate >= sevenDaysAgo ? sum + reward.amount : sum;
  }, 0) || 0;
  
  const totalRewards30d = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0;
  
  if (isLoadingWorkers || isLoadingRewards) {
    return <div className="p-8 text-center">Loading mining data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Mining Dashboard</h2>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            onClick={simulateMiningReward}
          >
            <Zap className="mr-2 h-4 w-4" />
            Simulate Mining
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Mining Worker</DialogTitle>
                <DialogDescription>
                  Add a new mining worker to increase your hashrate and earning potential.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="worker-name">Worker Name</Label>
                  <Input 
                    id="worker-name"
                    placeholder="e.g., Worker-04"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="worker-hashrate">Hashrate (MH/s)</Label>
                  <Input 
                    id="worker-hashrate"
                    type="number"
                    placeholder="e.g., 85"
                    value={newWorkerHashrate}
                    onChange={(e) => setNewWorkerHashrate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddWorker}>Add Worker</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkerCount} / {workers?.length}</div>
            <div className="text-xs text-neutral-300 mt-1">
              {activeWorkerCount === workers?.length 
                ? "All workers active" 
                : `${workers?.length && workers.length - activeWorkerCount} workers inactive`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Total Hashrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHashrate.toFixed(2)} MH/s</div>
            <div className="text-xs text-neutral-300 mt-1">
              {activeWorkerCount > 0 
                ? `${(totalHashrate / activeWorkerCount).toFixed(2)} MH/s per worker` 
                : "No active workers"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">24h Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards24h.toFixed(8)} BTC</div>
            <div className="text-xs text-neutral-300 mt-1">
              ≈ ${bitcoinData ? (totalRewards24h * bitcoinData.current_price).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Projected Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalRewards24h * 30).toFixed(8)} BTC
            </div>
            <div className="text-xs text-neutral-300 mt-1">
              Based on current 24h performance
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mining Workers</CardTitle>
              <CardDescription>
                Manage your mining hardware
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workers && workers.length > 0 ? (
                <div className="space-y-4">
                  {workers.map((worker) => (
                    <div key={worker.id} className="bg-neutral-500 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${worker.isActive ? "bg-positive" : "bg-negative"}`}></div>
                          <span className="ml-2 font-medium">{worker.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-mono mr-4">{worker.hashrate.toFixed(2)} MH/s</span>
                          <Button 
                            size="sm"
                            variant={worker.isActive ? "destructive" : "success"}
                            onClick={() => toggleWorkerStatus(worker)}
                          >
                            {worker.isActive ? (
                              <><Pause className="h-4 w-4 mr-1" /> Pause</>
                            ) : (
                              <><Play className="h-4 w-4 mr-1" /> Start</>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="h-2 bg-neutral-400 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${worker.isActive ? "bg-primary" : "bg-neutral-300"}`} 
                          style={{ width: `${(worker.hashrate / 120) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-neutral-300">
                        Last seen: {new Date(worker.lastSeen).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-300">No mining workers added yet.</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Worker
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mining Statistics</CardTitle>
            <CardDescription>
              Earnings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-neutral-500 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-neutral-300" />
                    <span className="text-sm text-neutral-300">24h Earnings</span>
                  </div>
                  <span className="text-sm font-medium font-mono">{totalRewards24h.toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-neutral-300" />
                    <span className="text-sm text-neutral-300">7d Earnings</span>
                  </div>
                  <span className="text-sm font-medium font-mono">{totalRewards7d.toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-neutral-300" />
                    <span className="text-sm text-neutral-300">30d Earnings</span>
                  </div>
                  <span className="text-sm font-medium font-mono">{totalRewards30d.toFixed(8)} BTC</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Rewards</h4>
                {rewards && rewards.length > 0 ? (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                    {rewards.slice(0, 10).map((reward) => (
                      <div key={reward.id} className="bg-neutral-500 rounded p-2 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-neutral-300">
                            {new Date(reward.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-positive">
                            +{reward.amount.toFixed(8)} BTC
                          </div>
                        </div>
                        <div className="text-xs">
                          ≈ ${bitcoinData ? (reward.amount * bitcoinData.current_price).toFixed(2) : "0.00"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-500 rounded p-4 text-center">
                    <p className="text-neutral-300">No mining rewards yet</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={simulateMiningReward}
                    >
                      Simulate Mining
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={simulateMiningReward}>
              <BarChart className="mr-2 h-4 w-4" />
              Generate Mining Reward
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Mining;
