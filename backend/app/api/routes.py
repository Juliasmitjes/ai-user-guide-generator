from fastapi import APIRouter
from app.models.guide_request import GuideRequest

router = APIRouter()

@router.post("/generate-guide")
async def generate_guide(request: GuideRequest):
    return {
        "status": "success",
        "received": request.model_dump()
    }