import { goTo } from '../router.js';
import { API_BASE_URL } from '../config.js';
import { state } from '../store.js';

export function AccountCreate() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-create";

  function init(props) {
    renderCreateForm();
  }

  function renderCreateForm() {
    el.innerHTML = `
      <div class="account-create-container">
        <h2>새 계좌 개설</h2>
        <div class="form-group">
          <label for="nickname">계좌 별칭</label>
          <input 
            type="text" 
            id="nickname" 
            placeholder="계좌 별칭을 입력하세요" 
            maxlength="20"
          >
        </div>
        <div class="form-group">
          <label for="initial-balance">초기 입금액</label>
          <input 
            type="number" 
            id="initial-balance" 
            placeholder="0" 
            min="0"
          >
        </div>
        <button id="create-account-btn" class="single-btn-dark-box">
          계좌 개설
        </button>
      </div>
    `;

    const createBtn = el.querySelector('#create-account-btn');
    createBtn.addEventListener('click', createAccount);
  }

  async function createAccount() {
    const nicknameInput = el.querySelector('#nickname');
    const balanceInput = el.querySelector('#initial-balance');
    
    const nickname = nicknameInput.value.trim();
    const balance = 0;

    // 입력 검증
    if (nickname.length === 0) {
      alert('계좌 별칭을 입력해주세요.');
      nicknameInput.focus();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: state.userId, // store에서 현재 사용자 ID 가져오기
          nickname: nickname,
          balance: balance
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('계좌가 성공적으로 개설되었습니다.');
        goTo('landing'); // 랜딩 페이지로 이동
      } else {
        alert(data.error || '계좌 개설에 실패했습니다.');
      }
    } catch (error) {
      console.error('계좌 개설 오류:', error);
      alert('네트워크 오류로 계좌 개설에 실패했습니다.');
    }
  }

  return { el, init };
}