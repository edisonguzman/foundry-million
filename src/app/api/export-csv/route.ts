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

  // Define CSV Headers including the AI data
  const headers = [
    "Tile Index", 
    "Business Name", 
    "Tagline",
    "Concept",
    "Problem", 
    "Status", 
    "Owner Email", 
    "Upvotes", 
    "Created At",
    "Business Plan (JSON)",
    "Marketing Plan (JSON)"
  ];

  // Map data to CSV rows, stringifying JSON and escaping commas/quotes inside text fields
  const rows = data.map((idea) => {
    // Safely stringify the JSON plans if they exist
    const bPlanString = idea.businessPlan ? JSON.stringify(idea.businessPlan) : "";
    const mPlanString = idea.marketingPlan ? JSON.stringify(idea.marketingPlan) : "";

    return [
      idea.tileIndex,
      `"${(idea.businessName || "").replace(/"/g, '""')}"`,
      `"${(idea.tagline || "").replace(/"/g, '""')}"`,
      `"${(idea.concept || "").replace(/"/g, '""')}"`,
      `"${(idea.problem || "").replace(/"/g, '""')}"`,
      idea.status,
      idea.ownerEmail || "",
      idea.upvotes,
      idea.createdAt.toISOString(),
      `"${bPlanString.replace(/"/g, '""')}"`,
      `"${mPlanString.replace(/"/g, '""')}"`
    ];
  });

  // Join headers and rows
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