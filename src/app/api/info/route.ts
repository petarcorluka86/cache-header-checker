import { Info, parseCacheControl } from "@/model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  // Basic URL validation + limit to http/https
  if (!url) {
    return NextResponse.json(
      { error: "Missing required 'url' query parameter." },
      { status: 400 }
    );
  }
  let target: URL;
  try {
    target = new URL(url);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      throw new Error("Only http and https URLs are allowed.");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid 'url' parameter. Must be a valid http/https URL." },
      { status: 400 }
    );
  }

  try {
    // Using GET since HEAD is not supported by all servers.
    // Add common headers that APIs expect to avoid blocking
    const response = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "Fastly-Debug": "1",
        "User-Agent": "sofa-fetch",
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch URL. Server returned status ${response.status}: ${response.statusText}`,
        },
        { status: response.status >= 500 ? 502 : 400 }
      );
    }

    const headers = response.headers;
    const cacheControl = headers.get("cache-control");
    const ageHeader = headers.get("age");
    const expiresHeader = headers.get("expires");
    const cc = parseCacheControl(cacheControl);
    const age = ageHeader ? Number.parseInt(ageHeader, 10) || 0 : 0;

    let maxServerLifetime = undefined;
    if (typeof cc["s-maxage"] === "string") {
      maxServerLifetime = Number.parseInt(cc["s-maxage"] as string, 10);
    }

    let maxBrowserLifetime;
    if (typeof cc["max-age"] === "string") {
      maxBrowserLifetime = Number.parseInt(cc["max-age"] as string, 10) || 0;
    }

    const isCached =
      !!cacheControl ||
      !!ageHeader ||
      !!maxServerLifetime ||
      !!maxBrowserLifetime ||
      !!expiresHeader;

    let timeLeft;
    if (maxServerLifetime) {
      timeLeft = Math.max(maxServerLifetime - age, 0);
    } else if (maxBrowserLifetime) {
      timeLeft = Math.max(maxBrowserLifetime - age, 0);
    }

    const info: Info = {
      url: target.toString(),
      isCached,
      age,
      maxServerLifetime,
      maxBrowserLifetime,
      timeLeft,
    };

    return NextResponse.json(info);
  } catch (error: unknown) {
    console.error("Error fetching URL in /api/info:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: `Failed to fetch the target URL or read its headers: ${errorMessage}`,
      },
      { status: 502 }
    );
  }
}
