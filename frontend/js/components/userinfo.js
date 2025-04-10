import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";
import { state } from "../store.js";
import { authorizedFetch } from "../utils.js";

export function UserInfo() {
  let localState = {
    userId: state.userId,
    userData: {},
  };

  function init(props) {
    if (!localState.userId) {
      console.error("[ERROR] userId is missing");
      return;
    }

    fetchUserData();
    bindEvents();
  }

  // 🌐 사용자 정보 불러오기 (GET 요청)
  async function fetchUserData() {
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/users/${localState.userId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      localState.userData = data;
      updateUI();
    } catch (error) {
      console.error("[ERROR] Failed to fetch user data:", error);
    }
  }

  // 🏗️ DOM 요소 생성
  const el = document.createElement("div");
  el.className = "display-userinfo";
  el.innerHTML = `
    <img class="back-btn" src="../../assets/icons/back-btn.png" />
    
    <div class="content-wrapper">
      <div class="subtitle">내 정보</div>
      <div class="tiny-content-wrapper">
        <div class="tiny-content">계정생성일</div>
        <div class="tiny-content" id="created-at">-</div>
      </div>

      <div class="info-list">
        <div class="info-item">
          <div class="info-list-subject">성명</div>
          <div class="info-list-content" id="user-name">-</div>
        </div>
        <div class="info-item">
          <div class="info-list-subject">연락처</div>
          <div class="info-list-content" id="user-phone">-</div>
        </div>
        <div class="info-item">
          <div class="info-list-subject">이메일</div>
          <div class="info-list-content" id="user-email">-</div>
        </div>
      </div>
    </div>

    <div class="edit-btn">수정</div>
  `;

  // 📌 이벤트 바인딩
  function bindEvents() {
    const backBtn = el.querySelector(".back-btn");
    const editBtn = el.querySelector(".edit-btn");

    if (!backBtn || !editBtn) {
      console.error("[ERROR] UI 요소 바인딩 실패");
      return;
    }

    backBtn.addEventListener("click", () => {
      goTo("landing", {});
    });

    editBtn.addEventListener("click", () => {
      goTo("userInfoEdit", {});
    });
  }

  // 📌 UI 업데이트
  function updateUI() {
    const nameElement = el.querySelector("#user-name");
    const phoneElement = el.querySelector("#user-phone");
    const emailElement = el.querySelector("#user-email");
    const createdAtElement = el.querySelector("#created-at");

    if (!nameElement || !phoneElement || !emailElement || !createdAtElement) {
      console.error("[ERROR] UI 요소를 찾을 수 없음");
      return;
    }

    nameElement.textContent = localState.userData?.name || "-";
    phoneElement.textContent = localState.userData?.phone || "-";
    emailElement.textContent = localState.userData?.email || "-";
    createdAtElement.textContent = formatDate(localState.userData?.created_at);
  }

  // 🗓️ 날짜 포맷 변환 함수
  function formatDate(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  return { el, init };
}
