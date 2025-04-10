import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";
import { state } from "../store.js";
import { authorizedFetch } from "../utils.js";

export function Menu() {
  let localState = {
    userId: state.userId,
    email: state.userEmail,
  };

  function init(props) {
    if (!localState.userId || !localState.email) {
        console.error("[ERROR] Menu 페이지에 userId 또는 email이 전달되지 않았습니다.");
        return;
    }

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
        goTo("landing", {});
    });

    infoBtn.addEventListener("click", () => {
      goTo("userInfo", {});
    });

    settingsBtn.addEventListener("click", () => {
        goTo("settings", {});
    });

    logoutBtn.addEventListener("click", async () => {
      const accessToken = sessionStorage.getItem("access_token");
      const refreshToken = sessionStorage.getItem("refresh_token");
      
      try {
        // 1. 서버에 로그아웃 요청 (옵션)
        await authorizedFetch(`${API_BASE_URL}/api/authentication/logout`, {
          method: "POST",
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        });
    
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("id_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user_id");
      sessionStorage.removeItem("user_name");
      sessionStorage.removeItem("user_email");
      
      alert("로그아웃 되었습니다.");
      goTo("login");
      } catch (error) {
        console.error("로그아웃 중 오류 발생:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
      }
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
