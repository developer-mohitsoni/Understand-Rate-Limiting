import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redisDB";

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"),
});

export default rateLimit;
