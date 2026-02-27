from fastapi import APIRouter, Depends

router = APIRouter(prefix="/advisor", tags=["advisor"])

@router.post("/chat")
async def chat(query: dict):
    # placeholder for chatbot interaction
    return {"response": "This is a chatbot reply."}
