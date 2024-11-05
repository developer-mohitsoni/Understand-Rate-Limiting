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

// If you want to work this rate limiting for the particular route you can use s:-

// export const config = {
//     matcher: "/api/:path*" // This will work for all the routes under /api mainly which starts from /api
// }
