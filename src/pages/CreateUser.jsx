import { useState } from 'react'
import { adminAPI } from '../services/api'

const ROLES = [
  { value:'SU', label:'Supervisor' },
  { value:'OT', label:'Operations Team' },
  { value:'IT', label:'IT Admin' },
]

export default function CreateUser() {
  const [form, setForm] = useState({
    name:     '',
    mobileNo: '',
    email:    '',
    password: '',
    role:     'SU',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setLoading(true)
    try {
      const res = await adminAPI.createUser(form)
      setSuccess(res.data?.data?.user || res.data?.data)
      setForm({ name:'', mobileNo:'', email:'', password:'', role:'SU' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:600, marginBottom:3 }}>Create Internal User</h1>
        <p style={{ color:'var(--text2)', fontSize:13 }}>
          Create Supervisor, Operations Team, or IT Admin accounts
        </p>
      </div>

      <div style={{ maxWidth:520 }}>

        {/* Success */}
        {success && (
         <div style={{ background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.25)',
         borderRadius:'var(--radius)', padding:'14px 18px', marginBottom:20 }}>
         <div style={{ fontSize:13, fontWeight:600, color:'#4ade80', marginBottom:10 }}>
         ✓ User created successfully!
         </div>
         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
         {[
         ['Name',       success.name],
         ['Mobile',     success.mobileNo],
         ['Role',       success.role],
         ['Partner ID', success.partnerId],
         ['Status',     success.status],
         ].filter(([,v]) => v).map(([label, val]) => (
          <div key={label} style={{ background:'rgba(74,222,128,.08)',
            borderRadius:'var(--radius)', padding:'8px 12px' }}>
            <div style={{ fontSize:10, color:'var(--text3)',
             textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>
             {label}
            </div>
             <div style={{ fontSize:13, fontFamily:
             label==='Mobile'||label==='Partner ID' ? 'monospace' : 'inherit',
            color: label==='Partner ID' ? 'var(--accent)' : 'var(--text)' }}>
            {val}
            </div>
          </div>
         ))}
       </div>
      </div>
     )}

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.25)',
            borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:20,
            fontSize:13, color:'#f87171' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:24 }}>

          <form onSubmit={handleSubmit}>

            {/* Role */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)',
                textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                Role *
              </label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{ width:'100%' }}>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)',
                textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                Full Name *
              </label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="John Doe" required />
            </div>

            {/* Mobile */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)',
                textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                Mobile Number *
              </label>
              <input name="mobileNo" value={form.mobileNo} onChange={handleChange}
                placeholder="9876543210" required />
            </div>

            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)',
                textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                Email
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="user@gomotorcar.com" />
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)',
                textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                Password *
              </label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min 6 characters" required />
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'11px', fontWeight:600, fontSize:14,
                background: loading ? 'rgba(59,130,246,.5)' : 'var(--accent)',
                color:'#fff', border:'none',
                borderRadius:'var(--radius)', opacity: loading ? .7 : 1 }}>
              {loading ? 'Creating...' : '+ Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}