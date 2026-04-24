"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadCardProps {
  targetWidthFt: number;
  targetWidthIn: number;
  targetHeightFt: number;
  targetHeightIn: number;
  useType: string;
}

export default function UploadCard({ targetWidthFt, targetWidthIn, targetHeightFt, targetHeightIn, useType }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validateFile = (f: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) { setError("Only JPG, PNG, and WebP files are allowed."); return false; }
    if (f.size > 50 * 1024 * 1024) { setError("File must be under 50MB."); return false; }
    setError("");
    return true;
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const totalWidthIn = (targetWidthFt * 12) + targetWidthIn;
      const totalHeightIn = (targetHeightFt * 12) + targetHeightIn;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_width_in", String(totalWidthIn));
      formData.append("target_height_in", String(totalHeightIn || totalWidthIn * 0.5));
      formData.append("use_type", useType);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      router.push(`/analysis/${data.job_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-[#14B8A6] bg-[#14B8A6]/10" : "border-[#1F2937] hover:border-[#14B8A6]/50"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input id="fileInput" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-[#6B7280] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium">Drag &amp; drop your artwork here</p>
              <p className="text-[#6B7280] text-sm">JPG, PNG, WebP • Max 50MB</p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-4 w-full py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Analyze & Process"}
      </button>
    </div>
  );
}
