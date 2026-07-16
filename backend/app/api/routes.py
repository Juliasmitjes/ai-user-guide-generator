from fastapi import APIRouter, Form, File, UploadFile
from typing import List
from app.models.guide_request import GuideRequest
from app.services.openai_service import OpenAIService

router = APIRouter()

service = OpenAIService()


@router.post("/generate-guide")
async def generate_guide( 
    language: str = Form(...),
    discipline: str = Form(...),
    environment: str = Form(...),
    screenshots: List[UploadFile] = File(...)):

    request = GuideRequest(
        language=language,
        discipline=discipline,
        environment=environment,
    )

    result = await service.generate(request, 
    screenshots)

    return {
        "status": "success",
        "manual": result["manual"],
        "language": language,
        "discipline": discipline,
        "environment": environment,
        "screenshots": [file.filename for file in screenshots],
    }