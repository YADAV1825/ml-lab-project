@echo off
cd frontend
call npm install react-markdown
cd ..
start "FastAPI Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
start "Vite Frontend" cmd /k "cd frontend && npm run dev"
echo Servers started in new windows.
