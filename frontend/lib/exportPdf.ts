import { jsPDF } from "jspdf";
import { theme } from "./exportTheme";

type ImageType = {
  name: string;
  dataUrl: string;
};

export async function exportPdf(
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
    newPageIfNeeded(100);

    const number = trimmed.match(/^\d+/)?.[0] ?? "";

    const title =
        language === "nl"
        ? `Stap ${number}`
        : `Step ${number}`;

    const text = trimmed.replace(/^\d+\.\s*/, "");

    // titel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(theme.secondary);

    doc.text(title, margin, y);

    y += 22;

    // tekst
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(theme.text);

    const wrapped = doc.splitTextToSize(text, contentWidth);

    wrapped.forEach((line: string) => {
        newPageIfNeeded();
        doc.text(line, margin, y);
        y += 15;
    });

    y += 10;

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

    function getImageSize(
        dataUrl: string
        ): Promise<{ width: number; height: number }> {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => {
            resolve({
                width: image.width,
                height: image.height,
            });
            };

            image.src = dataUrl;
        });
        }

        for (let index = 0; index < images.length; index++) {
        const img = images[index];

        doc.addPage();

        let imgY = 60;

        doc.setTextColor(theme.primary);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);

        doc.text(
            `Screenshot ${index + 1}`,
            margin,
            imgY
        );

        imgY += 20;

        try {
            const { width, height } = await getImageSize(img.dataUrl);

            const maxWidth = contentWidth;
            const maxHeight = pageHeight - 170;

            const scale = Math.min(
            maxWidth / width,
            maxHeight / height
            );

            const imageWidth = width * scale;
            const imageHeight = height * scale;

            const x = margin + (contentWidth - imageWidth) / 2;

            doc.setDrawColor(theme.border);
            doc.rect(
            x,
            imgY,
            imageWidth,
            imageHeight
            );

            doc.addImage(
            img.dataUrl,
            img.dataUrl.includes("png") ? "PNG" : "JPEG",
            x,
            imgY,
            imageWidth,
            imageHeight
            );

            imgY += imageHeight + 20;

            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(120);

            doc.text(
            img.name,
            pageWidth / 2,
            imgY,
            {
                align: "center",
            }
            );
        } catch {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(theme.text);

            doc.text(
            language === "nl"
                ? "Afbeelding kon niet worden toegevoegd."
                : "Image could not be embedded.",
            margin,
            imgY + 30
            );
        }
        }


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