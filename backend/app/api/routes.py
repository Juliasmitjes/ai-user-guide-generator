from fastapi import APIRouter
from app.models.guide_request import GuideRequest
from app.services.openai_service import OpenAIService

router = APIRouter()

service = OpenAIService()


@router.post("/generate-guide")
async def generate_guide(request: GuideRequest):

    return await service.generate(request)