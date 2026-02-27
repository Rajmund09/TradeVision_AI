from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import importlib

from src.inference.predict import predict_stock

router = APIRouter()

class PredictRequest(BaseModel):
    symbol: str


@router.post("/predict")
async def predict(req: PredictRequest):
    res = predict_stock(req.symbol)
    if res is None:
        raise HTTPException(status_code=404, detail="Data or prediction not available for that symbol")
    return res


@router.post("/train/{model_name}")
async def train_model(model_name: str):
    # Try to import a training module from src.model dynamically
    module_name = f"src.model.train_{model_name}"
    try:
        spec = importlib.util.find_spec(module_name)
        if spec is None:
            return {"status": "not_found", "detail": f"Training module {module_name} not found"}
        module = importlib.import_module(module_name)
        if hasattr(module, "main"):
            # Many training scripts provide a CLI entrypoint called main()
            module.main()
            return {"status": "ok", "detail": f"Ran {module_name}.main()"}
        else:
            return {"status": "ok", "detail": f"Imported {module_name}; run entrypoint not defined"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
