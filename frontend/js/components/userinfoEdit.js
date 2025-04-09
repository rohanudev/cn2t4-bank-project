import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";
import { authorizedFetch } from "../utils.js";

export function UserInfoEdit() {
  let localState = {
    userId: null,
    userData: {},
  };

  function init(props) {
    localState.userId = props.userId ?? null;
    if (!localState.userId) {
      console.error("[ERROR] userId is missing");
      return;
    }

    fetchUserData();
  }

  async function fetchUserData() {
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/users/${localState.userId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      localState.userData = data;
      populateForm();
    } catch (error) {
      console.error("[ERROR] Failed to fetch user data:", error);
    }
  }

  function populateForm() {
    el.querySelector("#user-name").value = localState.userData?.name || "";
    el.querySelector("#user-phone").value = localState.userData?.phone || "";
    el.querySelector("#user-email").value = localState.userData?.email || "";
  }

  async function updateUser() {
    const updatedData = {
      name: el.querySelector("#user-name").value,
      phone: el.querySelector("#user-phone").value,
      email: el.querySelector("#user-email").value,
    };

    if (!updatedData.name || !updatedData.phone || !updatedData.email) {
      console.error("[ERROR] Missing required fields");
      return;
    }

    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/users/${localState.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      alert("수정이 완료되었습니다.");

      goTo("userInfo", { userId: localState.userId });
    } catch (error) {
      console.error("[ERROR] Failed to update user data:", error);
    }
  }

  const el = document.createElement("div");
  el.className = "edit-userinfo";
  el.innerHTML = `
    <div class="subtitle">내 정보</div>
    <div>
      <div class="subsubtitle">개인 정보 수정</div>
      <div class="info-input-box">
        <input type="text" id="user-name" class="info-input-text" placeholder="이름">
      </div>
      <div class="info-input-box">
        <input type="tel" id="user-phone" class="info-input-text" placeholder="휴대폰 번호">
      </div>
      <div class="info-input-box">
        <input type="text" id="user-email" class="info-input-text" placeholder="이메일">
      </div>
    </div>
    <div class="btn-container">
      <div class="half-btn-light">취소</div>
      <div class="half-btn-dark">수정</div>
    </div>
  `;

  //TBD
  //el.querySelector(".half-btn-light").addEventListener("click", () => goTo("userInfo", { userId: localState.userId }));
  el.querySelector(".half-btn-light").addEventListener("click", () => goTo("userInfo", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" }));
  el.querySelector(".half-btn-dark").addEventListener("click", updateUser);

  return { el, init };
}
