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
    localState.accountNumber = props.accountNumber;

    fetchAccountDetails();
  }

  async function fetchAccountDetails() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/detail/${localState.accountId}`);
      const accountData = await response.json();
      
      localState.nickname = accountData.nickname;
      renderEditForm();
    } catch (error) {
      console.error('계좌 정보 불러오기 실패:', error);
      alert('계좌 정보를 불러올 수 없습니다.');
      goTo('landing');
    }
  }

  function renderEditForm() {
    el.innerHTML = `
      <div class="account-edit-container">
        <h2>계좌 정보 수정</h2>
        <div class="form-group">
          <label for="account-number">계좌번호</label>
          <input 
            type="text" 
            id="account-number" 
            value="${localState.accountNumber}" 
            disabled
          >
        </div>
        <div class="form-group">
          <label for="nickname">계좌 별칭</label>
          <input 
            type="text" 
            id="nickname" 
            value="${localState.nickname}"
            placeholder="계좌 별칭을 입력하세요"
            maxlength="20"
          >
        </div>
        <button id="save-btn" class="save-button">저장</button>
        <button id="cancel-btn" class="cancel-button">취소</button>
      </div>
    `;

    setupEventListeners();
  }

  function setupEventListeners() {
    el.querySelector('#save-btn').addEventListener('click', saveAccountChanges);
    el.querySelector('#cancel-btn').addEventListener('click', () => goTo('account', { accountId: localState.accountId }));
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
      const response = await fetch(`${API_BASE_URL}/accounts/${localState.accountId}`, {
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
        goTo('account', { accountId: localState.accountId });
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