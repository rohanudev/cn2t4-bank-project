export function AccountCreateComplete() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-create-complete";
  el.innerHTML = `
    <div class="subtitle">계좌가 생성되었습니다.</div>
    <div class="account-summary-box">
      <p>저축 계좌<br>3333233358212</p>
      <p>생성일<br>2025-03-28</p>
      <p>예금주<br>김구름</p>
    </div>
    <div class="single-btn-dark-box">
      <div class="single-btn-dark-text">확인</div>
    </div>
  `;

  function init() {}
  return { el, init };
}