import { NextResponse } from "next/server";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const conditions = [];

  // Parse and apply date filters if provided
  if (startDate) {
    conditions.push(gte(ideas.createdAt, new Date(startDate)));
  }
  if (endDate) {
    // Add 1 day to the end date to ensure it includes the full day's generation
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    conditions.push(lte(ideas.createdAt, end));
  }

  // Fetch from Neon database
  const data = await db
    .select()
    .from(ideas)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Define CSV Headers
  const headers = [
    "Tile Index", 
    "Business Name", 
    "Problem", 
    "Status", 
    "Owner Email", 
    "Upvotes", 
    "Created At"
  ];

  // Map data to CSV rows, escaping commas and quotes inside text fields
  const rows = data.map((idea) => [
    idea.tileIndex,
    `"${(idea.businessName || "").replace(/"/g, '""')}"`,
    `"${(idea.problem || "").replace(/"/g, '""')}"`,
    idea.status,
    idea.ownerEmail || "",
    idea.upvotes,
    idea.createdAt.toISOString()
  ]);

  // Join everything together
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="FoundryMillion_Tiles_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}