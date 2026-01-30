import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { Video, ShieldCheck, Lock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

// 👇 UPDATED: Keys are now pulled from .env file for security
// Note: We wrap APP_ID in Number() because .env values are always strings by default
const APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID); 
const SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET; 

export default function Telemedicine() {
  const [searchParams] = useSearchParams()
  const roomID = searchParams.get('room')
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPermission()
  }, [roomID])

  const checkPermission = async () => {
    if (!roomID) {
        alert("Invalid Meeting Link")
        navigate('/dashboard')
        return
    }

    // 1. Extract Appointment ID from Room Code (Format: uyir-consult-{id}-{random})
    // We split by '-' and get the 3rd part (index 2)
    const parts = roomID.split('-')
    const apptId = parts[2] 

    if (!apptId) {
        navigate('/dashboard')
        return
    }

    // 2. Identify Who is Trying to Enter
    const { data: { user } } = await supabase.auth.getUser()
    const docEmail = localStorage.getItem('uyir_doc_email') 
    const role = localStorage.getItem('uyir_role')

    // 3. Check Database: Is this person linked to this Appointment?
    const { data: appointment } = await supabase
        .from('appointments')
        .select('*, doctors(email)')
        .eq('id', apptId)
        .single()

    if (!appointment) {
        alert("Appointment not found.")
        navigate('/dashboard')
        return
    }

    let isAllowed = false
    let userName = "Guest"

    // CHECK IF PATIENT
    if (role === 'user' && user && appointment.user_id === user.id) {
        isAllowed = true
        // Get real name
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        userName = profile?.full_name || "Patient"
    } 
    // CHECK IF DOCTOR
    else if (role === 'doctor' && appointment.doctors?.email === docEmail) {
        isAllowed = true
        userName = "Dr. " + (localStorage.getItem('uyir_doc_name') || "Consultant")
    }

    if (isAllowed) {
        setAuthorized(true)
        startMeeting(userName, user?.id || 'doc_'+docEmail)
    } else {
        alert("⛔ ACCESS DENIED: You are not authorized for this private consultation.")
        navigate('/dashboard')
    }
    setLoading(false)
  }

  const startMeeting = (userName, userId) => {
      // Ensure we have valid credentials before starting
      if (!APP_ID || !SERVER_SECRET) {
        console.error("Missing ZegoCloud Credentials in .env file");
        alert("System Error: Video Service Config Missing");
        return;
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID, 
        SERVER_SECRET, 
        roomID, 
        userId, 
        userName
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)

      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONOneCall },
        showScreenSharingButton: false, // Privacy: Disable screen share by default
        showPreJoinView: false, 
      })
  }

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Verifying Identity...</div>

  return (
    <div className="flex flex-col h-[85vh] animate-fade-in">
      {/* Secure Header */}
      <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-teal-800 flex items-center gap-2">
             <Video size={24} className="text-teal-500"/> Tele-Consultation
           </h1>
           <p className="text-slate-500 text-xs font-mono mt-1">ID: {roomID}</p>
        </div>
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full text-xs font-bold border border-green-200">
           <Lock size={14}/> Secure & Encrypted
        </div>
      </div>
      
      {/* Video Container */}
      <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-slate-800">
         <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}