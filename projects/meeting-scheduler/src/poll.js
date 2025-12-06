// 투표 참여/결과 페이지 JavaScript

const API_BASE = '/api';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');

const pollTitleEl = document.getElementById('pollTitle');
const creatorNameEl = document.getElementById('creatorName');
const pollStatusEl = document.getElementById('pollStatus');

const voteForm = document.getElementById('voteForm');
const voterNameInput = document.getElementById('voterName');
const timeOptionsVoteEl = document.getElementById('timeOptionsVote');
const locationSectionEl = document.getElementById('locationSection');
const locationOptionsVoteEl = document.getElementById('locationOptionsVote');
const voteBtnEl = document.getElementById('voteBtn');

const totalVotesEl = document.getElementById('totalVotes');
const timeResultsEl = document.getElementById('timeResults');
const locationResultsSectionEl = document.getElementById('locationResultsSection');
const locationResultsEl = document.getElementById('locationResults');
const votersMatrixEl = document.getElementById('votersMatrix');

const shareResultBtn = document.getElementById('shareResultBtn');

// State
let pollId = null;
let pollData = null;

// 초기화
async function init() {
  // URL에서 poll ID 추출
  const pathParts = window.location.pathname.split('/');
  pollId = pathParts[pathParts.length - 1];

  if (!pollId) {
    showError();
    return;
  }

  // 저장된 이름 복원
  const savedName = localStorage.getItem(`vote_name_${pollId}`);
  if (savedName) {
    voterNameInput.value = savedName;
  }

  await loadPoll();

  // 이벤트 리스너
  voteForm.addEventListener('submit', handleVote);
  shareResultBtn.addEventListener('click', handleShare);
}

// 투표 데이터 로드
async function loadPoll() {
  try {
    const response = await fetch(`${API_BASE}/polls/${pollId}`);

    if (!response.ok) {
      showError();
      return;
    }

    const data = await response.json();
    pollData = data;

    renderPoll(data);
    showContent();
  } catch (error) {
    console.error('Error loading poll:', error);
    showError();
  }
}

// 투표 렌더링
function renderPoll(data) {
  const { poll, votes, summary } = data;

  // 헤더
  pollTitleEl.textContent = poll.title;
  creatorNameEl.textContent = poll.creator;
  pollStatusEl.textContent = poll.status === 'open' ? '투표 진행중' : '투표 마감';
  pollStatusEl.className = `poll-status ${poll.status}`;

  // 투표 폼 상태
  if (poll.status === 'closed') {
    voteForm.classList.add('hidden');
  }

  // 시간 옵션 렌더링
  renderTimeOptions(poll.timeOptions, votes);

  // 장소 옵션 렌더링
  if (poll.locationOptions && poll.locationOptions.length > 0) {
    locationSectionEl.classList.remove('hidden');
    locationResultsSectionEl.classList.remove('hidden');
    renderLocationOptions(poll.locationOptions, votes);
  }

  // 결과 렌더링
  renderResults(summary);

  // 매트릭스 렌더링
  renderMatrix(poll, votes);
}

// 시간 옵션 렌더링
function renderTimeOptions(options, votes) {
  const myName = voterNameInput.value.trim();
  const myVote = votes.find(v => v.name === myName);

  timeOptionsVoteEl.innerHTML = options.map((option, index) => `
    <label class="vote-option ${myVote?.selectedTimes.includes(index) ? 'selected' : ''}">
      <input
        type="checkbox"
        name="time"
        value="${index}"
        ${myVote?.selectedTimes.includes(index) ? 'checked' : ''}
      >
      <span>${option}</span>
    </label>
  `).join('');

  // 선택 시 스타일 변경
  timeOptionsVoteEl.querySelectorAll('.vote-option').forEach(label => {
    label.addEventListener('click', () => {
      setTimeout(() => {
        const checkbox = label.querySelector('input');
        label.classList.toggle('selected', checkbox.checked);
      }, 0);
    });
  });
}

// 장소 옵션 렌더링
function renderLocationOptions(options, votes) {
  const myName = voterNameInput.value.trim();
  const myVote = votes.find(v => v.name === myName);

  locationOptionsVoteEl.innerHTML = options.map((option, index) => `
    <label class="vote-option ${myVote?.selectedLocations.includes(index) ? 'selected' : ''}">
      <input
        type="checkbox"
        name="location"
        value="${index}"
        ${myVote?.selectedLocations.includes(index) ? 'checked' : ''}
      >
      <span>${option}</span>
    </label>
  `).join('');

  locationOptionsVoteEl.querySelectorAll('.vote-option').forEach(label => {
    label.addEventListener('click', () => {
      setTimeout(() => {
        const checkbox = label.querySelector('input');
        label.classList.toggle('selected', checkbox.checked);
      }, 0);
    });
  });
}

