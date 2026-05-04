from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import Optional, Dict, Any, List
import uuid
import io

from ai_copilot import query_ai
from ml_engine import datasets_store, load_builtin_dataset, generate_synthetic_dataset, train_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

class TrainRequest(BaseModel):
    dataset_id: str
    target_col: str
    model_name: str
    task_type: str
    test_size: float = 0.2
    params: Optional[Dict[str, Any]] = None
    tune: bool = False

class SyntheticDatasetRequest(BaseModel):
    type: str
    n_samples: int = 500
    n_features: int = 2

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    response = query_ai(request.messages)
    return {"reply": response}

@app.post("/api/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        dataset_id = str(uuid.uuid4())
        datasets_store[dataset_id] = df
        return {
            "dataset_id": dataset_id,
            "columns": df.columns.tolist(),
            "preview": df.head(5).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dataset/builtin/{name}")
async def builtin_dataset(name: str):
    try:
        df, target_names = load_builtin_dataset(name)
        dataset_id = str(uuid.uuid4())
        datasets_store[dataset_id] = df
        return {
            "dataset_id": dataset_id,
            "columns": df.columns.tolist(),
            "target_names": target_names.tolist() if target_names is not None else None,
            "preview": df.head(5).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dataset/generate")
async def generate_dataset(request: SyntheticDatasetRequest):
    try:
        df = generate_synthetic_dataset(request.type, request.n_samples, request.n_features)
        dataset_id = str(uuid.uuid4())
        datasets_store[dataset_id] = df
        return {
            "dataset_id": dataset_id,
            "columns": df.columns.tolist(),
            "preview": df.head(5).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train")
async def train_endpoint(request: TrainRequest):
    try:
        results = train_model(
            dataset_id=request.dataset_id,
            target_col=request.target_col,
            model_name=request.model_name,
            task_type=request.task_type,
            test_size=request.test_size,
            params=request.params,
            tune=request.tune
        )
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
