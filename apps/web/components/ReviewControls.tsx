"use client";
import { useState } from "react";
import { submitReview } from "@/lib/api";

interface ReviewControlsProps { jobId: string; onSubmit?: () => void; }
const FONTS = ["Helvetica Neue", "Montserrat", "Bebas Neue"];
export default function ReviewControls({ jobId, onSubmit }: ReviewControlsProps) {
  const [action, setAction] = useState<string>("");
  const [fontChoice, setFontChoice] = useState(FONTS[0]);
  const [smoothing, setSmoothing] = useState(50);
  const [texture, setTexture] = useState(50);
  const [notes, setNotes] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (selectedAction: string) => {
    setAction(selectedAction);
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(jobId, {
        action: selectedAction,
        font_choice: fontChoice,
        smoothing_value: smoothing,
        texture_value: texture,
        notes,
        ocr_corrections: ocrText ? { text: ocrText } : {},
      });
      setSubmitted(true);
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <div className="bg-[#1F2937] rounded-xl p-6 text-[#14B8A6] font-semibold">✓ Review submitted: {action.replace("_", " ")}</div>;

  const inp = "w-full bg-[#374151] border border-[#4B5563] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#14B8A6]";
  return (
    <div className="bg-[#1F2937] rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Review Controls</h2>
      <div>
        <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">OCR Text Correction</label>
        <textarea className={inp} rows={3} value={ocrText} onChange={e => setOcrText(e.target.value)} placeholder="Edit detected text..." />
      </div>
      <div>
        <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Font Selection</label>
        <select className={inp} value={fontChoice} onChange={e => setFontChoice(e.target.value)}>
          {FONTS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Smoothing: {smoothing}%</label>
        <input type="range" min={0} max={100} value={smoothing} onChange={e => setSmoothing(Number(e.target.value))} className="w-full accent-[#14B8A6]" />
      </div>
      <div>
        <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Texture: {texture}%</label>
        <input type="range" min={0} max={100} value={texture} onChange={e => setTexture(Number(e.target.value))} className="w-full accent-[#14B8A6]" />
      </div>
      <div>
        <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-1 block">Notes</label>
        <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button onClick={() => handleSubmit("approved")} disabled={submitting} className="py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-semibold text-sm transition-colors disabled:opacity-50">✓ Approve</button>
        <button onClick={() => handleSubmit("needs_rework")} disabled={submitting} className="py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 font-semibold text-sm transition-colors disabled:opacity-50">⚠ Rework</button>
        <button onClick={() => handleSubmit("full_rebuild")} disabled={submitting} className="py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-semibold text-sm transition-colors disabled:opacity-50">✕ Rebuild</button>
      </div>
    </div>
  );
}
