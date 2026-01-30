// 👇 CRITICAL CHANGE: Using HashRouter for Mobile Compatibility
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute' 

// NEW: Import Splash Screen
import SplashScreen from './components/SplashScreen'

// Auth Pages
import Auth from './pages/Auth'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import DoctorLogin from './pages/DoctorLogin'

// Dashboards
import AuthorityDashboard from './pages/AuthorityDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Dashboard from './pages/Dashboard'

// Features
import SOS from './pages/SOS'
import Reminders from './pages/Reminders'
import Telemedicine from './pages/Telemedicine'
import SymptomChecker from './pages/SymptomChecker'
import FirstAid from './pages/FirstAid'
import History from './pages/History'
import WomensHealth from './pages/WomensHealth'
import Appointments from './pages/Appointments'
import Habits from './pages/Habits'
import Community from './pages/Community'
import Profile from './pages/Profile' 

function App() {
  const [lang, setLang] = useState('en') 
  // 1. State to control Splash Screen
  const [showSplash, setShowSplash] = useState(true)

  // 2. If Splash is active, show ONLY the Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <Router>
      <div className="min-h-screen pb-20 bg-slate-50">
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/" element={<Auth />} />
          <Route path="/register" element={<Register />} />

          {/* 2. ADMIN ROUTES */}
          <Route path="/admin" element={<AdminLogin />} /> 
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AuthorityDashboard />
            </AdminRoute>
          } />

          {/* 3. DOCTOR ROUTES */}
          <Route path="/doctor" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

          {/* 4. PATIENT ROUTES */}
          <Route element={<ProtectedRoute />}>
             
             {/* Note: Navbar and padding wrapper applied manually to each page below */}
             
             <Route path="/dashboard" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Dashboard /></div></>} />
             <Route path="/sos" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><SOS /></div></>} />
             <Route path="/reminders" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Reminders /></div></>} />
             <Route path="/telemedicine" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Telemedicine /></div></>} />
             <Route path="/symptoms" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><SymptomChecker /></div></>} />
             <Route path="/firstaid" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><FirstAid /></div></>} />
             <Route path="/history" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><History /></div></>} />
             <Route path="/women" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><WomensHealth /></div></>} />
             <Route path="/appointments" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Appointments /></div></>} />
             <Route path="/habits" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Habits /></div></>} />
             <Route path="/community" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Community /></div></>} />
             <Route path="/profile" element={<><Navbar lang={lang} setLang={setLang}/><div className="pt-20 px-4"><Profile /></div></>} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App