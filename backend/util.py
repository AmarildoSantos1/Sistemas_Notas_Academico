from datetime import datetime
from typing import Optional

DATE_FMT = "%Y-%m-%d"

def today_str() -> str:
    return datetime.today().strftime(DATE_FMT)

def ensure_date(s: str) -> None:
    datetime.strptime(s, DATE_FMT)

def to_date(s: str):
    return datetime.strptime(s, DATE_FMT).date()

def nonempty(s: Optional[str]) -> Optional[str]:
    return s if s and s.strip() else None
