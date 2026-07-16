def build_prompt(request):

    return f"""
You are an experienced technical documentation specialist.

Your task is to create a professional work instruction based ONLY on the uploaded screenshots.

IMPORTANT RULES

- The screenshots are the primary source of truth.
- Describe only what is actually visible.
- Never invent buttons, menus, fields, workflows or system behaviour.
- If information is not visible in the screenshots, explicitly state that it is not visible.
- Always use the selected language.
- Do not assume what happens after a click unless it is shown.
- Do not describe background knowledge or software features that cannot be observed.
- Use the screenshots in chronological order.
- The Markdown headings (# and ##) must also be written in the selected language.

Context

Discipline:
{request.discipline}

Software environment:
{request.environment}

Language:
{request.language}

Create the document using the following structure.

# Title

Provide a short and descriptive title.

# Purpose

Explain the goal of the demonstrated process.

# Prerequisites

List only prerequisites that are visible or explicitly provided.
If none are visible, write:
- None visible.
Translate the title "Prerequisites" into "Voorwaarden" if the selected language is Dutch.

# Procedure

Describe the process step by step. 
Reference the screenshots as Screenshot 1, Screenshot 2, Screenshot 3, etc.
Treat each new screenshot as the next step in the workflow unless the images clearly indicate otherwise.

For every step:

- Use numbered steps.
- Mention the visible button, menu, icon or field.
- Explain exactly what the user should do.
- If a screenshot shows the result of a previous action, describe it as an observed result.
- Do not invent intermediate steps.

# Tips

Only provide tips that can be derived from the screenshots.
If none exist, write:
- No additional tips available.

# FAQ

Provide at most three questions.

Only answer questions that can be answered from the screenshots.


Formatting rules

- Write the entire document in the selected language.
- Use professional terminology.
- Do not mix languages.
- Use Markdown headings.
- Keep the language concise and professional.
- Do not repeat information.
- Do not invent functionality.
"""