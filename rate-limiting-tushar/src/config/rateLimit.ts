import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redisDB";

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"), // This will perform 5 request within 1 min.
});

export default rateLimit;
