// lib/redis.ts
import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 500,
    lazyConnect: true,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Prevent crashes if Redis is down
redis.on('error', (err) => {
  // Silent in development unless specifically needed
  if (process.env.NODE_ENV === 'development') {
    // console.warn('Redis connection failed, continuing without cache.')
  }
})

// Rate limiting helper
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const now = Date.now()
    const windowKey = `rl:${key}:${Math.floor(now / (windowSeconds * 1000))}`

    const current = await redis.incr(windowKey)
    if (current === 1) {
      await redis.expire(windowKey, windowSeconds)
    }

    const ttl = await redis.ttl(windowKey)
    const reset = now + ttl * 1000

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
      reset,
    }
  } catch {
    // If Redis is down, allow the request
    return { success: true, remaining: 1, reset: 0 }
  }
}

// Cooldown helper
export async function cooldown(
  key: string,
  cooldownSeconds: number
): Promise<{ success: boolean; waitSeconds: number }> {
  try {
    const cdKey = `cd:${key}`
    const exists = await redis.exists(cdKey)

    if (exists) {
      const ttl = await redis.ttl(cdKey)
      return { success: false, waitSeconds: ttl }
    }

    await redis.set(cdKey, '1', 'EX', cooldownSeconds)
    return { success: true, waitSeconds: 0 }
  } catch {
    return { success: true, waitSeconds: 0 }
  }
}
