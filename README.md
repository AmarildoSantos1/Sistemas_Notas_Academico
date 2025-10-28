Pré-requisitos

Python 3.10+
Verifique:

python --version


Se não tiver, instale em python.org e marque “Add Python to PATH”.

Node.js LTS (18+ recomendado)
Verifique:

node -v
npm -v
Backend (FastAPI)
2.1 Criar e ativar a venv + instalar deps
cd C:\sistema_notas\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
2.2 Subir o servidor
uvicorn app:app --reload --port 8000
 backend:

cd C:\sistema_notas\backend
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000


Abra http://127.0.0.1:8000/ (deve mostrar JSON com ok: true).

Garanta que o frontend tem .env com:

VITE_API_URL=http://127.0.0.1:8000


Suba o front:

cd C:\sistema_notas\frontend
npm install
npm run dev
