import { goTo } from "../router.js";

export function Settings() {
  function init() {
    bindEvents();
  }

  // 🔗 이벤트 바인딩
  function bindEvents() {
    const backBtn = el.querySelector(".back-btn");
    const notificationBtn = el.querySelector("#noti-settings");
    const sleepBtn = el.querySelector("#sleep-mode");
    const deleteBtn = el.querySelector("#account-delete");

    if (!backBtn || !notificationBtn || !sleepBtn || !deleteBtn) {
      console.error("[ERROR] 설정 화면 UI 요소를 찾을 수 없습니다");
      return;
    }

    backBtn.addEventListener("click", () => {
      goTo("menu", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
    });

    notificationBtn.addEventListener("click", () => {
      goTo("notiSettings");
    });

    sleepBtn.addEventListener("click", () => {
      goTo("sleepMode");
    });

    deleteBtn.addEventListener("click", () => {
      goTo("accountDelete");
    });
  }

  // 🏗️ DOM 생성
  const el = document.createElement("div");
  el.className = "menu";
  el.innerHTML = `
    <div class="back-btn-wrapper">
      <img class="back-btn" src="../../assets/icons/back-btn.png" />
    </div>
    <button id="noti-settings" class="menu-list">알림 설정</button>
    <button id="sleep-mode" class="menu-list">회원 휴면 전환</button>
    <button id="account-delete" class="menu-list">회원 탈퇴</button>
  `;

  return { el, init };
}
