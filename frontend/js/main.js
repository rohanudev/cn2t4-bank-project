import { goTo } from "./router.js";
import { state } from "./store.js";

document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("access_token");
  const selectedAccountId = sessionStorage.getItem("selected_account_id");
  state.userId = sessionStorage.getItem("user_id");
  state.userName = sessionStorage.getItem("user_name");
  state.userEmail = sessionStorage.getItem("user_email");
  if (accessToken) {
    if (selectedAccountId) {
      goTo("accountDetail", { accountId: selectedAccountId });
    } else {
      goTo("landing", {});
    }
  } else {
    goTo("login");
  }
});



