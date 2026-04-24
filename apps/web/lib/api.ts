const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAnalysis(jobId: string) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/analysis`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJobOutputs(jobId: string) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/outputs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function approveJob(jobId: string) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approved" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitReview(jobId: string, review: { action: string; ocr_corrections?: Record<string, string>; font_choice?: string; smoothing_value?: number; texture_value?: number; notes?: string }) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function triggerProcessing(jobId: string) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/process`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
