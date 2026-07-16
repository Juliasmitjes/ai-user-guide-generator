from pydantic import BaseModel

class GuideRequest(BaseModel):
    language: str = "English"
    discipline: str
    environment: str
    screenshots: list[str] = []