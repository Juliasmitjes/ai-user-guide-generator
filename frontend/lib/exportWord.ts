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
    language === "nl" ? "Werkinstructie" : "Work Instruction";

  const fileName =
    language === "nl"
      ? `werkinstructie-${discipline}-${environment}.doc`
      : `work-instruction-${discipline}-${environment}.doc`;

  const lines = generated.split("\n");

  let body = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      body += "</ul>";
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      closeList();
      continue;
    }

    //---------------------------------
    // HOOFDSTUK
    //---------------------------------

    if (line.startsWith("# ")) {
      closeList();

      body += `
      <div class="chapter">
          <h1>${escapeHtml(line.substring(2))}</h1>
      `;

      continue;
    }

    //---------------------------------
    // SUBTITEL
    //---------------------------------

    if (line.startsWith("## ")) {
      closeList();

      body += `
      <h2>${escapeHtml(line.substring(3))}</h2>
      `;

      continue;
    }

    //---------------------------------
    // STAP
    //---------------------------------

    const stepLabel = language === "nl" ? "Stap" : "Step";
    const step = line.match(/^(\d+)\.\s*(.*)$/);

    if (step) {
      closeList();

      body += `
      <div class="step">

            <div class="step-number">
                ${stepLabel} ${step[1]}
            </div>

          <div class="step-title">
              ${escapeHtml(step[2])}
          </div>

      </div>
      `;

      continue;
    }

    //---------------------------------
    // BULLETS
    //---------------------------------

    if (line.startsWith("- ")) {
      if (!inList) {
        body += "<ul>";
        inList = true;
      }

      body += `<li>${escapeHtml(line.substring(2))}</li>`;

      continue;
    }

    //---------------------------------
    // NORMALE TEKST
    //---------------------------------

    closeList();

    body += `<p>${escapeHtml(line)}</p>`;
  }

  closeList();

  //---------------------------------
  // SCREENSHOTS
  //---------------------------------

  let screenshots = "";

  if (images.length) {
    screenshots += `
    <div class="chapter">
        <h1>${
          language === "nl"
            ? "Screenshots"
            : "Screenshots"
        }</h1>
    `;

    images.forEach((img, i) => {
      screenshots += `
      <div class="image-page">

          <h2>Screenshot ${i + 1}</h2>

          <img src="${img.dataUrl}" />

          <div class="caption">
              ${escapeHtml(img.name)}
          </div>

      </div>
      `;
    });

    screenshots += "</div>";
  }

  //---------------------------------
  // HTML
  //---------------------------------

  const html = `
<!DOCTYPE html>

<html
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">

<head>

<meta charset="utf-8">

<title>${documentTitle}</title>

<style>

@page{
    size:A4;
    margin:2cm;
}

body{

    font-family:Calibri;
    font-size:11pt;
    color:#1e293b;
    line-height:1.55;
}

.cover{

    background:#2563eb;
    color:white;
    padding:35px;
    margin-bottom:35px;
}

.cover h1{

    color:white;
    font-size:28pt;
    margin:0;
}

.cover p{

    color:white;
    margin-top:8px;
    font-size:12pt;
}

.chapter{

    page-break-before:always;
}

.chapter:first-of-type{

    page-break-before:auto;
}

h1{

    font-size:22pt;
    color:#2563eb;

    border-bottom:3px solid #2563eb;

    padding-bottom:6px;

    margin-bottom:18px;
}

h2{

    color:#1d4ed8;

    font-size:16pt;

    margin-top:24px;

    margin-bottom:8px;
}

.step{

    margin-top:18px;

    margin-bottom:8px;
}

.step-number{

    color:#2563eb;

    font-size:13pt;

    font-weight:bold;
}

.step-title{

    font-size:12pt;

    font-weight:bold;

    margin-top:3px;
}

p{

    margin-top:6px;

    margin-bottom:10px;

    text-align:justify;
}

ul{

    margin-top:8px;

    margin-left:25px;
}

li{

    margin-bottom:6px;
}

.image-page{

    page-break-before:always;
}

.image-page img{

    display:block;

    width:100%;

    height:auto;

    border:1px solid #CBD5E1;

    margin-top:10px;
}

.caption{

    text-align:center;

    color:#64748b;

    font-size:9pt;

    margin-top:8px;
}

.footer{

    margin-top:40px;

    padding-top:12px;

    border-top:1px solid #CBD5E1;

    color:#64748b;

    font-size:9pt;
}

</style>

</head>

<body>

<div class="cover">

<h1>${documentTitle}</h1>

<p>

${escapeHtml(discipline)}
&nbsp;&nbsp;•&nbsp;&nbsp;
${escapeHtml(environment)}

</p>

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