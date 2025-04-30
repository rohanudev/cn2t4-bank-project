const hostname = window.location.hostname;

let API_BASE_URL = "";

if (hostname === "localhost") {
  API_BASE_URL = "http://localhost:8000";
} else if (hostname.endsWith("tikklemoa.com")) {
  API_BASE_URL = "https://api.tikklemoa.com";
} else {
  API_BASE_URL = "http://" + hostname;
}

export { API_BASE_URL };