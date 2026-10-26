"""Exercise the running server with an in-memory database: python scripts/smoke_test.py."""
import http.cookiejar
import json
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:18080"
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
token = None


def api(method, path, data=None, expected=200):
    global token
    if method != "GET" and token is None:
        token = api("GET", "/api/csrf")["token"]
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if method != "GET":
        headers["X-XSRF-TOKEN"] = token
    request = urllib.request.Request(BASE + path, data=json.dumps(data).encode() if data is not None else None,
                                     headers=headers, method=method)
    try:
        with opener.open(request) as response:
            status, body = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, body = error.code, error.read()
    assert status == expected, f"{method} {path}: expected {expected}, got {status}: {body[:300]!r}"
    return json.loads(body) if body else None


assert len(api("GET", "/api/products")) == 12
buyer = api("POST", "/api/auth/login", {"email": "user@shop.ru", "password": "user123"})
assert buyer["role"] == "user"
token = None
api("PUT", "/api/cart/1", {"quantity": 2})
assert api("GET", "/api/cart")[0]["quantity"] == 2
api("POST", "/api/products", {}, 403)
api("POST", "/api/auth/logout", {})
token = None
api("POST", "/api/auth/login", {"email": "user@shop.ru", "password": "user123"})
token = None
assert api("GET", "/api/cart")[0]["quantity"] == 2
order = api("POST", "/api/orders", {})
assert order["total"] > 0 and len(api("GET", "/api/cart")) == 0
api("POST", "/api/auth/logout", {})
token = None
admin = api("POST", "/api/auth/login", {"email": "admin@shop.ru", "password": "admin123"})
assert admin["role"] == "admin"
token = None
product = api("POST", "/api/products", {"name": "Тест", "category": "home", "price": 100,
    "image": "https://example.org/test.jpg", "description": "Тестовый товар", "inStock": True})
assert api("GET", f"/api/products/{product['id']}")["name"] == "Тест"
api("DELETE", f"/api/products/{product['id']}")
assert len(api("GET", "/api/products")) == 12
assert api("GET", "/api/orders")[0]["id"] == order["id"]
print("OK: catalog, roles, persistent cart, checkout, admin CRUD")
