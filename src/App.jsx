import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout            from './components/Layout'
import Login             from './pages/Login'
import Dashboard         from './pages/Dashboard'
import Users             from './pages/Users'
import Approvals         from './pages/Approvals'
import Cleaners          from './pages/Cleaners'
import Franchises        from './pages/Franchises'
import CreateUser        from './pages/CreateUser'
import Supervisors       from './pages/Supervisors'
import Subscriptions     from './pages/Subscriptions'
import NCSPPartners      from './pages/NCSP' // Yaha change kiya hai (NCSP ko NCSPPartners kar diya)

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'var(--bg)', color:'var(--text2)', fontSize:13 }}>
      Loading...
    </div>
  )
  return admin ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return null
  return admin ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route for Login */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="users"        element={<Users />} />
          <Route path="approvals"    element={<Approvals />} />
          <Route path="cleaners"     element={<Cleaners />} />
          <Route path="franchises"   element={<Franchises />} />
          <Route path="supervisors"  element={<Supervisors />} />
          <Route path="create-user"  element={<CreateUser />} />
          <Route path="ncsp-partners" element={<NCSPPartners defaultTab="all" />} />
          <Route path="ncsp-partners/add" element={<NCSPPartners defaultTab="add" />} />
          <Route path="ncsp-partners/approvals" element={<NCSPPartners defaultTab="approvals" />} />
          <Route path="ncsp-partners/performance" element={<NCSPPartners defaultTab="performance" />} />
          <Route path="ncsp-partners/settlement" element={<NCSPPartners defaultTab="settlement" />} />
          <Route path="subscriptions" element={<Subscriptions />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}