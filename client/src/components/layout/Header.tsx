import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    const sidebar = document.querySelector('div[class^="fixed md:relative w-64"]');
    if (sidebar) {
      setIsSidebarOpen(!isSidebarOpen);
      sidebar.classList.toggle('-translate-x-full');
      sidebar.classList.toggle('translate-x-0');
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
        <h2 className="text-lg font-semibold">Dashboard Overview</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-neutral-200 hover:text-white">
          <Bell className="h-6 w-6" />
        </button>
        <Button
          variant="outline"
          className="px-4 py-1.5 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
        >
          Deposit
        </Button>
      </div>
    </header>
  );
};

export default Header;
