import { DIRECT_API_BASE } from "@/lib/api";

interface Output {
  output_type: string;
  file_size: number;
  width_px: number;
  height_px: number;
}

interface DownloadPanelProps {
  jobId: string;
  outputs: Output[];
}

const FORMAT_META: Record<string, { icon: string; label: string; desc: string; highlight?: boolean }> = {
  zip: {
    icon: "🗂️",
    label: "Layers ZIP",
    desc: "Layered PDF + transparent PNGs — open in Illustrator, CorelDRAW, or any software",
    highlight: true,
  },
  png: { icon: "🖼️", label: "PNG", desc: "Full-res flattened image" },
  pdf: { icon: "📄", label: "PDF", desc: "Single-page print PDF" },
  eps: { icon: "✏️", label: "EPS", desc: "Vector — opens in all RIP software (Roland, Mimaki, Caldera, Flexi)" },
  ai:  { icon: "🎨", label: "AI", desc: "Adobe Illustrator — editable color layers" },
};

const FORMAT_ORDER = ["zip", "png", "pdf", "eps", "ai"];

export default function DownloadPanel({ jobId, outputs }: DownloadPanelProps) {
  return (
    <div className="bg-[#1F2937] rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-1">Download Outputs</h2>
      <p className="text-xs text-[#6B7280] mb-5">Optimized at 120 DPI for large-format print.</p>

      <div className="grid grid-cols-1 gap-3">
        {FORMAT_ORDER.map((type) => {
          const meta = FORMAT_META[type];
          const output = outputs.find((o) => o.output_type === type);
          const available = !!output;
          const sizeMB = output ? (output.file_size / 1024 / 1024).toFixed(1) : null;

          return (
            <a
              key={type}
              href={available ? `${DIRECT_API_BASE}/api/jobs/${jobId}/download/${type}` : undefined}
              download
              className={[
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                available
                  ? meta.highlight
                    ? "border-[#14B8A6] bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 cursor-pointer"
                    : "border-[#374151] hover:border-[#14B8A6]/60 hover:bg-[#374151]/40 cursor-pointer"
                  : "border-[#2D3748] opacity-40 cursor-not-allowed",
              ].join(" ")}
            >
              <span className="text-3xl w-10 text-center flex-shrink-0">{meta.icon}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{meta.label}</span>
                  {meta.highlight && available && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#14B8A6] text-black px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{meta.desc}</p>
                {output && (
                  <p className="text-xs text-[#4B5563] mt-1">
                    {output.width_px}×{output.height_px}px
                    {sizeMB && sizeMB !== "0.0" ? ` · ${sizeMB}MB` : ""}
                  </p>
                )}
              </div>

              {available && (
                <svg
                  className="w-5 h-5 text-[#14B8A6] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
