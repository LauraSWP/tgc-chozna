import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '@/lib/auth';
import { validateInput, packOpenSchema } from '@/lib/validate';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validation = validateInput(packOpenSchema, req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    const { set_code: setCode, quantity = 1 } = validation.data;

    // Call the Supabase Edge Function for production pack opening
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/open_pack`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          setCode,
          quantity,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error || 'Error al abrir sobres'
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Pack opening API error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