// 결과 렌더링
function renderResults(summary) {
  totalVotesEl.textContent = `${summary.totalVotes}명 참여`;

  // 시간 결과
  const maxTimeVotes = Math.max(...summary.timeResults.map(r => r.count));

  timeResultsEl.innerHTML = summary.timeResults.map(result => `
    <div class="result-item ${result.isTop ? 'top' : ''}">
      <div class="result-header">
        <span class="result-option">${result.isTop ? '⭐ ' : ''}${result.option}</span>
        <span class="result-count">${result.count}명</span>
      </div>
      <div class="result-bar">
        <div class="result-bar-fill" style="width: ${summary.totalVotes > 0 ? (result.count / summary.totalVotes * 100) : 0}%"></div>
      </div>
      <div class="result-voters">${result.voters.join(', ') || '-'}</div>
    </div>
  `).join('');

  // 장소 결과
  if (summary.locationResults && summary.locationResults.length > 0) {
    locationResultsEl.innerHTML = summary.locationResults.map(result => `
      <div class="result-item">
        <div class="result-header">
          <span class="result-option">${result.option}</span>
          <span class="result-count">${result.count}명</span>
        </div>
        <div class="result-bar">
          <div class="result-bar-fill" style="width: ${summary.totalVotes > 0 ? (result.count / summary.totalVotes * 100) : 0}%"></div>
        </div>
        <div class="result-voters">${result.voters.join(', ') || '-'}</div>
      </div>
    `).join('');
  }
}

// 참여자 매트릭스 렌더링
function renderMatrix(poll, votes) {
  if (votes.length === 0) {
    votersMatrixEl.innerHTML = '<p style="text-align: center; color: var(--gray-500);">아직 참여자가 없습니다</p>';
    return;
  }

  const headers = poll.timeOptions.map((opt, i) => `<th>${opt}</th>`).join('');

  const rows = votes.map(vote => {
    const cells = poll.timeOptions.map((_, i) =>
      `<td>${vote.selectedTimes.includes(i) ? '<span class="check-mark">✓</span>' : '-'}</td>`
    ).join('');
    return `<tr><td>${vote.name}</td>${cells}</tr>`;
  }).join('');

  votersMatrixEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>참여자</th>
          ${headers}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// 투표 제출
async function handleVote(e) {
  e.preventDefault();

  const name = voterNameInput.value.trim();
  if (!name) {
    alert('이름을 입력해주세요.');
    return;
  }

  const selectedTimes = Array.from(document.querySelectorAll('input[name="time"]:checked'))
    .map(input => parseInt(input.value));

  const selectedLocations = Array.from(document.querySelectorAll('input[name="location"]:checked'))
    .map(input => parseInt(input.value));

  if (selectedTimes.length === 0) {
    alert('최소 하나의 시간을 선택해주세요.');
    return;
  }

  voteBtnEl.disabled = true;
  voteBtnEl.textContent = '투표 중...';

  try {
    const response = await fetch(`${API_BASE}/polls/${pollId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        selectedTimes,
        selectedLocations
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '투표에 실패했습니다.');
    }

    const data = await response.json();
    pollData = data;

    // 이름 저장
    localStorage.setItem(`vote_name_${pollId}`, name);

    // 결과 업데이트
    renderResults(data.summary);
    renderMatrix(data.poll, data.votes);

    alert('투표가 완료되었습니다!');
  } catch (error) {
    alert(error.message);
  } finally {
    voteBtnEl.disabled = false;
    voteBtnEl.textContent = '투표하기';
  }
}

// 공유하기
async function handleShare() {
  const url = window.location.href;
  const title = pollTitleEl.textContent;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `투표해주세요: ${title}`,
        text: `${title} 일정 투표에 참여해주세요!`,
        url: url
      });
    } catch (error) {
      // 사용자가 취소한 경우
    }
  } else {
    // 클립보드 복사
    try {
      await navigator.clipboard.writeText(url);
      alert('링크가 복사되었습니다!');
    } catch (error) {
      prompt('링크를 복사하세요:', url);
    }
  }
}

// UI 상태 관리
function showContent() {
  loadingEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
}

function showError() {
  loadingEl.classList.add('hidden');
  contentEl.classList.add('hidden');
  errorEl.classList.remove('hidden');
}

// 초기화 실행
init();
