import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import ResultsPage from './pages/ResultsPage'
import ReviewDashboard from './pages/ReviewDashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload"   element={<UploadPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/results"  element={<ResultsPage />} />
          <Route path="/review"   element={<ReviewDashboard />} />
        </Routes>
      </main>
    </div>
  )
}
