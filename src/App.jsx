import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BlogHome from './pages/BlogHome'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<BlogHome />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
