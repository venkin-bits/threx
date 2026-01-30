import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { User, Lock, Mail, Phone, Loader, Shield, Smartphone } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',          // User's personal number
    emergencyPhone: '', // SOS contact number
    password: '',
    age: '',
    bloodGroup: '',
    gender: 'Male'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Save BOTH numbers to profile
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id,
            full_name: formData.fullName,
            age: formData.age,
            gender: formData.gender,
            blood_group: formData.bloodGroup,
            phone: formData.phone,                   // <--- Personal Number
            emergency_phone: formData.emergencyPhone // <--- SOS Number
        }])

        if (profileError) {
            console.error("Profile Error:", profileError)
            alert("Account created, but profile details failed.")
        } else {
            alert("Registration Successful! Please Login.")
            navigate('/login')
        }
      }

    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-indigo-900 flex items-center justify-center gap-2">
            <Shield className="text-indigo-600" /> Create Account
          </h1>
          <p className="text-slate-500 text-sm">Join UYIR Health Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required type="text" placeholder="Full Name"
              className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required type="email" placeholder="Email Address"
              className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required type="password" placeholder="Create Password"
              className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* --- NEW SPLIT PHONE SECTION --- */}
          <div className="grid grid-cols-1 gap-3">
             {/* Personal Phone */}
             <div className="relative">
                <Smartphone className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  required type="tel" placeholder="Your Mobile Number"
                  className="w-full pl-10 p-3 bg-slate-50 border rounded-xl outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
             </div>

             {/* Emergency Phone */}
             <div className="relative">
                <Phone className="absolute left-3 top-3 text-red-400" size={18} />
                <input 
                  required type="tel" placeholder="Emergency SOS Contact"
                  className="w-full pl-10 p-3 bg-red-50 border border-red-100 rounded-xl outline-none text-red-900 placeholder-red-300"
                  value={formData.emergencyPhone}
                  onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                />
             </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <input 
              required type="number" placeholder="Age"
              className="p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
            />
            <select 
              className="p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
            </select>
          </div>

          <input 
              required type="text" placeholder="Blood Group (e.g. O+)"
              className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
              value={formData.bloodGroup}
              onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
            />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : 'Register Now'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}