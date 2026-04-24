"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import StatusBadge from "@/components/StatusBadge";
import AnalysisPanel from "@/components/AnalysisPanel";
import IssueList from "@/components/IssueList";
import { getJob, getAnalysis } from "@/lib/api";

export default function AnalysisPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchData = async () => {
      try {
        const jobData = await getJob(jobId);
        setJob(jobData);
        if (["analyzed", "processing", "completed", "review"].includes(jobData.status)) {
          try {
            const analysisData = await getAnalysis(jobId);
            setAnalysis(analysisData);
            const generatedIssues: Array<{severity: "error"|"warning"|"info"; message: string}> = [];
            if (analysisData.effective_dpi < 60) generatedIssues.push({ severity: "error", message: `Very low DPI (${Math.round(analysisData.effective_dpi)}). Full reconstruction recommended.` });
            else if (analysisData.effective_dpi < 100) generatedIssues.push({ severity: "warning", message: `Low DPI (${Math.round(analysisData.effective_dpi)}). Upscaling will be applied.` });
            if (analysisData.text_detected && analysisData.ocr_confidence < 0.70) generatedIssues.push({ severity: "warning", message: "Text detected but OCR confidence is low. Human review recommended." });
            if (analysisData.vector_node_count > 8000) generatedIssues.push({ severity: "warning", message: `High vector complexity (${analysisData.vector_node_count} nodes). Full reconstruction may be needed.` });
            setIssues(generatedIssues);
            clearInterval(interval);
            setLoading(false);
          } catch { /* analysis not yet ready */ }
        } else if (["failed"].includes(jobData.status)) {
          setError("Analysis failed. Please try again.");
          clearInterval(interval);
          setLoading(false);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An error occurred");
        setLoading(false);
        clearInterval(interval);
      }
    };
    fetchData();
    interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <main className="min-h-screen bg-[#0B0F14] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <LogoHeader />
        {job && <div className="flex items-center gap-3"><span className="text-[#6B7280] text-sm">Job {jobId.slice(0,8)}...</span><StatusBadge status={job.status} /></div>}
        {loading && !analysis && <div className="text-center py-20 text-[#6B7280]"><div className="animate-spin w-10 h-10 border-2 border-[#14B8A6] border-t-transparent rounded-full mx-auto mb-4" /><p>Analyzing your artwork...</p></div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">{error}</div>}
        {analysis && <>
          <AnalysisPanel analysis={analysis} />
          <IssueList issues={issues} />
          <div className="flex gap-3">
            <button onClick={() => router.push(`/processing/${jobId}`)} className="flex-1 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0F766E] text-white font-semibold transition-colors">Continue to Processing →</button>
            <button onClick={() => router.push(`/review/${jobId}`)} className="px-6 py-3 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white font-semibold transition-colors">Review</button>
          </div>
        </>}
      </div>
    </main>
  );
}
