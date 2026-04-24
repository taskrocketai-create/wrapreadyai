"use client";
import { useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import UploadCard from "@/components/UploadCard";
import SizeInput from "@/components/SizeInput";
import UseTypeSelect from "@/components/UseTypeSelect";

export default function Home() {
  const [widthFt, setWidthFt] = useState(10);
  const [widthIn, setWidthIn] = useState(0);
  const [heightFt, setHeightFt] = useState(4);
  const [heightIn, setHeightIn] = useState(0);
  const [useType, setUseType] = useState("vehicle_wrap");

  return (
    <main className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <LogoHeader />
        <p className="text-center text-[#6B7280]">Submit an image. Get a wrap-ready file.</p>
        <SizeInput widthFt={widthFt} setWidthFt={setWidthFt} widthIn={widthIn} setWidthIn={setWidthIn} heightFt={heightFt} setHeightFt={setHeightFt} heightIn={heightIn} setHeightIn={setHeightIn} />
        <UseTypeSelect value={useType} onChange={setUseType} />
        <UploadCard targetWidthFt={widthFt} targetWidthIn={widthIn} targetHeightFt={heightFt} targetHeightIn={heightIn} useType={useType} />
        <p className="text-center text-xs text-[#374151]">Optimized at 120 DPI for large-format print.</p>
      </div>
    </main>
  );
}
