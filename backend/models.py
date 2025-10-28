from pydantic import BaseModel, Field, constr
from typing import Optional, Dict, List, Literal
from util import today_str

Stage = Literal["E1", "E2", "E3"]

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    token: str

class ChangePasswordIn(BaseModel):
    old_password: str
    new_password: constr(min_length=4)

class DisciplinaIn(BaseModel):
    nome: constr(min_length=1)
    data_cadastro: Optional[constr(pattern=r"\d{4}-\d{2}-\d{2}")] = Field(default_factory=today_str)

class DisciplinaOut(BaseModel):
    id: str
    nome: str
    data_cadastro: str
    notas: Dict[Stage, Optional[float]] = {"E1": None, "E2": None, "E3": None}
    media: Optional[float] = None
    status: str

class NotaIn(BaseModel):
    estagio: Stage
    nota: float

class AlunoIn(BaseModel):
    nome: constr(min_length=1)
    tipo_id: Literal["MATRICULA", "CPF"]
    identificador: constr(min_length=1)
    data_cadastro: Optional[constr(pattern=r"\d{4}-\d{2}-\d{2}")] = Field(default_factory=today_str)

class AlunoOut(BaseModel):
    id: str
    nome: str
    tipo_id: Literal["MATRICULA", "CPF"]
    identificador: str
    data_cadastro: str
    disciplinas: List[DisciplinaOut] = []
