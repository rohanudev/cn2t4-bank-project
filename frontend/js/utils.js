import { API_BASE_URL } from "./config.js";
import { goTo } from "./router.js";

export async function authorizedFetch(url, options = {}) {
  const accessToken = sessionStorage.getItem("access_token");
  const refreshToken = sessionStorage.getItem("refresh_token");

  if (!accessToken) {
    throw new Error("Access token not found. 사용자 인증 필요.");
  }

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // 액세스 토큰 만료 시 리프레시 토큰으로 재인증
  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/authentication/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        sessionStorage.setItem("access_token", refreshData.access_token);
        if (refreshData.id_token) {
          sessionStorage.setItem("id_token", refreshData.id_token);
        }

        // Retry original request with new token
        config.headers.Authorization = `Bearer ${refreshData.access_token}`;
        response = await fetch(url, config);
      } else {
        throw new Error("토큰 갱신 실패");
      }
    } catch (err) {
      console.error("세션 만료로 인한 자동 로그아웃", err);
      sessionStorage.clear();
      goTo("login", {});
      throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || `API 호출 실패: ${response.status}`);
    err.status = response.status;
    err.messageFromServer = errorData.message;
    throw err;
  }

  return response;
}