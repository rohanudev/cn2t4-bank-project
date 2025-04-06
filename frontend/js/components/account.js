// 계좌 상세
import { state } from '../store.js';
import { goTo } from '../router.js';

export function Account() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-landing";
  el.innerHTML = `
    <h2>계좌 상세 페이지</h2>
    <button id="btn-go-landing">랜딩페이지 가기</button>
    <button id="btn-go-deposit">입금하러 가기</button>
    <button id="btn-go-withdraw">출금하러 가기</button>
    <button id="btn-go-transfer">이체하러 가기</button>
  `;

  function init(props) {
    bindEvents();
  }

  function bindEvents() {
    el.querySelector("#btn-go-landing").addEventListener("click", () => {
      goTo("landing", {});
    });
    el.querySelector("#btn-go-deposit").addEventListener("click", () => {
      goTo("deposit", {});
    });
    el.querySelector("#btn-go-withdraw").addEventListener("click", () => {
      goTo("withdraw", {});
    });
    el.querySelector("#btn-go-transfer").addEventListener("click", () => {
      goTo("transfer", {});
    });
  }

  return { el, init };
}
