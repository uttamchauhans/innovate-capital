import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar(){
  const navigate = useNavigate()
  const authed = !!localStorage.getItem('token')
  function logout(){ localStorage.removeItem('token'); navigate('/login') }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-xl text-brand-700">Innovate Capital</Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({isActive})=> isActive? 'text-brand-700' : 'text-gray-600'}>Home</NavLink>
          {authed && <NavLink to="/dashboard" className={({isActive})=> isActive? 'text-brand-700' : 'text-gray-600'}>Dashboard</NavLink>}
          {authed && <NavLink to="/allclientsdetails" className={({isActive})=> isActive? 'text-brand-700' : 'text-gray-600'}>All Clients Investment</NavLink>}
          {authed && <NavLink to="/clients" className={({isActive})=> isActive? 'text-brand-700' : 'text-gray-600'}>Add Investment</NavLink>}
          <NavLink to="/contact" className={({isActive})=> isActive? 'text-brand-700' : 'text-gray-600'}>Contact</NavLink>
          {!authed ? (
            <NavLink to="/login" className="btn">Login</NavLink>
          ) : (
            <button className="btn" onClick={logout}>Logout</button>
          )}
        </nav>
      </div>
    </header>
  )
}
