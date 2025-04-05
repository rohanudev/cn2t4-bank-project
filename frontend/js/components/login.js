import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";

export function Login() {
  let localState = {
    email: "",
    password: "",
  };

  function init() {
    bindEvents();
  }

  // 🔗 이벤트 바인딩
  function bindEvents() {
    const emailInput = el.querySelector("#login-email");
    const passwordInput = el.querySelector("#login-password");
    const loginBtn = el.querySelector("#login-button");
    const signupBtn = el.querySelector("#signup-button");

    if (!emailInput || !passwordInput || !loginBtn || !signupBtn) {
      console.error("[ERROR] 로그인 화면 UI 요소를 찾을 수 없습니다");
      return;
    }

    emailInput.addEventListener("input", (e) => {
      localState.email = e.target.value;
    });

    passwordInput.addEventListener("input", (e) => {
      localState.password = e.target.value;
    });

    loginBtn.addEventListener("click", handleLogin);
    signupBtn.addEventListener("click", () => {
      goTo("signup");
    });
  }

  // 🔐 로그인 처리
  async function handleLogin() {
    if (!localState.email || !localState.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localState.email,
          password: localState.password,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("[INFO] 로그인 성공:", data);
      goTo("userInfo", { userId: data.userId });
    } catch (error) {
      console.error("[ERROR] 로그인 실패:", error);
      alert("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.");
    }
  }

  // 🏗️ DOM 생성
  const el = document.createElement("div");
  el.className = "login";
  el.innerHTML = `
    <div class="title lemon-regular">Tikkle</div>

    <div class="info-input-box">
      <input id="login-email" type="email" class="info-input-text" placeholder="이메일" />
    </div>

    <div class="info-input-box">
      <input id="login-password" type="password" class="info-input-text" placeholder="비밀번호" />
    </div>

    <div class="single-btn-dark-box">
      <div id="login-button" class="single-btn-dark-text">로그인</div>
    </div>

    <div class="signup-btn">
      <span>
        <span class="signup-btn-span">계정이 없으신가요? </span>
        <button id="signup-button" class="signup-btn-span2" type="button">회원가입</button>
      </span>
    </div>
  `;

  return { el, init };
}
