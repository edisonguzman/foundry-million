import { pgTable, serial, text, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  tileIndex: integer('tile_index').unique().notNull(), // The position on the Foundry Million grid
  problem: text('problem').notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  tagline: text('tagline'),
  concept: text('concept'),
  logoUrl: text('logo_url'),
  
  // Tiers: 1 ($10), 2 ($20), 3 ($50)
  tier: integer('tier').default(1),
  businessPlan: jsonb('business_plan'),
  marketingPlan: jsonb('marketing_plan'),
  
  ownerEmail: varchar('owner_email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});