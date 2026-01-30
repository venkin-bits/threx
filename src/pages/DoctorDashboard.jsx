import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, User, LogOut, Video } from 'lucide-react'

export default function DoctorDashboard() {
  const [requests, setRequests] = useState([])
  const [doctorName, setDoctorName] = useState('')
  const docEmail = localStorage.getItem('uyir_doc_email') 

  useEffect(() => {
    fetchRequests()
    const sub = supabase.channel('doc-dash').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchRequests).subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  const fetchRequests = async () => {
    const { data: doc } = await supabase.from('doctors').select('id, name').eq('email', docEmail).single()
    if(!doc) return 
    setDoctorName(doc.name)
    const { data: rawData } = await supabase.from('appointments').select('*').eq('doctor_id', doc.id).neq('status', 'rejected') 
    setRequests(rawData || [])
  }

  const handleDecision = async (id, decision) => {
    const newStatus = decision === 'approve' ? 'approved' : 'rejected'
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    fetchRequests()
  }

  return (
    // 1. FIXED LAYOUT: h-screen overflow-hidden
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 font-sans">
      
      {/* HEADER (Fixed Top) */}
      <header className="shrink-0 bg-white p-6 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-3xl font-black text-teal-800 tracking-tight">Doctor Portal</h1>
          <p className="text-slate-500 font-medium">Logged in as: <span className="text-teal-600 font-bold">{doctorName || docEmail}</span></p>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href='/doctor'; }} className="text-red-500 font-bold border border-red-100 bg-red-50 px-5 py-3 rounded-xl hover:bg-red-100 transition">
          <LogOut size={18}/> Logout
        </button>
      </header>

      {/* CONTENT (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto grid gap-4">
          {requests.length === 0 && <p className="text-center text-slate-400 py-10">No pending appointments.</p>}
          
          {requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <User size={20} className="text-teal-500"/> Patient Request #{req.id}
                </h3>
                <p className="mt-1 text-slate-500">Condition: <strong>{req.reason}</strong></p>
                <span className={`text-xs uppercase font-bold px-2 py-1 rounded mt-2 inline-block ${req.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span>
              </div>

              <div className="flex gap-3">
                {req.status === 'confirmed' && req.meeting_link ? (
                   <Link to={req.meeting_link} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200 animate-pulse">
                     <Video size={18}/> Join Call
                   </Link>
                ) : (
                   req.status !== 'approved' && (
                     <>
                       <button onClick={() => handleDecision(req.id, 'reject')} className="px-5 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 flex items-center gap-2"><XCircle size={18}/> Reject</button>
                       <button onClick={() => handleDecision(req.id, 'approve')} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2"><CheckCircle size={18}/> Accept</button>
                     </>
                   )
                )}
                {req.status === 'approved' && (
                    <span className="text-teal-600 font-bold flex items-center gap-2">✔ Accepted. Waiting for Admin Link.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}