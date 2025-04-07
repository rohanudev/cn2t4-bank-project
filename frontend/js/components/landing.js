import { API_BASE_URL } from "../config.js"; // API 주소
import { goTo } from "../router.js"; // 라우터 이동

export function Landing() {
  let localState = {
    userId: null,
    userName: "-", // 초기값
    accounts: [],
  };

  function init(props) {
    localState.userId = props.userId ?? null;
    if (!localState.userId) {
      console.error("[ERROR] userId is missing");
      return;
    }

    fetchUserData();  // 사용자 정보 불러오기
    fetchAccounts();   // 계좌 목록 불러오기
    bindEvents();
  }

  // 🌐 사용자 정보 불러오기 (GET 요청)
  async function fetchUserData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${localState.userId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      localState.userName = data.name; // 사용자 이름 저장
      updateUI();
    } catch (error) {
      console.error("[ERROR] Failed to fetch user data:", error);
    }
  }

  // 🌐 계좌 목록 불러오기 (GET 요청)
  async function fetchAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/${localState.userId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      localState.accounts = data;
      updateUI();
    } catch (error) {
      console.error("[ERROR] Failed to fetch accounts:", error);
    }
  }

  // 🏗️ DOM 요소 생성
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

  // 📌 UI 업데이트 함수
  function updateUI() {
    // 사용자 이름 업데이트
    const userNameElement = el.querySelector("#user-name");
    if (userNameElement) {
      userNameElement.textContent = localState.userName || "-";
    }

    // 계좌 목록 업데이트
    const accountListContainer = el.querySelector(".account-list-container");
    accountListContainer.innerHTML = ""; // 기존 내용 초기화

    localState.accounts.forEach(account => {
      const accountCard = document.createElement("div");
      accountCard.className = "account-info-card";
      accountCard.dataset.accountId = account.account_id; // 계좌 ID 저장
      accountCard.innerHTML = `
        <div class="account-header">
          <div class="account-nick">${account.nickname}</div>
          <div class="balance-container">
            <div class="balance">${account.balance.toLocaleString()}</div>
            <div class="money-unit">원</div>
          </div>
        </div>
        <div class="transfer-btn">
          <div class="transfer-text">이체</div>
        </div>
      `;
      accountListContainer.appendChild(accountCard);
    });

    // 계좌 목록 로드 후 이체 버튼 이벤트 바인딩
    bindTransferEvents();
  }

  // 🔄 이벤트 바인딩 함수
  function bindEvents() {
    // 계좌 추가 버튼 이벤트
    el.querySelector(".add-account-btn").addEventListener("click", () => {
      goTo("add-account");
    });
  
    // 알림 버튼 클릭 시
    el.querySelector(".noti-btn").addEventListener("click", () => {
      goTo("noti"); // noti 페이지로 이동
    });
  
    // 메뉴 버튼 클릭 시
    el.querySelector(".menu-btn").addEventListener("click", () => {
      goTo("menu"); // menu 페이지로 이동
    });
  }

  function bindTransferEvents() {
    const transferButtons = el.querySelectorAll(".transfer-btn");
    transferButtons.forEach(btn => {
      btn.addEventListener("click", (event) => {
        const accountCard = event.target.closest(".account-info-card");
        const accountId = accountCard.dataset.accountId;
        goTo(`/transfer`);
      });
    });
  }

  return { el, init };
}

/*
import { state } from '../store.js';
import { goTo } from '../router.js';

export function Landing() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-landing";
  el.innerHTML = `
    <h2>랜딩 페이지</h2>
    <button id="btn-go-deposit">입금하러 가기</button>
    <button id="btn-go-withdraw">출금하러 가기</button>
    <button id="btn-go-transfer">이체하러 가기</button>
  `;

  function init(props) {
    bindEvents();
  }

  function bindEvents() {
    el.querySelector("#btn-go-deposit").addEventListener("click", () => {
      goTo("deposit", { accountName: "저축 계좌", accountId: "333322233358212" });
    });
    el.querySelector("#btn-go-withdraw").addEventListener("click", () => {
      goTo("withdraw", { accountName: "저축 계좌", accountId: "333322233358212" });
    });
    el.querySelector("#btn-go-transfer").addEventListener("click", () => {
      goTo("transfer", { accountName: "저축 계좌", accountId: "333322233358212" });
    });
  }

  return { el, init };
}
  */
