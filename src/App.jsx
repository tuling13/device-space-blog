import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BlogHome from './pages/BlogHome'
import LoginPage from './pages/LoginPage'

const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
