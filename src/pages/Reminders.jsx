import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Trash2, Clock, Smartphone, AlertCircle } from 'lucide-react'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [newMed, setNewMed] = useState({ medicine_name: '', time: '', dosage: '' })
  const [permission, setPermission] = useState('prompt')

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeNotifications()
    }
    fetchReminders()
  }, [])

  // 1. Setup High Priority Channel (Crucial for sound when app is closed)
  const initializeNotifications = async () => {
    const perm = await LocalNotifications.requestPermissions()
    setPermission(perm.display)

    if (perm.display === 'granted') {
      await LocalNotifications.createChannel({
        id: 'uyir_meds_channel',
        name: 'Medicine Alerts',
        description: 'High priority alerts for medicine',
        importance: 5, // 5 = Max Importance (Heads Up + Sound)
        visibility: 1, // Public on lockscreen
        sound: 'beep.wav',
        vibration: true,
      })
    }
  }

  const fetchReminders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('time')
      setReminders(data || [])
      
      // Sync with native device
      if (Capacitor.isNativePlatform()) {
        syncNativeNotifications(data || [])
      }
    }
  }

  const syncNativeNotifications = async (currentReminders) => {
    // 1. Cancel existing to prevent duplicates
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending)
    }

    // 2. Create new schedules
    const newSchedules = currentReminders.map(rem => {
        const [hour, minute] = rem.time.split(':').map(Number)
        // Create a unique integer ID from the string ID
        const uniqueId = Math.abs(rem.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0))

        return {
            id: uniqueId,
            title: "💊 Medicine Time!",
            body: `Time to take ${rem.medicine_name} (${rem.dosage})`,
            // CRITICAL: Matches the channel created above
            channelId: 'uyir_meds_channel', 
            schedule: { 
              on: { hour, minute }, 
              allowWhileIdle: true, // CRITICAL: Fires even in battery saver mode
              every: 'day'          // Repeats daily
            },
        }
    })

    if (newSchedules.length > 0) {
      await LocalNotifications.schedule({ notifications: newSchedules })
    }
  }

  const addReminder = async () => {
    if (!newMed.medicine_name || !newMed.time) return alert("Please fill details")
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reminders').insert([{ ...newMed, user_id: user.id }])
    setNewMed({ medicine_name: '', time: '', dosage: '' })
    fetchReminders() // Triggers sync
    alert("Reminder Set! You will be notified daily.")
  }

  const deleteReminder = async (id) => {
    await supabase.from('reminders').delete().eq('id', id)
    fetchReminders() // Triggers sync
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-slate-800">Medicine Reminders</h2>
      </div>

      {Capacitor.isNativePlatform() && permission !== 'granted' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 flex items-center gap-2 border border-red-100">
           <AlertCircle />
           <p className="text-sm font-bold">Please allow notifications to receive alerts.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8">
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus className="text-blue-600"/> Add New</h3>
         <div className="space-y-3">
            <input placeholder="Medicine Name" className="w-full p-3 bg-slate-50 rounded-xl border" value={newMed.medicine_name} onChange={e => setNewMed({...newMed, medicine_name: e.target.value})} />
            <div className="flex gap-3">
                 <input type="time" className="flex-1 p-3 bg-slate-50 rounded-xl border" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} />
                 <input placeholder="Dosage" className="flex-1 p-3 bg-slate-50 rounded-xl border" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
            </div>
            <button onClick={addReminder} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Set Daily Reminder</button>
         </div>
      </div>

      <div className="space-y-3">
         {reminders.map(item => (
            <div key={item.id} className="p-4 rounded-2xl border bg-white border-slate-100 shadow-sm flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg text-slate-800">{item.medicine_name}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-blue-600"/> <span className="font-mono font-bold">{item.time}</span> <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">Daily</span>
                  </p>
               </div>
               <button onClick={() => deleteReminder(item.id)} className="text-slate-300 hover:text-red-500 bg-slate-50 p-3 rounded-full"><Trash2 size={18} /></button>
            </div>
         ))}
      </div>
    </div>
  )
}