import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { setLoading(false); return }

    authAPI.me()
      .then(res => {
        const user = res.data?.data?.user
                  || res.data?.data
                  || res.data?.user
        if (user) setAdmin(user)
        else localStorage.removeItem('adminToken')
      })
      .catch(() => localStorage.removeItem('adminToken'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (mobileNo, password) => {
    const res = await authAPI.login({ mobileNo, password })

    // Response: { data: { user: {...}, tokens: { accessToken, refreshToken } } }
    const d      = res.data?.data || res.data
    const tokens = d?.tokens

    const token =
      tokens?.accessToken ||
      tokens?.token       ||
      tokens?.authToken   ||
      tokens?.jwt         ||
      d?.token            ||
      d?.accessToken      ||
      d?.authtoken        ||
      d?.jwt

    const adminData = d?.user || d?.admin || d

    if (!token) throw new Error('Token not found in login response')

    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminUser', JSON.stringify(adminData))
    setAdmin(adminData)
    return adminData
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)