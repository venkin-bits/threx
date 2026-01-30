import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { HeartPulse, Stethoscope, ShieldCheck } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // 1. NEW: Check if user is already logged in when app opens
  useEffect(() => {
    const checkSession = async () => {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check specific role storage for Admin/Doctor persistence
      const role = localStorage.getItem('uyir_role')

      if (session) {
        navigate('/dashboard')
      } else if (role === 'admin') {
        navigate('/admin/dashboard')
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard')
      }
    }
    
    checkSession()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      localStorage.setItem('uyir_role', 'user')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/50 animate-fade-in">
        
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <HeartPulse size={48} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-center text-gray-800 mb-2">UYIR Health</h1>
        <p className="text-center text-gray-500 mb-8">Patient Login</p>

        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" 
            className="w-full p-4 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95">
            {loading ? 'Logging in...' : 'Login as Patient'}
          </button>
          
          <div className="text-center mt-4">
             <Link to="/register" className="text-sm font-bold text-gray-400 hover:text-red-500 transition">
               New here? Create Account
             </Link>
          </div>
        </div>

        {/* --- ROLE SWITCHER BUTTONS --- */}
        <div className="mt-8 pt-6 border-t border-gray-100">
           <p className="text-center text-xs text-gray-400 mb-3 uppercase font-bold tracking-widest">Staff Access</p>
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/doctor')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-teal-100 bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition">
                 <Stethoscope size={16}/> Doctor
              </button>
              <button onClick={() => navigate('/admin')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition">
                 <ShieldCheck size={16}/> Admin
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}