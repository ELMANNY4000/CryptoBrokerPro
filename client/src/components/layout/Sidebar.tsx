import { useState } from "react";
import { Link } from "wouter";
import { 
  BarChart2, 
  RefreshCcw, 
  Zap, 
  Wallet, 
  Layers, 
  Settings, 
  X, 
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

const Sidebar = ({ currentPath }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: <BarChart2 className="h-5 w-5 mr-3" /> },
    { path: "/trading", label: "Trading", icon: <RefreshCcw className="h-5 w-5 mr-3" /> },
    { path: "/mining", label: "Mining", icon: <Zap className="h-5 w-5 mr-3" /> },
    { path: "/wallet", label: "Wallet", icon: <Wallet className="h-5 w-5 mr-3" /> },
    { path: "/portfolio", label: "Portfolio", icon: <Layers className="h-5 w-5 mr-3" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5 mr-3" /> },
  ];
  
  const closeSidebar = () => setIsOpen(false);
  
  return (
    <div 
      className={`fixed md:relative w-64 h-screen bg-secondary shadow-lg z-30 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        transition-transform duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-neutral-400">
          <h1 className="text-xl font-bold text-white">
            <span className="text-primary">Crypto</span>Trader
          </h1>
          <button 
            className="md:hidden text-neutral-200 hover:text-white"
            onClick={closeSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="py-4 flex-grow custom-scrollbar overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li className="mb-1" key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={`flex items-center px-4 py-3 rounded-sm mx-2
                      ${currentPath === item.path 
                        ? "text-white bg-primary" 
                        : "text-neutral-200 hover:bg-neutral-500"
                      }`}
                    onClick={closeSidebar}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-neutral-400">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              DE
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Demo User</p>
              <p className="text-xs text-neutral-300">demo@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
