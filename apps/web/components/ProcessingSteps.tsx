const STAGES = [
  { key: "normalize", label: "Normalize" },
  { key: "analyze", label: "Analyze" },
  { key: "upscale", label: "Upscale" },
  { key: "segment", label: "Segment" },
  { key: "text_reconstruct", label: "Text Reconstruct" },
  { key: "vectorize", label: "Vectorize" },
  { key: "texture", label: "Texture Extract" },
  { key: "recompose", label: "Recompose" },
  { key: "export", label: "Export" },
  { key: "validate", label: "Validate" },
];
interface ProcessingStepsProps { currentStage?: string; status: string; }
export default function ProcessingSteps({ currentStage, status }: ProcessingStepsProps) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);
  return (
    <div className="space-y-3 w-full max-w-md">
      {STAGES.map((stage, idx) => {
        const done = status === "completed" || idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={stage.key} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? "bg-[#14B8A6] text-white" : active ? "bg-[#14B8A6]/30 border-2 border-[#14B8A6] text-[#14B8A6]" : "bg-[#1F2937] text-[#6B7280]"}`}>
              {done ? "✓" : idx + 1}
            </div>
            <span className={`text-sm ${done ? "text-white" : active ? "text-[#14B8A6] font-semibold" : "text-[#6B7280]"}`}>{stage.label}</span>
            {active && <span className="ml-auto text-xs text-[#14B8A6] animate-pulse">Processing...</span>}
          </div>
        );
      })}
    </div>
  );
}
