import { state } from '../store.js';
import { goTo } from '../router.js';
import { API_BASE_URL } from '../config.js';

export function Deposit() {
    // 내부 상태
    let localState = {
      amount: 0,
      accountName: null,
      accountNumber: null,
      accountBalance: 0,
    };

    // 📦 DOM 요소 생성
    const el = document.createElement("div");
    el.id = "screen-deposit";
    el.className = "screen";

    // 🚀 컴포넌트 초기화 (초기 상태 세팅, 이벤트 바인딩)
    function init(props) {
      localState.accountName = props.accountName ?? null;
      localState.accountNumber = props.accountNumber ?? null;
      
      render(StepAmountInput);
    }

    function render(component) {
      el.innerHTML = ''; // 초기화
      el.appendChild(component());
    }
  
    // 단계 1: 금액 입력
    function StepAmountInput() {
      const container = document.createElement('div');
      container.id = "screen-deposit-1";
      container.className = "transaction-container";
      container.innerHTML = `
        <div id="quit" class="transaction-quit">취소</div>
        <div class="subtitle transaction-title">입금</div>
        <div class="transaction-body">
          <div class="account-info-box">
            <div class="account-name">${localState.accountName}</div>
            <div class="account-id">${localState.accountNumber}</div>
          </div>
          <div class="section-body">
            <div class="amount-input-box">
              <input id="amount" class="amount-input-text" placeholder="보낼 금액" />
              <div class="unit-label">원</div>
            </div>
          </div>
          <div class="account-info-box" style="visibility: hidden;">
            <div><span class="account-name">${localState.accountName}</span>(${localState.accountNumber.slice(-4)}): ${localState.accountBalance}원</div>
          </div>
          <div id="next" class="single-btn-dark-box">
            <div class="single-btn-dark-text">다음</div>
          </div>
        </div>
      `
      container.querySelector('#quit').addEventListener('click', () => {
        goTo("account", {})
      });

      container.querySelector('#amount').addEventListener('input', (e) => {
        // 숫자만 추출
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        // 0원 또는 빈 값이면 초기화
        if (rawValue === "" || /^0+$/.test(rawValue)) {
          e.target.value = "";
          localState.amount = 0;
          return;
        }
        // 쉼표 붙이기
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // 화면에 포맷팅된 값 반영
        e.target.value = formatted;
        // 상태값은 숫자 그대로 저장
        localState.amount = Number(rawValue);
      });

      container.querySelector('#next').addEventListener('click', () => {
        // 금액이 0원 이하일 경우 경고
        if (localState.amount <= 0) {
          alert("금액을 입력해주세요.");
          return;
        }

        const amount = container.querySelector('#amount').value;
        render(() => StepConfirm(amount));
      });
    
      return container;
    }

    // 단계 2: 확인
    function StepConfirm(amount) {
      const container = document.createElement('div');
      container.id = "screen-deposit-2";
      container.className = "transaction-container";
      container.innerHTML = `
        <div id="quit" class="transaction-quit" style="visibility: hidden;">취소</div>
        <div class="subtitle transaction-title">입금</div>
        <div class="transaction-body">
          <div class="account-info-box">
            <div class="account-name">${localState.accountName}</div>
            <div class="account-id">${localState.accountNumber}</div>
          </div>
          <div class="section-body">
            <div class="confirm-message">
              <span class="bold-text">${localState.accountName}</span>로<br>
              <span class="bold-text">${amount}원</span>을 입금합니다.
            </div>
          </div>
          <div class="account-info-box" style="visibility: hidden;">
            <div><span class="account-name">${localState.accountName}</span>(${localState.accountNumber.slice(-4)}): ${localState.accountBalance}원</div>
          </div>
          <div class="btn-container">
            <div id="cancel" class="half-btn-light">취소</div>
            <div id="submit" class="half-btn-dark">입금</div>
          </div>
        </div>
      `

      container.querySelector('#cancel').addEventListener('click', () => {
        render(StepAmountInput)
      });
    
      container.querySelector('#submit').addEventListener('click', () => {
        // submitDeposit();
        render(StepDone)
      });

      return container;
    }

    // 단계 3: 완료
    function StepDone() {
      const container = document.createElement('div');
      container.id = "screen-deposit-3";
      container.className = "transaction-container";
      container.innerHTML = `
        <div class="transaction-body">
          <div class="section-body">
            <div class="bold-text">입금이 완료되었습니다.</div>
          </div>
          <div id="done" class="single-btn-dark-box">
            <div class="single-btn-dark-text">확인</div>
          </div>
        </div>
      `
      container.querySelector('#done').addEventListener('click', () => {
        // 랜딩 페이지로 이동
        goTo("landing", []);
      });

      return container;
    }

    // 🌐 API 요청 함수
    async function submitDeposit() {
      const res = await fetch(`${API_BASE_URL}/api/transactions/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: localState.accountNumber,
          amount: localState.amount,
        }),
      });
    
      const data = await res.json();
      
      try {
          if (data.success) {
            document.getElementById("deposit-message").textContent = "입금 성공!";
          } else {
            document.getElementById("deposit-message").textContent = "입금 실패!";
          }
      } catch {
          console.error(err);
	      document.getElementById("deposit-message").textContent = "오류 발생!";
      }
    }
    
    // ⛳ 외부에 노출할 것: 엘리먼트 + init 함수
    return { el, init };
  }