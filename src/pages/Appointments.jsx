import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom' 
import { CheckCircle, Clock, XCircle, Video, User } from 'lucide-react'

export default function Appointments() {
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [myAppointments, setMyAppointments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAppointments()
    const sub = supabase.channel('patient-bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAppointments).subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if(user) {
      const { data } = await supabase.from('appointments').select('*, doctors(name)').eq('user_id', user.id).order('created_at', { ascending: false })
      setMyAppointments(data || [])
    }
  }

  const requestBooking = async () => {
    if(!date || !reason) return alert("Please fill details")
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('appointments').insert([{ user_id: user.id, date, reason, status: 'pending' }])
    if (error) alert("Error: " + error.message)
    else { setDate(''); setReason(''); fetchAppointments() }
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">My Appointments</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
          <h2 className="text-lg font-bold text-indigo-900 mb-4">Book New Consultation</h2>
          <div className="space-y-4">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"/>
            <input placeholder="Reason (e.g. Fever)" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"/>
            <button onClick={requestBooking} disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              {loading ? 'Sending...' : 'Send Request to Admin'}
            </button>
          </div>
      </div>

      <div className="space-y-4">
        {myAppointments.map(apt => (
          <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-2">
                <div><span className="text-xs font-bold text-slate-400">ID: #{apt.id}</span><p className="font-bold text-lg text-slate-800">{new Date(apt.date).toLocaleDateString()}</p></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{apt.status}</span>
             </div>
             <p className="text-slate-600 text-sm mb-3 bg-slate-50 p-2 rounded-lg inline-block">Reason: {apt.reason}</p>

             <div className="pt-3 border-t border-slate-50 mt-2">
                {apt.status === 'pending' && <p className="text-xs text-yellow-600 font-bold">Waiting for Admin...</p>}
                {apt.status === 'forwarded' && <p className="text-blue-600 text-sm">Assigned to Dr. {apt.doctors?.name}. Waiting approval.</p>}
                
                {/* THE JOIN LINK */}
                {apt.status === 'confirmed' && apt.meeting_link && (
                   <Link to={apt.meeting_link} className="block w-full bg-green-500 text-white text-center py-3 rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-green-200 shadow-lg animate-pulse">
                     <Video size={18}/> Join Video Consultation
                   </Link>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}