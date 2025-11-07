// ShareHandler - 공유 데이터 처리
class ShareHandler {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  // 공유받은 데이터 로드
  async loadSharedData(shareId) {
    const sharedData = await this.storage.getSharedData(shareId);

    if (!sharedData || sharedData.processed) {
      return null;
    }

    return {
      url: this.extractURL(sharedData.url || sharedData.text),
      title: sharedData.title,
      text: sharedData.text
    };
  }

  // URL 추출 (text에서)
  extractURL(text) {
    if (!text) return '';

    // URL 패턴 매칭
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);

    if (match) {
      return match[0];
    }

    // URL처럼 보이는지 확인
    try {
      new URL(text);
      return text;
    } catch {
      return text;
    }
  }

  // 메타데이터 추출
  async fetchMetadata(url) {
    try {
      if (!url) {
        return this.getDefaultMetadata();
      }

      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      // 파비콘 URL 생성
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      return {
        domain,
        favicon,
        title: null, // 사용자가 제공한 title 사용
        thumbnail: null // CORS 이슈로 직접 추출 어려움
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return this.getDefaultMetadata();
    }
  }

  getDefaultMetadata() {
    return {
      domain: 'unknown',
      favicon: null,
      title: null,
      thumbnail: null
    };
  }

  // 링크 저장
  async saveLink(data) {
    const { url, title, note, shareId, originalText } = data;

    if (!url) {
      throw new Error('URL is required');
    }

    // URL 유효성 검증
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }

    // 메타데이터 추출
    const metadata = await this.fetchMetadata(url);

    // 링크 객체 생성
    const link = {
      id: this.generateId(),
      url,
      title: title || metadata.title || this.getTitleFromURL(url),
      description: note || '',
      thumbnail: metadata.thumbnail,
      favicon: metadata.favicon,
      domain: metadata.domain,
      isRead: false,
      category: null,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      readAt: null,
      sharedFrom: shareId ? 'share-api' : 'manual',
      sharedText: originalText || '',
      metadata: {
        author: null,
        publishDate: null,
        contentType: this.detectContentType(url),
        duration: null
      }
    };

    // IndexedDB에 저장
    await this.storage.createLink(link);

    // 공유 데이터를 처리 완료로 표시
    if (shareId) {
      await this.storage.markSharedDataProcessed(shareId);
    }

    return link;
  }

  // ID 생성
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // URL에서 제목 추출
  getTitleFromURL(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // 마지막 경로 세그먼트를 제목으로 사용
      const segments = pathname.split('/').filter(s => s);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        // 파일 확장자 제거
        return lastSegment.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      }

      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  // 콘텐츠 타입 감지
  detectContentType(url) {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'video';
    }
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return 'social';
    }
    if (urlLower.includes('github.com')) {
      return 'code';
    }
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return 'image';
    }
    if (urlLower.match(/\.(pdf)$/i)) {
      return 'document';
    }

    return 'article';
  }
}

export default ShareHandler;
