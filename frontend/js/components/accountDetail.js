import { goTo } from '../router.js';
import { API_BASE_URL } from '../config.js';

export function AccountDetail() {
  // 내부 상태 관리
  let localState = {
    userId: null,               
    accountId: null,
    accountNumber: null,
    nickname: null,
    balance: 0,
    status: null,
    createdAt: null
  };

  // DOM 요소 생성
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-detail";

  // 초기화 함수
  async function init(props) {
    // props에서 accountId 추출
    if (!props || !props.accountId) {
      console.error('계좌 ID가 제공되지 않았습니다.');
      goTo('landing');
      return;
    }

    localState.accountId = props.accountId;
    localState.userId = props.userId ?? null;

    // 계좌 상세 정보 fetching
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${localState.accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('계좌 정보를 불러오는 데 실패했습니다.');
      }

      const accountData = await response.json();
      
      // 상태 업데이트
      localState = {
        ...localState,
        accountId: accountData.account_id,
        accountNumber: accountData.account_number,
        nickname: accountData.nickname,
        balance: accountData.balance,
        status: accountData.status,
        createdAt: accountData.created_at
      };

      // UI 렌더링
      renderAccountDetail();
    } catch (error) {
      console.error('계좌 정보 불러오기 실패:', error);
      el.innerHTML = `
        <div class="error-message">
          계좌 정보를 불러올 수 없습니다. 다시 시도해주세요.
          <button id="retry-btn">다시 시도</button>
        </div>
      `;

      el.querySelector('#retry-btn').addEventListener('click', () => init(props));
    }
  }

  // UI 렌더링 함수
  function renderAccountDetail() {
    el.innerHTML = `
      <div class="account-detail-container">
        <div class="account-header">
          <h2>${localState.nickname || '계좌'}</h2>
          <p class="account-number">계좌번호: ${localState.accountNumber}</p>
        </div>
        
        <div class="account-balance">
          <h3>현재 잔액</h3>
          <p class="balance">${localState.balance.toLocaleString()}원</p>
        </div>
        
        <div class="account-info">
          <div class="info-item">
            <span>계좌 상태</span>
            <span>${localState.status === 'OPEN' ? '정상' : '비활성'}</span>
          </div>
          <div class="info-item">
            <span>개설일</span>
            <span>${localState.createdAt}</span>
          </div>
        </div>
        
        <div class="transaction-buttons">
          <button id="deposit-btn" class="transaction-btn">입금</button>
          <button id="withdraw-btn" class="transaction-btn">출금</button>
          <button id="transfer-btn" class="transaction-btn">이체</button>
        </div>
        
        <div class="account-actions">
          <button id="edit-btn">계좌 정보 수정</button>
          <button id="delete-btn">계좌 해지</button>
        </div>
      </div>
    `;

    // 버튼 이벤트 리스너 추가
    setupEventListeners();
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    // 거래 버튼 이벤트
    el.querySelector('#deposit-btn').addEventListener('click', () => {
      goTo('deposit', { 
        accountId: localState.accountId,
        accountNumber: localState.accountNumber 
      });
    });

    el.querySelector('#withdraw-btn').addEventListener('click', () => {
      goTo('withdraw', { 
        accountId: localState.accountId,
        accountNumber: localState.accountNumber 
      });
    });

    el.querySelector('#transfer-btn').addEventListener('click', () => {
      goTo('transfer', { 
        accountId: localState.accountId,
        accountNumber: localState.accountNumber 
      });
    });

    // 계좌 정보 수정 버튼
    el.querySelector('#edit-btn').addEventListener('click', () => {
      goTo('accountEdit', { 
        accountId: localState.accountId,
        accountNumber: localState.accountNumber 
      });
    });

    // 계좌 해지 버튼
    el.querySelector('#delete-btn').addEventListener('click', async () => {
      if (confirm('정말로 이 계좌를 해지하시겠습니까?')) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/accounts/${localState.accountId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            alert('계좌가 성공적으로 해지되었습니다.');
            goTo('landing', { userId: localState.userId });
          } else {
            const errorData = await response.json();
            alert(errorData.error || '계좌 해지에 실패했습니다.');
          }
        } catch (error) {
          console.error('계좌 해지 오류:', error);
          alert('계좌 해지 중 오류가 발생했습니다.');
        }
      }
    });
  }

  return { el, init };
}
