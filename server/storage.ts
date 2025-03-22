import {
  User,
  InsertUser,
  PortfolioAsset,
  InsertPortfolioAsset,
  Transaction,
  InsertTransaction,
  MiningWorker,
  InsertMiningWorker,
  MiningReward,
  InsertMiningReward
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  
  // Portfolio operations
  getPortfolioAssets(userId: number): Promise<PortfolioAsset[]>;
  getPortfolioAsset(userId: number, coinId: string): Promise<PortfolioAsset | undefined>;
  createOrUpdatePortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset>;
  getAllPortfolioAssets(): Promise<PortfolioAsset[]>;
  
  // Transaction operations
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(limit?: number): Promise<Transaction[]>;
  
  // Mining worker operations
  getMiningWorkers(userId: number): Promise<MiningWorker[]>;
  getMiningWorker(id: number): Promise<MiningWorker | undefined>;
  createMiningWorker(worker: InsertMiningWorker): Promise<MiningWorker>;
  updateMiningWorker(id: number, worker: Partial<InsertMiningWorker>): Promise<MiningWorker | undefined>;
  getAllMiningWorkers(): Promise<MiningWorker[]>;
  
  // Mining reward operations
  getMiningRewards(userId: number, limit?: number): Promise<MiningReward[]>;
  createMiningReward(reward: InsertMiningReward): Promise<MiningReward>;
  getAllMiningRewards(limit?: number): Promise<MiningReward[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolioAssets: Map<number, PortfolioAsset>;
  private transactions: Map<number, Transaction>;
  private miningWorkers: Map<number, MiningWorker>;
  private miningRewards: Map<number, MiningReward>;
  private userId: number;
  private portfolioAssetId: number;
  private transactionId: number;
  private miningWorkerId: number;
  private miningRewardId: number;

  constructor() {
    this.users = new Map();
    this.portfolioAssets = new Map();
    this.transactions = new Map();
    this.miningWorkers = new Map();
    this.miningRewards = new Map();
    
    this.userId = 1;
    this.portfolioAssetId = 1;
    this.transactionId = 1;
    this.miningWorkerId = 1;
    this.miningRewardId = 1;

    // Create a default user with some sample portfolio data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default user
    const defaultUser: InsertUser = {
      username: "demo",
      password: "password123", // In a real app, this would be hashed
      email: "demo@example.com",
      walletAddress: `0x${randomUUID().replace(/-/g, '')}`,
      role: "user"
    };

    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@example.com",
      walletAddress: `0x${randomUUID().replace(/-/g, '')}`,
      role: "admin"
    };

    const user = await this.createUser(defaultUser);
    await this.createUser(adminUser);

    // Create default portfolio assets
    const defaultAssets: InsertPortfolioAsset[] = [
      { userId: user.id, coinId: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.8642 },
      { userId: user.id, coinId: "ethereum", symbol: "ETH", name: "Ethereum", amount: 7.5421 },
      { userId: user.id, coinId: "tether", symbol: "USDT", name: "Tether", amount: 8500 },
      { userId: user.id, coinId: "binancecoin", symbol: "BNB", name: "Binance Coin", amount: 34.5721 }
    ];

    for (const asset of defaultAssets) {
      this.createOrUpdatePortfolioAsset(asset);
    }

    // Create default mining workers
    const defaultWorkers: InsertMiningWorker[] = [
      { userId: user.id, name: "Worker-01", hashrate: 92.0, isActive: true },
      { userId: user.id, name: "Worker-02", hashrate: 83.0, isActive: true },
      { userId: user.id, name: "Worker-03", hashrate: 70.0, isActive: true }
    ];

    for (const worker of defaultWorkers) {
      this.createMiningWorker(worker);
    }

    // Create some default transactions
    const defaultTransactions: InsertTransaction[] = [
      { userId: user.id, type: "mining_reward", coinId: "bitcoin", symbol: "BTC", amount: 0.00018, price: 29847.32 },
      { userId: user.id, type: "sell", coinId: "ethereum", symbol: "ETH", amount: -0.2, price: 1876.41 },
      { userId: user.id, type: "buy", coinId: "bitcoin", symbol: "BTC", amount: 0.0024, price: 29847.32 }
    ];

    for (const tx of defaultTransactions) {
      this.createTransaction(tx);
    }

    // Create some mining rewards
    const defaultRewards: InsertMiningReward[] = [
      { userId: user.id, amount: 0.00042 },
      { userId: user.id, amount: 0.00038 },
      { userId: user.id, amount: 0.00045 }
    ];

    for (const reward of defaultRewards) {
      this.createMiningReward(reward);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      id,
      username: user.username,
      password: user.password,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role || 'user', // Set default role to 'user' if not provided
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Portfolio operations
  async getPortfolioAssets(userId: number): Promise<PortfolioAsset[]> {
    return Array.from(this.portfolioAssets.values()).filter(
      (asset) => asset.userId === userId
    );
  }

  async getPortfolioAsset(userId: number, coinId: string): Promise<PortfolioAsset | undefined> {
    return Array.from(this.portfolioAssets.values()).find(
      (asset) => asset.userId === userId && asset.coinId === coinId
    );
  }

  async createOrUpdatePortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const existingAsset = await this.getPortfolioAsset(asset.userId, asset.coinId);
    
    if (existingAsset) {
      const updatedAsset: PortfolioAsset = {
        ...existingAsset,
        amount: asset.amount,
        updatedAt: new Date()
      };
      this.portfolioAssets.set(existingAsset.id, updatedAsset);
      return updatedAsset;
    } else {
      const id = this.portfolioAssetId++;
      const newAsset: PortfolioAsset = {
        ...asset,
        id,
        updatedAt: new Date()
      };
      this.portfolioAssets.set(id, newAsset);
      return newAsset;
    }
  }

  // Transaction operations
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Mining worker operations
  async getMiningWorkers(userId: number): Promise<MiningWorker[]> {
    return Array.from(this.miningWorkers.values()).filter(
      (worker) => worker.userId === userId
    );
  }

  async getMiningWorker(id: number): Promise<MiningWorker | undefined> {
    return this.miningWorkers.get(id);
  }

  async createMiningWorker(worker: InsertMiningWorker): Promise<MiningWorker> {
    const id = this.miningWorkerId++;
    const newWorker: MiningWorker = {
      id,
      name: worker.name,
      userId: worker.userId,
      hashrate: worker.hashrate,
      isActive: worker.isActive !== undefined ? worker.isActive : true, // Default to true if not provided
      lastSeen: new Date()
    };
    this.miningWorkers.set(id, newWorker);
    return newWorker;
  }

  async updateMiningWorker(id: number, workerData: Partial<InsertMiningWorker>): Promise<MiningWorker | undefined> {
    const existingWorker = await this.getMiningWorker(id);
    
    if (!existingWorker) {
      return undefined;
    }
    
    // Create new worker with explicit properties to ensure type safety
    const updatedWorker: MiningWorker = {
      id: existingWorker.id,
      name: workerData.name !== undefined ? workerData.name : existingWorker.name,
      userId: existingWorker.userId,
      hashrate: workerData.hashrate !== undefined ? workerData.hashrate : existingWorker.hashrate,
      isActive: workerData.isActive !== undefined ? workerData.isActive : existingWorker.isActive,
      lastSeen: new Date()
    };
    
    this.miningWorkers.set(id, updatedWorker);
    return updatedWorker;
  }

  // Mining reward operations
  async getMiningRewards(userId: number, limit?: number): Promise<MiningReward[]> {
    const userRewards = Array.from(this.miningRewards.values())
      .filter((reward) => reward.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userRewards.slice(0, limit) : userRewards;
  }

  async createMiningReward(reward: InsertMiningReward): Promise<MiningReward> {
    const id = this.miningRewardId++;
    const newReward: MiningReward = {
      ...reward,
      id,
      timestamp: new Date()
    };
    this.miningRewards.set(id, newReward);
    return newReward;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      role
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllPortfolioAssets(): Promise<PortfolioAsset[]> {
    return Array.from(this.portfolioAssets.values());
  }

  async getAllTransactions(limit?: number): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? allTransactions.slice(0, limit) : allTransactions;
  }

  async getAllMiningWorkers(): Promise<MiningWorker[]> {
    return Array.from(this.miningWorkers.values());
  }

  async getAllMiningRewards(limit?: number): Promise<MiningReward[]> {
    const allRewards = Array.from(this.miningRewards.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? allRewards.slice(0, limit) : allRewards;
  }
}

export const storage = new MemStorage();
