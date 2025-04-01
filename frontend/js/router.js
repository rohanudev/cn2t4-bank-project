// router.js
import { Login } from "./components/login.js";
import { Landing } from "./components/landing.js";
import { Account } from "./components/account.js";
import { Deposit } from "./components/deposit.js";
import { state } from './store.js';

const routes = {
  login: Login,
  landing: Landing,
  account: Account,
  deposit: Deposit,
};

let currentScreen = null;

export function goTo(screenName, props) {
  const app = document.getElementById("app");

  if (currentScreen) {
    app.removeChild(currentScreen.el); // 기존 화면 제거
  }

  const component = routes[screenName]();
  component.init?.(props);
  app.appendChild(component.el);

  currentScreen = component;
}