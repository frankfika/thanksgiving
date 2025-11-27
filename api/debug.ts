import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const envVars = {
    DEEPSEEK_KEY: process.env.DEEPSEEK_KEY ? `${process.env.DEEPSEEK_KEY.substring(0, 8)}...` : 'NOT SET',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 8)}...` : 'NOT SET',
    DEEP_SEEK_KEY: process.env.DEEP_SEEK_KEY ? `${process.env.DEEP_SEEK_KEY.substring(0, 8)}...` : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
  };

  return res.status(200).json({ envVars });
}
