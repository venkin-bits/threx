import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Save, Edit2, Phone, Heart, Calendar, Activity, Mail, Smartphone } from 'lucide-react'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    blood_group: '',
    phone: '',             // <--- New Personal Phone State
    emergency_phone: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            age: data.age || '',
            gender: data.gender || 'Male',
            blood_group: data.blood_group || '',
            phone: data.phone || '', // <--- Fetch Personal Phone
            emergency_phone: data.emergency_phone || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error
      
      setEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      alert("Error updating profile: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.full_name) return <div className="p-10 text-center text-slate-400">Loading Profile...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 animate-fade-in">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-4">
            <User size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black">{formData.full_name || 'User'}</h1>
          <p className="text-blue-200 flex items-center gap-2 mt-1">
            <Mail size={14} /> {email}
          </p>
        </div>
      </div>

      {/* Details Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">Personal Details</h2>
          <button 
            onClick={() => editing ? handleUpdate() : setEditing(true)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              editing 
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {editing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>

        <div className="p-6 grid gap-6">
          {/* Full Name */}
          <div className="relative">
             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
             <div className="flex items-center gap-3">
               <User className="text-slate-400" size={20} />
               {editing ? (
                 <input 
                   className="w-full font-bold text-slate-700 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                   value={formData.full_name}
                   onChange={e => setFormData({...formData, full_name: e.target.value})}
                 />
               ) : (
                 <p className="font-bold text-slate-700 text-lg">{formData.full_name}</p>
               )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Age & Gender sections remain the same... */}
            <div>
               <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Age</label>
               <div className="flex items-center gap-3">
                 <Calendar className="text-slate-400" size={20} />
                 {editing ? (
                   <input type="number" className="w-full font-bold text-slate-700 border-b-2 border-slate-200 outline-none py-1 bg-transparent"
                     value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                 ) : <p className="font-bold text-slate-700 text-lg">{formData.age} yrs</p>}
               </div>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Gender</label>
               <div className="flex items-center gap-3">
                 <Activity className="text-slate-400" size={20} />
                 {editing ? (
                   <select className="w-full font-bold text-slate-700 border-b-2 border-slate-200 outline-none py-1 bg-transparent"
                     value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                     <option>Male</option><option>Female</option><option>Other</option>
                   </select>
                 ) : <p className="font-bold text-slate-700 text-lg">{formData.gender}</p>}
               </div>
            </div>
          </div>

          {/* Blood Group */}
          <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Blood Group</label>
             <div className="flex items-center gap-3">
               <Heart className="text-red-400" size={20} />
               {editing ? (
                 <input className="w-full font-bold text-slate-700 border-b-2 border-slate-200 outline-none py-1 bg-transparent"
                   value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} />
               ) : <p className="font-bold text-slate-700 text-lg">{formData.blood_group}</p>}
             </div>
          </div>

          {/* NEW: PERSONAL PHONE */}
          <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">My Mobile Number</label>
             <div className="flex items-center gap-3">
               <Smartphone className="text-blue-400" size={20} />
               {editing ? (
                 <input 
                   className="w-full font-bold text-slate-700 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-1 bg-transparent"
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   placeholder="+91..."
                 />
               ) : (
                 <p className="font-bold text-slate-700 text-lg">{formData.phone || 'Not Set'}</p>
               )}
             </div>
          </div>

          {/* Emergency Phone (Highlighted Red) */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
             <label className="text-xs font-bold text-red-400 uppercase mb-1 block">Emergency Contact (SOS)</label>
             <div className="flex items-center gap-3">
               <Phone className="text-red-500" size={20} />
               {editing ? (
                 <input 
                   className="w-full font-bold text-red-700 border-b-2 border-red-200 focus:border-red-500 outline-none py-1 bg-transparent"
                   value={formData.emergency_phone}
                   onChange={e => setFormData({...formData, emergency_phone: e.target.value})}
                 />
               ) : (
                 <p className="font-black text-red-600 text-lg tracking-wider">{formData.emergency_phone}</p>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}