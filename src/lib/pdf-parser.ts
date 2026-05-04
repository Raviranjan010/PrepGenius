import * as pdfjsLib from "pdfjs-dist";

// Use CDN for worker to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extract text content from a PDF file.
 * All processing is client-side — no data leaves the browser.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  // Clean up the extracted text
  let text = textParts.join("\n\n");

  // Remove excessive whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Re-add paragraph breaks at likely section boundaries
  text = text.replace(/(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|SUMMARY|OBJECTIVE)/gi, "\n\n$1");

  return text;
}

/**
 * Validate that a file is a valid PDF
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "Please upload a PDF file." };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be less than 5MB." };
  }

  return { valid: true };
}
