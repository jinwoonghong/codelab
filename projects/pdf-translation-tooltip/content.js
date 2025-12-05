// Content Script
// 텍스트 선택 감지 및 툴팁 표시

(function() {
  'use strict';

  let tooltip = null;
  let isEnabled = true;
  let settings = {
    sourceLang: 'en',
    targetLang: 'ko',
    theme: 'light'
  };

  // 초기화
  init();

  function init() {
    createTooltip();
    loadSettings();
    setupEventListeners();
  }

  // 설정 로드
  async function loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response) {
        settings = response;
        isEnabled = settings.enabled;
        updateTooltipTheme();
      }
    } catch (e) {
      console.log('Settings load error:', e);
    }
  }

  // 툴팁 엘리먼트 생성
  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.id = 'pdf-translation-tooltip';
    tooltip.className = 'ptt-tooltip';
    tooltip.innerHTML = `
      <div class="ptt-header">
        <span class="ptt-original"></span>
        <button class="ptt-close" title="닫기">&times;</button>
      </div>
      <div class="ptt-body">
        <div class="ptt-translated"></div>
        <div class="ptt-loading">번역 중...</div>
        <div class="ptt-error"></div>
      </div>
      <div class="ptt-footer">
        <button class="ptt-btn ptt-speak" title="발음 듣기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <button class="ptt-btn ptt-copy" title="복사">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>
        <button class="ptt-btn ptt-save" title="단어장에 저장">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(tooltip);

    // 툴팁 이벤트 리스너
    tooltip.querySelector('.ptt-close').addEventListener('click', hideTooltip);
    tooltip.querySelector('.ptt-speak').addEventListener('click', speakText);
    tooltip.querySelector('.ptt-copy').addEventListener('click', copyText);
    tooltip.querySelector('.ptt-save').addEventListener('click', saveWord);

    // 툴팁 외부 클릭 시 닫기
    document.addEventListener('mousedown', (e) => {
      if (tooltip && !tooltip.contains(e.target) && tooltip.classList.contains('ptt-visible')) {
        hideTooltip();
      }
    });
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    document.addEventListener('mouseup', handleMouseUp);

    // 설정 변경 감지
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        settings = changes.settings.newValue;
        isEnabled = settings.enabled;
        updateTooltipTheme();
      }
    });
  }

  // 마우스업 이벤트 핸들러
  function handleMouseUp(e) {
    if (!isEnabled) return;
    if (tooltip && tooltip.contains(e.target)) return;

    // 약간의 딜레이 후 선택 텍스트 확인
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selectedText.length > 0 && selectedText.length < 500) {
        showTooltip(e.clientX, e.clientY, selectedText);
      }
    }, 10);
  }

  // 툴팁 표시
  async function showTooltip(x, y, text) {
    if (!tooltip) return;

    // 상태 초기화
    tooltip.querySelector('.ptt-original').textContent = text;
    tooltip.querySelector('.ptt-translated').textContent = '';
    tooltip.querySelector('.ptt-error').textContent = '';
    tooltip.querySelector('.ptt-loading').style.display = 'block';
    tooltip.querySelector('.ptt-translated').style.display = 'none';
    tooltip.querySelector('.ptt-error').style.display = 'none';

    // 위치 계산
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    const padding = 10;

    let left = x + padding;
    let top = y + padding;

    // 화면 경계 체크
    if (left + tooltipWidth > window.innerWidth) {
      left = x - tooltipWidth - padding;
    }
    if (top + tooltipHeight > window.innerHeight) {
      top = y - tooltipHeight - padding;
    }
    if (left < 0) left = padding;
    if (top < 0) top = padding;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('ptt-visible');

    // 현재 번역 텍스트 저장
    tooltip.dataset.currentText = text;

    // 번역 요청
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        sourceLang: settings.sourceLang,
        targetLang: settings.targetLang
      });

      // 텍스트가 변경되었으면 무시
      if (tooltip.dataset.currentText !== text) return;

      if (response.success) {
        tooltip.querySelector('.ptt-loading').style.display = 'none';
        tooltip.querySelector('.ptt-translated').style.display = 'block';
        tooltip.querySelector('.ptt-translated').textContent = response.data.translated;
        tooltip.dataset.translated = response.data.translated;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      tooltip.querySelector('.ptt-loading').style.display = 'none';
      tooltip.querySelector('.ptt-error').style.display = 'block';
      tooltip.querySelector('.ptt-error').textContent = '번역 실패: ' + error.message;
    }
  }

  // 툴팁 숨기기
  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('ptt-visible');
    }
  }

  // 테마 업데이트
  function updateTooltipTheme() {
    if (tooltip) {
      tooltip.classList.toggle('ptt-dark', settings.theme === 'dark');
    }
  }

  // 발음 듣기
  function speakText() {
    const text = tooltip.dataset.currentText;
    if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.sourceLang === 'en' ? 'en-US' : settings.sourceLang;
      speechSynthesis.speak(utterance);
    }
  }

  // 텍스트 복사
  async function copyText() {
    const original = tooltip.dataset.currentText;
    const translated = tooltip.dataset.translated;
    const textToCopy = `${original}\n${translated}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showButtonFeedback('.ptt-copy', '복사됨!');
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }

  // 단어 저장
  async function saveWord() {
    const original = tooltip.dataset.currentText;
    const translated = tooltip.dataset.translated;

    if (original && translated) {
      try {
        await chrome.runtime.sendMessage({
          action: 'saveWord',
          word: {
            original,
            translated,
            sourceLang: settings.sourceLang,
            targetLang: settings.targetLang
          }
        });
        showButtonFeedback('.ptt-save', '저장됨!');
      } catch (e) {
        console.error('Save failed:', e);
      }
    }
  }

  // 버튼 피드백 표시
  function showButtonFeedback(selector, message) {
    const btn = tooltip.querySelector(selector);
    const originalTitle = btn.title;
    btn.title = message;
    btn.classList.add('ptt-success');

    setTimeout(() => {
      btn.title = originalTitle;
      btn.classList.remove('ptt-success');
    }, 1500);
  }
})();
