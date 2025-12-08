import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // 투표 조회
      const poll = await kv.get(`poll:${id}`);

      if (!poll) {
        return res.status(404).json({ error: '투표를 찾을 수 없습니다' });
      }

      const votes = await kv.get(`votes:${id}`) || [];

      // 결과 집계
      const summary = calculateSummary(poll, votes);

      return res.status(200).json({ poll, votes, summary });
    }

    if (req.method === 'POST') {
      // 투표 참여
      const { name, selectedTimes, selectedLocations } = req.body;

      if (!name || !selectedTimes || selectedTimes.length === 0) {
        return res.status(400).json({ error: '이름과 선택 항목을 입력해주세요' });
      }

      const poll = await kv.get(`poll:${id}`);

      if (!poll) {
        return res.status(404).json({ error: '투표를 찾을 수 없습니다' });
      }

      if (poll.status === 'closed') {
        return res.status(400).json({ error: '이미 마감된 투표입니다' });
      }

      const votes = await kv.get(`votes:${id}`) || [];

      // 같은 이름으로 이미 투표했는지 확인
      const existingIndex = votes.findIndex(v => v.name === name);

      const vote = {
        name,
        selectedTimes,
        selectedLocations: selectedLocations || [],
        votedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // 기존 투표 수정
        votes[existingIndex] = vote;
      } else {
        // 새 투표 추가
        votes.push(vote);
      }

      await kv.set(`votes:${id}`, votes);

      const summary = calculateSummary(poll, votes);

      return res.status(200).json({ poll, votes, summary });
    }

    if (req.method === 'PATCH') {
      // 투표 마감
      const poll = await kv.get(`poll:${id}`);

      if (!poll) {
        return res.status(404).json({ error: '투표를 찾을 수 없습니다' });
      }

      poll.status = 'closed';
      await kv.set(`poll:${id}`, poll);

      return res.status(200).json({ poll });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}

function calculateSummary(poll, votes) {
  const timeResults = poll.timeOptions.map((option, index) => {
    const voters = votes.filter(v => v.selectedTimes.includes(index)).map(v => v.name);
    return { option, count: voters.length, voters };
  });

  const locationResults = poll.locationOptions.map((option, index) => {
    const voters = votes.filter(v => v.selectedLocations.includes(index)).map(v => v.name);
    return { option, count: voters.length, voters };
  });

  // 최다 득표 찾기
  const maxTimeVotes = Math.max(...timeResults.map(r => r.count));
  timeResults.forEach(r => {
    r.isTop = r.count === maxTimeVotes && r.count > 0;
  });

  return {
    totalVotes: votes.length,
    timeResults,
    locationResults
  };
}
