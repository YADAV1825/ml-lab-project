

# ⚡ Lightning Studio — ML Copilot

Built By:

| Name           | Roll No  |
|----------------|----------|
| Rohit Yadav    | 23124087 |
| Shakti         | 23124100 |
| Abhinoor       | 23124003 |

<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/96b4bcf2-7749-4011-9d7b-2a5339d725f8" />

---

Lightning Studio is a premium, AI-powered Machine Learning platform designed for interactive model exploration and visualization. It combines a powerful FastAPI backend with a stunning, glassmorphic React frontend to provide a seamless end-to-end ML experience.

![Lightning Studio Preview](https://via.placeholder.com/1200x600/6366f1/ffffff?text=Lightning+Studio+-+Interactive+ML+Platform)

---

## ✨ Key Features

- **🎨 Modern Glassmorphic UI**: A light-themed, premium design language featuring glossy surfaces, vibrant gradients, and smooth animations powered by Framer Motion.
- **🧊 Interactive 3D Visualizations**: Real-time 3D scatter plots and cluster visualizations using Three.js, allowing you to explore your model's performance in a spatial dimension.
- **🤖 AI Copilot (Built-in Assistant)**: An integrated AI agent that automatically explains training results, suggests hyperparameter optimizations, and answers complex ML questions.
- **📈 Advanced Analytics**: 
  - Dynamic metric cards (Accuracy, Precision, Recall, F1, MSE, etc.)
  - Confusion Matrices & ROC Curves
  - Decision Tree Graph visualizations
  - 3D Loss Landscape & Gradient Descent paths
- **⚙️ Dynamic Configuration**: Choose from various algorithms (Random Forest, SVM, K-Means, etc.) and fine-tune hyperparameters manually or via AI-driven Auto-tuning.
- **📊 Dataset Management**: Built-in support for standard datasets (Diabetes) and synthetic data generation.

---


<img width="1490" height="20%" alt="image" src="https://github.com/user-attachments/assets/1e4de0e9-d7a8-4408-812e-238cff4bf294" />

---

<img width="1467" height="24%" alt="image" src="https://github.com/user-attachments/assets/36608446-aa89-449a-a48d-1713a713a98c" />

---

<img width="1917" height="10%" alt="image" src="https://github.com/user-attachments/assets/c1c030ee-1eeb-4c20-814f-b20930c5576c" />

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS + Tailwind CSS (Glassmorphism System)
- **3D Engine**: Three.js (Pure WebGL implementation)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

### **Backend**
- **API Framework**: FastAPI (Python)
- **ML Libraries**: Scikit-Learn, Pandas, NumPy
- **Server**: Uvicorn
- **AI Integration**: Custom Copilot API (Lightning/DeepSeek)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- Python (3.9+)
- npm or yarn

### **Installation**

You can use the provided setup script to automate the process:

```cmd
.\setup.bat
```

**Manual Installation:**

1. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   pip install fastapi uvicorn scikit-learn pandas numpy requests python-dotenv python-multipart
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

### **Running the Application**

The easiest way to start both servers is using the provided batch file:

```cmd
.\start.bat
```

Alternatively, start them separately:

- **Backend:** `cd backend && uvicorn main:app --reload --port 8000`
- **Frontend:** `cd frontend && npm run dev`

Access the app at: **http://localhost:5173**

---

## 📁 Project Structure

```text
├── backend/
│   ├── main.py          # FastAPI Entry Point
│   ├── ml_engine.py      # Scikit-Learn training & plotting logic
│   ├── ai_copilot.py     # AI Assistant integration
│   └── venv/             # Python environment
├── frontend/
│   ├── src/
│   │   ├── panels/      # UI Component Panels (3D, Charts, etc.)
│   │   ├── App.jsx      # Main Layout and State
│   │   └── index.css    # Glassmorphism Design System
│   ├── public/
│   └── vite.config.js
├── setup.bat             # Automated Installation
└── start.bat             # Combined Run Script
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by the Lightning AI Team
</p>
