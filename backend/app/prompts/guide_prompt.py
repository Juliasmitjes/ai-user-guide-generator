def build_prompt(request):

    return f"""
Create a professional user guide.

Discipline:
{request.discipline}

Environment:
{request.environment}

Task:
{request.task}

Language:
{request.language}

The guide should contain:

- Introduction
- Step-by-step instructions
- Tips
- Warnings
- Conclusion
"""