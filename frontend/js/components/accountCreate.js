export function AccountCreate() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-create";
  el.innerHTML = `
    <div class="subtitle">계좌의 이름을 입력해주세요.</div>
    <div class="info-input-box">
      <input class="info-input-text" type="text" placeholder="ex) 김구름의 계좌"/>
    </div>
    <div class="single-btn-dark-box">
      <div class="single-btn-dark-text">다음</div>
    </div>
  `;

  function init() {}
  return { el, init };
}