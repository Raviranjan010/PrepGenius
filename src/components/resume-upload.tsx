import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, Loader, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF, validatePDFFile } from "@/lib/pdf-parser";
import { toast } from "sonner";

interface ResumeUploadProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

export const ResumeUpload = ({ value, onChange, disabled }: ResumeUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    const validation = validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);
      if (text.trim().length < 20) {
        setError("Could not extract enough text from this PDF. Try pasting your resume text instead.");
        toast.error("Could not extract text from PDF");
        return;
      }
      onChange(text);
      setShowPreview(true);
      toast.success("Resume parsed successfully!");
    } catch (err) {
      console.error("PDF parsing error:", err);
      setError("Failed to parse PDF. Please try pasting your resume text manually.");
      toast.error("Failed to parse PDF");
    } finally {
      setIsExtracting(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearFile = () => {
    setFileName(null);
    onChange("");
    setShowPreview(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-3">
      {/* Upload Zone or File Info */}
      {!fileName || error ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`upload-zone ${isDragOver ? "drag-over" : ""} ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          {isExtracting ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your resume PDF here or <span className="text-emerald-400">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF only, max 5MB</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-3 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
            <p className="text-xs text-emerald-400">
              {value.split(/\s+/).filter(Boolean).length} words extracted
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setShowPreview(!showPreview); }}
            className="shrink-0"
          >
            {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); clearFile(); }}
            className="shrink-0 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Preview */}
      {showPreview && value && (
        <div className="max-h-48 overflow-y-auto p-4 rounded-xl bg-black/20 border border-border/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Extracted Text Preview
          </p>
          <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
            {value.slice(0, 2000)}{value.length > 2000 ? "..." : ""}
          </p>
        </div>
      )}

      {/* Fallback textarea */}
      {!fileName && !error && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">— or paste your resume text manually —</p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your resume or CV text here to get highly personalized interview questions..."
            className="w-full h-32 px-4 py-3 text-sm bg-white/5 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-foreground placeholder:text-muted-foreground"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};
