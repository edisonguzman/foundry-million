import { pgTable, serial, text, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  tileIndex: integer('tile_index').unique().notNull(), // The specific pixel/tile on FoundryMillion.com
  problem: text('problem').notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  tagline: text('tagline'),
  concept: text('concept'),
  logoUrl: text('logo_url'),
  
  // Foundry Million Tiers
  tier: integer('tier').default(1), // 1: $10, 2: $20, 3: $50
  businessPlan: jsonb('business_plan'),
  marketingPlan: jsonb('marketing_plan'),
  
  ownerEmail: varchar('owner_email', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'paid', 'completed'
  createdAt: timestamp('created_at').defaultNow(),
});