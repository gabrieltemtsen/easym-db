
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp, token } = req.body;

  if (!email || !otp || !token) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const otpKey = `auth:otp:${email}`;
    const tokenKey = `auth:token:${email}`;

    await redis.set(otpKey, otp, { ex: 600 }); // OTP expires in 10 minutes
    await redis.set(tokenKey, token, { ex: 604800 }); // Token expires in 7 days

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing auth data in Redis:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
