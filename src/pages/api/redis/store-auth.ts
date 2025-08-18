
import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    await redis.set(otpKey, otp, { ex: 18000 }); // OTP expires in 5 hours
    await redis.set(tokenKey, token, { ex: 604800 }); // Token expires in 7 days

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing auth data in Redis:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
