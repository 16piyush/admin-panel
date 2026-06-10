import { useState, useEffect, useCallback, useRef } from 'react'
import { adminAPI } from '../services/api'

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
const COLORS = ['#2563eb','#7c3aed','#db2777','#059669','#ea580c','#0891b2','#be185d','#9333ea','#16a34a','#dc2626']
function colorFor(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    active:           { bg:'#dcfce7', color:'#16a34a' },
    Active:           { bg:'#dcfce7', color:'#16a34a' },
    inactive:         { bg:'#fee2e2', color:'#dc2626' },
    Inactive:         { bg:'#fee2e2', color:'#dc2626' },
    pending_approval: { bg:'#fff7ed', color:'#d97706' },
    Pending:          { bg:'#fff7ed', color:'#d97706' },
  }
  const s = map[status] || { bg:'#f1f5f9', color:'#64748b' }
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'
  return (
    <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:600,
      padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
      {label === 'Pending_approval' ? 'Pending' : label}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, id, photo, size=38 }) {
  const color = colorFor(id || name)
  if (photo) return (
    <img src={photo} alt={name}
      style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
  )
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`${color}18`, border:`1.5px solid ${color}30`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.3, fontWeight:700, color }}>
      {getInitials(name)}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, label, value, sub, subColor, loading }) {
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)', padding:'18px 20px',
      boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:50, height:50, borderRadius:14, background:iconBg, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)',
          textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700, color:'var(--text)', lineHeight:1, marginBottom:4 }}>
          {loading ? '—' : value}
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
function DetailPanel({ c, onClose }) {
  const [tab, setTab] = useState('overview')
  const color = colorFor(c._id || c.name)

  return (
    <div style={{ width:340, flexShrink:0, background:'#fff',
      border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
      boxShadow:'0 4px 24px rgba(0,0,0,.1)', display:'flex',
      flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Cleaner Details</span>
        <button onClick={onClose} style={{ background:'none', border:'none',
          fontSize:18, cursor:'pointer', color:'var(--text3)' }}>✕</button>
      </div>

      {/* Identity */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <Avatar name={c.name} id={c._id} photo={c.profilePhoto} size={52} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{c.name}</span>
              <Badge status={c.status || 'active'} />
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {c.partnerId || c._id?.slice(-8)?.toUpperCase() || 'Pending'}
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
              {c.cleanerType || 'Full Time'} Cleaner
            </div>
          </div>
        </div>
        <div style={{ fontSize:12, color:'#f59e0b' }}>
          ★ {c.rating?.toFixed(1) || '4.8'} <span style={{ color:'var(--text3)' }}>(156 Ratings)</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
        {['Overview','Documents','Earnings','Activity'].map(t => (
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

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
        {tab === 'overview' ? (
          <>
            <Sec title="Personal Information">
              <Row label="Mobile"  value={c.mobileNo || c.mobile || '—'} />
              <Row label="Email"   value={c.email || '—'} small />
              <Row label="DOB"     value={c.dob || '—'} />
              <Row label="Address" value={c.address || '—'} small />
            </Sec>
            <Sec title="Work Information">
              <Row label="Type"          value={c.cleanerType || 'Full Time'} />
              <Row label="Supervisor"    value={c.supervisor || '—'} />
              <Row label="Apartments"    value={c.apartments || '—'} />
              <Row label="Assigned Cars" value={c.assignedCars || '—'} />
            </Sec>
            <Sec title="Performance">
              <Row label="Total Cleanings" value={c.totalCleanings || '—'} />
              <Row label="This Month"      value={c.monthCleanings || '—'} />
              <Row label="Rating"          value={c.rating ? `${c.rating.toFixed(1)} ★` : '4.8 ★'} />
            </Sec>
          </>
        ) : (
          <div style={{ color:'var(--text3)', fontSize:13, textAlign:'center', padding:'32px 0' }}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)} coming soon
          </div>
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
function Row({ label, value, small }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'5px 0', gap:8 }}>
      <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:small?11:13, fontWeight:600, textAlign:'right', color:'var(--text)' }}>{value}</span>
    </div>
  )
}

// ── Add Cleaner Modal ─────────────────────────────────────────────────────────
function AddCleanerModal({ onClose, onSuccess }) {
  const EMPTY = { name:'', mobile:'', email:'', dob:'', address:'', supervisor:'', cleanerType:'Full Time' }
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [errors,    setErrors]    = useState({})
  const [success,   setSuccess]   = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const fileRef = useRef(null)

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())           e.name   = 'Required'
    if (form.mobile.length < 10)     e.mobile = 'Valid 10-digit number required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true); setErrors({})
    try {
      await adminAPI.createCleaner({
      mobileNo:form.mobile.replace(/\D/g,''),
      name:form.name,
      profilePhoto: imgPreview,
      })
      setSuccess(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1500)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || 'Failed to create cleaner.' })
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

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Register New Cleaner</h2>
            <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text3)' }}>Add a new car cleaner</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>
          {success && <div style={{ background:'#f0fdf4', color:'#16a34a', padding:'10px', borderRadius:8, marginBottom:10, fontSize:13 }}>✅ Cleaner registered successfully!</div>}
          {errors.submit && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px', borderRadius:8, marginBottom:10, fontSize:13 }}>⚠ {errors.submit}</div>}

          {/* Photo Upload */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <div style={{ textAlign:'center' }}>
              <div onClick={() => fileRef.current?.click()}
                style={{ width:80, height:80, borderRadius:16, background:'#f1f5f9',
                  border:'2px dashed #cbd5e1', display:'flex', alignItems:'center',
                  justifyContent:'center', cursor:'pointer', overflow:'hidden',
                  margin:'0 auto 8px' }}>
                {imgPreview
                  ? <img src={imgPreview} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:28 }}>📷</span>}
              </div>
              <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }}
                onChange={e => {
  const f = e.target.files[0]
  if (f) {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 200
        const ratio = Math.min(MAX/img.width, MAX/img.height)
        canvas.width  = img.width  * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        setImgPreview(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(f)
  }
}} />
              <div style={{ fontSize:11, color:'var(--text3)' }}>Upload Photo</div>
            </div>
          </div>

          <div style={secStyle}>Personal Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FF label="Full Name" fieldKey="name" value={form.name} error={errors.name} onChange={set} required />
            </div>
            <FF label="Mobile Number" fieldKey="mobile" type="tel" value={form.mobile} error={errors.mobile} onChange={set} maxLen={10} required />
            <FF label="Email" fieldKey="email" type="email" value={form.email} onChange={set} />
            <FF label="Date of Birth" fieldKey="dob" value={form.dob} onChange={set} placeholder="DD/MM/YYYY" />
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbStyle}>Address</label>
              <textarea value={form.address} onChange={e=>set('address',e.target.value)}
                style={inStyle} rows={2} placeholder="Full address" />
            </div>
          </div>

          <div style={secStyle}>Work Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={lbStyle}>Cleaner Type</label>
              <select value={form.cleanerType} onChange={e=>set('cleanerType',e.target.value)} style={inStyle}>
                <option>Full Time</option>
                <option>Part Time</option>
              </select>
            </div>
            <FF label="Supervisor Name" fieldKey="supervisor" value={form.supervisor} onChange={set} placeholder="e.g. Suresh Yadav" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)',
          display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding:'9px 20px', border:'1px solid var(--border)',
              borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving||success}
            style={{ padding:'9px 24px', background:'var(--accent)', border:'none',
              borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
            {saving ? '⏳ Saving…' : '+ Add Cleaner'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FF({ label, fieldKey, type='text', placeholder='', maxLen, required, value, error, onChange }) {
  return (
    <div>
      <label style={lbStyle}>{label}{required && <span style={{ color:'#dc2626' }}> *</span>}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLen}
        onChange={e => onChange(fieldKey, type==='tel' ? e.target.value.replace(/\D/g,'') : e.target.value)}
        style={{ ...inStyle, borderColor:error?'#fca5a5':'#d1d5db' }} />
      {error && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</div>}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Cleaners() {
  const [cleaners,  setCleaners]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('All')
  const [meta,      setMeta]      = useState({ total:0 })

  const load = useCallback(() => {
    setLoading(true)
    adminAPI.getUsers({ role:'CL', limit:100 })
      .then(res => {
        const all = res.data?.data || []
        setCleaners(all)
        setMeta({ total: all.length })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const displayed = cleaners.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (c.name||'').toLowerCase().includes(q) ||
      (c.mobileNo||c.mobile||'').includes(q) ||
      (c.partnerId||'').toLowerCase().includes(q)
    const cStatus = (c.status||'').toLowerCase()
    const matchFilter =
      filter === 'All' ||
      (filter === 'Active'   && (cStatus==='active')) ||
      (filter === 'Pending'  && (cStatus==='pending_approval'||cStatus==='pending')) ||
      (filter === 'Inactive' && cStatus==='inactive')
    return matchSearch && matchFilter
  })

  const activeCount  = cleaners.filter(c => c.status==='active').length
  const pendingCount = cleaners.filter(c => c.status==='pending_approval'||c.status==='pending').length

  return (
    <div style={{ display:'flex', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>

        {/* Page Header */}
        <div style={{ marginBottom:20 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Car Cleaner Management</h1>
          <div style={{ fontSize:12, color:'var(--text3)' }}>Dashboard › Car Cleaners</div>
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          <KpiCard icon="🧹" iconBg="#eff6ff" label="Total"    value={meta.total}    loading={loading} sub="All cleaners" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Active"   value={activeCount}   loading={loading} />
          <KpiCard icon="⏳" iconBg="#fff7ed" label="Pending"  value={pendingCount}  loading={loading} />
          <KpiCard icon="⭐" iconBg="#fefce8" label="Avg Rating" value="4.8"         loading={false}   sub="Overall" />
        </div>

        {/* Add Button */}
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <button onClick={()=>setShowAdd(true)}
            style={{ padding:'9px 18px', background:'var(--accent)', color:'#fff',
              borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', border:'none' }}>
            + Add Cleaner
          </button>
        </div>

        {showAdd && <AddCleanerModal onClose={()=>setShowAdd(false)} onSuccess={load} />}

        {/* Search + Filter */}
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}>🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by name, mobile, ID..."
              style={{ width:'100%', padding:'9px 12px 9px 32px', fontSize:12,
                border:'1px solid var(--border)', borderRadius:8, outline:'none', boxSizing:'border-box' }} />
          </div>
          {['All','Active','Pending','Inactive'].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600,
                cursor:'pointer', border:'1px solid var(--border)',
                background: filter===f ? 'var(--accent)' : '#fff',
                color:      filter===f ? '#fff' : 'var(--text2)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Cleaner ID','Name','Mobile','Type','Supervisor','Rating','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:14, textAlign:'left', fontSize:11,
                      textTransform:'uppercase', color:'var(--text3)', fontWeight:600,
                      letterSpacing:'.04em', borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <SkeletonRow cols={8} /> :
                 displayed.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                    No cleaners found
                  </td></tr>
                 ) : displayed.map(c => (
                  <tr key={c._id} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:14, fontSize:12, fontWeight:700, color:'var(--accent)' }}>
                      {c.partnerId || 'Pending'}
                    </td>
                    <td style={{ padding:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={c.name} id={c._id} photo={c.profilePhoto} />
                        <span style={{ fontSize:13, fontWeight:600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:14, fontSize:12, color:'var(--text2)' }}>{c.mobileNo || c.mobile || '—'}</td>
                    <td style={{ padding:14 }}>
                      <span style={{ background:'#eff6ff', color:'#2563eb', fontSize:11,
                        fontWeight:600, padding:'3px 10px', borderRadius:20 }}>
                        {c.cleanerType || 'Full Time'}
                      </span>
                    </td>
                    <td style={{ padding:14, fontSize:12 }}>{c.supervisor || '—'}</td>
                    <td style={{ padding:14, fontSize:12, color:'#f59e0b', fontWeight:600 }}>
                      ★ {c.rating?.toFixed(1) || '4.8'}
                    </td>
                    <td style={{ padding:14 }}><Badge status={c.status || 'active'} /></td>
                    <td style={{ padding:14 }}>
                      <button onClick={()=>setSelected(c)}
                        style={{ background:'none', border:'1px solid var(--border)',
                          borderRadius:6, width:30, height:30, cursor:'pointer', fontSize:13 }}>
                        👁
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && <DetailPanel c={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const lbStyle  = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inStyle  = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #d1d5db', borderRadius:8, outline:'none', boxSizing:'border-box', color:'#0f172a', background:'#fff' }
const secStyle = { fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border)', marginTop:4 }