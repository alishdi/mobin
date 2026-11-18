import { registerAs } from '@nestjs/config';

export default registerAs('encryption', () => ({
  key: process.env.ENCRYPTION_KEY,
  algorithm: 'aes-256-cbc',
}));