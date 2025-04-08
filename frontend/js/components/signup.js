import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";

export function Signup() {
  let localState = {
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    birthdate: "",
  };

  function init() {
    bindEvents();
  }

  // 🔗 이벤트 바인딩
  function bindEvents() {
    const emailInput = el.querySelector("#signup-email");
    const passwordInput = el.querySelector("#signup-password");
    const confirmPasswordInput = el.querySelector("#signup-confirm-password");
    const nameInput = el.querySelector("#signup-name");
    const phoneInput = el.querySelector("#signup-phone");
    const birthdateInput = el.querySelector("#signup-birthdate");
    const cancelBtn = el.querySelector("#signup-cancel-button");
    const submitBtn = el.querySelector("#signup-submit-button");

    if (
      !emailInput || !passwordInput || !confirmPasswordInput ||
      !nameInput || !phoneInput || !birthdateInput ||
      !cancelBtn || !submitBtn
    ) {
      console.error("[ERROR] 회원가입 화면 UI 요소를 찾을 수 없습니다");
      return;
    }

    emailInput.addEventListener("input", (e) => {
      localState.email = e.target.value;
    });

    passwordInput.addEventListener("input", (e) => {
      localState.password = e.target.value;
    });

    confirmPasswordInput.addEventListener("input", (e) => {
      localState.confirmPassword = e.target.value;
    });

    nameInput.addEventListener("input", (e) => {
      localState.name = e.target.value;
    });

    phoneInput.addEventListener("input", (e) => {
      localState.phone = e.target.value;
    });

    birthdateInput.addEventListener("input", (e) => {
      localState.birthdate = e.target.value;
    });

    cancelBtn.addEventListener("click", () => {
      goTo("login");
    });

    submitBtn.addEventListener("click", handleSignup);
  }

  // 📝 회원가입 처리
  async function handleSignup() {
    const {
      email, password, confirmPassword, name, phone, birthdate
    } = localState;

    if (!email || !password || !confirmPassword || !name || !phone || !birthdate) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone, birthdate }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      console.log("[INFO] 회원가입 성공:", data);
      alert("회원가입이 완료되었습니다. 이메일 인증 후 사용해 주세요.");
      
      goTo("verifyEmail", {email});

    } catch (error) {
      console.error("[ERROR] 회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // 🏗️ DOM 생성
  const el = document.createElement("div");
  el.className = "signup";
  el.innerHTML = `
    <div class="subtitle">회원가입</div>

    <div>
      <div class="subsubtitle">인증 정보 입력</div>

      <div class="info-input-box">
        <input id="signup-email" type="email" class="info-input-text" placeholder="이메일">
      </div>

      <div class="info-input-box">
        <input id="signup-password" type="password" class="info-input-text" placeholder="비밀번호">
      </div>

      <div class="info-input-box">
        <input id="signup-confirm-password" type="password" class="info-input-text" placeholder="비밀번호 확인">
      </div>
    </div>

    <div>
      <div class="subsubtitle">개인 정보 입력</div>

      <div class="info-input-box">
        <input id="signup-name" type="text" class="info-input-text" placeholder="이름">
      </div>

      <div class="info-input-box">
        <input id="signup-phone" type="tel" class="info-input-text" placeholder="휴대폰 번호">
      </div>

      <div class="info-input-box">
        <input id="signup-birthdate" type="text" class="info-input-text" placeholder="생년월일(ex.YYYY-MM-DD)">
      </div>
    </div>

    <div class="btn-container">
      <div id="signup-cancel-button" class="half-btn-light">취소</div>
      <div id="signup-submit-button" class="half-btn-dark">가입</div>
    </div>
  `;

  return { el, init };
}
