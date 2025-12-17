import { Info } from "@/model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing required 'url' query parameter." },
      { status: 400 }
    );
  }

  const info: Info = {
    url,
    isCached: true,
    age: 120, // seconds
    maxServerLifetime: 3600, // seconds
    maxBrowserLifetime: 600, // seconds
    timeLeft: 480, // seconds
  };

  // hardcoded example payload matching Info interface, echoing back url param
  return NextResponse.json(info);
}
