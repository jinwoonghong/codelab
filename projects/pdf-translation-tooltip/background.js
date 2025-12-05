// Background Service Worker
// 번역 API 호출 담당 (CORS 우회)

// 번역 캐시 (메모리)
const translationCache = new Map();

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslate(request.text, request.sourceLang, request.targetLang)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 비동기 응답을 위해 true 반환
  }

  if (request.action === 'getSettings') {
    getSettings().then(settings => sendResponse(settings));
    return true;
  }

  if (request.action === 'saveSettings') {
    saveSettings(request.settings).then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === 'saveWord') {
    saveWord(request.word).then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === 'getWords') {
    getWords().then(words => sendResponse(words));
    return true;
  }
});

// 번역 함수
async function handleTranslate(text, sourceLang = 'en', targetLang = 'ko') {
  // 캐시 확인
  const cacheKey = `${sourceLang}|${targetLang}|${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // MyMemory API 호출
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Translation API error');
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation failed');
  }

  const result = {
    original: text,
    translated: data.responseData.translatedText,
    sourceLang,
    targetLang
  };

  // 캐시 저장 (최대 100개)
  if (translationCache.size > 100) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }
  translationCache.set(cacheKey, result);

  // 히스토리에 저장
  saveToHistory(result);

  return result;
}

// 설정 관리
async function getSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || {
    enabled: true,
    sourceLang: 'en',
    targetLang: 'ko',
    theme: 'light'
  };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

// 단어장 관리
async function saveWord(word) {
  const result = await chrome.storage.local.get(['savedWords']);
  const savedWords = result.savedWords || [];

  // 중복 체크
  const exists = savedWords.some(w => w.original === word.original);
  if (!exists) {
    savedWords.unshift({
      ...word,
      savedAt: Date.now()
    });
    // 최대 500개 유지
    if (savedWords.length > 500) {
      savedWords.pop();
    }
    await chrome.storage.local.set({ savedWords });
  }
}

async function getWords() {
  const result = await chrome.storage.local.get(['savedWords']);
  return result.savedWords || [];
}

// 히스토리 관리
async function saveToHistory(translation) {
  const result = await chrome.storage.local.get(['history']);
  const history = result.history || [];

  history.unshift({
    ...translation,
    timestamp: Date.now()
  });

  // 최대 50개 유지
  if (history.length > 50) {
    history.pop();
  }

  await chrome.storage.local.set({ history });
}
