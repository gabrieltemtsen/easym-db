
import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const otpKey = `auth:otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    console.log('Stored OTP:', storedOtp);
    console.log('Provided OTP:', otp);

    console.log('Comparing OTPs:', storedOtp === otp);

    if (storedOtp != otp) {
      return res.status(401).json({ success: false, error: 'Invalid OTPs' });
    }

    await redis.del(otpKey);

    const tokenKey = `auth:token:${email}`;
    const token = await redis.get(tokenKey);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Error verifying OTP in Redis:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
