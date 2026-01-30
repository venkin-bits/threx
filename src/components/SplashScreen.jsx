import { useEffect, useState } from 'react'
import { HeartPulse } from 'lucide-react'

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false)
  const [progress, setProgress] = useState(0) // Control loading bar width

  useEffect(() => {
    // 1. Start loading bar animation immediately
    setTimeout(() => setProgress(100), 100)

    // 2. Wait 2.5 seconds, then start fading out the screen
    const timer = setTimeout(() => {
      setFade(true)
    }, 2500)

    // 3. Wait 3 seconds total, then unmount (Show App)
    const finishTimer = setTimeout(() => {
      onFinish()
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(finishTimer)
    }
  }, [onFinish])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Logo Animation */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl mb-6 animate-bounce">
        <HeartPulse size={64} className="text-blue-600" />
      </div>

      {/* Text Animation */}
      <h1 className="text-4xl font-black text-white tracking-widest animate-pulse">UYIR</h1>
      <p className="text-blue-200 mt-2 font-bold tracking-wide text-sm">HEALTH COMPANION</p>

      {/* Loading Bar (Fixed Animation) */}
      <div className="w-48 h-1 bg-blue-900/30 rounded-full mt-8 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-[2500ms] ease-out rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
    </div>
  )
}