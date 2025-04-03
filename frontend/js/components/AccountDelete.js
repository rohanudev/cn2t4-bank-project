import { goTo } from "../router.js";

export function AccountDelete() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-delete";

  let state = {
    accountName: "저축 계좌",
    accountId: "3333233358212",
    canDelete: true
  };

  function init(props) {
    state.accountName = props?.accountName ?? state.accountName;
    state.accountId = props?.accountId ?? state.accountId;
    state.canDelete = props?.canDelete ?? true;

    renderStep1();
  }

  function renderStep1() {
    console.log("🖌️ renderStep1 시작됨");
    el.innerHTML = `
      <div class="subtitle">계좌 삭제</div>
      <div class="subsubtitle">${state.accountName}(${state.accountId})를<br/>삭제하시겠습니까?</div>
      <div class="single-btn-dark-box">
        <div class="single-btn-dark-text" id="btn-next">다음</div>
      </div>
    `;
    el.querySelector("#btn-next").addEventListener("click", () => {
      state.canDelete ? renderStep3() : renderStep2();
    });
  }

  function renderStep2() {
    el.innerHTML = `
      <div class="subtitle">계좌 삭제</div>
      <div class="subsubtitle" style="color:red;">계좌를 삭제할 수 없습니다.<br/>잔액을 먼저 출금해주세요.</div>
      <div class="single-btn-dark-box">
        <div class="single-btn-dark-text" id="btn-cancel">확인</div>
      </div>
    `;
    el.querySelector("#btn-cancel").addEventListener("click", () => {
      goTo("account-detail", []);
    });
  }

  function renderStep3() {
    el.innerHTML = `
      <div class="subtitle">계좌 삭제</div>
      <div class="subsubtitle">${state.accountName}(${state.accountId})를<br/>삭제합니다.</div>
      <div class="btn-container">
        <div class="half-btn-light" id="btn-back">취소</div>
        <div class="half-btn-dark" id="btn-delete">삭제</div>
      </div>
    `;
    el.querySelector("#btn-back").addEventListener("click", () => renderStep1());
    el.querySelector("#btn-delete").addEventListener("click", () => renderStep4());
  }

  function renderStep4() {
    el.innerHTML = `
      <div class="subtitle">계좌 삭제</div>
      <div class="subsubtitle">계좌 삭제가 완료되었습니다.</div>
      <div class="single-btn-dark-box">
        <div class="single-btn-dark-text" id="btn-confirm">확인</div>
      </div>
    `;
    el.querySelector("#btn-confirm").addEventListener("click", () => {
      goTo("landing", []);
    });
  }

  return { el, init };
}
