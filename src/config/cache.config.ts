import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT!, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: 300, // 5 دقیقه پیش‌فرض
  max: 1000, // حداکثر 1000 آیتم در کش
}));