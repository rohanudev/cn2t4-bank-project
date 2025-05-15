# backend/config/middleware.py

class EnforceCSPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if not response.has_header("Content-Security-Policy"):
            response["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net 'nonce-{{nonce}}'; "
                "style-src 'self' https://cdn.jsdelivr.net; "
                "img-src 'self' data:; "
                "object-src 'none'; "
                "base-uri 'none'; "
                "frame-ancestors 'none';"
                "form-action 'self';"
            )
        return response