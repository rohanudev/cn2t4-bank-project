import { API_BASE_URL } from "../config.js";
import { goTo } from "../router.js";
import { state } from "../store.js";

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
      const res = await fetch(`${API_BASE_URL}/api/authentication/login`, {
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
      state.userId = data.user.user_id;
      state.userEmail = data.user.email;
      state.userName = data.user.name;
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("id_token", data.id_token);
      sessionStorage.setItem("refresh_token", data.refresh_token);
      sessionStorage.setItem("user_id", data.user.user_id);
      sessionStorage.setItem("user_name", data.user.name);
      sessionStorage.setItem("user_email", data.user.email);
    
      goTo("landing", {});

    } catch (error) {
      console.error("[ERROR] 로그인 실패:", error);
      alert("로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.");
    }
  }

  async function apiRequestWithAutoRefresh(url, options = {}) {
    let accessToken = localStorage.getItem("access_token");
    let refreshToken = localStorage.getItem("refresh_token");

    // 기본 헤더 설정
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
  };

  let response = await fetch(url, options);

  // access_token 만료됐을 경우
  if (response.status === 401 && refreshToken) {
    // refresh token으로 새 access_token 요청
    const refreshRes = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const refreshData = await refreshRes.json();

    if (refreshRes.ok && refreshData.access_token) {
      // 새 access_token 저장
      localStorage.setItem('access_token', refreshData.access_token);
      if (refreshData.id_token) {
        localStorage.setItem('id_token', refreshData.id_token);
      }

      // 원래 요청 재시도
      options.headers['Authorization'] = `Bearer ${refreshData.access_token}`;
      return fetch(url, options);
    } else {
      // refresh 실패 → 로그아웃 처리
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.clear();
      goTo("login");
    }
  }
  return response;
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

    <div id="login-button" class="single-btn-dark-box">
      <div id="login-text" class="single-btn-dark-text">로그인</div>
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
