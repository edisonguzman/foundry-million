import { pgTable, serial, text, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  tileIndex: integer("tile_index").unique().notNull(),
  problem: text("problem").notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  tagline: text("tagline"), 
  concept: text("concept"),
  logoUrl: text("logo_url"), 
  
  // Tiers and Ownership
  tier: integer("tier").default(1),
  ownerEmail: varchar("owner_email", { length: 255 }),
  
  // The Forge Engine Data
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  businessPlan: jsonb("business_plan"),
  marketingPlan: jsonb("marketing_plan"),
  
  // Community Voting
  upvotes: integer("upvotes").default(0).notNull(), 
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});