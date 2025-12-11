import { createClient } from 'redis';

let redisClient = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected');
  });

  await redisClient.connect();
  return redisClient;
}

export async function closeRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache helper functions
export async function getCache(key) {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

export async function setCache(key, value, ttl = 3600) {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis setCache error:', error);
    return false;
  }
}

export async function deleteCache(key) {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis deleteCache error:', error);
    return false;
  }
}

