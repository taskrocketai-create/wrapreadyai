import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadFile } from '../api'

export default function UploadCard() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [vehicleType, setVehicleType] = useState('Full Wrap')
  const [printWidth, setPrintWidth] = useState('54"')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await uploadFile(file, vehicleType, printWidth)
      sessionStorage.setItem('job_id', result.job_id)
      navigate('/analysis')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-xl px-10 py-16 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: dragging ? '#14B8A6' : file ? '#0F766E' : '#374151',
          backgroundColor: dragging ? 'rgba(20,184,166,0.05)' : 'transparent',
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".ai,.eps,.pdf,.png,.jpg,.jpeg,.tiff,.psd"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-5xl mb-4">{file ? '✓' : '↑'}</div>
        {file ? (
          <>
            <p className="text-teal font-semibold text-base mb-1">{file.name}</p>
            <p className="text-brand-subtle text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <p className="text-brand-text font-semibold text-base mb-2">Drop your file here</p>
            <p className="text-brand-subtle text-sm">AI, EPS, PDF, PNG, JPG, TIFF, PSD — up to 500 MB</p>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Vehicle Type', value: vehicleType, options: ['Full Wrap', 'Partial Wrap', 'Hood Only', 'Roof Only'], onChange: setVehicleType },
          { label: 'Print Width',  value: printWidth,  options: ['54"', '60"', '72"', 'Custom'],                        onChange: setPrintWidth },
        ].map(({ label, value, options, onChange }) => (
          <div key={label}>
            <label className="block text-brand-secondary text-xs font-medium mb-1.5 uppercase tracking-widest">
              {label}
            </label>
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full bg-brand-bg border border-brand-muted rounded-md text-brand-text px-3 py-2 text-sm"
            >
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={!file || uploading}
        className="w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors duration-150 border-none"
        style={{
          cursor: file && !uploading ? 'pointer' : 'not-allowed',
          backgroundColor: file && !uploading ? '#14B8A6' : '#1F2937',
          color: file && !uploading ? '#0B0F14' : '#4B5563',
        }}
      >
        {uploading ? 'Uploading…' : file ? 'Analyze File' : 'Select a file to continue'}
      </button>
    </div>
  )
}

