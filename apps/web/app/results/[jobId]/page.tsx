"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import StatusBadge from "@/components/StatusBadge";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import DownloadPanel from "@/components/DownloadPanel";
import { getJob, getJobOutputs, API_BASE } from "@/lib/api";

export default function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [outputs, setOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [j, o] = await Promise.all([getJob(jobId), getJobOutputs(jobId)]);
        setJob(j); setOutputs(o);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [jobId]);

  const originalUrl = `${API_BASE}/api/jobs/${jobId}/preview/original`;
  const processedUrl = `${API_BASE}/api/jobs/${jobId}/preview/processed`;

  return (
    <main className="min-h-screen bg-[#0B0F14] px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <LogoHeader />
        {job && <div className="flex items-center gap-3"><span className="text-[#6B7280] text-sm">Job {jobId.slice(0,8)}...</span><StatusBadge status={job.status} /></div>}
        {loading ? <div className="text-center py-20 text-[#6B7280]"><div className="animate-spin w-10 h-10 border-2 border-[#14B8A6] border-t-transparent rounded-full mx-auto mb-4" /><p>Loading results...</p></div> : <>
          <BeforeAfterSlider beforeUrl={originalUrl} afterUrl={processedUrl} />
          <DownloadPanel jobId={jobId} outputs={outputs} />
          <div className="bg-[#1F2937] rounded-xl p-4 text-sm text-[#6B7280]">
            <p className="text-white font-semibold mb-2">Summary of Improvements</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Upscaled to 120 DPI for large-format print</li>
              <li>Color profile normalized to sRGB</li>
              <li>Edges sharpened and artifacts removed</li>
              {outputs.length > 0 && <li>{outputs.length} output format{outputs.length > 1 ? "s" : ""} generated</li>}
            </ul>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/review/${jobId}`)} className="flex-1 py-3 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white font-semibold transition-colors">Internal Review</button>
            <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-white font-semibold transition-colors">New Job</button>
          </div>
        </>}
      </div>
    </main>
  );
}
