// Theme colors
export const COIN_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  BNB: '#F3BA2F',
  XRP: '#8DC351',
  ADA: '#345D9D',
  DOGE: '#C2A633',
  DOT: '#E6007A',
  UNI: '#FF007A',
  SOL: '#14F195',
  LINK: '#2A5ADA',
  LTC: '#BFBBBB',
  BCH: '#8DC351',
  MATIC: '#8247E5',
  DEFAULT: '#A7B1BC'
};

// Chart time periods
export const TIME_PERIODS = [
  { value: "1", label: "1h" },
  { value: "24", label: "24h" },
  { value: "7", label: "1w" },
  { value: "30", label: "1m" },
  { value: "365", label: "1y" }
];

// Transaction types
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  MINING_REWARD: 'mining_reward'
};

// App routes
export const ROUTES = {
  DASHBOARD: '/',
  TRADING: '/trading',
  MINING: '/mining',
  WALLET: '/wallet',
  PORTFOLIO: '/portfolio',
  SETTINGS: '/settings'
};

// API endpoints
export const API_ENDPOINTS = {
  MARKETS: '/api/crypto/markets',
  CHART: (coinId: string) => `/api/crypto/${coinId}/chart`,
  COIN: (coinId: string) => `/api/crypto/${coinId}`,
  PORTFOLIO: '/api/portfolio',
  TRANSACTIONS: '/api/transactions',
  MINING_WORKERS: '/api/mining/workers',
  MINING_REWARDS: '/api/mining/rewards',
  USER: '/api/user'
};

// Default coin IDs for top cryptocurrencies
export const DEFAULT_COINS = [
  'bitcoin',
  'ethereum',
  'tether',
  'binancecoin',
  'ripple',
  'cardano',
  'solana',
  'polkadot',
  'dogecoin',
  'avalanche-2'
];

// Trading fee percentage
export const TRADING_FEE_PERCENTAGE = 0.003; // 0.3%

// Mining simulation constants
export const MINING_CONSTANTS = {
  HASHRATE_MULTIPLIER: 0.00001,
  RANDOM_FACTOR: 0.5,
  MIN_HASHRATE: 10,
  MAX_HASHRATE: 200
};
