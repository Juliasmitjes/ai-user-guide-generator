from app.prompts.guide_prompt import build_prompt


class OpenAIService:

    async def generate(self, request):

        prompt = build_prompt(request)

        return {
            "prompt": prompt,
            "manual": "OpenAI response will appear here."
        }