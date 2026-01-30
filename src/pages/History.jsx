import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function History() {
  const [records, setRecords] = useState([])
  const [condition, setCondition] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('medical_history').select('*').eq('user_id', user.id)
      setRecords(data || [])
    }
    fetch()
  }, [])

  const add = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('medical_history').insert([{ user_id: user.id, condition, date: new Date() }])
    setCondition('')
    window.location.reload()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Medical Passport</h1>
      <div className="flex gap-2 mb-6">
        <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="Condition (e.g. Diabetes)" className="flex-1 p-3 border rounded-xl"/>
        <button onClick={add} className="bg-brand text-white px-6 rounded-xl">Add</button>
      </div>
      <div className="space-y-2">
        {records.map(r => (
          <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="font-bold">{r.condition}</p>
            <p className="text-xs text-gray-400">{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}