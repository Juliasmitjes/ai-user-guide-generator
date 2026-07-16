export type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "bullet"; text: string }
  | { type: "number"; text: string }
  | { type: "text"; text: string };

export function parseMarkdown(text: string): Block[] {
  return text.split("\n").map((line) => {
    if (line.startsWith("# "))
      return { type: "h1", text: line.slice(2) };

    if (line.startsWith("## "))
      return { type: "h2", text: line.slice(3) };

    if (line.startsWith("- "))
      return { type: "bullet", text: line.slice(2) };

    if (/^\d+\./.test(line))
      return {
        type: "number",
        text: line.replace(/^\d+\.\s*/, ""),
      };

    return {
      type: "text",
      text: line,
    };
  });
}