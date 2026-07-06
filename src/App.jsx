import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BlogHome from './pages/BlogHome'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
