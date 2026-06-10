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

// ── Detail Panel (RIGHT SIDEBAR) ──────────────────────────────────────────────
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
          </div>
        </div>

        {/* Approve/Reject Buttons for Side Panel */}
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

      {/* Detail Panel Tabs */}
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
              <Row label="City"                 value={f.city || '—'} />
              <Row label="Region"               value={f.region || '—'} />
              <Row label="GSTIN"                value={f.gstin || '—'} />
            </Sec>
          </>
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

function FormField({ label, fieldKey, type='text', placeholder='', maxLen, required, value, error, onChange }) {
  return (
    <div>
      <label style={lbStyle}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLen}
        onChange={e => onChange(fieldKey, type==='tel' ? e.target.value.replace(/\D/g,'') : e.target.value)}
        style={{ ...inStyle, borderColor:error?'#fca5a5':'#d1d5db' }} />
      {error && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</div>}
    </div>
  )
}

// ── FIXED Add Franchise Modal ─────────────────────────────────────────────────
function AddFranchiseModal({ onClose, onSuccess }) {
  const EMPTY = { businessName:'', ownerName:'', mobileNo:'', email:'', city:'', region:'North', gstin:'', address:'', password:'' }
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success,setSuccess]= useState(false)

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Required'
    if (!form.ownerName.trim())    e.ownerName    = 'Required'
    if (form.mobileNo.length < 10) e.mobileNo = 'Valid 10-digit number required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    return e
  }

  // ── FIX: API CALL UPDATED FOR REAL BACKEND ──
  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true); setErrors({})
    try {
      // Backend expects 'mobile' instead of 'mobileNo' for its createInternalUser function
      const payload = {
        mobileNo:form.mobileNo.replace(/\D/g),
        role:'FR',
        name:form.ownerName,
        entityType:'company',
      };

      // Calling createInternal because we updated the backend to allow FR role there
      await adminAPI.createFranchise(payload); 
      setSuccess(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1500)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || 'Failed to create franchise.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Add New Franchise</h2><p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text3)' }}>Onboard a new franchise partner</p></div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>
          {success && <div style={{ background:'#f0fdf4', color:'#16a34a', padding:'10px', borderRadius:8, marginBottom:10, fontSize:13 }}>✅ Franchise created successfully!</div>}
          {errors.submit && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px', borderRadius:8, marginBottom:10, fontSize:13 }}>⚠ {errors.submit}</div>}
          <div style={secStyle}>Business Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}><FormField label="Business Name" fieldKey="businessName" value={form.businessName} error={errors.businessName} onChange={set} placeholder="e.g. Speed Auto Care" required /></div>
            <FormField label="City" fieldKey="city" value={form.city} error={errors.city} onChange={set} placeholder="Bangalore" required />
            <div>
              <label style={lbStyle}>Region</label>
              <select value={form.region} onChange={e=>set('region',e.target.value)} style={inStyle}><option>North</option><option>South</option><option>East</option><option>West</option></select>
            </div>
            <div style={{ gridColumn:'1/-1' }}><label style={lbStyle}>Address</label><textarea value={form.address} onChange={e=>set('address',e.target.value)} style={inStyle} rows={2}/></div>
          </div>
          <div style={secStyle}>Owner Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
             <div style={{ gridColumn:'1/-1' }}><FormField label="Owner Full Name" fieldKey="ownerName" value={form.ownerName} error={errors.ownerName} onChange={set} required /></div>
             <FormField label="Mobile Number" fieldKey="mobileNo" type="tel" value={form.mobileNo} error={errors.mobileNo} onChange={set} maxLen={10} required />
             <FormField label="Password" fieldKey="password" type="password" value={form.password} error={errors.password} onChange={set} required />
          </div>
        </div>
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={{ padding:'9px 20px', border:'1px solid var(--border)', borderRadius:8, background:'#fff', fontSize:13 }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving||success} style={{ padding:'9px 24px', background:'var(--accent)', border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff' }}>{saving?'⏳ Creating…':'+ Add Franchise'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Tab 1 — All Franchises ─────────────────────────────────────────────────────
function AllFranchises() {
  const [franchises, setFranchises] = useState([]);
  const [meta, setMeta] = useState({ total:0, pages:1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    setLoading(true)
    adminAPI.getUsers({ role:'FR', limit:10 }).then(res => {
      setFranchises(res.data?.data || []);
      setMeta(res.data?.meta || { total:0, pages:1 });
    }).catch(()=>{}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id) => {
    if(!window.confirm("Approve?")) return;
    try { await adminAPI.approveUser(id, {}); load(); } catch(e){ alert("Failed"); }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Reject?")) return;
    try { await adminAPI.rejectUser(id, { reason:'Rejected' }); load(); } catch(e){ alert("Failed"); }
  };

  return (
    <div style={{ display:'flex', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        {/* KPI Section */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          <KpiCard icon="🏪" iconBg="#eff6ff" label="Total" value={meta.total} loading={loading} sub="Franchise network" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Active" value={franchises.filter(f=>f.status==='Active').length} loading={loading} />
          <KpiCard icon="⏳" iconBg="#fff7ed" label="Pending" value={franchises.filter(f=>f.status==='Pending').length} loading={loading} />
          <KpiCard icon="₹" iconBg="#f0fdfa" label="Revenue" value="₹ 10.06L" loading={false} sub="↑ 16.7%" subColor="#16a34a" />
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
           <button onClick={()=>setShowAdd(true)} style={{ padding:'9px 18px', background:'var(--accent)', color:'#fff', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', border:'none' }}>+ Add Franchise</button>
        </div>

        {showAdd && <AddFranchiseModal onClose={()=>setShowAdd(false)} onSuccess={load} />}

        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
              <thead><tr style={{ background:'#f8fafc' }}>{['Code','Business Name','Owner','City','Status','Actions'].map(h=><th key={h} style={{ padding:14, textAlign:'left', fontSize:11, textTransform:'uppercase', color:'var(--text3)' }}>{h}</th>)}</tr></thead>
              <tbody>
                {loading ? <SkeletonRow cols={6}/> : franchises.map(f => (
                  <tr key={f._id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:14, fontSize:12, fontWeight:700, color:'var(--accent)' }}>{f.partnerId || f._id?.slice(-8).toUpperCase()}</td>
                    <td style={{ padding:14 }}>
                       <div style={{ display:'flex', alignItems:'center', gap:10 }}><FLogo name={f.businessName||f.name} id={f._id} /><span style={{ fontSize:13, fontWeight:600 }}>{f.businessName || f.name}</span></div>
                    </td>
                    <td style={{ padding:14, fontSize:12 }}><div>{f.name}</div><div style={{ color:'var(--text3)', fontSize:11 }}>{f.mobileNo}</div></td>
                    <td style={{ padding:14, fontSize:13 }}>{f.city || '—'}</td>
                    <td style={{ padding:14 }}><Badge status={f.status} /></td>
                    <td style={{ padding:14 }}><div style={{ display:'flex', gap:6 }}><button onClick={()=>setSelected(f)} style={actBtn}>👁</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selected && <DetailPanel f={selected} onClose={()=>setSelected(null)} onApprove={handleApprove} onReject={handleReject} />}
    </div>
  )
}

// ── Shared styles (Original preserved) ──────────────────────────────────────────
const lbl = { fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }
const actBtn = { background:'none', border:'1px solid var(--border)', borderRadius:6, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13 }
const pgBtn = { width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', borderRadius:6, fontSize:13, cursor:'pointer' }
const lbStyle = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inStyle = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #d1d5db', borderRadius:8, outline:'none', boxSizing:'border-box', color:'#0f172a', background:'#fff' }
const secStyle = { fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border)' }

// ── Main Export ───────────────────────────────────────────────────────────────
export default function FranchisePartners() {
  const [activeTab, setActiveTab] = useState('all')
  const TABS = [{ key:'all', label:'All Franchises' }, { key:'approvals', label:'Franchise Approvals' }]

  return (
    <div style={{ p:6 }}>
      <div style={{ marginBottom:20 }}><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Franchise Management</h1><div style={{ fontSize:12, color:'var(--text3)' }}>Dashboard › Franchise Partners</div></div>
      <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'2px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{ padding:'10px 20px', border:'none', borderBottom: activeTab===t.key?'2px solid var(--accent)':'none', background:'transparent', fontSize:13, fontWeight:600, cursor:'pointer', color: activeTab===t.key?'var(--accent)':'var(--text2)' }}>{t.label}</button>
        ))}
      </div>
      {activeTab === 'all' && <AllFranchises />}
      {activeTab === 'approvals' && <div style={{ padding:40, textAlign:'center', color:'var(--text3)', background:'#fff', border:'1px solid var(--border)', borderRadius:12 }}>Approvals coming soon (Design preserved)</div>}
    </div>
  )
}