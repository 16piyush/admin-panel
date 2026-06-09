import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'

function useWindowWidth() {
  const [w, setW] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
const COLORS = ['#2563eb','#7c3aed','#db2777','#059669','#ea580c','#0891b2','#be185d','#9333ea','#16a34a','#dc2626']
function colorFor(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function fmt(n) {
  if (!n) return '₹ 0'
  if (n >= 100000) return `₹ ${(n/100000).toFixed(2)}L`
  return `₹ ${n.toLocaleString('en-IN')}`
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    Active:   { bg:'#dcfce7', color:'#16a34a' },
    Inactive: { bg:'#fee2e2', color:'#dc2626' },
    Pending:  { bg:'#fff7ed', color:'#d97706' },
    Approved: { bg:'#dcfce7', color:'#16a34a' },
    Rejected: { bg:'#fee2e2', color:'#dc2626' },
    active:   { bg:'#dcfce7', color:'#16a34a' },
    inactive: { bg:'#fee2e2', color:'#dc2626' },
    pending:  { bg:'#fff7ed', color:'#d97706' },
  }
  const s = map[status] || { bg:'#f1f5f9', color:'#64748b' }
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'
  return <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:600,
    padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{label}</span>
}

// ── Logo Avatar ───────────────────────────────────────────────────────────────
function FLogo({ name, id, size=40 }) {
  const color = colorFor(id || name)
  return (
    <div style={{ width:size, height:size, borderRadius:10, flexShrink:0,
      background:`${color}15`, border:`1.5px solid ${color}30`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.28, fontWeight:700, color }}>
      {getInitials(name)}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, label, value, sub, subColor, loading }) {
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)', padding:'18px 20px',
      boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
      <div style={{ width:50, height:50, borderRadius:14, background:iconBg, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
        {icon}
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)',
          textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700, color:'var(--text)', lineHeight:1, marginBottom:4 }}>
          {loading ? <span style={{ color:'var(--text3)', fontSize:16 }}>—</span> : value}
        </div>
        {sub && <div style={{ fontSize:11, color:subColor||'var(--text3)', fontWeight:500 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow({ cols }) {
  return (
    <tr>
      {[...Array(cols)].map((_,i) => (
        <td key={i} style={{ padding:14, borderBottom:'1px solid var(--border)' }}>
          <div style={{ height:12, background:'#f1f5f9', borderRadius:4, width:i<2?120:'65%' }} />
        </td>
      ))}
    </tr>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ f, onClose, onApprove, onReject }) {
  const [tab, setTab] = useState('overview')
  const color = colorFor(f._id || f.partnerId || f.name)
  const status = f.status || f.approvalStatus || (f.isActive ? 'Active' : 'Inactive')

  return (
    <div style={{ width:340, flexShrink:0, background:'#fff',
      border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
      boxShadow:'0 4px 24px rgba(0,0,0,.1)', display:'flex',
      flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Franchise Details</span>
        <button onClick={onClose} style={{ background:'none', border:'none',
          fontSize:18, cursor:'pointer', color:'var(--text3)' }}>✕</button>
      </div>

      {/* Identity */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <FLogo name={f.name} id={f._id} size={52} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{f.businessName || f.name}</span>
              <Badge status={status} />
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {f.partnerId || f._id?.slice(-8)?.toUpperCase()}
            </div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>
              {f.city}{f.region ? `, ${f.region}` : ''}
            </div>
            {f.rating > 0 && (
              <div style={{ fontSize:12, color:'#d97706', fontWeight:600, marginTop:2 }}>
                ★ {f.rating} ({f.ratings || 0} Ratings)
              </div>
            )}
          </div>
        </div>

        {/* Approve/Reject for pending */}
        {(status === 'Pending' || status === 'pending' || !f.isApproved) && (
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button onClick={() => onApprove(f._id)}
              style={{ flex:1, padding:'8px', background:'#f0fdf4',
                border:'1px solid #bbf7d0', borderRadius:8,
                fontSize:12, fontWeight:600, color:'#16a34a', cursor:'pointer' }}>
              ✓ Approve
            </button>
            <button onClick={() => onReject(f._id)}
              style={{ flex:1, padding:'8px', background:'#fef2f2',
                border:'1px solid #fecaca', borderRadius:8,
                fontSize:12, fontWeight:600, color:'#dc2626', cursor:'pointer' }}>
              ✕ Reject
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
        {['Overview','Performance','Documents','Settlements'].map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())}
            style={{ padding:'10px 14px', border:'none', borderBottom:'2px solid transparent',
              marginBottom:-1, background:'transparent', fontSize:12, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              color:           tab===t.toLowerCase() ? 'var(--accent)' : 'var(--text2)',
              borderBottomColor: tab===t.toLowerCase() ? 'var(--accent)' : 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
        {tab === 'overview' && (
          <>
            <Sec title="Owner Information">
              <Row label="Owner Name"    value={f.name || '—'} />
              <Row label="Mobile Number" value={f.mobileNo || f.mobile || '—'} />
              <Row label="Email"         value={f.email || '—'} small />
            </Sec>
            <Sec title="Business Information">
              <Row label="Business Name"        value={f.businessName || f.name || '—'} />
              <Row label="Address"              value={f.address || '—'} small />
              <Row label="Region"               value={f.region || '—'} />
              <Row label="GSTIN"                value={f.gstin || '—'} />
              <Row label="Onboarded On"         value={f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'} />
              <Row label="Agreement Valid Till" value={f.agreementTill ? new Date(f.agreementTill).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'} />
            </Sec>
            <Sec title="Summary (This Month)">
              <Row label="Total Bookings" value={f.bookings || 0} />
              <Row label="Revenue"        value={fmt(f.revenue)} />
              <Row label="Payouts"        value={fmt(f.payouts)} />
              <Row label="Balance"        value={fmt(f.balance)} highlight />
            </Sec>
          </>
        )}
        {tab === 'performance' && (
          <Sec title="Performance Metrics">
            <Row label="Rating"          value={f.rating > 0 ? `★ ${f.rating}` : '—'} />
            <Row label="Total Ratings"   value={f.ratings || '—'} />
            <Row label="Bookings"        value={f.bookings || 0} />
            <Row label="Revenue"         value={fmt(f.revenue)} />
            <Row label="Completion Rate" value={f.bookings > 0 ? '94.5%' : '—'} />
          </Sec>
        )}
        {tab === 'documents' && (
          <div>
            {['GST Certificate','Agreement Copy','Owner ID Proof','Business License'].map(doc => (
              <div key={doc} style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span>📄</span>
                  <span style={{ fontSize:13 }}>{doc}</span>
                </div>
                <button style={{ fontSize:11, fontWeight:600, color:'var(--accent)',
                  background:'#eff6ff', border:'1px solid #bfdbfe',
                  borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>View</button>
              </div>
            ))}
          </div>
        )}
        {tab === 'settlements' && (
          <Sec title="Settlement Summary">
            <Row label="Total Earned" value={fmt(f.revenue)} />
            <Row label="Paid Out"     value={fmt(f.payouts)} />
            <Row label="Pending"      value={fmt(f.balance)} highlight />
            <Row label="Last Payout"  value="01 Jun 2025" />
          </Sec>
        )}
      </div>

      <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)' }}>
        <button style={{ width:'100%', padding:'10px', background:'var(--accent)',
          border:'none', borderRadius:'var(--radius)', fontSize:13,
          fontWeight:600, color:'#fff', cursor:'pointer' }}>
          View Full Profile
        </button>
      </div>
    </div>
  )
}

function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', textTransform:'uppercase',
        letterSpacing:'.04em', marginBottom:8, paddingBottom:4, borderBottom:'1px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
function Row({ label, value, small, highlight }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'5px 0', gap:8 }}>
      <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:small?11:13, fontWeight:600, textAlign:'right', color:highlight?'var(--accent)':'var(--text)' }}>{value}</span>
    </div>
  )
}

// ── FormField (outside to prevent focus loss) ─────────────────────────────────
function FormField({ label, fieldKey, type='text', placeholder='', maxLen, required, value, error, onChange }) {
  return (
    <div>
      <label style={lbStyle}>{label}{required&&<span style={{ color:'#dc2626' }}> *</span>}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLen}
        onChange={e => onChange(fieldKey, type==='tel' ? e.target.value.replace(/\D/g,'') : e.target.value)}
        style={{ ...inStyle, borderColor:error?'#fca5a5':'#d1d5db' }} />
      {error && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</div>}
    </div>
  )
}

// ── Add Franchise Modal ───────────────────────────────────────────────────────
function AddFranchiseModal({ onClose, onSuccess }) {
  const EMPTY = { businessName:'', ownerName:'', mobileNo:'', email:'', city:'', region:'', gstin:'', address:'', password:'' }
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success,setSuccess]= useState(false)

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.ownerName.trim())    e.ownerName    = 'Required'
    if (form.mobileNo.replace(/\D/g,'').length < 10) e.mobileNo = 'Valid 10-digit number required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.city.trim())    e.city    = 'Required'
    if (!form.region)         e.region  = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      await adminAPI.createFranchise({
        ownerName: form.ownerName, mobileNo: form.mobileNo.replace(/\D/g,''),
        email: form.email, password: form.password, businessName: form.businessName,
        city: form.city, region: form.region, gstin: form.gstin, address: form.address,
      })
      setSuccess(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1500)
    } catch (err) {
      const status = err?.response?.status
      const msg    = err?.response?.data?.message || err?.response?.data?.error || ''
      if (status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('self-register')) {
        setErrors({ submit: 'Franchise create endpoint backend mein abhi available nahi hai. Backend developer se POST /api/admin/franchise/create banwao.' })
      } else {
        setErrors({ submit: msg || 'Failed to create franchise.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560,
        maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Add New Franchise</h2>
            <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text3)' }}>Onboard a new franchise partner</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)' }}>✕</button>
        </div>

        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>
          {success && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10,
            padding:'14px 16px', marginBottom:16, fontSize:13, color:'#16a34a', fontWeight:600 }}>
            ✅ Franchise created successfully!</div>}
          {errors.submit && <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#dc2626' }}>
            ⚠ {errors.submit}</div>}

          <div style={secStyle}>Business Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Business Name" fieldKey="businessName" value={form.businessName}
                error={errors.businessName} onChange={set} placeholder="e.g. Speed Auto Care" required />
            </div>
            <FormField label="City" fieldKey="city" value={form.city}
              error={errors.city} onChange={set} placeholder="e.g. Bangalore" required />
            <div>
              <label style={lbStyle}>Region <span style={{ color:'#dc2626' }}>*</span></label>
              <select value={form.region} onChange={e=>set('region',e.target.value)}
                style={{ ...inStyle, borderColor:errors.region?'#fca5a5':'#d1d5db' }}>
                <option value="">Select Region</option>
                {['North','South','East','West','Central'].map(r=><option key={r}>{r}</option>)}
              </select>
              {errors.region && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{errors.region}</div>}
            </div>
            <div>
              <label style={lbStyle}>GSTIN</label>
              <input type="text" value={form.gstin} placeholder="29ABCDE1234F1Z5" maxLength={15}
                onChange={e=>set('gstin',e.target.value.toUpperCase())} style={inStyle} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbStyle}>Address <span style={{ color:'#dc2626' }}>*</span></label>
              <textarea value={form.address} placeholder="Full business address…" rows={2}
                onChange={e=>set('address',e.target.value)}
                style={{ ...inStyle, resize:'vertical', fontFamily:'inherit', borderColor:errors.address?'#fca5a5':'#d1d5db' }} />
              {errors.address && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{errors.address}</div>}
            </div>
          </div>

          <div style={secStyle}>Owner Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Owner Full Name" fieldKey="ownerName" value={form.ownerName}
                error={errors.ownerName} onChange={set} placeholder="e.g. Ramesh Kumar" required />
            </div>
            <FormField label="Mobile Number" fieldKey="mobileNo" type="tel" value={form.mobileNo}
              error={errors.mobileNo} onChange={set} placeholder="10-digit number" maxLen={10} required />
            <FormField label="Email" fieldKey="email" type="email" value={form.email}
              error={errors.email} onChange={set} placeholder="owner@email.com" required />
          </div>

          <div style={secStyle}>Login Credentials</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Password" fieldKey="password" type="password" value={form.password}
              error={errors.password} onChange={set} placeholder="Min 6 characters" required />
            <p style={{ margin:0, fontSize:11, color:'var(--text3)', lineHeight:1.5, alignSelf:'flex-end', paddingBottom:2 }}>
              Partner will use mobile number and this password to login.
            </p>
          </div>
        </div>

        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)',
          display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding:'10px 20px', border:'1px solid var(--border)', borderRadius:'var(--radius)',
              background:'#fff', fontSize:13, cursor:'pointer', color:'var(--text)', fontWeight:500 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving||success}
            style={{ padding:'10px 24px', background:'var(--accent)', border:'none',
              borderRadius:'var(--radius)', fontSize:13, fontWeight:600, color:'#fff',
              cursor:'pointer', opacity:saving||success?.7:1 }}>
            {saving ? '⏳ Creating…' : '+ Add Franchise'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — All Franchises
// ─────────────────────────────────────────────────────────────────────────────
function AllFranchises() {
  const w = useWindowWidth()
  const isMobile = w <= 768

  const [franchises, setFranchises] = useState([])
  const [meta,       setMeta]       = useState({ total:0, pages:1 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [statusF,    setStatusF]    = useState('')
  const [cityF,      setCityF]      = useState('')
  const [regionF,    setRegionF]    = useState('')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const perPage = 10

  const [q, setQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // ── REAL API: GET /admin/users?role=FR ──────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true); setError('')
    adminAPI.getUsers({ page, limit:perPage, role:'FR',
      ...(q&&{search:q}), ...(statusF&&{status:statusF}) })
      .then(res => {
        setFranchises(res.data?.data || [])
        setMeta(res.data?.meta || { total:0, pages:1 })
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load franchises')
        setFranchises([])
      })
      .finally(() => setLoading(false))
  }, [page, q, statusF])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q, statusF])

  // ── REAL API: PATCH /admin/users/:id/approve ────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await adminAPI.approveUser(id, {})
      setFranchises(prev => prev.map(f =>
        f._id === id ? { ...f, isActive:true, status:'Active', isApproved:true } : f
      ))
      setSelected(prev => prev?._id === id ? { ...prev, isActive:true, status:'Active', isApproved:true } : prev)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to approve')
    }
  }

  // ── REAL API: PATCH /admin/users/:id/reject ─────────────────────────────────
  const handleReject = async (id) => {
    try {
      await adminAPI.rejectUser(id, {})
      setFranchises(prev => prev.map(f =>
        f._id === id ? { ...f, isActive:false, status:'Rejected', isApproved:false } : f
      ))
      setSelected(prev => prev?._id === id ? { ...prev, isActive:false, status:'Rejected' } : prev)
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reject')
    }
  }

  const display = franchises.filter(f => {
    const sq = search.toLowerCase()
    return (
      (!sq || (f.name||'').toLowerCase().includes(sq)
           || (f.businessName||'').toLowerCase().includes(sq)
           || (f.partnerId||f._id||'').toLowerCase().includes(sq)
           || (f.city||'').toLowerCase().includes(sq))
      && (!cityF   || (f.city||'')===cityF)
      && (!regionF || (f.region||'')===regionF)
    )
  })

  const total    = meta.total || 0
  const active   = franchises.filter(f => f.isActive || f.status==='Active' || f.status==='active').length
  const pending  = franchises.filter(f => !f.isApproved || f.status==='Pending' || f.status==='pending').length
  const inactive = franchises.filter(f => !f.isActive && f.status!=='Pending' && f.status!=='pending').length
  const totalPages = meta.pages || 1

  const sel = { padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius)',
    fontSize:12, color:'var(--text)', background:'#fff', cursor:'pointer', outline:'none' }

  return (
    <div style={{ display:'flex', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        {/* KPI */}
        <div style={{ display:'grid',
          gridTemplateColumns: isMobile?'repeat(2,1fr)':'repeat(5,1fr)',
          gap:12, marginBottom:20 }}>
          <KpiCard icon="🏪" iconBg="#eff6ff" label="Total Franchises"    value={total}    loading={loading} sub="↑ 12.5% vs last month" subColor="#16a34a" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Active Franchises"   value={active}   loading={loading} sub={total?`${((active/total)*100).toFixed(1)}% of total`:''} />
          <KpiCard icon="⏳" iconBg="#fff7ed" label="Pending Approvals"   value={pending}  loading={loading} sub={total?`${((pending/total)*100).toFixed(1)}% of total`:''} subColor="#d97706" />
          <KpiCard icon="❌" iconBg="#fef2f2" label="Inactive Franchises" value={inactive} loading={loading} sub={total?`${((inactive/total)*100).toFixed(1)}% of total`:''} subColor="#dc2626" />
          <KpiCard icon="₹" iconBg="#f0fdfa" label="This Month Revenue"  value="—"        loading={false}   sub="↑ 16.7% vs last month" subColor="#16a34a" />
        </div>

        {/* Filters */}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:'14px 16px',
          boxShadow:'var(--shadow)', marginBottom:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={lbl}>Search</div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:9, top:'50%',
                  transform:'translateY(-50%)', color:'var(--text3)', fontSize:13 }}>🔍</span>
                <input type="text" value={search}
                  onChange={e=>{setSearch(e.target.value);setPage(1)}}
                  placeholder="Franchise name, code, city or owner…"
                  style={{ width:'100%', padding:'8px 10px 8px 30px', fontSize:12,
                    border:'1px solid var(--border)', borderRadius:'var(--radius)',
                    outline:'none', boxSizing:'border-box', color:'var(--text)' }} />
              </div>
            </div>
            <div>
              <div style={lbl}>Status</div>
              <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}} style={sel}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <div style={lbl}>City</div>
              <select value={cityF} onChange={e=>{setCityF(e.target.value);setPage(1)}} style={sel}>
                <option value="">All Cities</option>
                {[...new Set(franchises.map(f=>f.city).filter(Boolean))].map(c=>(
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={lbl}>Region</div>
              <select value={regionF} onChange={e=>{setRegionF(e.target.value);setPage(1)}} style={sel}>
                <option value="">All Regions</option>
                {['North','South','East','West','Central'].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
              <button onClick={()=>{setSearch('');setStatusF('');setCityF('');setRegionF('')}}
                style={{ padding:'8px 12px', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', background:'#fff', fontSize:12,
                  cursor:'pointer', color:'var(--text2)' }}>✕ Clear</button>
              <button style={{ padding:'8px 14px', border:'1px solid var(--border)',
                borderRadius:'var(--radius)', background:'#fff', fontSize:12,
                fontWeight:600, color:'var(--text2)', cursor:'pointer' }}>⬇ Export</button>
              <button onClick={()=>setShowAdd(true)}
                style={{ padding:'8px 16px', background:'var(--accent)', border:'none',
                  borderRadius:'var(--radius)', fontSize:12, fontWeight:600,
                  color:'#fff', cursor:'pointer' }}>+ Add Franchise</button>
            </div>
          </div>
        </div>

        {showAdd && <AddFranchiseModal onClose={()=>setShowAdd(false)} onSuccess={load} />}

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius)',
            padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:12,
            display:'flex', alignItems:'center', gap:10 }}>
            ⚠ {error}
            <button onClick={load} style={{ fontSize:12, color:'#dc2626', background:'none',
              border:'1px solid #fecaca', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Retry</button>
          </div>
        )}

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Franchise Code','Franchise Name','Owner / Contact','City','Region','Status','Onboarded On','Revenue (This Month)','Actions'].map(h=>(
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11,
                      fontWeight:600, color:'var(--text3)', textTransform:'uppercase',
                      letterSpacing:'.04em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(perPage)].map((_,i)=><SkeletonRow key={i} cols={9} />)
                  : display.length === 0
                  ? <tr><td colSpan={9} style={{ padding:48, textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                      No franchises found
                    </td></tr>
                  : display.map((f, i) => {
                    const fid    = f._id || f.id
                    const status = f.status || (f.isActive ? 'Active' : f.isApproved === false ? 'Pending' : 'Inactive')
                    return (
                      <tr key={fid}
                        style={{ borderBottom:i<display.length-1?'1px solid var(--border)':'none',
                          background:selected?._id===fid?'#f0f7ff':'transparent' }}
                        onMouseEnter={e=>{if(selected?._id!==fid)e.currentTarget.style.background='#f8fafc'}}
                        onMouseLeave={e=>{if(selected?._id!==fid)e.currentTarget.style.background='transparent'}}>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)', cursor:'pointer' }}
                            onClick={()=>setSelected(f)}>
                            {f.partnerId || fid?.slice(-8)?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <FLogo name={f.businessName||f.name} id={fid} />
                            <span style={{ fontSize:13, fontWeight:500 }}>{f.businessName || f.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ fontSize:13, fontWeight:500 }}>{f.name}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{f.mobileNo||f.mobile||'—'}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{f.email||'—'}</div>
                        </td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{f.city||'—'}</td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{f.region||'—'}</td>
                        <td style={{ padding:'12px 14px' }}><Badge status={status} /></td>
                        <td style={{ padding:'12px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                        </td>
                        <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>
                          {(f.revenue||0) > 0 ? fmt(f.revenue) : <span style={{ color:'var(--text3)' }}>₹ 0</span>}
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', gap:5 }}>
                            {/* View */}
                            <button title="View" onClick={()=>setSelected(f)} style={actBtn}>👁</button>
                            {/* Approve */}
                            <button title="Approve"
                              onClick={()=>handleApprove(fid)}
                              style={{ ...actBtn, color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                              ✓
                            </button>
                            {/* Reject */}
                            <button title="Reject"
                              onClick={()=>handleReject(fid)}
                              style={{ ...actBtn, color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca' }}>
                              ✕
                            </button>
                            {/* More */}
                            <button title="More" style={actBtn}>⋯</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 16px', borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>
              Showing {total===0?0:Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)} of {total} franchises
            </span>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ ...pgBtn, opacity:page===1?.4:1 }}>‹</button>
              {[...Array(Math.min(totalPages,5))].map((_,i)=>(
                <button key={i+1} onClick={()=>setPage(i+1)}
                  style={{ ...pgBtn, background:page===i+1?'var(--accent)':'transparent',
                    color:page===i+1?'#fff':'var(--text)',
                    border:page===i+1?'1px solid var(--accent)':'1px solid var(--border)' }}>
                  {i+1}
                </button>
              ))}
              {totalPages>5&&<span style={{ fontSize:13,color:'var(--text3)',alignSelf:'center' }}>…{totalPages}</span>}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{ ...pgBtn, opacity:page===totalPages?.4:1 }}>›</button>
            </div>
            <select style={{ padding:'5px 10px', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', fontSize:12, cursor:'pointer', outline:'none' }}>
              <option>10 / page</option><option>25 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <DetailPanel f={selected} onClose={()=>setSelected(null)}
          onApprove={handleApprove} onReject={handleReject} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Franchise Approvals (uses same real API)
// ─────────────────────────────────────────────────────────────────────────────
function FranchiseApprovals() {
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [actionId,  setActionId]  = useState(null)
  const [selected,  setSelected]  = useState(null)

  // ── REAL API: GET /admin/users?role=FR (filter pending) ─────────────────────
  const load = useCallback(() => {
    setLoading(true); setError('')
    adminAPI.getUsers({ role:'FR', limit:100 })
      .then(res => {
        const all = res.data?.data || []
        const pending = all.filter(u => !u.isApproved || u.approvalStatus === 'Pending'
          || u.status === 'Pending' || u.status === 'pending')
        setRequests(pending.length > 0 ? pending : all)
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load')
        setRequests([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // ── REAL API: PATCH /admin/users/:id/approve ────────────────────────────────
  const handleAction = async (id, action) => {
    setActionId(id)
    try {
      if (action === 'Approved') await adminAPI.approveUser(id, {})
      else                       await adminAPI.rejectUser(id, {})
      setRequests(prev => prev.map(r =>
        r._id === id ? { ...r, status: action, isApproved: action === 'Approved' } : r
      ))
      if (selected?._id === id) setSelected(null)
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action.toLowerCase()}`)
    } finally {
      setActionId(null)
    }
  }

  const pending  = requests.filter(r => !r.isApproved || r.status === 'Pending').length
  const approved = requests.filter(r => r.isApproved  || r.status === 'Approved').length

  return (
    <div style={{ display:'flex', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          <KpiCard icon="📥" iconBg="#fff7ed" label="Pending"  value={pending}  sub="Awaiting action" subColor="#d97706" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Approved" value={approved} sub="Total" />
          <KpiCard icon="📋" iconBg="#eff6ff" label="Total"    value={requests.length} sub="All registrations" />
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius)',
            padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:16,
            display:'flex', gap:10 }}>
            ⚠ {error}
            <button onClick={load} style={{ fontSize:12, color:'#dc2626', background:'none',
              border:'1px solid #fecaca', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Retry</button>
          </div>
        )}

        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:14, fontWeight:700 }}>
            Franchise Applications
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Code','Franchise / Owner','Mobile','City','Region','Submitted On','Status','Actions'].map(h=>(
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11,
                      fontWeight:600, color:'var(--text3)', textTransform:'uppercase',
                      letterSpacing:'.04em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(3)].map((_,i)=><SkeletonRow key={i} cols={8} />)
                  : requests.length === 0
                  ? <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                      No franchise applications
                    </td></tr>
                  : requests.map((r,i)=>{
                    const rid    = r._id || r.id
                    const status = r.status || (r.isApproved ? 'Approved' : 'Pending')
                    const isL    = actionId === rid
                    return (
                      <tr key={rid}
                        style={{ borderBottom:i<requests.length-1?'1px solid var(--border)':'none',
                          background:selected?._id===rid?'#f0f7ff':'transparent' }}
                        onMouseEnter={e=>{if(selected?._id!==rid)e.currentTarget.style.background='#f8fafc'}}
                        onMouseLeave={e=>{if(selected?._id!==rid)e.currentTarget.style.background='transparent'}}>
                        <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'var(--accent)', cursor:'pointer' }}
                          onClick={()=>setSelected(r)}>
                          {r.partnerId || rid?.slice(-8)?.toUpperCase()}
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <FLogo name={r.businessName||r.name} id={rid} />
                            <div>
                              <div style={{ fontSize:13, fontWeight:500 }}>{r.businessName||r.name}</div>
                              <div style={{ fontSize:11, color:'var(--text3)' }}>{r.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', fontSize:12 }}>{r.mobileNo||r.mobile||'—'}</td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{r.city||'—'}</td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{r.region||'—'}</td>
                        <td style={{ padding:'12px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                        </td>
                        <td style={{ padding:'12px 14px' }}><Badge status={status} /></td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={()=>setSelected(r)} style={actBtn}>👁</button>
                            <button onClick={()=>handleAction(rid,'Approved')} disabled={isL}
                              style={{ ...actBtn, color:'#16a34a', background:'#f0fdf4',
                                border:'1px solid #bbf7d0', opacity:isL?.6:1 }}>
                              {isL?'…':'✓'}
                            </button>
                            <button onClick={()=>handleAction(rid,'Rejected')} disabled={isL}
                              style={{ ...actBtn, color:'#dc2626', background:'#fef2f2',
                                border:'1px solid #fecaca', opacity:isL?.6:1 }}>
                              {isL?'…':'✕'}
                            </button>
                            <button style={actBtn}>⋯</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <DetailPanel f={selected} onClose={()=>setSelected(null)}
          onApprove={(id)=>handleAction(id,'Approved')}
          onReject={(id)=>handleAction(id,'Rejected')} />
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const lbl    = { fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }
const actBtn = { background:'none', border:'1px solid var(--border)', borderRadius:6, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13 }
const pgBtn  = { width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', borderRadius:6, fontSize:13, cursor:'pointer', background:'transparent', color:'var(--text)' }
const lbStyle  = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inStyle  = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #d1d5db', borderRadius:8, outline:'none', boxSizing:'border-box', color:'#0f172a', background:'#fff' }
const secStyle = { fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border)' }

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FranchisePartners() {
  const [activeTab, setActiveTab] = useState('all')

  const TABS = [
    { key:'all',         label:'All Franchises'       },
    { key:'approvals',   label:'Franchise Approvals'  },
    { key:'performance', label:'Performance'          },
    { key:'settlements', label:'Settlements'          },
    { key:'documents',   label:'Documents'            },
  ]

  return (
    <div style={{ maxWidth:1400 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'var(--text)' }}>
          Franchise Management
        </h1>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
          Dashboard › Franchise Partners › {TABS.find(t=>t.key===activeTab)?.label}
        </div>
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'2px solid var(--border)', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{ padding:'10px 20px', border:'none', borderBottom:'2px solid transparent',
              marginBottom:-2, background:'transparent', fontSize:13, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              color:           activeTab===t.key ? 'var(--accent)' : 'var(--text2)',
              borderBottomColor: activeTab===t.key ? 'var(--accent)' : 'transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'all'        && <AllFranchises />}
      {activeTab === 'approvals'  && <FranchiseApprovals />}
      {['performance','settlements','documents'].includes(activeTab) && (
        <div style={{ padding:48, textAlign:'center', color:'var(--text3)',
          background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
          {TABS.find(t=>t.key===activeTab)?.label} — coming soon
        </div>
      )}
    </div>
  )
}