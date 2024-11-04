import { Context, Hono } from "hono";

import todos from "./utils/data.json" assert { type: "json" };
import { Ratelimit } from "@upstash/ratelimit";
import { BlankEnv, BlankInput } from "hono/types";
import { env } from "hono/adapter";
import { Redis } from "@upstash/redis/cloudflare";

declare module "hono" {
  interface ContextVariableMap {
    rateLimit: Ratelimit;
  }
}

const app = new Hono();

const cache = new Map();

class RedisRateLimiter {
  static instance: Ratelimit;

  static getInstance(c: Context<BlankEnv, "/todos/:id", BlankInput>) {
    if (!this.instance) {
      const { REDIS_URL, REDIS_TOKEN } = env<{
        REDIS_URL: string;
        REDIS_TOKEN: string;
      }>(c);

      const redisClient = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
      });

      const rateLimit = new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        ephemeralCache: cache,
      });

      this.instance = rateLimit;

      return this.instance;
    } else {
      return this.instance;
    }
  }
}

app.use(async (c, next) => {
  const rateLimit = RedisRateLimiter.getInstance(c);

  c.set("rateLimit", rateLimit);

  // Log the IP address for debugging
  const ip = c.req.raw.headers.get("CF-Connecting-IP") ?? "anonymous";
  console.log(`Incoming request from IP: ${ip}`);

  await next();
});
app.get("/todos/:id", async (c) => {
  const rateLimit = c.get("rateLimit");

  const ip = c.req.raw.headers.get("CF-Connecting-IP");

  console.log(`IP: ${ip}`);

  const { success } = await rateLimit.limit(ip ?? "anonymous");

  if (success) {
    const todoId = c.req.param("id");

    const todoIndex = Number(todoId);

    const todo = todos.todos[todoIndex] ?? {};

    return c.json(todo);
  } else {
    return c.json(
      {
        message: "Too many requests",
      },
      {
        status: 429,
      }
    );
  }
});

export default app;
