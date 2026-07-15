import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.prompts.guide_prompt import build_prompt

load_dotenv()

print(os.getenv("GEMINI_API_KEY"))

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY") 
)


class GeminiService:

    async def generate(self, request, screenshots):

        prompt = build_prompt(request)

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=4000,
            ),
        )

        print(response.text)

        return {
            "manual": response.text
        }