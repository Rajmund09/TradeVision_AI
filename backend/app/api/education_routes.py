from fastapi import APIRouter

router = APIRouter(prefix="/education", tags=["education"])

@router.get("/content")
async def get_content():
    return {"modules": []}
