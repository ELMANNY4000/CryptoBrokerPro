import { useQuery } from "@tanstack/react-query";
import { MiningWorker, MiningReward } from "@shared/schema";

export function useMining() {
  // Fetch mining workers
  const { 
    data: workers, 
    isLoading: isLoadingWorkers, 
    error: workersError 
  } = useQuery<MiningWorker[]>({
    queryKey: ["/api/mining/workers"],
  });
  
  // Fetch mining rewards
  const { 
    data: rewards, 
    isLoading: isLoadingRewards, 
    error: rewardsError 
  } = useQuery<MiningReward[]>({
    queryKey: ["/api/mining/rewards"],
  });
  
  // Calculate total hashrate
  const calculateTotalHashrate = () => {
    if (!workers) return 0;
    
    return workers.reduce((total, worker) => {
      return worker.isActive ? total + worker.hashrate : total;
    }, 0);
  };
  
  const totalHashrate = calculateTotalHashrate();
  
  // Calculate active workers count
  const activeWorkerCount = workers?.filter(worker => worker.isActive).length || 0;
  const totalWorkerCount = workers?.length || 0;
  
  // Calculate daily earnings (24h)
  const calculateDailyEarnings = () => {
    if (!rewards) return 0;
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentRewards = rewards.filter(reward => 
      new Date(reward.timestamp) >= oneDayAgo
    );
    
    return recentRewards.reduce((total, reward) => total + reward.amount, 0);
  };
  
  const dailyEarnings = calculateDailyEarnings();
  
  // Calculate weekly earnings (7d)
  const calculateWeeklyEarnings = () => {
    if (!rewards) return 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRewards = rewards.filter(reward => 
      new Date(reward.timestamp) >= sevenDaysAgo
    );
    
    return recentRewards.reduce((total, reward) => total + reward.amount, 0);
  };
  
  const weeklyEarnings = calculateWeeklyEarnings();
  
  // Calculate monthly earnings (30d)
  const calculateMonthlyEarnings = () => {
    if (!rewards) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRewards = rewards.filter(reward => 
      new Date(reward.timestamp) >= thirtyDaysAgo
    );
    
    return recentRewards.reduce((total, reward) => total + reward.amount, 0);
  };
  
  const monthlyEarnings = calculateMonthlyEarnings();
  
  // Calculate projected earnings
  const calculateProjectedEarnings = () => {
    if (dailyEarnings === 0) return 0;
    
    return dailyEarnings * 30; // 30 days projection
  };
  
  const projectedMonthlyEarnings = calculateProjectedEarnings();
  
  return {
    workers,
    rewards,
    totalHashrate,
    activeWorkerCount,
    totalWorkerCount,
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
    projectedMonthlyEarnings,
    isLoading: isLoadingWorkers || isLoadingRewards,
    error: workersError || rewardsError
  };
}
