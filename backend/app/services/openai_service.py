import os
import base64

from dotenv import load_dotenv
from openai import OpenAI
from typing import cast
from openai.types.responses import ResponseInputParam

from app.prompts.guide_prompt import build_prompt

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


class OpenAIService:

    async def generate(self, request, screenshots):

        prompt = build_prompt(request)

        contents = []

        contents.append({
            "type": "message",
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": prompt,
                }
            ]
        })

        for screenshot in screenshots:
            image_bytes = await screenshot.read()

            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            contents[0]["content"].append(
                {
                    "type": "input_image",
                    "image_url": f"data:{screenshot.content_type};base64,{base64_image}",
                }
            )

        print(contents)
        print(f"Aantal content-items: {len(contents[0]['content'])}")

        response = client.responses.create(
            model="gpt-4.1-nano",
            input=cast(ResponseInputParam, contents),
        )

        print(response.output_text)

        return {
            "manual": response.output_text
        }