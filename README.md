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
