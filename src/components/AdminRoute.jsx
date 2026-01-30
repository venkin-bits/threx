import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('uyir_role') === 'admin'
  
  // If not admin, kick them back to the ADMIN LOGIN page, not the user login
  return isAdmin ? children : <Navigate to="/admin" replace />
}