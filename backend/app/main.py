from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="AI User Guide Generator API",
    version="1.0.0"
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}