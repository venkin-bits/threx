import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Stethoscope, Loader } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Added loading state
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw new Error("Invalid Credentials")

      // 2. SECURITY CHECK: Verify this user is actually an ADMIN in the database
      // (This prevents regular patients from logging into the admin panel)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        // If not admin, sign them out immediately
        await supabase.auth.signOut()
        throw new Error("Unauthorized Access: You do not have admin privileges.")
      }

      // 3. Success! Set local storage and redirect
      localStorage.setItem('uyir_role', 'admin')
      navigate('/admin/dashboard')

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/50">
            <ShieldCheck size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2">Authority Access</h1>
        <p className="text-center text-slate-400 mb-8 text-sm">Authorized Personnel Only</p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input 
            type="email" required placeholder="Admin Email" 
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none transition-colors"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input 
            type="password" required placeholder="Secure Key" 
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none transition-colors"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : 'Access System'}
          </button>
        </form>

        {/* --- ROLE SWITCHER --- */}
        <div className="mt-8 pt-6 border-t border-slate-700">
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition text-sm font-bold">
                 <User size={16}/> Patient Login
              </button>
              <button onClick={() => navigate('/doctor')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition text-sm font-bold">
                 <Stethoscope size={16}/> Doctor Login
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}