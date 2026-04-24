"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import StatusBadge from "@/components/StatusBadge";
import ReviewControls from "@/components/ReviewControls";
import AnalysisPanel from "@/components/AnalysisPanel";
import { getJob, getAnalysis, API_BASE } from "@/lib/api";

export default function ReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [j, a] = await Promise.all([getJob(jobId), getAnalysis(jobId).catch(() => null)]);
        setJob(j); setAnalysis(a);
      } catch { /* ignore errors */ }
    };
    fetchData();
  }, [jobId]);

  const originalUrl = `${API_BASE}/api/jobs/${jobId}/preview/original`;
  const processedUrl = `${API_BASE}/api/jobs/${jobId}/preview/processed`;

  return (
    <main className="min-h-screen bg-[#0B0F14] px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <LogoHeader />
          <span className="text-[#6B7280] text-sm bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">Internal Review</span>
        </div>
        {job && <div className="flex items-center gap-3"><span className="text-[#6B7280] text-sm">Job {jobId.slice(0,8)}...</span><StatusBadge status={job.status} /></div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wide">Original</p>
              <div className="bg-[#1F2937] rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wide">Processed</p>
              <div className="bg-[#1F2937] rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <img src={processedUrl} alt="Processed" className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
              </div>
            </div>
            {analysis && <AnalysisPanel analysis={analysis} />}
          </div>
          <ReviewControls jobId={jobId} onSubmit={() => router.push(`/results/${jobId}`)} />
        </div>
      </div>
    </main>
  );
}
