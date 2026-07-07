from pydantic import BaseModel

class GuideRequest(BaseModel):
    topic: str
    audience: str
    language: str = "English"