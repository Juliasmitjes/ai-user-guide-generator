import { jsPDF } from "jspdf";
import { theme } from "./exportTheme";

type ImageType = {
  name: string;
  dataUrl: string;
};

export function exportPdf(
  generated: string,
  images: ImageType[],
  language: string,
  discipline: string,
  environment: string
) {
  if (!generated) return;

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let y = 95;

  const title =
    language === "nl"
      ? "Werkinstructie"
      : "Work Instruction";


  // titel

  doc.setFillColor(theme.primary);
  doc.rect(0, 0, pageWidth, 70, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, margin, 45);

  doc.setFontSize(10);

  doc.text(
    `${discipline} • ${environment}`,
    margin,
    62
  );


  // body

  const newPageIfNeeded = (height = 20) => {
    if (y + height > pageHeight - 60) {
      doc.addPage();

      y = 60;
    }
  };

  const lines = generated.split("\n");

  lines.forEach((line) => {
    const trimmed = line.trim();
    

    // H1

    if (trimmed.startsWith("# ")) {
      newPageIfNeeded(35);

      y += 12;

      doc.setTextColor(theme.primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      doc.text(trimmed.replace("# ", ""), margin, y);

      y += 18;

      doc.setDrawColor(theme.border);
      doc.line(margin, y, pageWidth - margin, y);

      y += 20;

      return;
    }


// H2

    if (trimmed.startsWith("## ")) {
      newPageIfNeeded(30);

      doc.setTextColor(theme.secondary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);

      doc.text(trimmed.replace("## ", ""), margin, y);

      y += 22;

      return;
    }

// bulletpoints
    if (trimmed.startsWith("- ")) {
      newPageIfNeeded(20);

      doc.setTextColor(theme.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const wrapped = doc.splitTextToSize(
        trimmed.substring(2),
        contentWidth - 18
      );

      wrapped.forEach((w: string, i: number) => {
        newPageIfNeeded();

        if (i === 0) {
          doc.circle(margin + 4, y - 3, 1.5, "F");
        }

        doc.text(w, margin + 15, y);

        y += 15;
      });

      return;
    }


// nummering

    if (/^\d+\./.test(trimmed)) {
      newPageIfNeeded(24);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(theme.secondary);

      const wrapped = doc.splitTextToSize(
        trimmed,
        contentWidth
      );

      wrapped.forEach((w: string) => {
        doc.text(w, margin, y);
        y += 18;
      });

      return;
    }


// tekst

    if (trimmed.length > 0) {
      newPageIfNeeded();

      doc.setTextColor(theme.text);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const wrapped = doc.splitTextToSize(
        trimmed,
        contentWidth
      );

      wrapped.forEach((w: string) => {
        newPageIfNeeded();

        doc.text(w, margin, y);

        y += 15;
      });

      return;
    }

    y += 8;
  });


 // screenshots

  images.forEach((img, index) => {
    doc.addPage();

    let imgY = 60;

    doc.setTextColor(theme.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      `${
        language === "nl"
          ? "Screenshot"
          : "Screenshot"
      } ${index + 1}`,
      margin,
      imgY
    );

    imgY += 20;

    doc.setDrawColor(theme.border);
    doc.setLineWidth(1);

    const imageWidth = contentWidth;
    const imageHeight = 420;

    doc.rect(
      margin,
      imgY,
      imageWidth,
      imageHeight
    );

    try {
      doc.addImage(
        img.dataUrl,
        img.dataUrl.includes("png")
          ? "PNG"
          : "JPEG",
        margin + 5,
        imgY + 5,
        imageWidth - 10,
        imageHeight - 10
      );
    } catch {
      doc.text(
        language === "nl"
          ? "Afbeelding kon niet worden toegevoegd."
          : "Image could not be embedded.",
        margin,
        imgY + 30
      );
    }
  });


  // footer

  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    doc.setDrawColor(theme.border);

    doc.line(
      margin,
      pageHeight - 35,
      pageWidth - margin,
      pageHeight - 35
    );

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(
      `${language === "nl" ? "Pagina" : "Page"} ${i} / ${pages}`,
      pageWidth - margin - 45,
      pageHeight - 18
    );
  }

  // opslaan
  const filename =
    `${title}-${discipline}-${environment}`
      .replace(/\s+/g, "-")
      .toLowerCase();

  doc.save(`${filename}.pdf`);
}