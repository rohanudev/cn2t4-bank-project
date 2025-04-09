import { API_BASE_URL } from "../config.js"; // API 주소
import { goTo } from "../router.js"; // 라우터 이동
import { state } from "../store.js"; // 상태 관리

export function Landing() {
  let localState = {
    userId: null,
    userName: "-",
    email: "",
    accounts: [],
  };

  function init(props) {
    localState = {
      userId: state.userId,
      email: state.userEmail,
      userName: state.userName,
      accounts: [],
    };

    if (!localState.userId) {
      console.error("[ERROR] userId is missing");
      return;
    }

    fetchUserData();
    fetchAccounts();
    bindEvents();
  }

  async function fetchUserData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${localState.userId}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      localState.userName = data.name;
      updateUI();
    } catch (error) {
      console.error("[ERROR] Failed to fetch user data:", error);
    }
  }

  async function fetchAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/user/${localState.userId}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      localState.accounts = data;
      updateUI();
    } catch (error) {
      console.error("[ERROR] Failed to fetch accounts:", error);
    }
  }

  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-landing";
  el.innerHTML = `
    <div class="landing">
      <div class="header-container">
        <div class="user-name" id="user-name">-</div>
        <div class="icons">
          <img src="../../assets/icons/noti-btn.png" class="noti-btn" />
          <img src="../../assets/icons/menu-btn.png" class="menu-btn" />
        </div>
      </div>
      <div class="center-wrapper">
        <div class="account-list-container"></div>
        <div class="single-btn-dark-box add-account-btn">
          <div class="single-btn-dark-text">+</div>
        </div>
      </div>
    </div>
  `;

  function updateUI() {
    const userNameElement = el.querySelector("#user-name");
    if (userNameElement) {
      userNameElement.textContent = localState.userName || "-";
    }

    const accountListContainer = el.querySelector(".account-list-container");
    accountListContainer.innerHTML = "";

    localState.accounts.forEach(account => {
      const accountCard = document.createElement("div");
      accountCard.className = "account-info-card";
      accountCard.dataset.accountId = account.account_id;
      accountCard.innerHTML = `
        <div class="account-header">
          <div class="account-nick">${account.nickname}</div>
          <div class="balance-container">
            <div class="balance">${account.balance.toLocaleString()}</div>
            <div class="money-unit">원</div>
          </div>
        </div>
        <div id="btn-go-transfer" class="transfer-btn">
          <div class="transfer-text">이체</div>
        </div>
      `;

      // ✅ 카드 클릭 시 account-detail로 이동 (이체 버튼 클릭 제외)
      accountCard.addEventListener("click", (event) => {
        if (!event.target.closest(".transfer-btn")) {
          console.log("[INFO] 계좌상세이동:", account.account_id);
          goTo("accountDetail", { userId: localState.userId, accountId: account.account_id });
        }
      });

      accountListContainer.appendChild(accountCard);
    });

    bindTransferEvents(); // 이체 버튼 바인딩
  }

  function bindEvents() {
    el.querySelector(".add-account-btn").addEventListener("click", () => {
      goTo("accountCreate", { userId: localState.userId });
    });

    el.querySelector(".noti-btn").addEventListener("click", () => {
      goTo("noti");
    });

    el.querySelector(".menu-btn").addEventListener("click", () => {
      goTo("menu", { userId: localState.userId, email: localState.email });
    });
  }

  function bindTransferEvents() {
    const transferButtons = el.querySelectorAll(".transfer-btn");
    transferButtons.forEach(btn => {
      btn.addEventListener("click", (event) => {
        const accountCard = event.target.closest(".account-info-card");
        const accountId = accountCard.dataset.accountId;
        goTo("transfer", { accountId });
      });
    });
  }

  return { el, init };
}
