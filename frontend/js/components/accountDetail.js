export function AccountDetail() {
  const el = document.createElement("div");
  el.className = "screen";
  el.id = "screen-account-detail";
  el.innerHTML = `
    <div class="subtitle">신용카드 출금 계좌</div>
    <div class="balance-big">164,500원</div>
    <div class="transaction-list">
      <div><span>03.23 홍길동</span><span>-30,000원</span></div>
      <div><span>03.22 카카오택시</span><span>-17,400원</span></div>
      <div><span>03.21 캐시백</span><span>1,800원</span></div>
      <div><span>03.21 CU</span><span>-15,700원</span></div>
    </div>
    <div class="btn-container">
      <div class="half-btn-dark">입금</div>
      <div class="half-btn-light">출금</div>
    </div>
    <div class="single-btn-dark-box">
      <div class="single-btn-dark-text">이체하기</div>
    </div>
  `;

  function init() {}
  return { el, init };
}