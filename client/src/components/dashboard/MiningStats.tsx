import { useQuery } from "@tanstack/react-query";
import { MiningWorker, MiningReward } from "@shared/schema";
import { useMining } from "@/hooks/useMining";
import { useCryptoData } from "@/hooks/useCryptoData";
import { formatNumber } from "@/lib/utils";

const MiningStats = () => {
  const { 
    workers, 
    rewards, 
    isLoading,
    totalHashrate,
    activeWorkerCount,
    totalWorkerCount,
    dailyEarnings
  } = useMining();
  
  const { data: bitcoinData } = useCryptoData("bitcoin");
  
  if (isLoading) {
    return (
      <div className="bg-secondary rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="p-4 border-b border-neutral-400">
          <div className="h-6 bg-neutral-500 rounded w-1/2"></div>
        </div>
        <div className="p-4">
          <div className="h-28 bg-neutral-500 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-neutral-500 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate USD value of bitcoin earnings
  const earningsInUsd = bitcoinData ? dailyEarnings * bitcoinData.current_price : 0;
  
  return (
    <div className="bg-secondary rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-400">
        <h3 className="font-semibold text-lg">Mining Stats</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-neutral-500 rounded-lg p-3">
            <div className="text-sm text-neutral-300">Active Workers</div>
            <div className="text-xl font-medium">{activeWorkerCount}</div>
          </div>
          <div className="bg-neutral-500 rounded-lg p-3">
            <div className="text-sm text-neutral-300">Hashrate</div>
            <div className="text-xl font-medium">{formatNumber(totalHashrate)} MH/s</div>
          </div>
        </div>
        
        <div className="bg-neutral-500 rounded-lg p-3 mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-300">24h Earnings</span>
            <span className="text-sm font-medium">{dailyEarnings.toFixed(8)} BTC</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-300">7d Earnings</span>
            <span className="text-sm font-medium">{(dailyEarnings * 7).toFixed(8)} BTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-300">30d Earnings</span>
            <span className="text-sm font-medium">{(dailyEarnings * 30).toFixed(8)} BTC</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Workers Status</span>
            <span className={`text-xs ${
              activeWorkerCount === totalWorkerCount && activeWorkerCount > 0
                ? 'bg-positive'
                : activeWorkerCount === 0
                  ? 'bg-negative'
                  : 'bg-yellow-500'
            } px-2 py-0.5 rounded-full`}>
              {activeWorkerCount === totalWorkerCount && activeWorkerCount > 0
                ? 'All Online'
                : activeWorkerCount === 0
                  ? 'All Offline'
                  : `${activeWorkerCount}/${totalWorkerCount} Online`}
            </span>
          </div>
          
          <div className="space-y-2">
            {workers?.slice(0, 3).map((worker) => (
              <div key={worker.id} className="bg-neutral-500 rounded p-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 ${worker.isActive ? 'bg-positive' : 'bg-negative'} rounded-full`}></div>
                    <span className="ml-2 text-sm">{worker.name}</span>
                  </div>
                  <span className="text-xs font-mono">{worker.hashrate.toFixed(0)} MH/s</span>
                </div>
                <div className="mt-1 h-1.5 bg-neutral-400 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${worker.isActive ? 'bg-primary' : 'bg-neutral-300'}`} 
                    style={{ width: `${Math.min((worker.hashrate / 120) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded font-medium"
          onClick={() => window.location.href = '/mining'}
        >
          Mining Dashboard
        </button>
      </div>
    </div>
  );
};

export default MiningStats;
