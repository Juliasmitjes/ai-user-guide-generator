import os

from dotenv import load_dotenv
from google import genai

from app.prompts.guide_prompt import build_prompt

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


class GeminiService:

     async def generate(self, request):

        prompt = build_prompt(request)

        response = await client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            temperature=0.7,
            max_output_tokens=1000
        )

        return {
            "manual": response.text
        }