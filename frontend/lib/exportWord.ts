type ImageType = {
  name: string;
  dataUrl: string;
};

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function exportWord(
  generated: string,
  images: ImageType[],
  language: string,
  discipline: string,
  environment: string
) {
  if (!generated) return;

  const documentTitle =
    language === "nl"
      ? "Werkinstructie"
      : "Work Instruction";

  const fileName =
    language === "nl"
      ? `werkinstructie-${discipline}-${environment}.doc`
      : `work-instruction-${discipline}-${environment}.doc`;


// html

  let body = "";

  const lines = generated.split("\n");

  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      if (inList) {
        body += "</ul>";
        inList = false;
      }

      body += "<br>";
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      if (inList) {
        body += "</ul>";
        inList = false;
      }

      body += `<h1>${escapeHtml(line.substring(2))}</h1>`;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      if (inList) {
        body += "</ul>";
        inList = false;
      }

      body += `<h2>${escapeHtml(line.substring(3))}</h2>`;
      continue;
    }


// bulletpoints

    if (line.startsWith("- ")) {
      if (!inList) {
        body += "<ul>";
        inList = true;
      }

      body += `<li>${escapeHtml(line.substring(2))}</li>`;
      continue;
    }

    // Nummering
    if (/^\d+\./.test(line)) {
      if (inList) {
        body += "</ul>";
        inList = false;
      }

      body += `<p class="step"><strong>${escapeHtml(line)}</strong></p>`;
      continue;
    }

    // Gewone tekst
    if (inList) {
      body += "</ul>";
      inList = false;
    }

    body += `<p>${escapeHtml(line)}</p>`;
  }

  if (inList) {
    body += "</ul>";
  }


// screenshots

  let screenshots = "";

  if (images.length > 0) {
    screenshots += `<h1>${
      language === "nl" ? "Screenshots" : "Screenshots"
    }</h1>`;

    images.forEach((img, index) => {
      screenshots += `
      <div class="screenshot">
          <h2>${
            language === "nl"
              ? `Screenshot ${index + 1}`
              : `Screenshot ${index + 1}`
          }</h2>

          <img src="${img.dataUrl}" />

          <p class="caption">${escapeHtml(img.name)}</p>
      </div>
      `;
    });
  }


// html

  const html = `
<!DOCTYPE html>

<html
xmlns:o='urn:schemas-microsoft-com:office:office'
xmlns:w='urn:schemas-microsoft-com:office:word'
xmlns='http://www.w3.org/TR/REC-html40'>

<head>

<meta charset="utf-8">

<title>${documentTitle}</title>

<style>

body{
    font-family:Calibri,Arial,sans-serif;
    color:#1e293b;
    margin:40px;
    line-height:1.5;
}

.header{
    background:#2563eb;
    color:white;
    padding:20px;
    margin-bottom:30px;
}

.header h1{
    margin:0;
    font-size:28px;
    color:white;
}

.subtitle{
    margin-top:6px;
    font-size:12px;
    opacity:.9;
}

h1{
    color:#2563eb;
    border-bottom:3px solid #2563eb;
    padding-bottom:6px;
    margin-top:30px;
}

h2{
    color:#1e40af;
    margin-top:22px;
}

p{
    margin:8px 0;
}

.step{
    margin-top:16px;
}

ul{
    margin-left:24px;
}

li{
    margin-bottom:6px;
}

.screenshot{
    page-break-before:always;
}

img{
    width:100%;
    border:1px solid #CBD5E1;
    border-radius:6px;
    margin-top:15px;
}

.caption{
    color:#64748b;
    font-size:10pt;
    text-align:center;
}

.footer{
    margin-top:40px;
    font-size:10px;
    color:#64748b;
    border-top:1px solid #CBD5E1;
    padding-top:10px;
}

</style>

</head>

<body>

<div class="header">

<h1>${documentTitle}</h1>

<div class="subtitle">

${escapeHtml(discipline)} • ${escapeHtml(environment)}

</div>

</div>

${body}

${screenshots}

<div class="footer">

${
  language === "nl"
    ? "Gegenereerd met AI Manual Generator"
    : "Generated with AI Manual Generator"
}

</div>

</body>

</html>
`;


// download
  const blob = new Blob(["\ufeff", html], {
    type: "application/msword",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = fileName.replace(/\s+/g, "-").toLowerCase();

  a.click();

  URL.revokeObjectURL(url);
}