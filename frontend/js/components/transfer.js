import { state } from "../store.js";
import { goTo } from "../router.js";
import { API_BASE_URL } from "../config.js";
import { authorizedFetch } from "../utils.js";

export function Transfer() {
  // 내부 상태
  let localState = {
    amount: 0,
    accountId: null,
    accountName: null,
    accountNumber: null,
    accountBalance: 0,
    userName: null,
    toAccountUserName: null,
    toaccountNumber: null,
  };

  // 📦 DOM 요소 생성
  const el = document.createElement("div");
  el.id = "screen-deposit";
  el.className = "screen";

  // 🚀 컴포넌트 초기화 (초기 상태 세팅, 이벤트 바인딩)
  async function init(props) {
    localState.accountId = props.accountId;
    const accountInfo = await validateAccountNumber(localState.accountId);
    if (!accountInfo) return;

    localState.accountNumber = accountInfo.account_number;
    localState.accountName = accountInfo.account_name;
    localState.accountBalance = accountInfo.balance;
    localState.userName = accountInfo.owner;

    if (!localState.accountNumber || !localState.accountName) return;
    render(StepAccountInput);
  }

  function render(component) {
    el.innerHTML = ""; // 초기화
    el.appendChild(component());
  }

  // 단계 1: 계좌번호 입력
  function StepAccountInput() {
    const container = document.createElement("div");
    container.id = "screen-transfer-1";
    container.className = "transaction-container";
    container.innerHTML = `
        <div id="quit" class="transaction-quit">취소</div>
        <div class="subtitle transaction-title">이체</div>
        <div class="transaction-body">
          <div class="section-body">
            <div class="bold-text" style="align-self: start;">누구에게 보낼까요?</div>
            <input id="to-account-input" class="account-input-box" placeholder="입금할 계좌번호 입력" />
          </div>
          <div id="next" class="single-btn-dark-box">
            <div class="single-btn-dark-text">다음</div>
          </div>
        </div>
      `;

    container.querySelector("#quit").addEventListener("click", () => {
      goTo("landing", {});
    });

    container
      .querySelector("#to-account-input")
      .addEventListener("input", (e) => {
        // 숫자만 추출
        const formatted = e.target.value.replace(/[^0-9]/g, "");
        e.target.value = formatted;
        // 상태값은 숫자 그대로 저장
        localState.toaccountNumber = formatted;
      });

    container.querySelector("#next").addEventListener("click", async () => {
      if (
        localState.toaccountNumber == "" ||
        localState.toaccountNumber == null
      ) {
        alert("계좌 번호를 입력해주세요.");
        return;
      }
      // 계좌번호 유효성 검사
      const accountInfo = await validateAccountNumber(
        null,
        localState.toaccountNumber
      );
      if (!accountInfo) return;

      localState.toAccountUserName = accountInfo.owner;
      render(StepAmountInput);
    });

    return container;
  }

  // 단계 2: 금액 입력
  function StepAmountInput() {
    const container = document.createElement("div");
    container.id = "screen-transfer-2";
    container.className = "transaction-container";
    container.innerHTML = `
          <div id="quit" class="transaction-quit">취소</div>
          <div class="subtitle transaction-title">이체</div>
          <div class="transaction-body">
            <div class="account-info-box">
              <div class="account-name">${localState.toAccountUserName}</div>
              <div class="account-id">${localState.toaccountNumber}</div>
            </div>
            <div class="section-body">
              <div class="bold-text" style="align-self: start; margin-bottom: 40px;">얼마를 보낼까요?</div>
              <div class="amount-input-box">
                <input id="amount" class="amount-input-text" placeholder="보낼 금액" />
                <div class="unit-label">원</div>
              </div>
              <div id="amount-warning" style="margin-top: 20px; display: none;">출금계좌 잔고 부족</div>
            </div>
            <div class="account-info-box">
              <div><span class="account-name">${
                localState.accountName
              }</span>(${localState.accountNumber.slice(
      -4
    )}): ${localState.accountBalance.toLocaleString()}원</div>
            </div>
            <div id="next" class="single-btn-dark-box">
              <div class="single-btn-dark-text">다음</div>
            </div>
          </div>
        `;

    container.querySelector("#quit").addEventListener("click", () => {
      goTo("landing", {});
    });

    container.querySelector("#amount").addEventListener("input", (e) => {
      // 숫자만 추출
      const rawValue = e.target.value.replace(/[^0-9]/g, "");
      const warningEl = container.querySelector("#amount-warning");
      const nextBtn = container.querySelector("#next");

      // 0원 또는 빈 값이면 초기화
      if (rawValue === "" || /^0+$/.test(rawValue)) {
        e.target.value = "";
        localState.amount = 0;
        warningEl.style.display = "none";
        nextBtn.classList.remove("disabled");
        return;
      }
      // 쉼표 붙이기
      const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // 화면에 포맷팅된 값 반영
      e.target.value = formatted;
      // 상태값은 숫자 그대로 저장
      localState.amount = Number(rawValue);

      if (localState.amount > localState.accountBalance) {
        e.target.style.color = "#d33";
        warningEl.style.display = "block";
        nextBtn.classList.add("disabled");
      } else {
        e.target.style.color = "#000";
        warningEl.style.display = "none";
        nextBtn.classList.remove("disabled");
      }
    });

    container.querySelector("#next").addEventListener("click", (e) => {
      if (e.target.classList.contains("disabled")) return;
      // 금액이 0원 이하일 경우 경고
      if (localState.amount <= 0) {
        alert("금액을 입력해주세요.");
        return;
      }

      const amount = container.querySelector("#amount").value;
      render(() => StepConfirm(amount));
    });

    return container;
  }

  // 단계 3: 확인
  function StepConfirm(amount) {
    const container = document.createElement("div");
    container.id = "screen-transfer-3";
    container.className = "transaction-container";
    container.innerHTML = `
        <div class="transaction-body">
          <div class="section-body">
            <div class="confirm-message">
              <span class="bold-text">${localState.toAccountUserName}</span>님에게<br>
              <span class="bold-text">${amount}원</span>을 이체할까요?
            </div>
          </div>
          <div class="account-detail-box">
            <div class="account-detail-line">
              <span class="account-detail-label">받는 계좌</span>
              <span class="account-detail-value">${localState.toaccountNumber}</span>
            </div>
            <div class="account-detail-line">
              <span class="account-detail-label">출금 계좌</span>
              <span class="account-detail-value">${localState.accountNumber}</span>
            </div>
            <div class="">
              <label for="transfer-memo" class="account-detail-label">메모</label>
              <input id="transfer-memo" class="memo-input-box" placeholder="최대 100자" />
            </div>
          </div>
          <div class="btn-container">
            <div id="cancel" class="half-btn-light">취소</div>
            <div id="submit" class="half-btn-dark">이체</div>
          </div>
        </div>
      `;

    container.querySelector("#cancel").addEventListener("click", () => {
      render(StepAmountInput);
    });

    container.querySelector("#submit").addEventListener("click", () => {
      submitTransfer();
    });

    return container;
  }

  // 단계 4: 완료
  function StepDone() {
    const container = document.createElement("div");
    container.id = "screen-transfer-4";
    container.className = "transaction-container";
    container.innerHTML = `
        <div class="transaction-body">
          <div class="section-body">
            <div class="confirm-message">
              <span class="bold-text">${localState.toAccountUserName}</span>님에게<br>
              <span class="bold-text">${localState.amount}원</span>을 이체했습니다.
            </div>
          </div>
          <div id="done" class="single-btn-dark-box">
            <div class="single-btn-dark-text">확인</div>
          </div>
        </div>
      `;
    container.querySelector("#done").addEventListener("click", async () => {
      await sendTransferNotification(localState.amount);
      goTo("landing", {});
    });

    return container;
  }

  // 🌐 API 요청 함수
  async function validateAccountNumber(accountId, accountNumber) {
    try {
      const res = await authorizedFetch(
        `${API_BASE_URL}/api/transactions/validate_account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_id: accountId,
            account_number: accountNumber,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "계좌 확인 실패");
      }

      return data.account; // { account_number, owner }
    } catch (err) {
      console.error(err);
      alert("계좌번호 확인 중 오류가 발생했습니다.");
      return null;
    }
  }

  async function sendTransferNotification(amount) {
    try {
      const res = await authorizedFetch(`${API_BASE_URL}/api/notifications/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const result = await res.json();
      console.log("[INFO] Notification result:", result);
    } catch (error) {
      console.error("[ERROR] Failed to send notification:", error);
    }
  }

  async function submitTransfer() {
    const res = await authorizedFetch(
      `${API_BASE_URL}/api/transactions/transfer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_account: localState.accountNumber,
          to_account: localState.toaccountNumber,
          amount: localState.amount,
          memo: document.getElementById("transfer-memo").value || "송금",
        }),
      }
    );

    const data = await res.json();

    try {
      if (data.success) {
        render(StepDone);
      } else {
        data.message || "이체 실패!";
      }
    } catch (err) {
      console.error(err);
      alert("오류 발생!");
    }
  }

  // ⛳ 외부에 노출할 것: 엘리먼트 + init 함수
  return { el, init };
}
