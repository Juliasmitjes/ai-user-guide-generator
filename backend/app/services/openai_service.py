import os


from dotenv import load_dotenv
from openai import AsyncOpenAI

from app.prompts.guide_prompt import build_prompt

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class OpenAIService:

     async def generate(self, request):

        prompt = build_prompt(request)

        response = await client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior technical writer."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return {
            "manual": response.choices[0].message.content
        }