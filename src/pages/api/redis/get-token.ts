
import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const tokenKey = `auth:token:${email}`;
    const token = await redis.get(tokenKey);

    if (!token) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Error retrieving token from Redis:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
