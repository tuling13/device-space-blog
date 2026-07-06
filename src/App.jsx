import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BlogHome from './pages/BlogHome'
import GuidePage from './pages/GuidePage'

const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
