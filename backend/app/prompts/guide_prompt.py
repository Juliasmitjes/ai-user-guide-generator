def build_prompt(request):

    return f"""
You are a senior technical writer specializing in enterprise software documentation.

Generate a professional work instruction.

Use the uploaded screenshots as the primary source of truth.

Only describe actions that are visible in the screenshots.

If information is missing, explicitly state that it cannot be determined.

Do not invent buttons, menus or workflows.

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