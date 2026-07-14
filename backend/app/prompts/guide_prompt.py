def build_prompt(request):

    return f"""
You are a senior technical writer.

Your task is to generate professional software documentation.

Discipline:
{request.discipline}

Software environment:
{request.environment}

Generate the following sections:

1. Title
2. Purpose
3. Prerequisites
4. Procedure
5. Tips
6. FAQ

Write in clear business English.

Do not invent functionality.
Only describe what is provided.
"""