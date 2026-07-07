from fastapi import APIRouter, Form, File, UploadFile
from typing import List
from app.models.guide_request import GuideRequest
from app.services.openai_service import OpenAIService

router = APIRouter()

service = OpenAIService()


@router.post("/generate-guide")
async def generate_guide( discipline: str = Form(...),
    environment: str = Form(...),
    task: str = Form(...),
    language: str = Form(...),
    screenshots: List[UploadFile] = File(...)):

    request = GuideRequest(
        discipline=discipline,
        environment=environment,
        task=task,
        language=language
    )

    print(request)
    result = await service.generate(request)

    return {
        "status": "success",
        "manual": result.get("manual"),
         "discipline": discipline,
        "environment": environment,
        "task": task,
        "language": language,
        "screenshots": [file.filename for file in screenshots],
    }