import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPortfolioAssetSchema, 
  insertTransactionSchema,
  insertMiningWorkerSchema,
  insertMiningRewardSchema
} from "@shared/schema";
import axios from "axios";
import { z } from "zod";

// Get CoinGecko API key from environment variables
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || "";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for cryptocurrency data
  
  // Get top cryptocurrencies market data
  app.get("/api/crypto/markets", async (req, res) => {
    try {
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
          x_cg_demo_api_key: COINGECKO_API_KEY
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Get price chart data for a specific coin
  app.get("/api/crypto/:coinId/chart", async (req, res) => {
    try {
      const { coinId } = req.params;
      const { days = "1" } = req.query;
      
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: "usd",
          days,
          x_cg_demo_api_key: COINGECKO_API_KEY
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Get single coin data
  app.get("/api/crypto/:coinId", async (req, res) => {
    try {
      const { coinId } = req.params;
      
      const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
          x_cg_demo_api_key: COINGECKO_API_KEY
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching coin data:", error);
      res.status(500).json({ message: "Failed to fetch coin data" });
    }
  });

  // User Routes
  
  // Get current user (for demo, we'll always return the default user)
  app.get("/api/user", async (_req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Portfolio Routes
  
  // Get user portfolio
  app.get("/api/portfolio", async (_req, res) => {
    try {
      // For demo, we'll use the default user
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const assets = await storage.getPortfolioAssets(user.id);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update portfolio asset
  app.post("/api/portfolio", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const assetData = insertPortfolioAssetSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const asset = await storage.createOrUpdatePortfolioAsset(assetData);
      res.json(asset);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });

  // Transaction Routes
  
  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactions(user.id, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Update portfolio with new transaction
      const existingAsset = await storage.getPortfolioAsset(user.id, transactionData.coinId);
      let newAmount = transactionData.amount;
      
      if (existingAsset) {
        newAmount += existingAsset.amount;
      }
      
      if (newAmount > 0) {
        await storage.createOrUpdatePortfolioAsset({
          userId: user.id,
          coinId: transactionData.coinId,
          symbol: transactionData.symbol,
          name: req.body.name, // Name should be provided in request
          amount: newAmount
        });
      } else if (existingAsset && newAmount <= 0) {
        // If transaction would reduce holdings to zero or negative, remove asset
        // (In a real implementation, you'd want to handle this differently)
        await storage.createOrUpdatePortfolioAsset({
          userId: user.id,
          coinId: transactionData.coinId,
          symbol: transactionData.symbol,
          name: existingAsset.name,
          amount: 0
        });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Mining Routes
  
  // Get mining workers
  app.get("/api/mining/workers", async (_req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const workers = await storage.getMiningWorkers(user.id);
      res.json(workers);
    } catch (error) {
      console.error("Error fetching mining workers:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create mining worker
  app.post("/api/mining/workers", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const workerData = insertMiningWorkerSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const worker = await storage.createMiningWorker(workerData);
      res.json(worker);
    } catch (error) {
      console.error("Error creating mining worker:", error);
      res.status(400).json({ message: "Invalid mining worker data" });
    }
  });

  // Update mining worker
  app.patch("/api/mining/workers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const worker = await storage.getMiningWorker(parseInt(id));
      
      if (!worker) {
        return res.status(404).json({ message: "Mining worker not found" });
      }
      
      const updateSchema = z.object({
        name: z.string().optional(),
        hashrate: z.number().optional(),
        isActive: z.boolean().optional()
      });
      
      const workerData = updateSchema.parse(req.body);
      const updatedWorker = await storage.updateMiningWorker(parseInt(id), workerData);
      
      res.json(updatedWorker);
    } catch (error) {
      console.error("Error updating mining worker:", error);
      res.status(400).json({ message: "Invalid mining worker data" });
    }
  });

  // Get mining rewards
  app.get("/api/mining/rewards", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const rewards = await storage.getMiningRewards(user.id, limit);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching mining rewards:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create mining reward (simulated mining payout)
  app.post("/api/mining/rewards", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const rewardData = insertMiningRewardSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const reward = await storage.createMiningReward(rewardData);
      
      // Also create a transaction for this mining reward
      await storage.createTransaction({
        userId: user.id,
        type: "mining_reward",
        coinId: "bitcoin",
        symbol: "BTC",
        amount: rewardData.amount,
        price: req.body.price // Current BTC price should be provided in request
      });
      
      // Update portfolio
      const existingAsset = await storage.getPortfolioAsset(user.id, "bitcoin");
      
      if (existingAsset) {
        await storage.createOrUpdatePortfolioAsset({
          userId: user.id,
          coinId: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          amount: existingAsset.amount + rewardData.amount
        });
      } else {
        await storage.createOrUpdatePortfolioAsset({
          userId: user.id,
          coinId: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          amount: rewardData.amount
        });
      }
      
      res.json(reward);
    } catch (error) {
      console.error("Error creating mining reward:", error);
      res.status(400).json({ message: "Invalid mining reward data" });
    }
  });

  // ADMIN ROUTES
  
  // Admin Authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password || user.role !== "admin") {
        return res.status(401).json({ message: "Invalid credentials or not an admin" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // In a real app, you would create a JWT token here
      res.json({ user: userWithoutPassword, authenticated: true });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Admin authentication middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      // For demo purposes, we'll use a simple admin check
      // In a real app, you'd verify a JWT token
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password || user.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      req.adminUser = user;
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Get all users
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords before sending
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all transactions
  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getAllTransactions(limit);
      
      // Enrich transactions with user data
      const enrichedTransactions = await Promise.all(
        transactions.map(async (tx) => {
          const user = await storage.getUser(tx.userId);
          return {
            ...tx,
            username: user ? user.username : 'Unknown User'
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all portfolio assets
  app.get("/api/admin/portfolio", requireAdmin, async (_req, res) => {
    try {
      const assets = await storage.getAllPortfolioAssets();
      
      // Enrich assets with user data
      const enrichedAssets = await Promise.all(
        assets.map(async (asset) => {
          const user = await storage.getUser(asset.userId);
          return {
            ...asset,
            username: user ? user.username : 'Unknown User'
          };
        })
      );
      
      res.json(enrichedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all mining workers
  app.get("/api/admin/mining/workers", requireAdmin, async (_req, res) => {
    try {
      const workers = await storage.getAllMiningWorkers();
      
      // Enrich workers with user data
      const enrichedWorkers = await Promise.all(
        workers.map(async (worker) => {
          const user = await storage.getUser(worker.userId);
          return {
            ...worker,
            username: user ? user.username : 'Unknown User'
          };
        })
      );
      
      res.json(enrichedWorkers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get all mining rewards
  app.get("/api/admin/mining/rewards", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const rewards = await storage.getAllMiningRewards(limit);
      
      // Enrich rewards with user data
      const enrichedRewards = await Promise.all(
        rewards.map(async (reward) => {
          const user = await storage.getUser(reward.userId);
          return {
            ...reward,
            username: user ? user.username : 'Unknown User'
          };
        })
      );
      
      res.json(enrichedRewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update user role
  app.patch("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      const updatedUser = await storage.updateUserRole(parseInt(userId), role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
