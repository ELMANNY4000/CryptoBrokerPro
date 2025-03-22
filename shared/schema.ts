import { pgTable, text, serial, doublePrecision, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Portfolio schema (user's crypto holdings)
export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  coinId: text("coin_id").notNull(), // CoinGecko API coin ID
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioAssetSchema = createInsertSchema(portfolioAssets).omit({
  id: true,
  updatedAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'buy', 'sell', 'deposit', 'withdraw', 'mining_reward'
  coinId: text("coin_id").notNull(),
  symbol: text("symbol").notNull(),
  amount: doublePrecision("amount").notNull(),
  price: doublePrecision("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

// Mining workers schema
export const miningWorkers = pgTable("mining_workers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  hashrate: doublePrecision("hashrate").notNull(), // in MH/s
  isActive: boolean("is_active").notNull().default(true),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

export const insertMiningWorkerSchema = createInsertSchema(miningWorkers).omit({
  id: true,
  lastSeen: true,
});

// Mining rewards schema
export const miningRewards = pgTable("mining_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(), // Amount of BTC
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMiningRewardSchema = createInsertSchema(miningRewards).omit({
  id: true,
  timestamp: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PortfolioAsset = typeof portfolioAssets.$inferSelect;
export type InsertPortfolioAsset = z.infer<typeof insertPortfolioAssetSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type MiningWorker = typeof miningWorkers.$inferSelect;
export type InsertMiningWorker = z.infer<typeof insertMiningWorkerSchema>;

export type MiningReward = typeof miningRewards.$inferSelect;
export type InsertMiningReward = z.infer<typeof insertMiningRewardSchema>;

// API response types
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}
