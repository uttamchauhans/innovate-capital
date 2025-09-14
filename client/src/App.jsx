import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Allclientsdetails from './pages/Allclientsdetails'
import Clients from './pages/Clients'
import Contact from './pages/Contact'
import ProtectedRoute from './components/ProtectedRoute'

// ✅ Import Toastify container once
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App(){
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-8xl px-4 py-8">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path='/allclientsdetails' element={<ProtectedRoute><Allclientsdetails/></ProtectedRoute>} />
          <Route path='/clients' element={<ProtectedRoute><Clients/></ProtectedRoute>} />
          <Route path='/contact' element={<Contact />} />
        </Routes>
      </main>

      {/* ✅ Global ToastContainer (works for all pages) */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
