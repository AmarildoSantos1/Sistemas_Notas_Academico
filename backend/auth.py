import hashlib, hmac, secrets, json, os, time
from typing import Optional, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ADMIN_FILE = os.path.join(DATA_DIR, "admin.json")
TOKENS_FILE = os.path.join(DATA_DIR, "tokens.json")
PBKDF2_ITERS = 120_000

def _pbkdf2(password: str, salt: bytes, iters: int = PBKDF2_ITERS) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iters).hex()

def _new_admin(username: str, password: str) -> dict:
    salt = secrets.token_bytes(16)
    return {
        "usuario": username,
        "pwd_scheme": "pbkdf2_sha256",
        "iterations": PBKDF2_ITERS,
        "salt": salt.hex(),
        "pwd_hash": _pbkdf2(password, salt, PBKDF2_ITERS),
    }

def ensure_admin():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(ADMIN_FILE):
        rec = _new_admin("admin", "1234")
        with open(ADMIN_FILE, "w", encoding="utf-8") as f:
            json.dump(rec, f, indent=2, ensure_ascii=False)
    if not os.path.exists(TOKENS_FILE):
        with open(TOKENS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def _read_admin() -> dict:
    ensure_admin()
    with open(ADMIN_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def verify_password(password: str) -> bool:
    adm = _read_admin()
    salt = bytes.fromhex(adm["salt"])
    expected = adm["pwd_hash"]
    given = _pbkdf2(password, salt, adm["iterations"])
    return hmac.compare_digest(expected, given)

def verify_user(username: str, password: str) -> bool:
    adm = _read_admin()
    return username == adm["usuario"] and verify_password(password)

def change_password(old: str, new: str) -> None:
    adm = _read_admin()
    if not verify_password(old):
        raise ValueError("Senha atual incorreta.")
    rec = _new_admin(adm["usuario"], new)
    with open(ADMIN_FILE, "w", encoding="utf-8") as f:
        json.dump(rec, f, indent=2, ensure_ascii=False)

def issue_token(ttl_seconds: int = 60 * 60 * 4) -> str:
    ensure_admin()
    tok = secrets.token_urlsafe(32)
    exp = int(time.time()) + ttl_seconds
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        tokens = json.load(f)
    tokens[tok] = exp
    with open(TOKENS_FILE, "w", encoding="utf-8") as f:
        json.dump(tokens, f)
    return tok

def validate_token(token: str) -> bool:
    ensure_admin()
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        tokens = json.load(f)
    now = int(time.time())
    exp = tokens.get(token)
    if exp is None or now > exp:
        if token in tokens:
            tokens.pop(token, None)
            with open(TOKENS_FILE, "w", encoding="utf-8") as f:
                json.dump(tokens, f)
        return False
    return True

def revoke_token(token: str) -> None:
    ensure_admin()
    with open(TOKENS_FILE, "r", encoding="utf-8") as f:
        tokens = json.load(f)
    if token in tokens:
        tokens.pop(token, None)
        with open(TOKENS_FILE, "w", encoding="utf-8") as f:
            json.dump(tokens, f)
