import { goTo } from "./router.js";
import { state } from "./store.js";

document.addEventListener("DOMContentLoaded", () => {
  // goTo("login");
  //goTo("userInfo", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
  //oTo("landing", { userId: "b4e8cd6c10117010456033172212c2f1" });
  //goTo("userInfoEdit", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
  //goTo("accountDetail", { userId: "b4e8cd6c10117010456033172212c2f1" });
  //goTo("deposit", {accountId});
  //goTo("withdraw", {accountId});
  //goTo("transfer", {accountId});
  //goTo("account", { userId: "bf7dfc9e-6e59-46e8-9ef4-efaabb2fe51b" });
  const accessToken = sessionStorage.getItem("access_token");
  state.userId = sessionStorage.getItem("user_id");
  state.userName = sessionStorage.getItem("user_name");
  state.userEmail = sessionStorage.getItem("user_email");
  if (accessToken) {
    goTo("landing", {});
  } else {
    goTo("login");
  }
});



