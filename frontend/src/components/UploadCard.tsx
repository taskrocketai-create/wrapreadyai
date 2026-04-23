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
      const msg =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#14B8A6' : file ? '#0F766E' : '#374151'}`,
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: dragging ? 'rgba(20, 184, 166, 0.05)' : 'transparent',
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".ai,.eps,.pdf,.png,.jpg,.jpeg,.tiff,.psd"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {file ? '✓' : '↑'}
        </div>
        {file ? (
          <>
            <p style={{ color: '#14B8A6', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{file.name}</p>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <p style={{ color: '#E5E7EB', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Drop your file here</p>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>AI, EPS, PDF, PNG, JPG, TIFF, PSD — up to 500MB</p>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Vehicle Type', value: vehicleType, options: ['Full Wrap', 'Partial Wrap', 'Hood Only', 'Roof Only'], onChange: setVehicleType },
          { label: 'Print Width', value: printWidth, options: ['54"', '60"', '72"', 'Custom'], onChange: setPrintWidth },
        ].map(({ label, value, options, onChange }) => (
          <div key={label}>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '12px', fontWeight: '500', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </label>
            <select
              value={value}
              onChange={e => onChange(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#E5E7EB',
                padding: '8px 12px',
                fontSize: '14px',
              }}
            >
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: '#F87171', fontSize: '13px', margin: 0 }}>{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || uploading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '15px',
          cursor: file && !uploading ? 'pointer' : 'not-allowed',
          backgroundColor: file && !uploading ? '#14B8A6' : '#1F2937',
          color: file && !uploading ? '#0B0F14' : '#4B5563',
          border: 'none',
          transition: 'background-color 0.15s',
        }}
      >
        {uploading ? 'Uploading...' : file ? 'Analyze File' : 'Select a file to continue'}
      </button>
    </div>
  )
}

