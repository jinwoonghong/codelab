// Main App
import StorageManager from './managers/storage-manager.js';
import ShareHandler from './handlers/share-handler.js';
import { createDateGroup } from './components/link-card.js';
import { getDateGroup } from './utils/formatters.js';

class LinkKeeperApp {
  constructor() {
    this.storage = new StorageManager();
    this.shareHandler = new ShareHandler(this.storage);
    this.currentFilter = 'all';

    this.init();
  }

  async init() {
    console.log('Initializing Link Keeper App...');

    // Storage 초기화 대기
    await this.storage.ready;

    // Service Worker 등록
    this.registerServiceWorker();

    // PWA 설치 프롬프트
    this.setupInstallPrompt();

    // UI 이벤트 리스너 설정
    this.setupEventListeners();

    // 초기 데이터 로드
    await this.loadLinks();

    // 저장 완료 메시지 확인
    this.checkSavedParam();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/public/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  setupInstallPrompt() {
    let deferredPrompt = null;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // 설치 버튼 표시
      installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log('Install prompt outcome:', outcome);
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      installBtn.classList.add('hidden');
      this.showToast('앱이 설치되었습니다!');
    });
  }

  setupEventListeners() {
    // 필터 탭
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.changeFilter(tab.dataset.filter);
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // FAB (링크 추가 버튼)
    const addBtn = document.getElementById('add-link-btn');
    addBtn.addEventListener('click', () => {
      this.showAddLinkModal();
    });

    // 모달 닫기
    const closeModalBtn = document.getElementById('close-modal-btn');
    closeModalBtn.addEventListener('click', () => {
      this.hideAddLinkModal();
    });

    // 모달 외부 클릭 시 닫기
    const modal = document.getElementById('add-link-modal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideAddLinkModal();
      }
    });

    // 링크 추가 폼
    const addLinkForm = document.getElementById('add-link-form');
    addLinkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddLink();
    });
  }

  async changeFilter(filter) {
    this.currentFilter = filter;
    await this.loadLinks();
  }

  async loadLinks() {
    try {
      // 링크 가져오기
      const links = await this.storage.getAllLinks(this.currentFilter);

      // 개수 업데이트
      await this.updateCounts();

      // UI 렌더링
      this.renderLinks(links);
    } catch (error) {
      console.error('Error loading links:', error);
      this.showToast('링크를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async updateCounts() {
    const counts = await this.storage.getCounts();

    document.getElementById('count-all').textContent = `(${counts.all})`;
    document.getElementById('count-unread').textContent = `(${counts.unread})`;
    document.getElementById('count-read').textContent = `(${counts.read})`;
  }

  renderLinks(links) {
    const mainContent = document.getElementById('main-content');
    const emptyState = document.getElementById('empty-state');

    // 기존 링크 제거
    const dateGroups = mainContent.querySelectorAll('.date-group');
    dateGroups.forEach(group => group.remove());

    if (links.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    // 날짜별로 그룹화
    const grouped = this.groupByDate(links);

    // 각 그룹 렌더링
    const order = ['오늘', '어제', '이번 주', '이번 달', '이전'];
    order.forEach(dateLabel => {
      if (grouped[dateLabel] && grouped[dateLabel].length > 0) {
        const group = createDateGroup(
          dateLabel,
          grouped[dateLabel],
          (id, isRead) => this.toggleReadStatus(id, isRead),
          (id) => this.deleteLink(id)
        );
        mainContent.appendChild(group);
      }
    });
  }

  groupByDate(links) {
    const groups = {
      '오늘': [],
      '어제': [],
      '이번 주': [],
      '이번 달': [],
      '이전': []
    };

    links.forEach(link => {
      const dateLabel = getDateGroup(link.createdAt);
      if (groups[dateLabel]) {
        groups[dateLabel].push(link);
      }
    });

    return groups;
  }

  async toggleReadStatus(id, isRead) {
    try {
      if (isRead) {
        await this.storage.markAsRead(id);
      } else {
        await this.storage.markAsUnread(id);
      }

      await this.loadLinks();
      this.showToast(isRead ? '읽음으로 표시했습니다' : '안 읽음으로 표시했습니다');
    } catch (error) {
      console.error('Error toggling read status:', error);
      this.showToast('상태 변경 중 오류가 발생했습니다.');
    }
  }

  async deleteLink(id) {
    if (!confirm('이 링크를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await this.storage.deleteLink(id);
      await this.loadLinks();
      this.showToast('링크가 삭제되었습니다');
    } catch (error) {
      console.error('Error deleting link:', error);
      this.showToast('삭제 중 오류가 발생했습니다.');
    }
  }

  showAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    modal.classList.remove('hidden');

    // URL 입력 필드에 포커스
    setTimeout(() => {
      document.getElementById('url-input').focus();
    }, 100);
  }

  hideAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    modal.classList.add('hidden');

    // 폼 초기화
    document.getElementById('add-link-form').reset();
  }

  async handleAddLink() {
    const urlInput = document.getElementById('url-input');
    const noteInput = document.getElementById('note-input');

    const url = urlInput.value.trim();
    const note = noteInput.value.trim();

    if (!url) {
      alert('URL을 입력해주세요.');
      return;
    }

    try {
      await this.shareHandler.saveLink({
        url,
        title: null,
        note,
        shareId: null,
        originalText: ''
      });

      this.hideAddLinkModal();
      await this.loadLinks();
      this.showToast('링크가 저장되었습니다');
    } catch (error) {
      console.error('Error adding link:', error);
      alert('링크 저장 중 오류가 발생했습니다: ' + error.message);
    }
  }

  checkSavedParam() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('saved') === 'true') {
      this.showToast('링크가 저장되었습니다');

      // URL에서 파라미터 제거
      window.history.replaceState({}, '', '/');
    }
  }

  showToast(message, duration = 3000) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    // 자동 제거
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  new LinkKeeperApp();
});
