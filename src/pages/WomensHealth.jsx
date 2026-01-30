import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Calendar, Save } from 'lucide-react'

export default function WomensHealth() {
  const [lastPeriod, setLastPeriod] = useState('')
  const [daysLeft, setDaysLeft] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCycleData()
  }, [])

  // 1. Fetch saved date from Supabase
  const fetchCycleData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('last_period').eq('id', user.id).single()
      if (data?.last_period) {
        setLastPeriod(data.last_period)
        calculateDays(data.last_period)
      }
    }
    setLoading(false)
  }

  // 2. Logic to calculate countdown
  const calculateDays = (dateStr) => {
    if (!dateStr) return
    const lastDate = new Date(dateStr)
    const cycleLength = 28 // Standard cycle
    
    // Next Period = Last Period + 28 Days
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + cycleLength)
    
    // Difference = Next Period - Today
    const today = new Date()
    const diffTime = nextDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setDaysLeft(diffDays)
  }

  // 3. Save to Supabase
  const saveDate = async () => {
    if (!lastPeriod) return alert("Please select a date")
    
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({ last_period: lastPeriod }).eq('id', user.id)
    
    if (error) alert("Error saving: " + error.message)
    else {
      calculateDays(lastPeriod)
      alert("Cycle updated!")
    }
  }

  return (
    <div className="p-4 bg-pink-50 min-h-[80vh] animate-fade-in">
      <h1 className="text-2xl font-bold text-pink-700 mb-6 flex items-center gap-2">
        <Activity className="text-pink-600" /> Cycle Tracker
      </h1>
      
      {/* 4. The Countdown Circle */}
      <div className="bg-white p-8 rounded-full h-64 w-64 mx-auto flex flex-col items-center justify-center shadow-xl border-4 border-pink-200 mb-8 relative">
        {daysLeft !== null ? (
           <>
             <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Next Period In</p>
             <h2 className="text-7xl font-black text-pink-500 my-2">{daysLeft > 0 ? daysLeft : 0}</h2>
             <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">{daysLeft === 1 ? 'DAY' : 'DAYS'}</p>
             {daysLeft < 0 && <span className="absolute bottom-10 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Late by {Math.abs(daysLeft)} days</span>}
           </>
        ) : (
           <p className="text-gray-400 text-center px-4 font-bold">Enter your last date below to start tracking</p>
        )}
      </div>

      {/* 5. Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 mb-6">
        <label className="text-xs font-bold text-pink-400 uppercase mb-2 block">When did your last period start?</label>
        <div className="flex gap-3">
          <input 
            type="date" 
            value={lastPeriod} 
            onChange={(e) => setLastPeriod(e.target.value)} 
            className="w-full p-3 bg-pink-50 rounded-xl border-none outline-none font-bold text-pink-800"
          />
          <button onClick={saveDate} className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition shadow-lg shadow-pink-200">
            <Save size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
        <h3 className="font-bold text-pink-800 mb-2">🌸 Daily Tip</h3>
        <p className="text-gray-600 text-sm">
          {daysLeft < 5 
             ? "Your cycle is approaching. Try reducing salt intake to minimize bloating." 
             : "You are in your most energetic phase! Great time for a workout."}
        </p>
      </div>
    </div>
  )
}