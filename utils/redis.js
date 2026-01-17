const { promisify } = require('util');

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => console.log(error.message));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    try {
      const getval = promisify(this.client.get).bind(this.client);
      const val = await getval(key);
      return val;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, val, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    const expireAsync = promisify(this.client.expire).bind(this.client);
    await setAsync(key, val);
    await expireAsync(key, duration);
  }

  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
