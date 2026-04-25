// When NEXT_PUBLIC_API_URL is set (production), the browser calls the backend
// directly, avoiding Vercel's server-side rewrite proxy (which blocks requests
// to private hostnames with DNS_HOSTNAME_RESOLVED_PRIVATE).
// When unset (local dev), relative /api/* paths are used and Next.js rewrites
// them to http://localhost:8000 via the rewrite in next.config.ts.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init).catch((err: Error) => {
    throw new Error(
      `Network error reaching the API server. ` +
      `Verify the backend is running and that NEXT_PUBLIC_API_URL is set to the correct backend URL in your deployment environment. (${err.message})`
    );
  });
  return res;
}

export async function uploadFile(formData: FormData) {
  const res = await apiFetch(`${API_BASE}/api/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJob(jobId: string) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAnalysis(jobId: string) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}/analysis`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJobOutputs(jobId: string) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}/outputs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function approveJob(jobId: string) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approved" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitReview(jobId: string, review: { action: string; ocr_corrections?: Record<string, string>; font_choice?: string; smoothing_value?: number; texture_value?: number; notes?: string }) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function triggerProcessing(jobId: string) {
  const res = await apiFetch(`${API_BASE}/api/jobs/${jobId}/process`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
