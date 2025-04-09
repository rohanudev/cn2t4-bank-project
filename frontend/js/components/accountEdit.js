import { goTo } from '../router.js';
import { API_BASE_URL } from '../config.js';

export function AccountEdit() {
  let localState = {
    accountId: null,
    accountNumber: null,
    nickname: '',
  };

  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-edit";

  function init(props) {
    if (!props || !props.accountId) {
      console.error('계좌 ID가 제공되지 않았습니다.');
      goTo('landing');
      return;
    }

    localState.accountId = props.accountId;
    localState.accountNumber = props.accountNumber || '';
    fetchAccountDetails();
  }

  async function fetchAccountDetails() {
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
      
      // localState 업데이트
      localState.nickname = accountData.nickname;
      localState.balance = accountData.balance;
      localState.status = accountData.status;
  
      // UI 렌더링
      renderEditForm();
    } catch (error) {
      console.error('계좌 정보 불러오기 실패:', error);
      alert('계좌 정보를 불러올 수 없습니다.');
      goTo('landing');
    }
  }

  function renderEditForm() {
    el.innerHTML = `
      <div class="subtitle">계좌 정보 수정</div>

      <div class="info-horizontal">
        <div class="info-label">계좌번호:</div>
        <div class="info-static-text">${localState.accountNumber}</div>
      </div>
  
      <div class="account-edit-wrapper">
        <div class="info-input-box">
          <input 
            type="text" 
            id="nickname" 
            class="info-input-text"
            value="${localState.nickname}"
            placeholder="계좌 별칭을 입력하세요"
            maxlength="20"
          >
        </div>
  
        <div class="btn-container">
          <div id="cancel-btn" class="half-btn-light">취소</div>
          <div id="save-btn" class="half-btn-dark">저장</div>
        </div>
      </div>
    `;
  
    setupEventListeners();
  }
  
  

  function setupEventListeners() {
    el.querySelector('#save-btn').addEventListener('click', saveAccountChanges);
    el.querySelector('#cancel-btn').addEventListener('click', () => goTo('accountDetail', { accountId: localState.accountId }));
  }

  async function saveAccountChanges() {
    const nicknameInput = el.querySelector('#nickname');
    const newNickname = nicknameInput.value.trim();

    if (newNickname.length === 0) {
      alert('계좌 별칭을 입력해주세요.');
      nicknameInput.focus();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${localState.accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: newNickname
        })
      });

      if (response.ok) {
        alert('계좌 정보가 성공적으로 수정되었습니다.');
        goTo('accountDetail', { accountId: localState.accountId });
      } else {
        const errorData = await response.json();
        alert(errorData.error || '계좌 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('계좌 정보 수정 오류:', error);
      alert('네트워크 오류로 계좌 정보 수정에 실패했습니다.');
    }
  }

  return { el, init };
}