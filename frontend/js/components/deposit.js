import { state } from './store.js';

export function Deposit() {
    // 내부 상태
    let localState = {
      amount: 0,
      accountId: null,
    };

    // 🚀 컴포넌트 초기화 (초기 상태 세팅, 이벤트 바인딩)
    function init(accountId) {
        localState.accountId = accountId;
        bindEvents();
      }
  
    // 📦 DOM 요소 생성
    const el = document.createElement("div");
    el.className = "screen";
    el.id = "screen-deposit";
    el.innerHTML = `
      <h2>입금</h2>
      <input type="number" id="deposit-amount" placeholder="금액 입력" />
      <button id="btn-submit-deposit">입금하기</button>
      <p id="deposit-message"></p>
    `;
  
    // 🔌 이벤트 핸들러 등록
    function bindEvents() {
      el.querySelector("#deposit-amount").addEventListener("input", (e) => {
        localState.amount = Number(e.target.value);
      });
  
      el.querySelector("#btn-submit-deposit").addEventListener("click", () => {
        submitDeposit();
      });
    }

    // 🌐 API 요청 함수
    async function submitDeposit() {
        const res = await fetch("https://api.example.com/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_id: localState.accountId,
            amount: localState.amount,
          }),
        });
    
        const data = await res.json();
    
        if (data.success) {
          document.getElementById("deposit-message").textContent = "입금 성공!";
          // 이후 화면 전환도 여기서 처리 가능
        } else {
          document.getElementById("deposit-message").textContent = "입금 실패!";
        }
      }
    
    // ⛳ 외부에 노출할 것: 엘리먼트 + init 함수
    return { el, init };
  }