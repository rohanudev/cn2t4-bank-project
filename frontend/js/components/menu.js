import { goTo } from "../router.js";

export function Menu() {
  function init() {
    bindEvents();
  }

  // 🔗 이벤트 바인딩
  function bindEvents() {
    const backBtn = el.querySelector(".back-btn");
    const infoBtn = el.querySelector("#user-info");
    const settingsBtn = el.querySelector("#settings");
    const logoutBtn = el.querySelector("#logout");

    if (!backBtn || !infoBtn || !settingsBtn || !logoutBtn) {
      console.error("[ERROR] 메뉴 화면 UI 요소를 찾을 수 없습니다");
      return;
    }

    backBtn.addEventListener("click", () => {
      goTo("landing", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
    });

    infoBtn.addEventListener("click", () => {
      goTo("userInfo", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
    });

    settingsBtn.addEventListener("click", () => {
      goTo("settings");
    });

    logoutBtn.addEventListener("click", () => {
      // 로그아웃 로직 추가 가능
      alert("로그아웃 되었습니다.");
      goTo("login");
    });
  }

  // 🏗️ DOM 생성
  const el = document.createElement("div");
  el.className = "menu";
  el.innerHTML = `
    <div class="back-btn-wrapper">
        <img class="back-btn" src="../../assets/icons/back-btn.png" />
    </div>
    <button id="user-info" class="menu-list">내 정보</button>
    <button id="settings" class="menu-list">설정</button>
    <button id="logout" class="menu-list">로그아웃</button>
  `;

  return { el, init };
}
