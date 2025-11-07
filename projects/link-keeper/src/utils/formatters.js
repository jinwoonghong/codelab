// 시간 포맷팅 유틸리티

export function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) {
    return '방금 전';
  } else if (minutes < 60) {
    return `${minutes}분 전`;
  } else if (hours < 24) {
    return `${hours}시간 전`;
  } else if (days < 7) {
    return `${days}일 전`;
  } else if (weeks < 4) {
    return `${weeks}주 전`;
  } else if (months < 12) {
    return `${months}개월 전`;
  } else {
    return new Date(timestamp).toLocaleDateString('ko-KR');
  }
}

export function getDateGroup(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 24) {
    return '오늘';
  } else if (hours < 48) {
    return '어제';
  } else if (days < 7) {
    return '이번 주';
  } else if (days < 30) {
    return '이번 달';
  } else {
    return '이전';
  }
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
