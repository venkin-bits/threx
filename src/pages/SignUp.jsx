import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', 
    dob: '', gender: 'Male', bloodGroup: '', emergencyPhone: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Create Auth User
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    // 2. Create OR Update Profile Record
    // We use 'upsert' to fix the duplicate key error
    if (user) {
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: user.id,
        full_name: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        emergency_phone: formData.emergencyPhone
      }])

      if (profileError) {
        alert("Account created but profile failed: " + profileError.message)
      } else {
        alert("Account Created Successfully! Please Login.")
        navigate('/') // Redirect to Login Page
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-full text-red-600"><UserPlus /></div>
          <h1 className="text-2xl font-black text-gray-800">Create Patient Profile</h1>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="fullName" placeholder="Full Name" onChange={handleChange} required className="p-3 bg-gray-50 rounded-xl border" />
            <select name="gender" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl border">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-gray-400 ml-1">Date of Birth</label>
               <input type="date" name="dob" onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-400 ml-1">Blood Group</label>
               <input name="bloodGroup" placeholder="e.g. O+ve" onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border" />
             </div>
          </div>

          <input name="emergencyPhone" placeholder="Emergency Contact Number" onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border" />
          
          <hr className="border-gray-100" />
          
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border" />

          <button type="submit" disabled={loading} className="w-full bg-brandDark text-white py-4 rounded-xl font-bold hover:opacity-90 transition">
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/" className="text-blue-600 font-bold">Login here</Link>
        </p>
      </div>
    </div>
  )
}