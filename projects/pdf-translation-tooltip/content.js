// Content Script
// 텍스트 선택 감지 및 번역 툴팁 표시
// PDF 뷰어 (Google Scholar PDF Reader, PDF.js 등) 호환

(function() {
  'use strict';

  // 이미 로드되었는지 확인 (중복 방지)
  if (window.__pdfTranslationTooltipLoaded) return;
  window.__pdfTranslationTooltipLoaded = true;

  // 상태 변수
  let tooltip = null;
  let isEnabled = true;
  let isInitialized = false;
  let settings = {
    enabled: true,
    sourceLang: 'en',
    targetLang: 'ko',
    theme: 'light'
  };

  // PDF 환경 감지
  const isPDFEnvironment = detectPDFEnvironment();

  // 초기화 - DOM 준비 대기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // 추가로 load 이벤트에서도 재초기화 시도 (동적 콘텐츠 대응)
  window.addEventListener('load', () => {
    if (!isInitialized) initialize();
    setupMutationObserver();
  });

  function initialize() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('[PDF Translation Tooltip] Initializing...', {
      url: window.location.href,
      isPDF: isPDFEnvironment,
      readyState: document.readyState
    });

    loadSettings();
    setupEventListeners();

    // 툴팁은 body가 준비되면 생성
    if (document.body) {
      createTooltip();
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        if (document.body) {
          createTooltip();
          obs.disconnect();
        }
      });
      observer.observe(document.documentElement, { childList: true });
    }
  }

  // PDF 환경 감지
  function detectPDFEnvironment() {
    const url = window.location.href.toLowerCase();
    const contentType = document.contentType || '';

    return {
      isPDF: url.endsWith('.pdf') ||
             contentType.includes('pdf') ||
             url.includes('/pdf/') ||
             url.includes('pdf.') ||
             document.querySelector('embed[type="application/pdf"]') !== null,
      isPDFJS: typeof window.PDFViewerApplication !== 'undefined' ||
               document.querySelector('.pdfViewer') !== null ||
               document.querySelector('#viewer.pdfViewer') !== null,
      isScholarReader: url.includes('scholar') ||
                       document.querySelector('[class*="scholar"]') !== null,
      isEmbed: document.body?.children[0]?.tagName === 'EMBED'
    };
  }

  // 설정 로드
  async function loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (response) {
        settings = { ...settings, ...response };
        isEnabled = settings.enabled !== false;
        updateTooltipTheme();
        console.log('[PDF Translation Tooltip] Settings loaded:', settings);
      }
    } catch (e) {
      console.log('[PDF Translation Tooltip] Using default settings:', e.message);
    }
  }

  // 툴팁 생성
  function createTooltip() {
    if (!document.body) return;
    if (document.getElementById('pdf-translation-tooltip')) {
      tooltip = document.getElementById('pdf-translation-tooltip');
      return;
    }

    tooltip = document.createElement('div');
    tooltip.id = 'pdf-translation-tooltip';
    tooltip.className = 'ptt-tooltip';
    tooltip.setAttribute('data-ptt', 'true');

    tooltip.innerHTML = `
      <div class="ptt-header">
        <span class="ptt-original"></span>
        <button class="ptt-close" title="닫기 (ESC)">&times;</button>
      </div>
      <div class="ptt-body">
        <div class="ptt-translated"></div>
        <div class="ptt-loading">
          <span class="ptt-spinner"></span> 번역 중...
        </div>
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

    // 이벤트 바인딩
    tooltip.querySelector('.ptt-close').addEventListener('click', hideTooltip);
    tooltip.querySelector('.ptt-speak').addEventListener('click', speakText);
    tooltip.querySelector('.ptt-copy').addEventListener('click', copyText);
    tooltip.querySelector('.ptt-save').addEventListener('click', saveWord);

    // 툴팁 내부 이벤트 전파 방지
    tooltip.addEventListener('mousedown', e => e.stopPropagation());
    tooltip.addEventListener('mouseup', e => e.stopPropagation());
    tooltip.addEventListener('click', e => e.stopPropagation());

    console.log('[PDF Translation Tooltip] Tooltip created');
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    // 텍스트 선택 감지 - 여러 방식으로 캡처
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchend', handleTouchEnd, true);

    // 더블클릭으로 단어 선택
    document.addEventListener('dblclick', handleDoubleClick, true);

    // 툴팁 외부 클릭 시 닫기
    document.addEventListener('mousedown', handleOutsideClick, true);

    // ESC 키로 닫기
    document.addEventListener('keydown', handleKeyDown, true);

    // 스크롤 시 툴팁 숨기기
    document.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('scroll', hideTooltip, true);

    // 설정 변경 감지
    try {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.settings) {
          settings = { ...settings, ...changes.settings.newValue };
          isEnabled = settings.enabled !== false;
          updateTooltipTheme();
        }
      });
    } catch (e) {
      // chrome.storage 접근 불가 시 무시
    }

    // selectionchange 이벤트도 감지 (PDF.js 등에서 유용)
    document.addEventListener('selectionchange', debounce(handleSelectionChange, 300));
  }

  // MutationObserver 설정 (동적 콘텐츠 대응)
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      // 툴팁이 삭제되었으면 다시 생성
      if (!document.getElementById('pdf-translation-tooltip')) {
        createTooltip();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 마우스업 핸들러
  function handleMouseUp(e) {
    if (!isEnabled) return;
    if (tooltip && tooltip.contains(e.target)) return;

    // 딜레이 후 선택 확인
    setTimeout(() => processSelection(e.clientX, e.clientY), 50);
  }

  // 터치 핸들러 (모바일)
  function handleTouchEnd(e) {
    if (!isEnabled) return;

    const touch = e.changedTouches[0];
    if (touch) {
      setTimeout(() => processSelection(touch.clientX, touch.clientY), 100);
    }
  }

  // 더블클릭 핸들러
  function handleDoubleClick(e) {
    if (!isEnabled) return;
    if (tooltip && tooltip.contains(e.target)) return;

    setTimeout(() => processSelection(e.clientX, e.clientY), 10);
  }

  // 선택 변경 핸들러
  let lastSelectionText = '';
  function handleSelectionChange() {
    if (!isEnabled) return;

    const text = getSelectedText();
    if (text && text !== lastSelectionText && text.length > 0) {
      lastSelectionText = text;
      // 위치를 알 수 없으므로 선택 영역 기준으로 표시
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0) {
          showTooltip(rect.right, rect.bottom, text);
        }
      }
    }
  }

  // 외부 클릭 핸들러
  function handleOutsideClick(e) {
    if (tooltip && !tooltip.contains(e.target) && tooltip.classList.contains('ptt-visible')) {
      hideTooltip();
    }
  }

  // 키보드 핸들러
  function handleKeyDown(e) {
    if (e.key === 'Escape' && tooltip && tooltip.classList.contains('ptt-visible')) {
      hideTooltip();
      e.preventDefault();
    }
  }

  // 선택 처리
  function processSelection(x, y) {
    const text = getSelectedText();

    if (text && text.length > 0 && text.length < 2000 && shouldTranslate(text)) {
      showTooltip(x, y, text);
    }
  }

  // 선택된 텍스트 가져오기 (다양한 방법 시도)
  function getSelectedText() {
    let text = '';

    // 방법 1: 표준 Selection API
    try {
      const selection = window.getSelection();
      if (selection && selection.toString) {
        text = selection.toString().trim();
      }
    } catch (e) {}

    // 방법 2: document.getSelection()
    if (!text) {
      try {
        const docSelection = document.getSelection();
        if (docSelection && docSelection.toString) {
          text = docSelection.toString().trim();
        }
      } catch (e) {}
    }

    // 방법 3: activeElement (input, textarea)
    if (!text && document.activeElement) {
      try {
        const el = document.activeElement;
        if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') &&
            typeof el.selectionStart === 'number') {
          text = el.value.substring(el.selectionStart, el.selectionEnd).trim();
        }
      } catch (e) {}
    }

    // 방법 4: PDF.js 특수 처리
    if (!text && isPDFEnvironment.isPDFJS) {
      try {
        const textLayer = document.querySelector('.textLayer');
        if (textLayer) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            text = selection.toString().trim();
          }
        }
      } catch (e) {}
    }

    // 텍스트 정리 (여러 줄 공백 정리)
    if (text) {
      text = text.replace(/\s+/g, ' ').trim();
    }

    return text;
  }

  // 번역 필요 여부 확인
  function shouldTranslate(text) {
    if (!text || text.length < 1) return false;
    if (/^\d+$/.test(text)) return false; // 숫자만
    if (/^https?:\/\//.test(text)) return false; // URL
    if (/^[^\w\s]+$/.test(text)) return false; // 특수문자만
    return true;
  }

  // 툴팁 표시
  async function showTooltip(x, y, text) {
    if (!tooltip) {
      createTooltip();
      if (!tooltip) return;
    }

    // UI 초기화
    const originalEl = tooltip.querySelector('.ptt-original');
    const translatedEl = tooltip.querySelector('.ptt-translated');
    const loadingEl = tooltip.querySelector('.ptt-loading');
    const errorEl = tooltip.querySelector('.ptt-error');

    const displayText = text.length > 150 ? text.substring(0, 150) + '...' : text;
    originalEl.textContent = displayText;
    translatedEl.textContent = '';
    errorEl.textContent = '';
    loadingEl.style.display = 'flex';
    translatedEl.style.display = 'none';
    errorEl.style.display = 'none';

    // 위치 설정 및 표시
    positionTooltip(x, y);
    tooltip.classList.add('ptt-visible');

    // 데이터 저장
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
        throw new Error(response?.error || 'Translation failed');
      }
    } catch (error) {
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';

      let errorMsg = '번역 실패';
      if (error.message.includes('Extension context invalidated') ||
          error.message.includes('Could not establish connection')) {
        errorMsg = '페이지를 새로고침 해주세요';
      } else {
        errorMsg = error.message || '알 수 없는 오류';
      }
      errorEl.textContent = errorMsg;
    }
  }

  // 툴팁 위치 계산
  function positionTooltip(x, y) {
    if (!tooltip) return;

    const padding = 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 툴팁 크기 측정
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    tooltip.style.left = '0';
    tooltip.style.top = '0';

    const rect = tooltip.getBoundingClientRect();
    const tooltipWidth = Math.max(rect.width, 250);
    const tooltipHeight = Math.max(rect.height, 120);

    tooltip.style.visibility = '';

    // 위치 계산
    let left = x + padding;
    let top = y + padding;

    // 오른쪽 경계
    if (left + tooltipWidth > viewportWidth - padding) {
      left = x - tooltipWidth - padding;
    }

    // 아래쪽 경계
    if (top + tooltipHeight > viewportHeight - padding) {
      top = y - tooltipHeight - padding;
    }

    // 최소값 보정
    left = Math.max(padding, left);
    top = Math.max(padding, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // 툴팁 숨기기
  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('ptt-visible');
    }
    lastSelectionText = '';
  }

  // 테마 업데이트
  function updateTooltipTheme() {
    if (tooltip) {
      tooltip.classList.toggle('ptt-dark', settings.theme === 'dark');
    }
  }

  // 발음 듣기
  function speakText() {
    const text = tooltip?.dataset?.currentText;
    if (text && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.sourceLang === 'en' ? 'en-US' : settings.sourceLang;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  // 복사
  async function copyText() {
    const original = tooltip?.dataset?.currentText || '';
    const translated = tooltip?.dataset?.translated || '';
    const textToCopy = translated ? `${original}\n${translated}` : original;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showFeedback('.ptt-copy', '복사됨!');
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showFeedback('.ptt-copy', '복사됨!');
      } catch (e2) {}
      document.body.removeChild(textarea);
    }
  }

  // 저장
  async function saveWord() {
    const original = tooltip?.dataset?.currentText;
    const translated = tooltip?.dataset?.translated;

    if (!original || !translated) {
      showFeedback('.ptt-save', '번역 완료 후 저장');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        action: 'saveWord',
        word: { original, translated, sourceLang: settings.sourceLang, targetLang: settings.targetLang }
      });
      showFeedback('.ptt-save', '저장됨!');
    } catch (e) {
      showFeedback('.ptt-save', '저장 실패');
    }
  }

  // 피드백 표시
  function showFeedback(selector, message) {
    const btn = tooltip?.querySelector(selector);
    if (!btn) return;

    const original = btn.title;
    btn.title = message;
    btn.classList.add('ptt-success');

    setTimeout(() => {
      btn.title = original;
      btn.classList.remove('ptt-success');
    }, 1500);
  }

  // 디바운스 유틸리티
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
})();
