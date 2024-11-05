import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Configuration for the token bucket
const BUCKET_KEY = "rate_limit_bucket";
const BUCKET_CAPACITY = 10; // Maximum tokens
const REFILL_RATE = 1; // Tokens per second

// Helper function to refill tokens
async function refillBucket() {
  const lastRefill =
    (await redis.get<number>(`${BUCKET_KEY}:lastRefill`)) || Date.now();
  const tokens = (await redis.get<number>(BUCKET_KEY)) || BUCKET_CAPACITY;

  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000; // time in seconds

  const newTokens = Math.min(tokens + elapsed * REFILL_RATE, BUCKET_CAPACITY);
  await redis.set(BUCKET_KEY, newTokens);
  await redis.set(`${BUCKET_KEY}:lastRefill`, now);
  return newTokens;
}

// Main rate-limiting logic
export async function GET() {
  await refillBucket(); // Refill tokens if necessary

  const tokens = (await redis.get<number>(BUCKET_KEY)) || BUCKET_CAPACITY;
  if (tokens >= 1) {
    await redis.decr(BUCKET_KEY); // Decrease token count
    return NextResponse.json({
      message: "Request successful!",
      remainingTokens: tokens - 1,
    });
  } else {
    return NextResponse.json(
      { message: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
}
