import { NextRequest, NextResponse } from "next/server";
import rateLimit from "./config/rateLimit";

export const middleware = async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  const result = await rateLimit.limit(ip);

  if (!result.success) {
    return NextResponse.json({ message: "Too Many Requests" }, { status: 429 });
  }

  return NextResponse.next();
};
