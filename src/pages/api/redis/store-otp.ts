import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

type Body = {
  email?: string;
  otp?: string;
  ttlSeconds?: number; // optional override
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp, ttlSeconds }: Body = req.body ?? {};

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Default OTP expiry: 15 minutes. Allow caller override with sane bounds.
  const DEFAULT_TTL = 15 * 60; // 900s
  const MAX_TTL = 24 * 60 * 60; // 24h
  const MIN_TTL = 60; // 1m
  let ttl = Number.isFinite(ttlSeconds as number) ? Number(ttlSeconds) : DEFAULT_TTL;
  if (!Number.isFinite(ttl) || ttl <= 0) ttl = DEFAULT_TTL;
  ttl = Math.min(Math.max(ttl, MIN_TTL), MAX_TTL);

  try {
    const otpKey = `auth:otp:${email}`;
    await redis.set(otpKey, otp, { ex: ttl });
    return res.status(200).json({ success: true, expiresIn: ttl });
  } catch (error) {
    console.error('Error storing OTP in Redis:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

