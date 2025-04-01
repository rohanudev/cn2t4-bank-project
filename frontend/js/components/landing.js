import { state } from '../store.js';
import { goTo } from '../router.js';

export function Landing() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-landing";
  el.innerHTML = `
    <h2>랜딩 페이지</h2>
    <button id="btn-go-deposit">입금하러 가기</button>
  `;

  function init(props) {
    bindEvents();
  }

  function bindEvents() {
    el.querySelector("#btn-go-deposit").addEventListener("click", () => {
      goTo("deposit", { accountId: "333322233358212" });
    });
  }

  return { el, init };
}
