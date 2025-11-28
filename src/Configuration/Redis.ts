import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(url: string = 'redis://localhost:6379') {
    this.client = createClient({ url });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });
    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> { 
    if (!this.isConnected) {
      await this.client.connect();
    }
  } 

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    await this.ensureConnected();
    if (expireInSeconds) {
      await this.client.setEx(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    await this.ensureConnected();
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.hGet(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    await this.ensureConnected();
    return await this.client.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.hDel(key, field);
  }

  async lPush(key: string, ...values: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.lPush(key, values);
  }

  async rPop(key: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.rPop(key);
  }

  async lLen(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.lLen(key);
  }

  async flushAll(): Promise<string> {
    await this.ensureConnected();
    return await this.client.flushAll();
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }
  
  getClient(): RedisClientType {
    return this.client;
  }
}

// สร้าง singleton instance
const redisClient = new RedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

export default redisClient;
export { RedisClient };
