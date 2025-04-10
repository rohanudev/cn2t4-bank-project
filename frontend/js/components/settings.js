import { API_BASE_URL } from "../config.js"; // API 주소
import { goTo } from "../router.js"; // 라우터 이동
import { authorizedFetch } from "../utils.js";
import { state } from "../store.js"; // 상태 관리

export function Settings() {

    let localState = {
        userId: state.userId,
        email: state.userEmail,
      };
    
      function init(props) {
        if (!localState.userId || !localState.email) {
          console.error("[ERROR] userId 또는 email이 누락되었습니다");
          return;
        }
    
        bindEvents();
      }

    // 🔗 이벤트 바인딩
    function bindEvents() {
        const backBtn = el.querySelector(".back-btn");
        const notificationBtn = el.querySelector("#noti-settings");
        const sleepBtn = el.querySelector("#sleep-mode");
        const deleteBtn = el.querySelector("#user-delete");

        if (!backBtn || !notificationBtn || !sleepBtn || !deleteBtn) {
        console.error("[ERROR] 설정 화면 UI 요소를 찾을 수 없습니다");
        return;
        }

        backBtn.addEventListener("click", () => {
            goTo("menu", {
              userId: localState.userId,
              email: localState.email,
            });
          });

        notificationBtn.addEventListener("click", () => {
        goTo("notiSettings");
        });

        sleepBtn.addEventListener("click", async () => {
            if (!confirm("정말로 휴면 전환하시겠습니까?")) return;

            try {
                const res = await authorizedFetch(`${API_BASE_URL}/api/users/deactivate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: localState.email }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "휴면 전환 요청 실패");
                }

                alert("휴면 전환이 완료되었습니다.");
                goTo("login");
            } catch (err) {
                console.error("[ERROR] 휴면 전환 요청 실패:", err);
                alert("휴면 전환 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        });

        deleteBtn.addEventListener("click", async () => {
            if (!confirm("정말로 회원을 탈퇴하시겠습니까?")) return;

            try {
                const res = await authorizedFetch(`${API_BASE_URL}/api/users/${localState.userId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: localState.email }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "탈퇴 요청 실패");
                }

                alert("회원 탈퇴가 완료되었습니다.");
                goTo("login");
            } catch (err) {
                console.error("[ERROR] 탈퇴 요청 실패:", err);
                alert("탈퇴 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        });
    }

    // 🏗️ DOM 생성
    const el = document.createElement("div");
    el.className = "menu";
    el.innerHTML = `
        <div class="back-btn-wrapper">
        <img class="back-btn" src="../../assets/icons/back-btn.png" />
        </div>
        <button id="noti-settings" class="menu-list">알림 설정</button>
        <button id="sleep-mode" class="menu-list">회원 휴면 전환</button>
        <button id="user-delete" class="menu-list">회원 탈퇴</button>
    `;

    return { el, init };
}
