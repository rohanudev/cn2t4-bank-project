export async function authorizedFetch(url, options = {}) {
    const accessToken = sessionStorage.getItem("access_token");
  
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
  
    const response = await fetch(url, config);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API 호출 실패: ${response.status}`);
    }
  
    return response;
  }