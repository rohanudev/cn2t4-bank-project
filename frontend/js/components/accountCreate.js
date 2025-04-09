import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";

export function AccountCreate() {
  let localState = {
    userId: null,
    nickname: "",
  };

  function init(props) {
    localState.userId = props?.userId ?? null;

    if (!localState.userId) {
      console.error("[ERROR] userId is missing");
      return;
    }

    bindEvents();
  }

  // 🔗 이벤트 바인딩
  function bindEvents() {
    const nicknameInput = el.querySelector("#account-nickname");
    const cancelBtn = el.querySelector("#account-cancel-button");
    const submitBtn = el.querySelector("#account-submit-button");

    if (!nicknameInput || !cancelBtn || !submitBtn) {
      console.error("[ERROR] 계좌 생성 화면 UI 요소를 찾을 수 없습니다");
      return;
    }

    nicknameInput.addEventListener("input", (e) => {
      localState.nickname = e.target.value;
    });

    cancelBtn.addEventListener("click", () => {
      goTo("landing", { userId: localState.userId });
    });

    submitBtn.addEventListener("click", handleCreateAccount);
  }

  // 📝 계좌 생성 처리
  async function handleCreateAccount() {
    const { nickname, userId } = localState;

    if (!nickname || nickname.trim().length === 0) {
      alert("계좌 별칭을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nickname: nickname.trim(),
          balance: 0,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("[INFO] 계좌 생성 성공:", data);
      alert("계좌가 성공적으로 개설되었습니다.");
      goTo("landing", { userId }); // userId 넘겨서 다시 돌아가기
    } catch (error) {
      console.error("[ERROR] 계좌 생성 실패:", error);
      alert("계좌 개설에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // 🏗️ DOM 생성
  const el = document.createElement("div");
  el.className = "account-create";
  el.innerHTML = `
    <div class="subtitle">새 계좌 개설</div>

    <div class="info-input-box">
      <input id="account-nickname" type="text" class="info-input-text" placeholder="계좌 별칭 입력" maxlength="20">
    </div>

    <div class="btn-container">
      <div id="account-cancel-button" class="half-btn-light">취소</div>
      <div id="account-submit-button" class="half-btn-dark">생성</div>
    </div>
  `;

  return { el, init };
}
