import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ShieldAlert, CheckCircle, Loader } from 'lucide-react'

export default function SOS() {
  const [status, setStatus] = useState('idle') 

  const handleSOS = async () => {
    setStatus('locating')
    
    if (!navigator.geolocation) {
      alert("GPS Error: Not supported on this device.")
      setStatus('idle')
      return
    }

    // SPEED OPTIMIZED OPTIONS
    const options = {
      enableHighAccuracy: true, 
      timeout: 5000,            // MAX WAIT: 5 Seconds
      maximumAge: 10000         // ACCEPT CACHE: Up to 10 seconds old (Instant)
    }

    const sendData = async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if(user) {
                // 1. Log to Admin Dashboard (Instant DB Write)
                await supabase.from('sos_logs').insert([
                  { user_id: user.id, lat: latitude, lng: longitude, status: 'active' }
                ])

                // 2. Fetch Emergency Contact
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('emergency_phone')
                  .eq('id', user.id)
                  .single()

                const emergencyNumber = profile?.emergency_phone || "919999999999" 

                // 3. Construct Link
                const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`
                
                // 4. Send Message
                const message = `🚨 *SOS* - I need help!\n📍 Location: ${mapLink}\n(Acc: ${Math.round(accuracy)}m)`
                window.open(`https://wa.me/${emergencyNumber}?text=${encodeURIComponent(message)}`, '_blank')
                
                setStatus('sent')
            }
        } catch (err) {
            console.error(err)
            alert("Sent to WhatsApp (DB Error)")
            setStatus('sent')
        }
    }

    const onError = (error) => {
        console.warn("GPS timeout/error, forcing low-accuracy send...");
        // RETRY: Force a low-accuracy read if high-accuracy fails/times out
        navigator.geolocation.getCurrentPosition(
            sendData, 
            () => { alert("Could not get location. Check permissions."); setStatus('idle'); },
            { enableHighAccuracy: false, timeout: 5000 }
        )
    }

    // EXECUTE IMMEDIATELY
    navigator.geolocation.getCurrentPosition(sendData, onError, options)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in p-6">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 mb-2">Emergency SOS</h1>
        <p className="text-slate-500">Tap for Immediate Help</p>
      </div>

      {status === 'sent' ? (
        <div className="text-center animate-fade-in">
           <div className="bg-green-100 p-6 rounded-full inline-block mb-4">
             <CheckCircle size={64} className="text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">Alert Sent!</h2>
           <button onClick={() => setStatus('idle')} className="mt-6 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">Reset</button>
        </div>
      ) : (
          <div className="relative group cursor-pointer" onClick={status === 'locating' ? null : handleSOS}>
            <div className={`absolute inset-0 bg-red-500 rounded-full opacity-20 ${status === 'locating' ? 'animate-ping' : ''}`}></div>
            <div className="relative w-64 h-64 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-red-400 active:scale-95 transition-transform">
              {status === 'locating' ? (
                 <>
                   <Loader size={64} className="text-white mb-2 animate-spin" />
                   <span className="text-xl font-black text-white tracking-widest">SENDING...</span>
                 </>
              ) : (
                 <>
                   <ShieldAlert size={64} className="text-white mb-2" />
                   <span className="text-3xl font-black text-white tracking-widest">HELP</span>
                 </>
              )}
            </div>
          </div>
      )}
    </div>
  )
}