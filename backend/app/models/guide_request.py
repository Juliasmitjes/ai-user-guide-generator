from pydantic import BaseModel

class GuideRequest(BaseModel):
    discipline: str
    environment: str
    screenshots: list[str] = []