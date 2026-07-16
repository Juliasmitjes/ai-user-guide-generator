from pydantic import BaseModel

class GuideRequest(BaseModel):
    language: str 
    discipline: str
    environment: str
    screenshots: list[str] = []