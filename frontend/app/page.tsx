"use client";

import { useState, useRef } from "react";
import { Upload, FileText, FileDown, X, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { showToast } from "nextjs-toast-notify";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "nl", label: "Dutch" }]

const DISCIPLINES = [
  "Doctor",
  "Doctor's assistant",
  "Data engineer",
  "Business support",
  "Front desk employee",
  "HR employee",
];

const ENVIRONMENTS = [
  "Workflow",
  "Planning wizard",
  "Calendar",
  "Client portal",
  "Records",
  "Client profile",
];

interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  file: File;
}

 function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");}

export default function Home() {

  const [language, setLanguage] = useState<string>("English");
  const [discipline, setDiscipline] = useState<string>("");
  const [environment, setEnvironment] = useState<string>("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [generated, setGenerated] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            dataUrl: reader.result as string,
            file
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGenerate = async () => {
    console.log("Generate clicked");


    if (!discipline || !environment) {
      showToast.error("Please select a discipline and a work environment.");
      return;
    }
    setLoading(true);
    try { const formData = new FormData();

    formData.append("discipline", discipline);
    formData.append("environment", environment);
    images.forEach((image) => {
      formData.append("screenshots", image.file);
    });

    const response = await fetch(
      "http://127.0.0.1:8000/generate-guide",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log(data);
    setGenerated(data.manual ?? JSON.stringify(data, null, 2));

    showToast.success("Work instruction generated! 🎉", {
      duration: 4000, 
      position: "top-right",
      transition: "bounceIn",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      sound: true,
      progress: true
    });
}
catch (error) {
    console.error(error);
    showToast.error("Something went wrong.");
}
finally {
    setLoading(false);
}};

  const downloadPdf = () => {
    if (!generated) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    let y = 64;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = doc.internal.pageSize.getWidth() - marginX * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Work Instruction", marginX, y);
    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const lines = generated.split("\n").slice(2); // skip title
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line || " ", maxWidth);
      wrapped.forEach((w: string) => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 64;
        }
        doc.text(w, marginX, y);
        y += 16;
      });
    });

    images.forEach((img) => {
      doc.addPage();
      y = 48;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(img.name, marginX, y);
      y += 16;
      try {
        const format = img.dataUrl.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(img.dataUrl, format, marginX, y, maxWidth, 0);
      } catch {
        doc.text("(Screenshot could not be embedded)", marginX, y + 20);
      }
    });

    doc.save(`work-instruction-${discipline}-${environment}.pdf`.replace(/\s+/g, "-").toLowerCase());
  };

  const downloadWord = () => {
    if (!generated) return;
    const bodyHtml = generated
      .split("\n")
      .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<p>&nbsp;</p>"))
      .join("");
    const imagesHtml = images
      .map(
        (img) =>
          `<h3>${escapeHtml(img.name)}</h3><img src="${img.dataUrl}" style="max-width:600px;" />`,
      )
      .join("");
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Work Instruction</title></head><body style="font-family:Calibri,Arial,sans-serif;">${bodyHtml}${imagesHtml}</body></html>`;
    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-instruction-${discipline}-${environment}.doc`
      .replace(/\s+/g, "-")
      .toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-10 flex flex-col items-start gap-3">
          
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Work instruction generator
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Pick your discipline and work environment, upload the relevant
            screenshots, and generate a downloadable work instruction.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:grid-cols-3">

            <div className="space-y-3">
              <Label htmlFor="discipline">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="discipline">
                  <SelectValue placeholder="Select a discipline" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-3">
              <Label htmlFor="discipline">Discipline</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline">
                  <SelectValue placeholder="Select a discipline" />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="environment">Work environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label>Screenshots</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted cursor-pointer"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground ">
                Click to upload screenshots
              </span>
              <span className="text-xs text-muted-foreground">
                PNG or JPG, multiple files supported
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="aspect-video w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
                      aria-label={`Remove ${img.name}`}
                    >
                      <X className="h-3.5 w-3.5 cursor-pointer" />
                    </button>
                    <div className="truncate px-2 py-1 text-xs text-muted-foreground">
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleGenerate} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  Generate work instruction
                </>
              )}
            </Button>
          </div>
        </section>

        {generated && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Generated work instruction
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadWord}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Word
                </Button>
                <Button onClick={downloadPdf}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-foreground">
              {generated}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Disclaimer: This content was developed with the assistance of AI. 
              Please verify any critical information.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
