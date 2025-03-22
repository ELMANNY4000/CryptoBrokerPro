import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to user-friendly string
export function formatPrice(price: number, compact: boolean = false): string {
  if (isNaN(price)) return "$0.00";
  
  if (compact) {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
      })}`;
    }
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
      })}`;
    }
    return `$${price.toLocaleString('en-US', { 
      minimumFractionDigits: price < 0.01 ? 6 : 4, 
      maximumFractionDigits: price < 0.01 ? 6 : 4
    })}`;
  }
  
  return `$${price.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: price < 1 ? 6 : 2
  })}`;
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2
  });
}

// Format date to user-friendly string
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format percentage
export function formatPercentage(percent: number): string {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

// Shorthand number (K, M, B)
export function shortenNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  } 
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } 
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

// Shorten wallet address
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// Calculate percentage change
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}
