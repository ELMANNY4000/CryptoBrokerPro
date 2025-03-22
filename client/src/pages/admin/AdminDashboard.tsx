import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { UsersTable } from "../../components/admin/UsersTable";
import { TransactionsTable } from "../../components/admin/TransactionsTable";
import { AssetsTable } from "../../components/admin/AssetsTable";
import { MiningTable } from "../../components/admin/MiningTable";
import { DashboardStats } from "../../components/admin/DashboardStats";
import { Users, Clock, Wallet, Coins, BarChart3, LogOut, Settings } from "lucide-react";

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for admin authentication
    const token = localStorage.getItem("adminAuth");
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to access the admin panel",
        variant: "destructive",
      });
      setLocation("/admin/login");
      return;
    }
    
    setAdminToken(token);
  }, [setLocation, toast]);
  
  // Initialize requestHeaders with an empty object that meets Record<string, string> requirements
  const requestHeaders: Record<string, string> = {};
  
  // Add Authorization only if adminToken exists
  if (adminToken) {
    requestHeaders.Authorization = adminToken;
  }
  
  // Fetch admin data (users, transactions, etc.)
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }
      
      const response = await fetch("/api/admin/users", { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session expired",
            description: "Please login again",
            variant: "destructive",
          });
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("adminUser");
          setLocation("/admin/login");
        }
        throw new Error("Failed to fetch users");
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/admin/transactions"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }
      
      const response = await fetch("/api/admin/transactions", { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });
  
  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["/api/admin/portfolio"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }
      
      const response = await fetch("/api/admin/portfolio", { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio assets");
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });
  
  const { data: workers, isLoading: isLoadingWorkers } = useQuery({
    queryKey: ["/api/admin/mining/workers"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }
      
      const response = await fetch("/api/admin/mining/workers", { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch mining workers");
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });
  
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["/api/admin/mining/rewards"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }
      
      const response = await fetch("/api/admin/mining/rewards", { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch mining rewards");
      }
      
      return response.json();
    },
    enabled: !!adminToken,
  });
  
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation("/admin/login");
  };

  // Calculate stats
  const stats = {
    totalUsers: users?.length || 0,
    totalTransactions: transactions?.length || 0,
    totalAssets: assets?.length || 0,
    totalWorkers: workers?.length || 0,
    totalRewards: rewards?.length || 0,
    recentTransactions: transactions?.slice(0, 5) || [],
  };
  
  // Check if any data is still loading
  const isLoading = isLoadingUsers || isLoadingTransactions || isLoadingAssets || isLoadingWorkers || isLoadingRewards;
  
  if (!adminToken) {
    return null; // Don't render anything while checking auth
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 flex-col bg-secondary border-r border-neutral-700">
          <div className="p-4 border-b border-neutral-700">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-neutral-400">Crypto Platform</p>
          </div>
          
          <div className="flex-1 p-2">
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setLocation("/admin/dashboard")}>
                <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" /> Users
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Wallet className="mr-2 h-4 w-4" /> Assets
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" /> Transactions
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Coins className="mr-2 h-4 w-4" /> Mining
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </nav>
          </div>
          
          <div className="p-4 border-t border-neutral-700">
            <Button variant="ghost" className="w-full justify-start text-negative" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <Button variant="outline" className="md:hidden" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-neutral-600 rounded w-1/2 mb-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-neutral-600 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <DashboardStats stats={stats} />
          )}
          
          <Tabs defaultValue="users" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="assets">Portfolio</TabsTrigger>
              <TabsTrigger value="mining">Mining</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-neutral-600 rounded w-full animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <UsersTable users={users || []} requestHeaders={requestHeaders} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-neutral-600 rounded w-full animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <TransactionsTable transactions={transactions || []} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAssets ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-neutral-600 rounded w-full animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <AssetsTable assets={assets || []} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mining" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mining Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingWorkers || isLoadingRewards ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-neutral-600 rounded w-full animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <MiningTable workers={workers || []} rewards={rewards || []} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;