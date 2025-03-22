import React from "react";

interface CoinIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
}

const CoinIcon: React.FC<CoinIconProps> = ({ symbol, size = "md" }) => {
  // Get the color for each coin
  const getCoinColor = (symbol: string) => {
    const colors: Record<string, string> = {
      "BTC": "#F7931A",
      "ETH": "#627EEA",
      "USDT": "#26A17B",
      "BNB": "#F3BA2F",
      "XRP": "#8DC351",
      "ADA": "#345D9D",
      "DOT": "#E6007A",
      "DOGE": "#C2A633",
      "UNI": "#FF007A",
      "LINK": "#2A5ADA",
      "SOL": "#14F195",
      "LTC": "#BFBBBB",
      "BCH": "#8DC351",
      "MATIC": "#8247E5",
    };
    
    return colors[symbol] || "#A7B1BC";
  };
  
  // Determine size class
  const sizeClass = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }[size];
  
  const normalizedSymbol = symbol.toUpperCase();
  const bgColor = getCoinColor(normalizedSymbol);
  
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold`}
      style={{ backgroundColor: bgColor }}
    >
      {normalizedSymbol.substring(0, 3)}
    </div>
  );
};

export default CoinIcon;
