interface AnalysisPanelProps {
  analysis: {
    effective_dpi: number;
    confidence_score: number;
    route_recommendation: string;
    classification: string;
    original_width_px: number;
    original_height_px: number;
    text_detected: boolean;
    vector_candidate: boolean;
  };
}
const ROUTE_COLORS: Record<string, string> = {
  AUTO_PROCESS: "text-green-400",
  QUICK_REVIEW: "text-yellow-400",
  FULL_RECONSTRUCTION: "text-red-400",
};
export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const routeColor = ROUTE_COLORS[analysis.route_recommendation] || "text-white";
  const dpiOk = analysis.effective_dpi >= 100;
  return (
    <div className="bg-[#1F2937] rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Effective DPI" value={`${Math.round(analysis.effective_dpi)}`} color={dpiOk ? "text-green-400" : "text-red-400"} />
        <Stat label="Confidence" value={`${Math.round(analysis.confidence_score)}%`} color={analysis.confidence_score >= 65 ? "text-[#14B8A6]" : "text-red-400"} />
        <Stat label="Resolution" value={`${analysis.original_width_px} × ${analysis.original_height_px}px`} />
        <Stat label="Classification" value={analysis.classification?.replace(/_/g, " ")} />
        <Stat label="Text Detected" value={analysis.text_detected ? "Yes" : "No"} />
        <Stat label="Vector Candidate" value={analysis.vector_candidate ? "Yes" : "No"} />
      </div>
      <div className="border-t border-[#374151] pt-4">
        <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Recommended Route</p>
        <p className={`text-xl font-bold ${routeColor}`}>{analysis.route_recommendation?.replace(/_/g, " ")}</p>
        <p className="text-xs text-[#6B7280] mt-1">Optimized at 120 DPI for large-format print.</p>
      </div>
      <div className="w-full bg-[#374151] rounded-full h-2">
        <div className="bg-[#14B8A6] h-2 rounded-full transition-all" style={{ width: `${analysis.confidence_score}%` }} />
      </div>
    </div>
  );
}
function Stat({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-[#6B7280] uppercase tracking-wide">{label}</p>
      <p className={`font-semibold ${color}`}>{value}</p>
    </div>
  );
}
