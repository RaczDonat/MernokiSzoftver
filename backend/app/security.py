"""Jelszó-hashelés és munkamenet-tokenek – kizárólag a Python standard könyvtárral.

- Jelszavak: PBKDF2-HMAC-SHA256, felhasználónként egyedi 16 bájt,
  310 000 iterációval (OWASP ajánlás). Nyers jelszót soha nem tárol.
- Tokenek: "user_id.lejárat.aláírás" formátum, HMAC-SHA256 aláírással.
  A titkos kulcs a SECRET_KEY környezeti változóból jön; ha nincs megadva,
  első induláskor véletlenszerűen generálódik a backend/.secret_key fájlba.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import time
from pathlib import Path

PBKDF2_ITERATIONS = 310_000
TOKEN_TTL_SECONDS = 7 * 24 * 3600  # 7 nap

_SECRET_FILE = Path(__file__).resolve().parent.parent / ".secret_key"
_secret_cache: bytes | None = None


def _secret() -> bytes:
    global _secret_cache
    if _secret_cache is None:
        env = os.getenv("SECRET_KEY")
        if env:
            _secret_cache = env.encode()
        else:
            if not _SECRET_FILE.exists():
                _SECRET_FILE.write_text(secrets.token_hex(32), encoding="utf-8")
            _secret_cache = _SECRET_FILE.read_text(encoding="utf-8").strip().encode()
    return _secret_cache


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt_hex, digest_hex = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _sign(payload: str) -> str:
    return hmac.new(_secret(), payload.encode(), hashlib.sha256).hexdigest()


def create_token(user_id: int, ttl: int = TOKEN_TTL_SECONDS) -> str:
    payload = f"{user_id}.{int(time.time()) + ttl}"
    return f"{payload}.{_sign(payload)}"


def decode_token(token: str) -> int | None:
    """Érvényes, le nem járt token esetén a felhasználó azonosítója, egyébként None."""
    try:
        user_id, expires, signature = token.split(".")
        if not hmac.compare_digest(_sign(f"{user_id}.{expires}"), signature):
            return None
        if int(expires) < time.time():
            return None
        return int(user_id)
    except (ValueError, TypeError):
        return None
