import { useState } from 'react'

export default function Habits() {
  const [habits, setHabits] = useState([
    { name: "Drink 3L Water", done: false },
    { name: "No Sugar", done: false },
    { name: "30 Mins Walk", done: false }
  ])

  const toggle = (index) => {
    const newHabits = [...habits]
    newHabits[index].done = !newHabits[index].done
    setHabits(newHabits)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Daily Habits</h1>
      <div className="space-y-3">
        {habits.map((h, i) => (
          <div key={i} onClick={() => toggle(i)} className={`p-4 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${h.done ? 'bg-green-500 text-white' : 'bg-white text-gray-600'}`}>
            <span className="font-bold">{h.name}</span>
            <span>{h.done ? '✓' : '○'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}