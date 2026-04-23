import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export interface CheckResult {
  label: string
  status: 'ready' | 'warning' | 'error' | 'processing' | 'pending'
  detail: string
}

export interface Job {
  id: string
  filename: string
  file_size_mb: number
  vehicle_type: string
  print_width: string
  status: 'pending' | 'processing' | 'ready' | 'warning' | 'error'
  checks: CheckResult[]
  created_at: string
  updated_at: string
}

export async function uploadFile(
  file: File,
  vehicleType: string,
  printWidth: string,
): Promise<{ job_id: string; filename: string; status: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('vehicle_type', vehicleType)
  form.append('print_width', printWidth)
  const res = await api.post('/upload/', form)
  return res.data
}

export async function analyzeJob(jobId: string): Promise<Job> {
  const res = await api.post(`/jobs/${jobId}/analyze`)
  return res.data
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await api.get(`/jobs/${jobId}`)
  return res.data
}

export async function getReviewQueue(): Promise<Job[]> {
  const res = await api.get('/review/queue')
  return res.data
}

export async function approveJob(jobId: string): Promise<void> {
  await api.post(`/review/${jobId}/approve`)
}

export async function rejectJob(jobId: string): Promise<void> {
  await api.post(`/review/${jobId}/reject`)
}

export function downloadJobFile(jobId: string): void {
  const a = document.createElement('a')
  a.href = `/api/jobs/${jobId}/download`
  a.download = ''
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}
