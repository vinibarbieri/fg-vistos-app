// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Crie o cliente Redis e o Rate Limiter uma vez
const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests por 10 segundos
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Função para verificar o limite em uma API Route
export async function checkRateLimit() {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  return success;
}
