import json, os, uuid
from typing import List, Dict, Optional
from util import ensure_date, today_str, to_date
from dataclasses import dataclass, asdict, field

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ALUNOS_FILE = os.path.join(DATA_DIR, "alunos.json")

WEIGHTS = {"E1": 0.3, "E2": 0.3, "E3": 0.4}

@dataclass
class Disciplina:
    id: str
    nome: str
    data_cadastro: str
    notas: Dict[str, Optional[float]] = field(default_factory=lambda: {"E1": None, "E2": None, "E3": None})

    def media(self) -> Optional[float]:
        if any(self.notas[e] is None for e in ("E1","E2","E3")):
            return None
        m = sum((self.notas[e] or 0.0) * WEIGHTS[e] for e in ("E1","E2","E3"))
        return round(m, 2)

    def status(self) -> str:
        m = self.media()
        if m is None:
            return "EM CURSO"
        return "APROVADO" if m >= 7.0 else "REPROVADO"

@dataclass
class Aluno:
    id: str
    nome: str
    tipo_id: str
    identificador: str
    data_cadastro: str
    disciplinas: List[Disciplina] = field(default_factory=list)

def _load_raw() -> List[dict]:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(ALUNOS_FILE):
        return []
    with open(ALUNOS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_raw(items: List[dict]) -> None:
    tmp = ALUNOS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    os.replace(tmp, ALUNOS_FILE)

def list_alunos() -> List[Aluno]:
    res = []
    for a in _load_raw():
        res.append(
            Aluno(
                id=a["id"], nome=a["nome"], tipo_id=a["tipo_id"], identificador=a["identificador"],
                data_cadastro=a["data_cadastro"],
                disciplinas=[Disciplina(**d) for d in a.get("disciplinas", [])]
            )
        )
    return res

def save_alunos(alunos: List[Aluno]) -> None:
    _save_raw([
        {
            "id": a.id, "nome": a.nome, "tipo_id": a.tipo_id,
            "identificador": a.identificador, "data_cadastro": a.data_cadastro,
            "disciplinas": [asdict(d) for d in a.disciplinas]
        } for a in alunos
    ])

def create_aluno(nome: str, tipo_id: str, identificador: str, data_cadastro: Optional[str]) -> Aluno:
    data_cadastro = data_cadastro or today_str()
    ensure_date(data_cadastro)
    alunos = list_alunos()
    if any(x.tipo_id==tipo_id and x.identificador==identificador for x in alunos):
        raise ValueError("Aluno já existe.")
    a = Aluno(id=str(uuid.uuid4()), nome=nome, tipo_id=tipo_id,
              identificador=identificador, data_cadastro=data_cadastro)
    alunos.append(a); save_alunos(alunos); return a

def update_aluno(aid: str, **patch) -> Aluno:
    alunos = list_alunos()
    a = next((x for x in alunos if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    if "nome" in patch and patch["nome"]: a.nome = patch["nome"]
    if "identificador" in patch and patch["identificador"]: a.identificador = patch["identificador"]
    if "tipo_id" in patch and patch["tipo_id"]: a.tipo_id = patch["tipo_id"]
    if "data_cadastro" in patch and patch["data_cadastro"]:
        ensure_date(patch["data_cadastro"]); a.data_cadastro = patch["data_cadastro"]
    save_alunos(alunos); return a

def delete_aluno(aid: str) -> None:
    alunos = list_alunos()
    novos = [x for x in alunos if x.id != aid]
    if len(novos)==len(alunos): raise ValueError("Aluno não encontrado")
    save_alunos(novos)

def find_aluno(aid: str) -> Aluno:
    a = next((x for x in list_alunos() if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    return a

def filter_alunos(nome: Optional[str], tipo: Optional[str], ident: Optional[str],
                  dmin: Optional[str], dmax: Optional[str]) -> List[Aluno]:
    items = list_alunos()
    if nome: items = [x for x in items if nome.lower() in x.nome.lower()]
    if tipo: items = [x for x in items if x.tipo_id == tipo]
    if ident: items = [x for x in items if x.identificador == ident]
    if dmin: ensure_date(dmin); items = [x for x in items if to_date(x.data_cadastro) >= to_date(dmin)]
    if dmax: ensure_date(dmax); items = [x for x in items if to_date(x.data_cadastro) <= to_date(dmax)]
    return items

def add_disciplina(aid: str, nome: str, data: Optional[str]) -> Disciplina:
    alunos = list_alunos()
    a = next((x for x in alunos if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    data = data or today_str(); ensure_date(data)
    d = Disciplina(id=str(uuid.uuid4()), nome=nome, data_cadastro=data)
    a.disciplinas.append(d); save_alunos(alunos); return d

def update_disciplina(aid: str, did: str, **patch) -> Disciplina:
    alunos = list_alunos()
    a = next((x for x in alunos if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    d = next((y for y in a.disciplinas if y.id == did), None)
    if not d: raise ValueError("Disciplina não encontrada")
    if "nome" in patch and patch["nome"]: d.nome = patch["nome"]
    if "data_cadastro" in patch and patch["data_cadastro"]:
        ensure_date(patch["data_cadastro"]); d.data_cadastro = patch["data_cadastro"]
    save_alunos(alunos); return d

def del_disciplina(aid: str, did: str) -> None:
    alunos = list_alunos()
    a = next((x for x in alunos if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    prev = len(a.disciplinas)
    a.disciplinas = [y for y in a.disciplinas if y.id != did]
    if len(a.disciplinas)==prev: raise ValueError("Disciplina não encontrada")
    save_alunos(alunos)

def set_nota(aid: str, did: str, estagio: str, nota: float) -> Disciplina:
    if estagio not in ("E1","E2","E3"): raise ValueError("Estágio inválido.")
    if nota < 0 or nota > 10: raise ValueError("Nota deve estar entre 0 e 10")
    alunos = list_alunos()
    a = next((x for x in alunos if x.id == aid), None)
    if not a: raise ValueError("Aluno não encontrado")
    d = next((y for y in a.disciplinas if y.id == did), None)
    if not d: raise ValueError("Disciplina não encontrada")
    d.notas[estagio] = round(float(nota), 2)
    save_alunos(alunos); return d
