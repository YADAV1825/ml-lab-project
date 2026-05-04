@echo off
mkdir backend
cd backend
python -m venv venv
call venv\Scripts\activate
pip install fastapi uvicorn scikit-learn pandas numpy requests python-dotenv python-multipart
cd ..
npx -y create-vite@latest frontend --template react
cd frontend
call npm install
call npm install tailwindcss postcss autoprefixer framer-motion recharts lucide-react axios clsx tailwind-merge
call npx -y tailwindcss init -p
cd ..
echo Setup complete
