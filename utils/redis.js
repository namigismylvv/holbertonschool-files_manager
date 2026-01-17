const { promisify } = require('util');

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => console.log(error.message));
    this.connected = false;
    this.client.on('connect', () => {
      this.connected = true;
    });
    this.client.on('ready', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.client.connected && this.connected;
  }

  async get(key) {
    try {
      if (!this.client.connected) {
        return null;
      }
      const getval = promisify(this.client.get).bind(this.client);
      const val = await getval(key);
      return val;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, val, duration) {
    try {
      if (!this.client.connected) {
        return;
      }
      const setAsync = promisify(this.client.set).bind(this.client);
      const expireAsync = promisify(this.client.expire).bind(this.client);
      await setAsync(key, val);
      await expireAsync(key, duration);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key) {
    try {
      if (!this.client.connected) {
        return;
      }
      const delAsync = promisify(this.client.del).bind(this.client);
      await delAsync(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
