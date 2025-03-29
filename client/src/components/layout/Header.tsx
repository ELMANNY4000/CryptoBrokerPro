import { useState } from "react";
import { Bell, Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";

interface HeaderProps {
  title?: string;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
}

const Header = ({ 
  title = "Dashboard Overview",
  isSidebarOpen = false,
  setIsSidebarOpen
}: HeaderProps) => {
  const [, navigate] = useLocation();
  const [isRootPath] = useRoute("/");
  
  const goBack = () => {
    window.history.back();
  };
  
  const toggleSidebar = () => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };
  
  return (
    <header className="bg-secondary h-16 border-b border-neutral-400 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button 
          className="md:hidden mr-4 text-neutral-200 hover:text-white"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {!isRootPath && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 text-neutral-200 hover:text-white"
            onClick={goBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-neutral-200 hover:text-white">
          <Bell className="h-6 w-6" />
        </button>
        <Button
          variant="outline"
          className="px-4 py-1.5 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
          onClick={() => navigate("/wallet")}
        >
          Deposit
        </Button>
      </div>
    </header>
  );
};

export default Header;
