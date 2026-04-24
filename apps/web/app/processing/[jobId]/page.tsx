"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LogoHeader from "@/components/LogoHeader";
import StatusBadge from "@/components/StatusBadge";
import ProcessingSteps from "@/components/ProcessingSteps";
import { getJob, triggerProcessing } from "@/lib/api";

export default function ProcessingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [job, setJob] = useState<any>(null);
  const [triggered, setTriggered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const start = async () => {
      try {
        if (!triggered) {
          await triggerProcessing(jobId);
          setTriggered(true);
        }
      } catch { /* ignore trigger errors */ }
      const poll = async () => {
        try {
          const data = await getJob(jobId);
          setJob(data);
          if (data.status === "completed") { clearInterval(interval); setTimeout(() => router.push(`/results/${jobId}`), 1000); }
          if (data.status === "failed") { clearInterval(interval); setError("Processing failed."); }
        } catch { /* ignore poll errors */ }
      };
      poll();
      interval = setInterval(poll, 2000);
    };
    start();
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <main className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <LogoHeader />
        {job && <div className="flex items-center gap-3 justify-center"><StatusBadge status={job.status} /></div>}
        <h2 className="text-center text-xl font-semibold">Processing Your Artwork</h2>
        <p className="text-center text-[#6B7280] text-sm">Optimized at 120 DPI for large-format print.</p>
        <ProcessingSteps currentStage={job?.current_stage} status={job?.status || "processing"} />
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">{error}</div>}
        {job?.status === "completed" && <p className="text-center text-[#14B8A6] font-semibold">✓ Complete! Redirecting...</p>}
      </div>
    </main>
  );
}
