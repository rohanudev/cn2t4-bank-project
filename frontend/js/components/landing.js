// 계좌 리스트
import { state } from './store.js';

export function Landing() {
    // ✅ 내부 상태
    let localState = {
      accounts: [],
      selectedAccountId: null,
    };

    // ✅ 초기화
    function init(optionalParams) {
      localState.accounts = optionalParams;
      bindEvents();
    }
    
    // ✅ DOM 생성
    const el = document.createElement("div");

    // ✅ 이벤트 등록
    function bindEvents() {

    }
    
    // ✅ API 요청 함수
    async function fetchData() {

    }
    
    return { el, init}
}