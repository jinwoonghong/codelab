import { kv } from '@vercel/kv';

// 랜덤 ID 생성
function generateId() {
  return Math.random().toString(36).substring(2, 8);
}

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // 투표 생성
      const { title, creator, timeOptions, locationOptions } = req.body;

      if (!title || !creator || !timeOptions || timeOptions.length < 2) {
        return res.status(400).json({ error: '필수 항목을 입력해주세요' });
      }

      const id = generateId();
      const poll = {
        id,
        title,
        creator,
        timeOptions,
        locationOptions: locationOptions || [],
        status: 'open',
        createdAt: new Date().toISOString()
      };

      await kv.set(`poll:${id}`, poll);
      await kv.set(`votes:${id}`, []);

      return res.status(201).json({ poll, url: `/p/${id}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
