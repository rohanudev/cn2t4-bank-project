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
    createdAt: null,
    transactions: []
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

      const txRes = await fetch(`${API_BASE_URL}/api/accounts/${localState.accountNumber}/history`);
      if (txRes.ok) {
        const txData = await txRes.json();
        localState.transactions = txData.history;
      }

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
    //loadAccountDetailCSS();
    el.innerHTML = `
      <div class="top-bar">
        <div class="back-btn-wrapper">
          <img class="back-btn" src="../../assets/icons/back-btn.png" />
        </div>
        <div id="delete-btn" class="account-delete">삭제</div>
      </div>


      <div class="account-detail-container">
        <div class="account-header">
          <div class="account-title-row">
            <h2>${localState.nickname || '계좌'}</h2>
            <img id="edit-btn" class="pencil-btn" src="../../assets/icons/pencil-btn.png" alt="수정" />
          </div>
          <p class="account-number">계좌번호: ${localState.accountNumber}</p>
        </div>

        
        <div class="account-balance">
          <p class="balance-big">${localState.balance.toLocaleString()}원</p>
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

        <div class="account-transactions">
          <h3 style="margin: 20px 0;">거래 내역</h3>
          <div class="scrollable-transactions">
            ${
              localState.transactions.length === 0
                ? '<p class="no-transaction">거래 내역이 없습니다.</p>'
                : `<ul class="transaction-history">
                    ${localState.transactions.map(tx => {
                      const isSent = tx.from_account === localState.accountNumber;
                      const isTransfer = tx.type === 'TRANSFER';
                      const amountSign = isTransfer ? (isSent ? '-' : '+') : (tx.type === 'WITHDRAWAL' ? '-' : '+');
                      const counterpartyLabel = isTransfer ? `${tx.counterparty_name || '상대방 정보 없음'}` : '';

                      return `
                        <li class="transaction-item ${tx.type.toLowerCase()}">
                          <div class="tx-header">
                            <span class="tx-type-label">
                              ${tx.type === 'DEPOSIT' ? '입금' : tx.type === 'WITHDRAWAL' ? '출금' : counterpartyLabel}
                            </span>
                            <span class="tx-amount ${amountSign === '+' ? 'incoming' : 'outgoing'}">
                              ${amountSign}${tx.amount.toLocaleString()}원
                            </span>
                          </div>
                          <div class="tx-details">
                            <span class="tx-time">${new Date(tx.timestamp).toLocaleString()}</span>
                            ${tx.memo ? `<span class="tx-memo">메모: ${tx.memo}</span>` : ''}
                          </div>
                        </li>
                      `;
                    }).join('')}
                  </ul>`
            }
          </div>
        </div>
      </div>

      <div class="transaction-buttons">
          <div class="btn-container">
            <div id="deposit-btn" class="half-btn-light">입금</div>
            <div id="withdraw-btn" class="half-btn-dark">출금</div>
          </div>
          <div id="transfer-btn" class="single-btn-dark-box">
            <span class="single-btn-dark-text">이체</span>
          </div>
      </div>
    `;

    // 버튼 이벤트 리스너 추가
    setupEventListeners();
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    //뒤로가기 버튼 이벤트
    el.querySelector(".back-btn").addEventListener("click", () => {
      goTo("landing", {
        userId: localState.userId,
      });
    });

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

  function loadAccountDetailCSS() {
    if (!document.querySelector('link[href*="account-feature.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../../css/account-feature.css'; // 실제 경로
      document.head.appendChild(link);
    }
  }

  return { el, init };
}
