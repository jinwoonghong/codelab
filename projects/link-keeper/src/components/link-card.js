// LinkCard 컴포넌트
import { getRelativeTime } from '../utils/formatters.js';

export function createLinkCard(link, onToggleRead, onDelete) {
  const card = document.createElement('div');
  card.className = `link-card ${link.isRead ? 'read' : ''}`;
  card.dataset.id = link.id;

  // 썸네일 또는 파비콘
  const thumbnailEl = document.createElement('div');
  thumbnailEl.className = 'link-thumbnail';

  if (link.thumbnail) {
    const img = document.createElement('img');
    img.src = link.thumbnail;
    img.alt = link.title;
    img.onerror = () => {
      // 썸네일 로드 실패 시 파비콘 표시
      thumbnailEl.innerHTML = link.favicon
        ? `<img src="${link.favicon}" alt="${link.domain}" class="link-favicon">`
        : `<div class="link-favicon">🔗</div>`;
    };
    thumbnailEl.appendChild(img);
  } else if (link.favicon) {
    thumbnailEl.innerHTML = `<img src="${link.favicon}" alt="${link.domain}" class="link-favicon">`;
  } else {
    thumbnailEl.innerHTML = `<div class="link-favicon">🔗</div>`;
  }

  // 콘텐츠
  const contentEl = document.createElement('div');
  contentEl.className = 'link-content';

  const titleEl = document.createElement('div');
  titleEl.className = 'link-title';
  titleEl.textContent = link.title;

  const metaEl = document.createElement('div');
  metaEl.className = 'link-meta';
  metaEl.innerHTML = `
    <span class="link-domain">${link.domain}</span>
    <span class="link-time">${getRelativeTime(link.createdAt)}</span>
  `;

  contentEl.appendChild(titleEl);
  contentEl.appendChild(metaEl);

  // 상태 아이콘
  const statusEl = document.createElement('div');
  statusEl.className = `link-status ${link.isRead ? 'read' : 'unread'}`;
  statusEl.innerHTML = link.isRead ? '✓' : '';
  statusEl.title = link.isRead ? '읽음' : '안 읽음';

  // 이벤트 리스너
  statusEl.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggleRead(link.id, !link.isRead);
  });

  card.addEventListener('click', () => {
    window.open(link.url, '_blank');
  });

  // 조립
  card.appendChild(thumbnailEl);
  card.appendChild(contentEl);
  card.appendChild(statusEl);

  return card;
}

export function createDateGroup(dateLabel, links, onToggleRead, onDelete) {
  const group = document.createElement('div');
  group.className = 'date-group';

  const header = document.createElement('div');
  header.className = 'date-group-header';
  header.innerHTML = `${dateLabel} <span class="date-group-count">(${links.length})</span>`;

  group.appendChild(header);

  links.forEach(link => {
    const card = createLinkCard(link, onToggleRead, onDelete);
    group.appendChild(card);
  });

  return group;
}
