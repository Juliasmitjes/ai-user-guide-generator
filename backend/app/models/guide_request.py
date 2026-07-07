from pydantic import BaseModel

class GuideRequest(BaseModel):
    discipline: str
    environment: str
    task: str
    language: str = "English"

    screenshots: list[str] = []