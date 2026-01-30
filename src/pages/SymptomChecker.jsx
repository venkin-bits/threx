import { useState } from 'react'
import { Thermometer, Eye, Activity, User, HeartPulse, AlertTriangle } from 'lucide-react'

export default function SymptomChecker() {
  const [part, setPart] = useState(null)

  // Expanded Database of Symptoms & Advice
  const advice = {
    Head: {
      text: "Possible: Migraine, Tension. Advice: Drink water, rest in a dark room. Avoid screens.",
      color: "bg-purple-100 text-purple-800",
      urgent: false
    },
    Stomach: {
      text: "Possible: Indigestion, Gastritis. Advice: Avoid spicy food, take antacids, drink ginger tea.",
      color: "bg-orange-100 text-orange-800",
      urgent: false
    },
    Chest: {
      text: "⚠️ WARNING: If pain feels heavy or radiates to the left arm, call SOS immediately.",
      color: "bg-red-100 text-red-800",
      urgent: true
    },
    Legs: {
      text: "Possible: Cramp, Fatigue. Advice: Gentle stretching, hydration, and magnesium intake.",
      color: "bg-blue-100 text-blue-800",
      urgent: false
    },
    Eyes: {
      text: "Possible: Strain, Dryness. Advice: Use eye drops, take breaks from screens (20-20-20 rule).",
      color: "bg-teal-100 text-teal-800",
      urgent: false
    },
    Throat: {
      text: "Possible: Infection, Viral. Advice: Salt water gargle, honey & warm water.",
      color: "bg-pink-100 text-pink-800",
      urgent: false
    },
    Back: {
      text: "Possible: Posture issue, Muscle strain. Advice: Apply heat pack, avoid heavy lifting.",
      color: "bg-amber-100 text-amber-800",
      urgent: false
    },
    Fever: {
      text: "Possible: Viral infection. Advice: Monitor temp, stay hydrated, take Paracetamol if > 100°F.",
      color: "bg-red-50 text-red-900",
      urgent: false
    }
  }

  // Icons for visual appeal
  const getIcon = (p) => {
    if (p === 'Fever') return <Thermometer />
    if (p === 'Eyes') return <Eye />
    if (p === 'Chest') return <HeartPulse />
    return <Activity />
  }

  return (
    <div className="p-4 animate-fade-in max-w-xl mx-auto pb-24">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Symptom Navigator</h1>
        <p className="text-slate-500 text-sm">Tap on a body part or condition to get instant home remedies.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(advice).map(p => (
          <button 
            key={p} 
            onClick={() => setPart(p)} 
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${
              part === p 
                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' 
                : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
            }`}
          >
            <div className={`p-2 rounded-full ${part === p ? 'bg-blue-200' : 'bg-slate-100'}`}>
               {getIcon(p)}
            </div>
            <span className="font-bold">{p}</span>
          </button>
        ))}
      </div>

      {part && (
        <div className={`p-6 rounded-2xl border ${advice[part].color} animate-fade-in shadow-lg transition-all`}>
          <div className="flex items-start gap-3">
             {advice[part].urgent ? <AlertTriangle className="shrink-0 animate-pulse"/> : <User className="shrink-0"/>}
             <div>
                <h3 className="font-bold text-lg mb-2">Advice for {part}:</h3>
                <p className="font-medium leading-relaxed">{advice[part].text}</p>
                {advice[part].urgent && (
                   <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-bold w-full shadow-lg animate-pulse">
                     Call Emergency Now
                   </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  )
}