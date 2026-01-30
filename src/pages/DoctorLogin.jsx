import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, User, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function DoctorLogin() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    // Verify against Supabase Doctors Table
    const { data } = await supabase.from('doctors').select('*').eq('email', email).eq('code', code).single()
    
    if (data) {
      localStorage.setItem('uyir_role', 'doctor')
      localStorage.setItem('uyir_doc_email', email)
      navigate('/doctor/dashboard')
    } else {
      alert("Invalid Doctor Credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-900 text-white p-6">
      <div className="w-full max-w-md bg-teal-800 p-8 rounded-2xl shadow-2xl animate-fade-in border border-teal-700">
        
        <div className="flex justify-center mb-6">
          <div className="bg-teal-500 p-4 rounded-full shadow-lg">
            <Stethoscope size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center mb-2">Doctor Portal</h1>
        <p className="text-center text-teal-300 mb-8">Medical Staff Access Only</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" required placeholder="Doctor Email" 
            className="w-full p-4 bg-teal-950 rounded-xl border border-teal-600 outline-none focus:border-teal-400" 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" required placeholder="Access Code" 
            className="w-full p-4 bg-teal-950 rounded-xl border border-teal-600 outline-none focus:border-teal-400" 
            onChange={e => setCode(e.target.value)} 
          />
          <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 rounded-xl transition shadow-lg">
            Enter Dashboard
          </button>
        </form>

        {/* --- ROLE SWITCHER --- */}
        <div className="mt-8 pt-6 border-t border-teal-700/50">
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-teal-900/50 text-teal-200 hover:bg-teal-900 transition text-sm font-bold">
                 <User size={16}/> Patient Login
              </button>
              <button onClick={() => navigate('/admin')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-teal-900/50 text-teal-200 hover:bg-teal-900 transition text-sm font-bold">
                 <ShieldCheck size={16}/> Admin Login
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}