// 투표 생성 페이지 JavaScript

const API_BASE = '/api';

// DOM Elements
const form = document.getElementById('createForm');
const timeOptionsContainer = document.getElementById('timeOptions');
const locationOptionsContainer = document.getElementById('locationOptions');
const addTimeBtn = document.getElementById('addTimeBtn');
const addLocationBtn = document.getElementById('addLocationBtn');
const submitBtn = document.getElementById('submitBtn');

// Modal Elements
const modal = document.getElementById('successModal');
const modalTitle = document.getElementById('modalTitle');
const pollLink = document.getElementById('pollLink');
const copyBtn = document.getElementById('copyBtn');
const copyFeedback = document.getElementById('copyFeedback');
const shareBtn = document.getElementById('shareBtn');
const viewPollBtn = document.getElementById('viewPollBtn');

// 초기화
function init() {
  // 기본 시간 옵션 2개 추가
  addTimeOption();
  addTimeOption();

  // 이벤트 리스너
  addTimeBtn.addEventListener('click', addTimeOption);
  addLocationBtn.addEventListener('click', addLocationOption);
  form.addEventListener('submit', handleSubmit);
  copyBtn.addEventListener('click', handleCopy);
  shareBtn.addEventListener('click', handleShare);
}

// 시간 옵션 추가
function addTimeOption() {
  const div = document.createElement('div');
  div.className = 'option-item';

  // 기본값: 내일 19:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  div.innerHTML = `
    <input
      type="text"
      class="time-option"
      placeholder="예: 12/10(화) 저녁 7시"
      required
    >
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
  `;

  timeOptionsContainer.appendChild(div);
}

// 장소 옵션 추가
function addLocationOption() {
  const div = document.createElement('div');
  div.className = 'option-item';

  div.innerHTML = `
    <input
      type="text"
      class="location-option"
      placeholder="예: 강남역"
    >
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
  `;

  locationOptionsContainer.appendChild(div);
}

// 폼 제출
async function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const creator = document.getElementById('creator').value.trim();

  const timeOptions = Array.from(document.querySelectorAll('.time-option'))
    .map(input => input.value.trim())
    .filter(v => v);

  const locationOptions = Array.from(document.querySelectorAll('.location-option'))
    .map(input => input.value.trim())
    .filter(v => v);

  // 유효성 검사
  if (timeOptions.length < 2) {
    alert('날짜/시간 옵션을 최소 2개 입력해주세요.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '생성 중...';

  try {
    const response = await fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        creator,
        timeOptions,
        locationOptions
      })
    });

    if (!response.ok) {
      throw new Error('투표 생성에 실패했습니다.');
    }

    const data = await response.json();

    // 성공 모달 표시
    showSuccessModal(data);
  } catch (error) {
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '투표 만들기';
  }
}

// 성공 모달 표시
function showSuccessModal(data) {
  const url = `${window.location.origin}/p/${data.poll.id}`;

  modalTitle.textContent = data.poll.title;
  pollLink.value = url;
  viewPollBtn.href = url;

  modal.classList.remove('hidden');
}

// 링크 복사
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(pollLink.value);
    copyFeedback.classList.remove('hidden');
    setTimeout(() => copyFeedback.classList.add('hidden'), 2000);
  } catch (error) {
    // Fallback
    pollLink.select();
    document.execCommand('copy');
    copyFeedback.classList.remove('hidden');
    setTimeout(() => copyFeedback.classList.add('hidden'), 2000);
  }
}

// 공유하기
async function handleShare() {
  const url = pollLink.value;
  const title = modalTitle.textContent;

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
    // Web Share API 미지원 시 복사
    handleCopy();
  }
}

// 초기화 실행
init();
