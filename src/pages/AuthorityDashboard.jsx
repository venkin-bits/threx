import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Shield, Users, Bell, Activity, Send, LogOut, 
  AlertTriangle, Stethoscope, Video, ChevronRight, 
  ArrowLeft, MapPin, Menu, ChevronLeft, ClipboardList, CheckCircle,
  Search, FileText, UserCircle, Phone, Calendar, Heart
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AuthorityDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('alerts') 
  const [isExpanded, setIsExpanded] = useState(true) 
  
  // Data States
  const [stats, setStats] = useState({ users: 0, sos: 0, pending: 0 })
  const [alerts, setAlerts] = useState([]) 
  const [historyLogs, setHistoryLogs] = useState([]) 
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('')

  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Official Update' })

  // Modal / Selection States
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientHistory, setPatientHistory] = useState([])
  
  const [bookingAction, setBookingAction] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null) 

  useEffect(() => {
    checkAdminAuth()
    fetchData()
    
    // Subscribe to changes so the dashboard updates instantly
    const sub = supabase.channel('admin-dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_logs' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchData)
      .subscribe()
      
    return () => supabase.removeChannel(sub)
  }, [])

  const checkAdminAuth = () => {
    const role = localStorage.getItem('uyir_role')
    if (role !== 'admin') {
        navigate('/admin') 
    }
  }

  const fetchData = async () => {
    // 1. Fetch Counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact' })
    const { count: sosCount } = await supabase.from('sos_logs').select('*', { count: 'exact' })
    
    // 2. Fetch Doctors
    const { data: docData } = await supabase.from('doctors').select('*')
    setDoctors(docData || [])
    
    // 3. Fetch Active SOS Alerts (Status = 'active')
    const { data: sosActive } = await supabase.from('sos_logs')
      .select('*, profiles(full_name, emergency_phone)')
      .eq('status', 'active') 
      .order('created_at', { ascending: false })

    // 4. Fetch RESOLVED SOS Alerts (Status = 'resolved')
    const { data: sosResolved } = await supabase.from('sos_logs')
      .select('*, profiles(full_name, emergency_phone)')
      .eq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(50) 
    
    setHistoryLogs(sosResolved || []) 

    // 5. Fetch Pending Appointments
    const { data: apt } = await supabase.from('appointments')
      .select('*, profiles(full_name), doctors(name)')
      .neq('status', 'confirmed')
      .order('created_at', { ascending: false })
    
    // 6. Combine Active Alerts
    const combinedAlerts = [
      ...(sosActive || []).map(i => ({ ...i, type: 'EMERGENCY', priority: 'critical' })),
      ...(apt || []).filter(a => a.status !== 'rejected').map(i => ({ ...i, type: 'BOOKING', priority: 'medium' }))
    ]
    setAlerts(combinedAlerts)
    setStats({ users: userCount || 0, sos: sosCount || 0, pending: combinedAlerts.length })

    // 7. Fetch Patients
    const { data: allPatients } = await supabase
      .from('profiles')
      .select('*')
      .neq('full_name', null) 
      .order('full_name', { ascending: true })
      
    setPatients(allPatients || [])
  }

  // --- ACTIONS ---

  const handleLogout = () => {
    localStorage.removeItem('uyir_role')
    navigate('/admin') 
  }

  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient)
    // Fetch history for the specific user clicked
    const { data } = await supabase.from('medical_history').select('*').eq('user_id', patient.id).order('date', { ascending: false })
    setPatientHistory(data || [])
  }

  const assignDoctor = async (apptId, docId) => {
    await supabase.from('appointments').update({ doctor_id: docId, status: 'forwarded' }).eq('id', apptId)
    setBookingAction(null)
    setSelectedCategory(null) 
    fetchData()
    alert("Request Forwarded to Doctor")
  }

  const sendMeetingLink = async (apptId) => {
    const roomCode = `uyir-consult-${apptId}-${Math.floor(Math.random() * 1000)}`
    const internalLink = `/telemedicine?room=${roomCode}`
    
    const { error } = await supabase.from('appointments').update({ 
      meeting_link: internalLink, 
      status: 'confirmed' 
    }).eq('id', apptId)

    if (error) alert("Error: " + error.message)
    else {
      setBookingAction(null); 
      fetchData(); 
      alert("Meeting Arranged! Room created.")
    }
  }

  const publishPost = async () => {
    if(!newPost.title || !newPost.content) return alert("Please fill all fields")
    const { error } = await supabase.from('community_posts').insert([newPost])
    if(error) alert(error.message)
    else {
      setNewPost({ title: '', content: '', category: 'Official Update' })
      alert("Posted to Community Feed")
    }
  }

  const resolveSOS = async (id) => {
    if(confirm("Mark emergency as resolved and move to History?")) {
      // Optimistic Update
      setAlerts(current => current.filter(a => a.id !== id))
      
      const { error } = await supabase.from('sos_logs').update({ status: 'resolved' }).eq('id', id)
      
      if (error) {
        alert("Error updating DB")
        fetchData() 
      } else {
        fetchData() 
      }
    }
  }

  // --- SEARCH FILTER ---
  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const doctorCategories = [...new Set(doctors.map(d => d.specialization || "General"))]

  return (
    // FIXED: Main container uses h-screen and overflow-hidden to stop page bounce
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* SIDEBAR - Fixed height, own scrollbar */}
      <div className={`${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-800 border-r border-slate-700 flex flex-col h-full z-20 shrink-0`}>
        <div className="p-6 flex items-center justify-between">
           {isExpanded && (
               <h1 className="text-2xl font-black text-blue-400 flex items-center gap-2 animate-fade-in">
                   <Shield /> ADMIN
               </h1>
           )}
           <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700"
           >
             {isExpanded ? <ChevronLeft size={20} /> : <Menu size={24} />}
           </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
           <SidebarItem icon={Activity} label="System" active={activeTab === 'overview'} expanded={isExpanded} onClick={() => setActiveTab('overview')} />
           <SidebarItem icon={Bell} label="Alerts" count={stats.pending} active={activeTab === 'alerts'} expanded={isExpanded} onClick={() => setActiveTab('alerts')} />
           <SidebarItem icon={ClipboardList} label="History" active={activeTab === 'history'} expanded={isExpanded} onClick={() => setActiveTab('history')} />
           <SidebarItem icon={Users} label="Patients" active={activeTab === 'patients'} expanded={isExpanded} onClick={() => setActiveTab('patients')} />
           <SidebarItem icon={Send} label="Community" active={activeTab === 'community'} expanded={isExpanded} onClick={() => setActiveTab('community')} />
        </nav>
      </div>

      {/* CONTENT - Independent Scroll Area */}
      <div className="flex-1 h-full overflow-y-auto p-8 relative">
        
        <div className="flex justify-end mb-8 sticky top-0 z-10 pointer-events-none">
            <button 
                onClick={handleLogout}
                className="pointer-events-auto flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg font-bold transition shadow-lg shadow-red-900/20"
            >
                <LogOut size={18} /> {isExpanded && "Logout"}
            </button>
        </div>

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-3xl font-bold">System Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Users" value={stats.users} icon={Users} color="bg-blue-600" />
                <StatCard label="Pending Alerts" value={stats.pending} icon={Bell} color="bg-red-600" />
                <StatCard label="Total Emergencies" value={stats.sos} icon={Activity} color="bg-purple-600" />
             </div>
          </div>
        )}

        {/* 2. ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4 animate-fade-in max-w-4xl">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-3xl font-bold">Live Operations Center</h2>
               <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">LIVE</span>
             </div>

             {alerts.length === 0 && <p className="text-slate-500">No active alerts or pending requests.</p>}

             {alerts.map((item, i) => (
               <div key={i} className={`bg-slate-800 rounded-xl border-l-4 p-6 shadow-lg ${item.type === 'EMERGENCY' ? 'border-red-500' : 'border-blue-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.type === 'EMERGENCY' ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'}`}>{item.type}</span>
                           <span className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleTimeString()}</span>
                        </div>
                        <h3 className="text-xl font-bold">{item.profiles?.full_name || 'Unknown User'}</h3>
                     </div>
                     {item.type === 'EMERGENCY' && (
                         <button 
                            onClick={() => resolveSOS(item.id)} 
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-green-900/50"
                         >
                            <CheckCircle size={16}/> Resolve
                         </button>
                     )}
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg mb-4 border border-slate-700/50">
                     {item.type === 'EMERGENCY' ? (
                        <div className="text-red-300">
                            <p className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={18}/> 
                                <b>SOS Signal Received</b>
                            </p>
                            <a 
                                href={`https://www.google.com/maps?q=${item.lat},${item.lng}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                            >
                                <MapPin size={16} /> View Location on Map
                            </a>
                        </div>
                     ) : (
                        <div className="text-sm text-slate-300">
                           <p><b>Request:</b> {item.reason}</p>
                           <p><b>Status:</b> <span className="text-yellow-400 font-bold uppercase">{item.status}</span></p>
                           {item.status === 'forwarded' && <p className="text-blue-400 font-bold mt-1">➡ Forwarded to {item.doctors?.name}</p>}
                        </div>
                     )}
                  </div>

                  {item.type === 'BOOKING' && (
                     <div className="flex gap-3">
                        {(item.status === 'pending' || item.status === 'rejected') && (
                           <button onClick={() => { setBookingAction({ item, type: 'assign_doc' }); setSelectedCategory(null); }} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2">
                              <Stethoscope size={18}/> Assign Doctor
                           </button>
                        )}
                        {item.status === 'approved' && (
                           <button onClick={() => sendMeetingLink(item.id)} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2">
                              <Video size={18}/> Arrange Meeting
                           </button>
                        )}
                     </div>
                  )}
               </div>
             ))}
          </div>
        )}

        {/* 3. HISTORY */}
        {activeTab === 'history' && (
           <div className="space-y-6 animate-fade-in max-w-4xl">
              <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                 <ClipboardList className="text-slate-400"/> Incident History
              </h2>
              {historyLogs.length === 0 ? (
                 <p className="text-slate-500 bg-slate-800 p-6 rounded-xl border border-slate-700">No resolved incidents found.</p>
              ) : (
                 historyLogs.map(log => (
                    <div key={log.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex justify-between items-center opacity-75 hover:opacity-100 transition">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="bg-green-900 text-green-100 text-xs font-bold px-2 py-0.5 rounded uppercase">Resolved</span>
                             <span className="text-slate-500 text-xs">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <h3 className="font-bold text-lg">{log.profiles?.full_name}</h3>
                          <p className="text-slate-400 text-sm">Emergency SOS (Lat: {log.lat}, Lng: {log.lng})</p>
                       </div>
                       <div className="text-right">
                          <span className="text-green-500 font-bold text-sm flex items-center gap-1 justify-end">
                             <CheckCircle size={14} /> Handled
                          </span>
                       </div>
                    </div>
                 ))
              )}
           </div>
        )}

        {/* 4. PATIENTS */}
        {activeTab === 'patients' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Global Patient Database</h2>
                {/* Search Input */}
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search Patient Name..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length === 0 ? (
                  <p className="col-span-3 text-center text-slate-500 py-10">No patients found matching "{searchTerm}"</p>
                ) : (
                  filteredPatients.map(p => (
                     <div key={p.id} onClick={() => handlePatientClick(p)} className="group bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 cursor-pointer transition-all shadow-lg hover:shadow-blue-900/20">
                        <div className="flex items-start gap-4">
                           <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-full text-white font-bold text-lg shadow-lg">
                              {p.full_name?.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{p.full_name}</h3>
                              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                                <Activity size={14} className="text-red-400"/> Blood: <span className="font-bold text-slate-200">{p.blood_group || 'N/A'}</span>
                              </p>
                              <p className="text-slate-500 text-xs mt-2">ID: {p.id.slice(0, 8)}...</p>
                           </div>
                        </div>
                     </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* 5. COMMUNITY */}
        {activeTab === 'community' && (
           <div className="max-w-2xl animate-fade-in space-y-6">
              <h2 className="text-3xl font-bold">Community Manager</h2>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                 <input placeholder="Headline" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
                 <textarea placeholder="Message..." rows="4" className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}></textarea>
                 
                 <select className="w-full bg-slate-900 p-3 rounded-lg border border-slate-600" value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                     <option>Official Update</option>
                     <option>Awareness Message</option>
                     <option>Health Tip</option>
                 </select>

                 <button onClick={publishPost} className="bg-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Send size={18}/> Post</button>
              </div>
           </div>
        )}
      </div>

      {/* --- MODAL: ASSIGN DOCTOR --- */}
      {bookingAction?.type === 'assign_doc' && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-2xl w-[500px] border border-slate-600 animate-fade-in">
               {!selectedCategory ? (
                 <>
                    <h3 className="text-xl font-bold mb-4 text-white">Select Department</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4 max-h-96 overflow-y-auto">
                        {doctorCategories.length > 0 ? doctorCategories.map((cat, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedCategory(cat)}
                            className="bg-slate-700 hover:bg-blue-600 text-white p-4 rounded-xl text-left font-bold transition flex justify-between items-center group"
                          >
                             {cat} <ChevronRight size={16} className="text-slate-400 group-hover:text-white"/>
                          </button>
                        )) : (
                          <p className="text-slate-400 col-span-2">No departments found.</p>
                        )}
                    </div>
                    <button onClick={() => setBookingAction(null)} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold">Cancel</button>
                 </>
               ) : (
                 <>
                    <div className="flex items-center gap-3 mb-4">
                       <button onClick={() => setSelectedCategory(null)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600"><ArrowLeft size={18}/></button>
                       <h3 className="text-xl font-bold text-white">Select {selectedCategory}</h3>
                    </div>

                    <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                        {doctors.filter(d => d.specialization === selectedCategory).map(d => (
                          <button 
                            key={d.id} 
                            onClick={() => assignDoctor(bookingAction.item.id, d.id)} 
                            className="w-full text-left p-4 bg-slate-700 hover:bg-green-600 rounded-xl flex justify-between items-center group transition"
                          >
                             <span className="font-bold text-lg">{d.name}</span>
                             <span className="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded group-hover:bg-green-800 group-hover:text-white">Assign</span>
                          </button>
                        ))}
                        {doctors.filter(d => d.specialization === selectedCategory).length === 0 && (
                          <p className="text-center text-slate-500 py-4">No doctors available in this department.</p>
                        )}
                    </div>
                 </>
               )}
            </div>
         </div>
      )}
      
      {/* MODAL: PATIENT PROFILE (TWO COLUMNS) */}
      {selectedPatient && (
         <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
               
               {/* Header */}
               <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
                  <div className="flex items-center gap-4">
                     <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full text-white">
                        <UserCircle size={32} />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">{selectedPatient.full_name}</h2>
                        <p className="text-slate-400 text-sm">Patient ID: {selectedPatient.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white bg-slate-700 p-2 rounded-full transition">✕</button>
               </div>

               {/* TWO COLUMN BODY */}
               <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     
                     {/* COLUMN 1: PROFILE DETAILS */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2 border-b border-slate-700 pb-2">
                           <FileText size={20}/> Important Details
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <DetailBox label="Age" value={`${selectedPatient.age || 'N/A'} yrs`} icon={Calendar} color="text-yellow-400"/>
                           <DetailBox label="Gender" value={selectedPatient.gender || 'N/A'} icon={UserCircle} color="text-purple-400"/>
                           <DetailBox label="Blood Group" value={selectedPatient.blood_group || 'N/A'} icon={Activity} color="text-red-500"/>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Information</p>
                           <div className="flex items-center gap-3">
                              <div className="bg-green-900/50 p-2 rounded-lg text-green-400"><Phone size={18}/></div>
                              <div>
                                 <p className="text-xs text-slate-400">Personal Phone</p>
                                 <p className="font-bold text-lg">{selectedPatient.phone || 'Not provided'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="bg-red-900/50 p-2 rounded-lg text-red-400"><Heart size={18}/></div>
                              <div>
                                 <p className="text-xs text-slate-400">Emergency Contact</p>
                                 <p className="font-bold text-lg text-red-400">{selectedPatient.emergency_phone || 'Not provided'}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* COLUMN 2: MEDICAL HISTORY */}
                     <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-full">
                        <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-4">
                           <ClipboardList size={20}/> Medical History
                        </h3>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {patientHistory.length === 0 ? (
                               <div className="text-center py-12 text-slate-500 border border-dashed border-slate-600 rounded-xl">
                                  <ClipboardList size={40} className="mx-auto mb-2 opacity-50"/>
                                  <p>No medical records found.</p>
                               </div>
                           ) : (
                               patientHistory.map((h, i) => (
                                  <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
                                     <p className="font-bold text-lg text-slate-200">{h.condition}</p>
                                     <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                       <Calendar size={12}/> Recorded on: {new Date(h.date).toLocaleDateString()}
                                     </p>
                                  </div>
                               ))
                           )}
                        </div>
                     </div>

                  </div>
               </div>

            </div>
         </div>
      )}
    </div>
  )
}

// Helper Components
function DetailBox({ label, value, icon: Icon, color }) {
   return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
         <div className={`p-2 rounded-lg bg-slate-900 ${color}`}><Icon size={20}/></div>
         <div>
            <p className="text-xs text-slate-500 uppercase font-bold">{label}</p>
            <p className="text-lg font-bold text-slate-200">{value}</p>
         </div>
      </div>
   )
}

function SidebarItem({ icon: Icon, label, active, count, expanded, onClick }) {
   return (
      <button 
        onClick={onClick} 
        title={!expanded ? label : ''} 
        className={`w-full flex items-center ${expanded ? 'justify-between px-3' : 'justify-center'} py-3 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
      >
         <div className="flex items-center gap-3">
             <Icon size={20} />
             {expanded && <span className="font-semibold whitespace-nowrap">{label}</span>}
         </div>
         
         {count > 0 && (
             expanded 
               ? <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
               : <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span> 
         )}
      </button>
   )
}

function StatCard({ label, value, icon: Icon, color }) {
   return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
         <div className={`p-4 rounded-full ${color} bg-opacity-20 text-white`}><Icon size={24}/></div>
         <div><p className="text-slate-400 text-sm">{label}</p><p className="text-3xl font-black text-white">{value}</p></div>
      </div>
   )
}