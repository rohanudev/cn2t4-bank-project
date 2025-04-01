import { state } from '../store.js';
import { goTo } from '../router.js';

export function Login() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-landing";
  el.innerHTML = `
    <h2>로그인 페이지</h2>
    <button id="btn-go-landing">랜딩페이지 가기</button>
  `;

  function init(props) {
    bindEvents();
  }

  function bindEvents() {
    el.querySelector("#btn-go-landing").addEventListener("click", () => {
      goTo("landing", {});
    });
  }

  return { el, init };
}
