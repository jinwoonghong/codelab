// Content Script
// 텍스트 선택 감지 및 툴팁 표시
// PDF 뷰어 (Google Scholar PDF Reader 등) 호환

(function() {
  'use strict';

  // 이미 로드되었는지 확인 (iframe 중복 방지)
  if (window.__pttLoaded) return;
  window.__pttLoaded = true;

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
    // DOM이 준비될 때까지 대기
    if (document.body) {
      createTooltip();
    } else {
      document.addEventListener('DOMContentLoaded', createTooltip);
    }
    loadSettings();
    setupEventListeners();

    // PDF 환경 감지 로그
    console.log('[PDF Translation Tooltip] Initialized on:', window.location.href);
  }

  // 설정 로드
  async function loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response) {
        settings = response;
        isEnabled = settings.enabled !== false; // 기본값 true
        updateTooltipTheme();
      }
    } catch (e) {
      // Extension context가 없는 경우 (예: 다른 확장 프로그램 페이지)
      console.log('[PDF Translation Tooltip] Settings load error:', e.message);
    }
  }

  // 툴팁 엘리먼트 생성
  function createTooltip() {
    // 이미 존재하면 스킵
    if (document.getElementById('pdf-translation-tooltip')) {
      tooltip = document.getElementById('pdf-translation-tooltip');
      return;
    }

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

    // body가 없으면 documentElement에 추가
    const container = document.body || document.documentElement;
    container.appendChild(tooltip);

    // 툴팁 이벤트 리스너
    tooltip.querySelector('.ptt-close').addEventListener('click', hideTooltip);
    tooltip.querySelector('.ptt-speak').addEventListener('click', speakText);
    tooltip.querySelector('.ptt-copy').addEventListener('click', copyText);
    tooltip.querySelector('.ptt-save').addEventListener('click', saveWord);

    // 툴팁 내부 클릭 시 이벤트 전파 방지
    tooltip.addEventListener('mousedown', (e) => e.stopPropagation());
    tooltip.addEventListener('mouseup', (e) => e.stopPropagation());
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    // mouseup 이벤트 (캡처 단계에서)
    document.addEventListener('mouseup', handleMouseUp, true);

    // 툴팁 외부 클릭 시 닫기
    document.addEventListener('mousedown', (e) => {
      if (tooltip && !tooltip.contains(e.target) && tooltip.classList.contains('ptt-visible')) {
        hideTooltip();
      }
    }, true);

    // 키보드 단축키 (ESC로 닫기)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tooltip && tooltip.classList.contains('ptt-visible')) {
        hideTooltip();
      }
    });

    // 설정 변경 감지
    try {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.settings) {
          settings = changes.settings.newValue;
          isEnabled = settings.enabled !== false;
          updateTooltipTheme();
        }
      });
    } catch (e) {
      // chrome.storage 접근 불가 시 무시
    }

    // 스크롤 시 툴팁 숨기기
    document.addEventListener('scroll', hideTooltip, true);
  }

  // 마우스업 이벤트 핸들러
  function handleMouseUp(e) {
    if (!isEnabled) return;
    if (tooltip && tooltip.contains(e.target)) return;

    // 약간의 딜레이 후 선택 텍스트 확인
    setTimeout(() => {
      const selectedText = getSelectedText();

      if (selectedText && selectedText.length > 0 && selectedText.length < 1000) {
        // 영어 또는 선택된 소스 언어인지 간단히 체크
        if (shouldTranslate(selectedText)) {
          showTooltip(e.clientX, e.clientY, selectedText);
        }
      }
    }, 50);
  }

  // 선택된 텍스트 가져오기 (다양한 환경 지원)
  function getSelectedText() {
    let text = '';

    // 1. 표준 Selection API
    const selection = window.getSelection();
    if (selection) {
      text = selection.toString().trim();
    }

    // 2. 텍스트가 없으면 activeElement 확인 (input, textarea)
    if (!text && document.activeElement) {
      const el = document.activeElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        text = el.value.substring(el.selectionStart, el.selectionEnd).trim();
      }
    }

    return text;
  }

  // 번역이 필요한 텍스트인지 확인
  function shouldTranslate(text) {
    // 너무 짧으면 스킵
    if (text.length < 1) return false;

    // 숫자만 있으면 스킵
    if (/^\d+$/.test(text)) return false;

    // URL이면 스킵
    if (/^https?:\/\//.test(text)) return false;

    return true;
  }

  // 툴팁 표시
  async function showTooltip(x, y, text) {
    if (!tooltip) {
      createTooltip();
      if (!tooltip) return;
    }

    // 상태 초기화
    const originalEl = tooltip.querySelector('.ptt-original');
    const translatedEl = tooltip.querySelector('.ptt-translated');
    const loadingEl = tooltip.querySelector('.ptt-loading');
    const errorEl = tooltip.querySelector('.ptt-error');

    // 긴 텍스트는 잘라서 표시
    const displayText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    originalEl.textContent = displayText;
    translatedEl.textContent = '';
    errorEl.textContent = '';
    loadingEl.style.display = 'block';
    translatedEl.style.display = 'none';
    errorEl.style.display = 'none';

    // 위치 계산
    positionTooltip(x, y);
    tooltip.classList.add('ptt-visible');

    // 현재 번역 텍스트 저장
    tooltip.dataset.currentText = text;
    tooltip.dataset.translated = '';

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

      if (response && response.success) {
        loadingEl.style.display = 'none';
        translatedEl.style.display = 'block';
        translatedEl.textContent = response.data.translated;
        tooltip.dataset.translated = response.data.translated;
      } else {
        throw new Error(response?.error || 'Unknown error');
      }
    } catch (error) {
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';

      // 에러 메시지 처리
      let errorMsg = '번역 실패';
      if (error.message.includes('Extension context invalidated')) {
        errorMsg = '확장 프로그램을 새로고침 해주세요';
      } else if (error.message.includes('Could not establish connection')) {
        errorMsg = '연결 오류 - 페이지를 새로고침 해주세요';
      } else {
        errorMsg = '번역 실패: ' + error.message;
      }
      errorEl.textContent = errorMsg;
    }
  }

  // 툴팁 위치 계산
  function positionTooltip(x, y) {
    const padding = 10;

    // 툴팁 크기 측정
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 300;
    const tooltipHeight = tooltipRect.height || 150;
    tooltip.style.visibility = '';

    // 뷰포트 크기
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x + padding;
    let top = y + padding;

    // 화면 경계 체크
    if (left + tooltipWidth > viewportWidth - padding) {
      left = x - tooltipWidth - padding;
    }
    if (top + tooltipHeight > viewportHeight - padding) {
      top = y - tooltipHeight - padding;
    }
    if (left < padding) left = padding;
    if (top < padding) top = padding;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
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
      // 이전 발화 취소
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.sourceLang === 'en' ? 'en-US' : settings.sourceLang;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  // 텍스트 복사
  async function copyText() {
    const original = tooltip.dataset.currentText;
    const translated = tooltip.dataset.translated;
    const textToCopy = translated ? `${original}\n${translated}` : original;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showButtonFeedback('.ptt-copy', '복사됨!');
    } catch (e) {
      // Fallback: execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showButtonFeedback('.ptt-copy', '복사됨!');
      } catch (e2) {
        console.error('Copy failed:', e2);
      }
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
    } else {
      showButtonFeedback('.ptt-save', '번역 완료 후 저장 가능');
    }
  }

  // 버튼 피드백 표시
  function showButtonFeedback(selector, message) {
    const btn = tooltip.querySelector(selector);
    if (!btn) return;

    const originalTitle = btn.title;
    btn.title = message;
    btn.classList.add('ptt-success');

    setTimeout(() => {
      btn.title = originalTitle;
      btn.classList.remove('ptt-success');
    }, 1500);
  }
})();
