// accountDetail.js
import { goTo } from '../router.js';
import { API_BASE_URL } from '../config.js';
export function AccountDetail() {
  // 1) 화면에 넣을 <div> 생성
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-detail";


  // 2) init 함수: props를 받아서 실제 API 호출 및 화면 업데이트
  async function init(props) {
    // 화면 초기 템플릿 (로딩 상태 등)
    el.innerHTML = `
      <div class="subtitle">계좌 상세</div>
      <div id="account-info">Loading...</div>
      <div class="transaction-list" id="transaction-list"></div>
      <div class="btn-container">
        <div class="half-btn-dark" id="deposit-btn">입금</div>
        <div class="half-btn-light" id="withdraw-btn">출금</div>
      </div>
      <div class="single-btn-dark-box" id="transfer-btn">
        <div class="single-btn-dark-text">이체하기</div>
      </div>
    `;

    // props.accountId가 있다고 가정
    const { accountId } = props;
    if (!accountId) {
      document.getElementById("account-info").textContent =
        "accountId가 제공되지 않았습니다.";
      return;
    }

    try {
      // 3) GET /accounts/<account_id> 호출 (Django 서버: http://localhost:8000 등)
      const response = await fetch(`http://localhost:8000/accounts/detail/${accountId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch account");
      }

      // 4) 응답 JSON 파싱
      const account = await response.json();
      // account = {
      //   "account_id": "...",
      //   "account_number": "...",
      //   "user_id": "...",
      //   "nickname": "...",
      //   "balance": 100000,
      //   "status": "OPEN",
      //   "created_at": "2025-03-31 15:14:32"
      // }

      // 5) 화면에 표시
      const accountInfo = document.getElementById("account-info");
      accountInfo.innerHTML = `
        <div class="balance-big">${account.balance}원</div>
        <p>계좌번호: ${account.account_number}</p>
        <p>계좌 별칭: ${account.nickname}</p>
        <p>상태: ${account.status}</p>
        <p>생성일시: ${account.created_at}</p>
      `;

      const depositBtn = document.getElementById("deposit-btn");
      const withdrawBtn = document.getElementById("withdraw-btn");
      const transferBtn = document.getElementById("transfer-btn");

      if (depositBtn) {
        depositBtn.addEventListener("click", () => {
          goTo("deposit", {accountNumber: account.account_number});
        });
      }

      if (withdrawBtn) {
        withdrawBtn.addEventListener("click", () => {
          goTo("withdraw", {accountNumber: account.account_number});
        });
      }

      if (transferBtn) {
        transferBtn.addEventListener("click", () => {
          goTo("transfer", {accountNumber: account.account_number});
        });
      }
    } catch (error) {
      document.getElementById("account-info").innerHTML = `
        <p style="color:red;">계좌 정보를 불러오지 못했습니다: ${error.message}</p>
      `;
    }
  }

  return { el, init };
}