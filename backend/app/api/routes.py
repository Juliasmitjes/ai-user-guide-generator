from fastapi import APIRouter, Form, File, UploadFile
from typing import List
from app.models.guide_request import GuideRequest
from app.services.gemini_service import GeminiService

router = APIRouter()

service = GeminiService()


@router.post("/generate-guide")
async def generate_guide( 
    discipline: str = Form(...),
    environment: str = Form(...),
    screenshots: List[UploadFile] = File(...)):

    request = GuideRequest(
        discipline=discipline,
        environment=environment,
    )

    print(request)
    result = await service.generate(request)

    return {
        "status": "success",
        "manual": result["manual"],
         "discipline": discipline,
        "environment": environment,
        "screenshots": [file.filename for file in screenshots],
    }