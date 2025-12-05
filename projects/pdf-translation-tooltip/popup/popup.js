// Popup Script
document.addEventListener('DOMContentLoaded', init);

let settings = {
  enabled: true,
  sourceLang: 'en',
  targetLang: 'ko',
  theme: 'light'
};

async function init() {
  await loadSettings();
  await loadHistory();
  await loadWordCount();
  setupEventListeners();
}

// 설정 로드
async function loadSettings() {
  const result = await chrome.storage.local.get(['settings']);
  if (result.settings) {
    settings = result.settings;
  }
  updateUI();
}

// UI 업데이트
function updateUI() {
  document.getElementById('enableToggle').checked = settings.enabled;
  document.getElementById('sourceLang').value = settings.sourceLang;
  document.getElementById('targetLang').value = settings.targetLang;

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === settings.theme);
  });
}

// 설정 저장
async function saveSettings() {
  await chrome.storage.local.set({ settings });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 활성화 토글
  document.getElementById('enableToggle').addEventListener('change', async (e) => {
    settings.enabled = e.target.checked;
    await saveSettings();
  });

  // 원본 언어 변경
  document.getElementById('sourceLang').addEventListener('change', async (e) => {
    settings.sourceLang = e.target.value;
    await saveSettings();
  });

  // 번역 언어 변경
  document.getElementById('targetLang').addEventListener('change', async (e) => {
    settings.targetLang = e.target.value;
    await saveSettings();
  });

  // 테마 변경
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      settings.theme = btn.dataset.theme;
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await saveSettings();
    });
  });

  // 단어장 열기
  document.getElementById('openWordbook').addEventListener('click', openWordbook);

  // 모달 닫기
  document.querySelector('.modal-close').addEventListener('click', closeWordbook);
  document.getElementById('wordbookModal').addEventListener('click', (e) => {
    if (e.target.id === 'wordbookModal') closeWordbook();
  });

  // CSV 내보내기
  document.getElementById('exportWords').addEventListener('click', exportWordsToCSV);

  // 전체 삭제
  document.getElementById('clearWords').addEventListener('click', clearAllWords);
}

// 히스토리 로드
async function loadHistory() {
  const result = await chrome.storage.local.get(['history']);
  const history = result.history || [];
  const container = document.getElementById('historyList');

  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">아직 번역 기록이 없습니다</div>';
    return;
  }

  container.innerHTML = history.slice(0, 10).map(item => `
    <div class="history-item">
      <div class="history-original">${escapeHtml(item.original)}</div>
      <div class="history-translated">${escapeHtml(item.translated)}</div>
    </div>
  `).join('');
}

// 단어 수 로드
async function loadWordCount() {
  const result = await chrome.storage.local.get(['savedWords']);
  const words = result.savedWords || [];
  document.getElementById('wordCount').textContent = words.length;
}

// 단어장 열기
async function openWordbook() {
  const result = await chrome.storage.local.get(['savedWords']);
  const words = result.savedWords || [];
  const container = document.getElementById('wordList');

  if (words.length === 0) {
    container.innerHTML = '<div class="history-empty">저장된 단어가 없습니다</div>';
  } else {
    container.innerHTML = words.map((word, index) => `
      <div class="word-item" data-index="${index}">
        <div class="word-content">
          <div class="word-original">${escapeHtml(word.original)}</div>
          <div class="word-translated">${escapeHtml(word.translated)}</div>
        </div>
        <button class="word-delete" data-index="${index}">&times;</button>
      </div>
    `).join('');

    // 삭제 버튼 이벤트
    container.querySelectorAll('.word-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(e.target.dataset.index);
        await deleteWord(index);
      });
    });
  }

  document.getElementById('wordbookModal').classList.add('active');
}

// 단어장 닫기
function closeWordbook() {
  document.getElementById('wordbookModal').classList.remove('active');
}

// 단어 삭제
async function deleteWord(index) {
  const result = await chrome.storage.local.get(['savedWords']);
  const words = result.savedWords || [];
  words.splice(index, 1);
  await chrome.storage.local.set({ savedWords: words });
  await loadWordCount();
  openWordbook(); // 새로고침
}

// CSV로 내보내기
async function exportWordsToCSV() {
  const result = await chrome.storage.local.get(['savedWords']);
  const words = result.savedWords || [];

  if (words.length === 0) {
    alert('저장된 단어가 없습니다.');
    return;
  }

  const csv = 'Original,Translated,Date\n' + words.map(word => {
    const date = new Date(word.savedAt).toLocaleDateString();
    return `"${word.original}","${word.translated}","${date}"`;
  }).join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wordbook.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// 전체 삭제
async function clearAllWords() {
  if (confirm('모든 저장된 단어를 삭제하시겠습니까?')) {
    await chrome.storage.local.set({ savedWords: [] });
    await loadWordCount();
    openWordbook(); // 새로고침
  }
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
