import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";
import { authorizedFetch } from "../utils.js";
import { state } from "../store.js";

export function VerifyEmail() {
  let localState = {
    email: state.userEmail,
    code: "",
  };

  function init(props) {
    if (!localState.email) {
      console.error("[ERROR] 이메일 정보가 없습니다.");
      return;
    }

    bindEvents();
    updateUI();
  }

  // 📌 UI 요소 생성
  const el = document.createElement("div");
  el.className = "verify-email";
  el.innerHTML = `
    <img class="back-btn" src="../../assets/icons/back-btn.png" />
    
    <div class="content-wrapper" style="margin-top: 60px;">
      <div class="subtitle">이메일 인증</div>
      <p><b id="verify-email-text">-</b> 주소로 전송된 인증 코드를 입력해주세요.</p>

      <div class="info-input-box">
        <input id="verify-code-input" class="info-input-text" placeholder="인증 코드">
      </div>

      <div class="btn-container">
        <div id="verify-confirm-btn" class="half-btn-dark">인증 완료</div>
      </div>
    </div>
  `;

  // 📌 이벤트 바인딩
  function bindEvents() {
    const backBtn = el.querySelector(".back-btn");
    const input = el.querySelector("#verify-code-input");
    const confirmBtn = el.querySelector("#verify-confirm-btn");

    if (!backBtn || !input || !confirmBtn) {
      console.error("[ERROR] UI 요소 바인딩 실패");
      return;
    }

    input.addEventListener("input", (e) => {
      localState.code = e.target.value;
    });

    confirmBtn.addEventListener("click", handleConfirm);
    backBtn.addEventListener("click", () => {
      goTo("signup");
    });
  }

  // 📡 인증 확인 요청
  async function handleConfirm() {
    if (!localState.code) {
      alert("인증 코드를 입력해주세요.");
      return;
    }

    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/users/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localState.email,
          confirmation_code: localState.code,
        }),
      });

      if (!res.ok) throw new Error(`인증 실패: ${res.status}`);

      alert("이메일 인증이 완료되었습니다. 로그인해주세요.");
      goTo("login");
    } catch (err) {
      console.error("[ERROR] 이메일 인증 실패:", err);
      alert("인증 코드가 유효하지 않습니다. 다시 확인해주세요.");
    }
  }

  // 🖥️ UI 업데이트
  function updateUI() {
    const emailText = el.querySelector("#verify-email-text");
    if (emailText) {
      emailText.textContent = localState.email;
    }
  }

  return { el, init };
}
