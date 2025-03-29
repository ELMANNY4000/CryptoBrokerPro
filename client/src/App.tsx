import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import Dashboard from "@/pages/Dashboard";
import Trading from "@/pages/Trading";
import Mining from "@/pages/Mining";
import Wallet from "@/pages/Wallet";
import Portfolio from "@/pages/Portfolio";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on an admin route
  const isAdminRoute = location.startsWith("/admin");
  
  // For admin routes, render without the sidebar and header
  if (isAdminRoute) {
    return (
      <div className="bg-background text-foreground">
        <main>
          <Switch>
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Toaster />
      </div>
    );
  }
  
  // Get the page title based on current location
  const getPageTitle = () => {
    switch (true) {
      case location === "/":
        return "Dashboard Overview";
      case location === "/trading":
        return "Trading Platform";
      case location === "/mining":
        return "Mining Dashboard";
      case location === "/wallet":
        return "Wallet & Deposits";
      case location === "/portfolio":
        return "Portfolio Management";
      case location === "/settings":
        return "Account Settings";
      default:
        return "Trading Desk";
    }
  };

  // For non-admin routes, render with the sidebar and header
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar currentPath={location} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title={getPageTitle()} />
        
        <main className="flex-1 overflow-y-auto bg-background p-4">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/trading" component={Trading} />
            <Route path="/mining" component={Mining} />
            <Route path="/wallet" component={Wallet} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
