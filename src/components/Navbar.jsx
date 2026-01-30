import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LogOut, User, Globe, Home } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { language, toggleLanguage, t } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('uyir_role')
    localStorage.removeItem('uyir_doc_email')
    navigate('/', { replace: true })
  }

  return (
    // ADDED 'pt-safe' to handle the notch
    <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 pt-safe shadow-sm">
      
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white font-black text-lg">U</span>
        </div>
        <span className="text-xl font-black bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          UYIR
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-slate-600 active:bg-slate-100 p-2 rounded-full transition">
           <Home size={22} />
        </Link>

        <button 
           onClick={toggleLanguage}
           className="flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition"
        >
           <Globe size={18}/>
           <span className="text-sm">{language === 'en' ? 'EN' : 'தமிழ்'}</span>
        </button>

        <Link to="/profile" className="text-slate-600 active:bg-slate-100 p-2 rounded-full transition">
          <User size={22}/>
        </Link>

        <button onClick={handleLogout} className="bg-red-50 text-red-600 active:bg-red-600 active:text-white p-2 rounded-full transition">
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  )
}