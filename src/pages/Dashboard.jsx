import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { AlertTriangle, Video, Pill, Activity, Heart, Calendar, Book, Users, Thermometer, CheckCircle } from 'lucide-react'
// 1. Import the hook
import { useLanguage } from '../context/LanguageContext'

export default function Dashboard() {
  const [gender, setGender] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 2. Get the translation object 't'
  const { t } = useLanguage()

  useEffect(() => {
    const fetchGender = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
        setGender(data?.gender || 'Male')
      }
      setLoading(false)
    }
    fetchGender()
  }, [])

  // 3. Update menu names to use 't.keyname'
  const menu = [
    { name: t.medicines, link: "/reminders", icon: Pill, color: "bg-blue-100 text-blue-600" },
    { name: t.doctors, link: "/telemedicine", icon: Video, color: "bg-green-100 text-green-600" },
    { name: t.symptoms, link: "/symptoms", icon: Thermometer, color: "bg-orange-100 text-orange-600" },
    { name: t.first_aid, link: "/firstaid", icon: Heart, color: "bg-red-100 text-red-600" },
    { name: t.history, link: "/history", icon: Book, color: "bg-purple-100 text-purple-600" },
    
    { name: t.women, link: "/women", icon: Activity, color: "bg-pink-100 text-pink-600" },
    
    { name: t.booking, link: "/appointments", icon: Calendar, color: "bg-indigo-100 text-indigo-600" },
    { name: t.habits, link: "/habits", icon: CheckCircle, color: "bg-yellow-100 text-yellow-600" },
    { name: t.community, link: "/community", icon: Users, color: "bg-teal-100 text-teal-600" },
  ]

  const visibleMenu = menu.filter(item => item.name !== t.women || gender === 'Female')
  
  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-10">
      
      {/* SOS Card */}
      <Link to="/sos" className="block bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-3xl shadow-xl shadow-red-500/20 text-white flex justify-between items-center transform transition hover:scale-[1.02]">
        <div>
          {/* 4. Use translations here too */}
          <h2 className="text-3xl font-black">{t.sos_title}</h2>
          <p className="text-red-100">{t.sos_desc}</p>
        </div>
        <AlertTriangle size={40} className="animate-pulse"/>
      </Link>

      {/* Grid Menu */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
           <p className="col-span-3 text-center text-slate-400 py-10">{t.loading}</p>
        ) : (
           visibleMenu.map((m, i) => (
             <Link key={i} to={m.link} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md transition-all">
               <div className={`p-3 rounded-full ${m.color}`}>
                 <m.icon size={24} />
               </div>
               <span className="text-xs font-bold text-gray-600 text-center leading-tight">{m.name}</span>
             </Link>
           ))
        )}
      </div>
    </div>
  )
}