import { Deposit } from './components/deposit.js';

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  const { el, init } = Deposit();
  app.appendChild(el);

  init("333322233358212"); // accountId 넘겨주기
});

