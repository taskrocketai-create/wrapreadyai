interface DownloadPanelProps { jobId: string; outputs: Array<{ output_type: string; file_size: number; width_px: number; height_px: number }>; }
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function DownloadPanel({ jobId, outputs }: DownloadPanelProps) {
  const types = ["png", "tiff", "pdf", "svg"];
  return (
    <div className="bg-[#1F2937] rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Download Outputs</h2>
      <p className="text-xs text-[#6B7280] mb-4">Optimized at 120 DPI for large-format print.</p>
      <div className="grid grid-cols-2 gap-3">
        {types.map(type => {
          const output = outputs.find(o => o.output_type === type);
          return (
            <a key={type} href={output ? `${API_BASE}/api/jobs/${jobId}/download/${type}` : undefined}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${output ? "border-[#14B8A6]/50 hover:border-[#14B8A6] hover:bg-[#14B8A6]/10 cursor-pointer" : "border-[#374151] opacity-40 cursor-not-allowed"}`}>
              <span className="text-2xl">{type === "png" ? "🖼" : type === "tiff" ? "🗂" : type === "pdf" ? "📄" : "📐"}</span>
              <span className="text-sm font-semibold uppercase">{type}</span>
              {output && <span className="text-xs text-[#6B7280]">{output.width_px}×{output.height_px}px · {(output.file_size/1024/1024).toFixed(1)}MB</span>}
              {!output && <span className="text-xs text-[#6B7280]">Not available</span>}
            </a>
          );
        })}
      </div>
    </div>
  );
}
