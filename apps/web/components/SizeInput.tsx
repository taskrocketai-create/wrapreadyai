"use client";
interface SizeInputProps {
  widthFt: number; setWidthFt: (v: number) => void;
  widthIn: number; setWidthIn: (v: number) => void;
  heightFt: number; setHeightFt: (v: number) => void;
  heightIn: number; setHeightIn: (v: number) => void;
}
export default function SizeInput({ widthFt, setWidthFt, widthIn, setWidthIn, heightFt, setHeightFt, heightIn, setHeightIn }: SizeInputProps) {
  const inp = "bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:border-[#14B8A6] text-sm";
  return (
    <div className="w-full max-w-lg">
      <p className="text-[#6B7280] text-xs mb-2 uppercase tracking-wide">Target Size</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Width</p>
          <div className="flex gap-2">
            <div className="flex-1"><input type="number" min="0" value={widthFt} onChange={e=>setWidthFt(Number(e.target.value))} className={inp} placeholder="ft"/><span className="text-xs text-[#6B7280] ml-1">ft</span></div>
            <div className="flex-1"><input type="number" min="0" max="11" value={widthIn} onChange={e=>setWidthIn(Number(e.target.value))} className={inp} placeholder="in"/><span className="text-xs text-[#6B7280] ml-1">in</span></div>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Height <span className="text-[#374151]">(optional)</span></p>
          <div className="flex gap-2">
            <div className="flex-1"><input type="number" min="0" value={heightFt} onChange={e=>setHeightFt(Number(e.target.value))} className={inp} placeholder="ft"/><span className="text-xs text-[#6B7280] ml-1">ft</span></div>
            <div className="flex-1"><input type="number" min="0" max="11" value={heightIn} onChange={e=>setHeightIn(Number(e.target.value))} className={inp} placeholder="in"/><span className="text-xs text-[#6B7280] ml-1">in</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
