"use client";
interface UseTypeSelectProps { value: string; onChange: (v: string) => void; }
const USE_TYPES = [
  { value: "vehicle_wrap", label: "Vehicle Wrap" },
  { value: "trailer_wrap", label: "Trailer Wrap" },
  { value: "banner", label: "Banner" },
  { value: "decal", label: "Decal" },
  { value: "sign", label: "Sign" },
  { value: "logo", label: "Logo" },
];
export default function UseTypeSelect({ value, onChange }: UseTypeSelectProps) {
  return (
    <div className="w-full max-w-lg">
      <p className="text-[#6B7280] text-xs mb-2 uppercase tracking-wide">Use Type</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#14B8A6] text-sm"
      >
        {USE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
    </div>
  );
}
