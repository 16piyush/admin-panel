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

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK = [
  { id:'FR-1001', name:'Speed Auto Care',    owner:'Ramesh Kumar',  mobile:'+91 98765 43210', email:'ramesh.kumar@email.com',  city:'Bangalore', region:'South', status:'Active',   onboarded:'2024-01-15', revenue:235640, rating:4.7, ratings:128, address:'#45, 2nd Main, Koramangala, Bangalore - 560034', gstin:'29ABCDE1234F1Z5', agreementTill:'2026-01-14', bookings:256, payouts:182400, balance:53240, logo:null },
  { id:'FR-1002', name:'Shine Auto Services',owner:'Anita Singh',   mobile:'+91 87654 32109', email:'anita.singh@email.com',   city:'Mumbai',    region:'West',  status:'Active',   onboarded:'2024-02-28', revenue:185230, rating:4.5, ratings:98,  address:'12, Carter Road, Bandra, Mumbai - 400050',        gstin:'27FGHIJ5678K2L6', agreementTill:'2026-02-27', bookings:198, payouts:148184, balance:37046, logo:null },
  { id:'FR-1003', name:'QuickFix Solutions', owner:'Vikas Sharma',  mobile:'+91 90123 45678', email:'vikas.sharma@email.com',  city:'Delhi',     region:'North', status:'Active',   onboarded:'2024-03-10', revenue:162450, rating:4.6, ratings:112, address:'Plot 7, Sector 18, Noida, Delhi - 201301',         gstin:'07KLMNO9012P3Q7', agreementTill:'2026-03-09', bookings:175, payouts:129960, balance:32490, logo:null },
  { id:'FR-1004', name:'DriveCare Experts',  owner:'Suresh Patel',  mobile:'+91 93210 98765', email:'suresh.patel@email.com',  city:'Hyderabad', region:'South', status:'Pending',  onboarded:'2025-05-05', revenue:0,      rating:0,   ratings:0,   address:'8-2-293, Road No. 78, Jubilee Hills, Hyderabad',   gstin:'36PQRST3456U4V8', agreementTill:'2027-05-04', bookings:0,   payouts:0,      balance:0,     logo:null },
  { id:'FR-1005', name:'AutoPro Services',   owner:'Neha Gupta',    mobile:'+91 74321 09876', email:'neha.gupta@email.com',    city:'Pune',      region:'West',  status:'Active',   onboarded:'2024-04-12', revenue:128900, rating:4.4, ratings:76,  address:'FC Road, Shivajinagar, Pune - 411005',             gstin:'27UVWXY7890Z5A9', agreementTill:'2026-04-11', bookings:142, payouts:103120, balance:25780, logo:null },
  { id:'FR-1006', name:'CarzCare Network',   owner:'Deepak Yadav',  mobile:'+91 98701 23456', email:'deepak.yadav@email.com',  city:'Chennai',   region:'South', status:'Active',   onboarded:'2024-05-18', revenue:105760, rating:4.3, ratings:64,  address:'Anna Salai, Teynampet, Chennai - 600018',         gstin:'33ABCDE1111B1C1', agreementTill:'2026-05-17', bookings:118, payouts:84608,  balance:21152, logo:null },
  { id:'FR-1007', name:'Elite Auto Care',    owner:'Pooja Mehta',   mobile:'+91 81234 56789', email:'pooja.mehta@email.com',   city:'Kolkata',   region:'East',  status:'Inactive', onboarded:'2023-12-22', revenue:0,      rating:4.1, ratings:45,  address:'Park Street, Kolkata - 700016',                   gstin:'19FGHIJ2222C2D2', agreementTill:'2025-12-21', bookings:0,   payouts:0,      balance:0,     logo:null },
  { id:'FR-1008', name:'Prime Auto Wash',    owner:'Amit Verma',    mobile:'+91 99887 66554', email:'amit.verma@email.com',    city:'Ahmedabad', region:'West',  status:'Active',   onboarded:'2024-01-30', revenue:98700,  rating:4.2, ratings:53,  address:'SG Highway, Bodakdev, Ahmedabad - 380054',        gstin:'24KLMNO3333D3E3', agreementTill:'2026-01-29', bookings:108, payouts:78960,  balance:19740, logo:null },
]

const MOCK_APPROVALS = [
  { id:'FA-001', name:'Rapid Car Wash',   owner:'Sanjay Tiwari', mobile:'+91 77665 44332', city:'Jaipur',  region:'North', submittedOn:'2025-06-01', docs:3, status:'Pending'  },
  { id:'FA-002', name:'GreenWash Auto',   owner:'Kavya Nair',    mobile:'+91 66554 33221', city:'Kochi',   region:'South', submittedOn:'2025-06-02', docs:4, status:'Pending'  },
  { id:'FA-003', name:'FastTrack Detailing',owner:'Rohan Desai', mobile:'+91 55443 22110', city:'Surat',   region:'West',  submittedOn:'2025-05-29', docs:2, status:'Pending'  },
]

function fmt(n) {
  if (n >= 100000) return `₹ ${(n/100000).toFixed(2)}L`
  return `₹ ${n.toLocaleString('en-IN')}`
}

// ── Field component (OUTSIDE modal to prevent focus loss) ────────────────────
function FormField({ label, fieldKey, type='text', placeholder='', maxLen, required, value, error, onChange }) {
  return (
    <div>
      <label style={lbStyle}>{label}{required && <span style={{ color:'#dc2626' }}> *</span>}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLen}
        onChange={e => onChange(fieldKey, type==='tel'
          ? e.target.value.replace(/\D/g,'')
          : e.target.value)}
        style={{ ...inStyle, borderColor: error ? '#fca5a5' : '#d1d5db' }}
      />
      {error && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</div>}
    </div>
  )
}

// ── Add Franchise Modal ───────────────────────────────────────────────────────
function AddFranchiseModal({ onClose, onSuccess }) {
  const EMPTY = {
    businessName:'', ownerName:'', mobileNo:'', email:'',
    city:'', region:'', gstin:'', address:'', password:'',
  }
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})
  const [success, setSuccess] = useState(false)

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.businessName.trim()) e.businessName = 'Business name is required'
    if (!form.ownerName.trim())    e.ownerName    = 'Owner name is required'
    if (!form.mobileNo.trim() || form.mobileNo.replace(/\D/g,'').length < 10)
      e.mobileNo = 'Valid 10-digit mobile required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email required'
    if (!form.city.trim())    e.city    = 'City is required'
    if (!form.region)         e.region  = 'Region is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.password.trim() || form.password.length < 6)
      e.password = 'Password min 6 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    try {
      // Try admin create endpoint
      await adminAPI.createFranchise({
        ownerName:    form.ownerName,
        mobileNo:     form.mobileNo.replace(/\D/g,''),
        email:        form.email,
        password:     form.password,
        businessName: form.businessName,
        city:         form.city,
        region:       form.region,
        gstin:        form.gstin,
        address:      form.address,
      })
      setSuccess(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1500)
    } catch (err) {
      const status = err?.response?.status
      const msg    = err?.response?.data?.message || err?.response?.data?.error || ''

      if (status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('self-register')) {
        setErrors({ submit: '⚠️ Admin se franchise create karna abhi backend mein support nahi hai. Franchise partner ko app se khud register karna hoga. Backend developer se /admin/franchise/create endpoint banwao.' })
      } else if (status === 401) {
        setErrors({ submit: 'Session expire ho gayi. Please refresh karke dobara login karein.' })
      } else {
        setErrors({ submit: msg || 'Failed to create franchise. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
      zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:560,
        maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Add New Franchise</h2>
            <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text3)' }}>
              Fill in the details to onboard a new franchise partner
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none',
            fontSize:20, cursor:'pointer', color:'var(--text3)', padding:4, lineHeight:1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>

          {success && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0',
              borderRadius:10, padding:'14px 16px', marginBottom:16,
              display:'flex', alignItems:'center', gap:10, fontSize:13,
              color:'#16a34a', fontWeight:600 }}>
              ✅ Franchise created successfully! Redirecting…
            </div>
          )}

          {errors.submit && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:10, padding:'12px 16px', marginBottom:16,
              fontSize:13, color:'#dc2626' }}>
              ⚠ {errors.submit}
            </div>
          )}

          {/* Business Info */}
          <div style={sectionStyle}>Business Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Business Name" fieldKey="businessName" value={form.businessName}
                error={errors.businessName} onChange={set} placeholder="e.g. Speed Auto Care" required />
            </div>
            <FormField label="City" fieldKey="city" value={form.city}
              error={errors.city} onChange={set} placeholder="e.g. Bangalore" required />
            <div>
              <label style={lbStyle}>Region <span style={{ color:'#dc2626' }}>*</span></label>
              <select value={form.region} onChange={e => set('region', e.target.value)}
                style={{ ...inStyle, borderColor: errors.region ? '#fca5a5' : '#d1d5db' }}>
                <option value="">Select Region</option>
                {['North','South','East','West','Central'].map(r => <option key={r}>{r}</option>)}
              </select>
              {errors.region && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{errors.region}</div>}
            </div>
            <div>
              <label style={lbStyle}>GSTIN</label>
              <input type="text" value={form.gstin} placeholder="29ABCDE1234F1Z5" maxLength={15}
                onChange={e => set('gstin', e.target.value.toUpperCase())}
                style={{ ...inStyle }} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={lbStyle}>Address <span style={{ color:'#dc2626' }}>*</span></label>
              <textarea value={form.address} placeholder="Full business address…" rows={2}
                onChange={e => set('address', e.target.value)}
                style={{ ...inStyle, resize:'vertical', fontFamily:'inherit',
                  borderColor: errors.address ? '#fca5a5' : '#d1d5db' }} />
              {errors.address && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{errors.address}</div>}
            </div>
          </div>

          {/* Owner Info */}
          <div style={sectionStyle}>Owner Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Owner Full Name" fieldKey="ownerName" value={form.ownerName}
                error={errors.ownerName} onChange={set} placeholder="e.g. Ramesh Kumar" required />
            </div>
            <FormField label="Mobile Number" fieldKey="mobileNo" type="tel" value={form.mobileNo}
              error={errors.mobileNo} onChange={set} placeholder="10-digit number" maxLen={10} required />
            <FormField label="Email Address" fieldKey="email" type="email" value={form.email}
              error={errors.email} onChange={set} placeholder="owner@email.com" required />
          </div>

          {/* Credentials */}
          <div style={sectionStyle}>Login Credentials</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Password" fieldKey="password" type="password" value={form.password}
              error={errors.password} onChange={set} placeholder="Min 6 characters" required />
            <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
              <p style={{ margin:0, fontSize:11, color:'var(--text3)', lineHeight:1.5 }}>
                Franchise partner will use mobile number and this password to login.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)',
          display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding:'10px 20px', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', background:'#fff', fontSize:13,
              cursor:'pointer', color:'var(--text)', fontWeight:500 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving || success}
            style={{ padding:'10px 24px', background:'var(--accent)', border:'none',
              borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
              color:'#fff', cursor:'pointer', opacity: saving||success ? .7 : 1,
              display:'flex', alignItems:'center', gap:8 }}>
            {saving ? '⏳ Creating…' : '+ Add Franchise'}
          </button>
        </div>
      </div>
    </div>
  )
}

const lbStyle = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inStyle  = {
  width:'100%', padding:'9px 12px', fontSize:13,
  border:'1px solid #d1d5db', borderRadius:8, outline:'none',
  boxSizing:'border-box', color:'#0f172a', background:'#fff',
}
const sectionStyle = {
  fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase',
  letterSpacing:'.05em', marginBottom:10, paddingBottom:6,
  borderBottom:'1px solid var(--border)',
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    Active:   { bg:'#dcfce7', color:'#16a34a' },
    Inactive: { bg:'#fee2e2', color:'#dc2626' },
    Pending:  { bg:'#fff7ed', color:'#d97706' },
    Approved: { bg:'#dcfce7', color:'#16a34a' },
    Rejected: { bg:'#fee2e2', color:'#dc2626' },
  }
  const s = map[status] || { bg:'#f1f5f9', color:'#64748b' }
  return <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:600,
    padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{status}</span>
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function FranchiseLogo({ name, id }) {
  const color = colorFor(id)
  return (
    <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
      background:`${color}15`, border:`1.5px solid ${color}30`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:12, fontWeight:700, color }}>
      {getInitials(name)}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, label, value, sub, subColor }) {
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
        <div style={{ fontSize:24, fontWeight:700, color:'var(--text)',
          letterSpacing:'-.02em', lineHeight:1, marginBottom:4 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:subColor||'var(--text3)', fontWeight:500 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ franchise, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const color = colorFor(franchise.id)

  const tabs = ['Overview','Performance','Documents','Settlements']

  return (
    <div style={{ width:340, flexShrink:0, background:'#fff',
      border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
      boxShadow:'var(--shadow-md)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Franchise Details</span>
        <button onClick={onClose} style={{ background:'none', border:'none',
          fontSize:18, cursor:'pointer', color:'var(--text3)', padding:4 }}>✕</button>
      </div>

      {/* Identity */}
      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ width:52, height:52, borderRadius:12, flexShrink:0,
            background:`${color}15`, border:`2px solid ${color}30`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700, color }}>
            {getInitials(franchise.name)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{franchise.name}</span>
              <Badge status={franchise.status} />
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{franchise.id}</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:1 }}>{franchise.city}, {franchise.region === 'South' ? 'Karnataka' : franchise.region === 'West' ? 'Maharashtra' : franchise.region === 'North' ? 'Delhi' : 'West Bengal'}</div>
          </div>
        </div>
        {franchise.rating > 0 && (
          <div style={{ fontSize:12, color:'#d97706', fontWeight:600 }}>
            ★ {franchise.rating} ({franchise.ratings} Ratings)
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)',
        overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t.toLowerCase())}
            style={{ padding:'10px 14px', border:'none', borderBottom:'2px solid transparent',
              marginBottom:-1, background:'transparent', fontSize:12, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              color:      activeTab===t.toLowerCase() ? 'var(--accent)' : 'var(--text2)',
              borderBottomColor: activeTab===t.toLowerCase() ? 'var(--accent)' : 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>

        {activeTab === 'overview' && (
          <>
            <Section title="Owner Information">
              <Row label="Owner Name"    value={franchise.owner} />
              <Row label="Mobile Number" value={franchise.mobile} />
              <Row label="Email"         value={franchise.email} small />
            </Section>
            <Section title="Business Information">
              <Row label="Address"          value={franchise.address} small />
              <Row label="Region"           value={franchise.region} />
              <Row label="GSTIN"            value={franchise.gstin} />
              <Row label="Onboarded On"     value={new Date(franchise.onboarded).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} />
              <Row label="Agreement Valid Till" value={new Date(franchise.agreementTill).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} />
            </Section>
            <Section title="Summary (This Month)">
              <Row label="Total Bookings" value={franchise.bookings} />
              <Row label="Revenue"        value={`₹ ${franchise.revenue.toLocaleString('en-IN')}`} />
              <Row label="Payouts"        value={`₹ ${franchise.payouts.toLocaleString('en-IN')}`} />
              <Row label="Balance"        value={`₹ ${franchise.balance.toLocaleString('en-IN')}`} highlight />
            </Section>
          </>
        )}

        {activeTab === 'performance' && (
          <Section title="Performance Metrics">
            <Row label="Rating"         value={franchise.rating > 0 ? `★ ${franchise.rating}` : '—'} />
            <Row label="Total Ratings"  value={franchise.ratings || '—'} />
            <Row label="Bookings"       value={franchise.bookings} />
            <Row label="Revenue"        value={`₹ ${franchise.revenue.toLocaleString('en-IN')}`} />
            <Row label="Completion Rate" value={franchise.bookings > 0 ? '94.5%' : '—'} />
          </Section>
        )}

        {activeTab === 'documents' && (
          <div>
            {['GST Certificate','Agreement Copy','Owner ID Proof','Business License'].map(doc => (
              <div key={doc} style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'10px 0',
                borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>📄</span>
                  <span style={{ fontSize:13 }}>{doc}</span>
                </div>
                <button style={{ fontSize:11, fontWeight:600, color:'var(--accent)',
                  background:'#eff6ff', border:'1px solid #bfdbfe',
                  borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settlements' && (
          <Section title="Settlement Summary">
            <Row label="Total Earned"  value={`₹ ${franchise.revenue.toLocaleString('en-IN')}`} />
            <Row label="Paid Out"      value={`₹ ${franchise.payouts.toLocaleString('en-IN')}`} />
            <Row label="Pending"       value={`₹ ${franchise.balance.toLocaleString('en-IN')}`} highlight />
            <Row label="Last Payout"   value="01 Jun 2025" />
          </Section>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)' }}>
        <button style={{ width:'100%', padding:'10px', background:'var(--accent)',
          border:'none', borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
          color:'#fff', cursor:'pointer' }}>
          View Full Profile
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text)',
        textTransform:'uppercase', letterSpacing:'.04em', marginBottom:8,
        paddingBottom:4, borderBottom:'1px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  )
}
function Row({ label, value, small, highlight }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between',
      alignItems:'flex-start', padding:'5px 0', gap:8 }}>
      <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize: small ? 11 : 13, fontWeight:600, textAlign:'right',
        color: highlight ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
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
  const [selected,      setSelected]      = useState(null)
  const [showAddModal,  setShowAddModal]  = useState(false)
  const perPage = 10

  // debounce
  const [q, setQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    adminAPI.getFranchises({
      page, limit: perPage,
      ...(q       && { search: q }),
      ...(statusF && { status: statusF }),
    })
      .then(res => {
        setFranchises(res.data?.data || [])
        setMeta(res.data?.meta || { total:0, pages:1 })
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load franchises')
        // fallback to mock
        setFranchises(MOCK)
        setMeta({ total: MOCK.length, pages: 1 })
      })
      .finally(() => setLoading(false))
  }, [page, q, statusF])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q, statusF])

  // For KPI — use meta or mock counts
  const displayList = franchises.length > 0 ? franchises : MOCK
  const filtered = displayList.filter(f => {
    const sq = search.toLowerCase()
    return (
      (!sq || (f.name||'').toLowerCase().includes(sq) || (f.partnerId||f.id||'').toLowerCase().includes(sq)
           || (f.city||'').toLowerCase().includes(sq)  || (f.name||f.owner||'').toLowerCase().includes(sq))
      && (!cityF   || (f.city||'')   === cityF)
      && (!regionF || (f.region||'') === regionF)
    )
  })

  const totalPages = meta.pages || 1
  const rows = franchises  // already paginated from server

  const total    = meta.total || MOCK.length
  const active   = MOCK.filter(f => f.status === 'Active').length
  const pending  = MOCK.filter(f => f.status === 'Pending').length
  const inactive = MOCK.filter(f => f.status === 'Inactive').length
  const revenue  = MOCK.reduce((s,f) => s + f.revenue, 0)

  const sel = {
    padding:'7px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius)',
    fontSize:12, color:'var(--text)', background:'#fff', cursor:'pointer', outline:'none',
  }

  return (
    <div style={{ display:'flex', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        {/* KPI */}
        <div style={{ display:'grid',
          gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
          gap:12, marginBottom:20 }}>
          <KpiCard icon="🏪" iconBg="#eff6ff" label="Total Franchises"    value={total}   sub="↑ 12.5% vs last month" subColor="#16a34a" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Active Franchises"   value={active}  sub={`${((active/total)*100).toFixed(1)}% of total`} />
          <KpiCard icon="⏳" iconBg="#fff7ed" label="Pending Approvals"   value={pending} sub={`${((pending/total)*100).toFixed(1)}% of total`} subColor="#d97706" />
          <KpiCard icon="❌" iconBg="#fef2f2" label="Inactive Franchises" value={inactive} sub={`${((inactive/total)*100).toFixed(1)}% of total`} subColor="#dc2626" />
          <KpiCard icon="₹" iconBg="#f0fdfa" label="This Month Revenue"  value={fmt(revenue)} sub="↑ 16.7% vs last month" subColor="#16a34a" />
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
                <option>Active</option><option>Inactive</option><option>Pending</option>
              </select>
            </div>
            <div>
              <div style={lbl}>City</div>
              <select value={cityF} onChange={e=>{setCityF(e.target.value);setPage(1)}} style={sel}>
                <option value="">All Cities</option>
                {[...new Set(MOCK.map(f=>f.city))].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Region</div>
              <select value={regionF} onChange={e=>{setRegionF(e.target.value);setPage(1)}} style={sel}>
                <option value="">All Regions</option>
                {[...new Set(MOCK.map(f=>f.region))].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
              <button onClick={()=>{setSearch('');setStatusF('');setCityF('');setRegionF('')}}
                style={{ padding:'8px 12px', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', background:'#fff',
                  fontSize:12, cursor:'pointer', color:'var(--text2)' }}>
                ✕ Clear
              </button>
              <button style={{ padding:'8px 14px', border:'1px solid var(--border)',
                borderRadius:'var(--radius)', background:'#fff', fontSize:12,
                fontWeight:600, color:'var(--text2)', cursor:'pointer' }}>
                ⬇ Export
              </button>
              <button style={{ padding:'8px 16px', background:'var(--accent)', border:'none',
                borderRadius:'var(--radius)', fontSize:12, fontWeight:600,
                color:'#fff', cursor:'pointer' }}
                onClick={() => setShowAddModal(true)}>
                + Add Franchise
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showAddModal && (
          <AddFranchiseModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => load()}
          />
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13,
            color:'#dc2626', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
            ⚠ {error}
            <button onClick={load} style={{ fontSize:12, color:'#dc2626', background:'none',
              border:'1px solid #fecaca', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>
              Retry
            </button>
          </div>
        )}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Franchise Code','Franchise Name','Owner / Contact','City','Region',
                    'Status','Onboarded On','Revenue (This Month)','Actions'].map(h => (
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                      fontSize:11, fontWeight:600, color:'var(--text3)',
                      textTransform:'uppercase', letterSpacing:'.04em',
                      borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0
                  ? <tr><td colSpan={9} style={{ padding:48, textAlign:'center',
                      color:'var(--text3)', fontSize:13 }}>No franchises found</td></tr>
                  : rows.map((f, i) => (
                    <tr key={f.id}
                      style={{ borderBottom: i < rows.length-1 ? '1px solid var(--border)':'none',
                        background: selected?.id===f.id ? '#f0f7ff' : 'transparent' }}
                      onMouseEnter={e => { if(selected?.id!==f.id) e.currentTarget.style.background='#f8fafc' }}
                      onMouseLeave={e => { if(selected?.id!==f.id) e.currentTarget.style.background='transparent' }}>
                      <td style={{ padding:'12px 14px' }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)',
                          cursor:'pointer' }} onClick={() => setSelected(f)}>
                          {f.id}
                        </span>
                      </td>
                      <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <FranchiseLogo name={f.name} id={f.id} />
                          <span style={{ fontSize:13, fontWeight:500 }}>{f.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{f.owner}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{f.mobile}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{f.email}</div>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:13 }}>{f.city}</td>
                      <td style={{ padding:'12px 14px', fontSize:13 }}>{f.region}</td>
                      <td style={{ padding:'12px 14px' }}><Badge status={f.status} /></td>
                      <td style={{ padding:'12px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                        {new Date(f.onboarded).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>
                        {f.revenue > 0 ? `₹ ${f.revenue.toLocaleString('en-IN')}` : <span style={{ color:'var(--text3)' }}>₹ 0</span>}
                      </td>
                      <td style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button title="View" onClick={() => setSelected(f)} style={actBtn}>👁</button>
                          <button title="Edit" style={actBtn}>✏️</button>
                          <button title="More" style={actBtn}>⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px 16px', borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>
              Showing {Math.min((page-1)*perPage+1,filtered.length)}–{Math.min(page*perPage,filtered.length)} of {filtered.length} franchises
            </span>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{ ...pgBtn, opacity:page===1?.4:1 }}>‹</button>
              {[...Array(Math.min(totalPages,5))].map((_,i) => (
                <button key={i+1} onClick={()=>setPage(i+1)}
                  style={{ ...pgBtn,
                    background: page===i+1?'var(--accent)':'transparent',
                    color:      page===i+1?'#fff':'var(--text)',
                    border:     page===i+1?'1px solid var(--accent)':'1px solid var(--border)' }}>
                  {i+1}
                </button>
              ))}
              {totalPages>5 && <span style={{ fontSize:13,color:'var(--text3)',alignSelf:'center' }}>…{totalPages}</span>}
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
        <DetailPanel franchise={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Franchise Approvals
// ─────────────────────────────────────────────────────────────────────────────
function FranchiseApprovals() {
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [actionId,  setActionId]  = useState(null)  // loading state per row

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    adminAPI.getFranchisePending()
      .then(res => setRequests(res.data?.data || []))
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to load pending franchises')
        setRequests(MOCK_APPROVALS) // fallback
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (id, action) => {
    setActionId(id)
    try {
      if (action === 'Approved') await adminAPI.approveFranchise(id)
      else                       await adminAPI.rejectFranchise(id)
      // refresh list
      load()
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action.toLowerCase()} franchise`)
    } finally {
      setActionId(null)
    }
  }

  const pending  = requests.filter(r => (r.status||r.approvalStatus) === 'Pending' || (!r.status && !r.approvalStatus)).length
  const approved = requests.filter(r => (r.status||r.approvalStatus) === 'Approved').length
  const rejected = requests.filter(r => (r.status||r.approvalStatus) === 'Rejected').length

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <KpiCard icon="📥" iconBg="#fff7ed" label="Pending Approvals" value={pending}  sub="Awaiting action"  subColor="#d97706" />
        <KpiCard icon="✅" iconBg="#f0fdf4" label="Approved"          value={approved} sub="This month" />
        <KpiCard icon="❌" iconBg="#fef2f2" label="Rejected"          value={rejected} sub="This month"       subColor="#dc2626" />
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
          borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13,
          color:'#dc2626', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
          ⚠ {error}
          <button onClick={load} style={{ fontSize:12, color:'#dc2626', background:'none',
            border:'1px solid #fecaca', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>
            Retry
          </button>
        </div>
      )}

      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)',
          fontSize:14, fontWeight:700 }}>Franchise Applications</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ID / Code','Franchise / Owner','Mobile','City','Region','Submitted On','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                    fontSize:11, fontWeight:600, color:'var(--text3)',
                    textTransform:'uppercase', letterSpacing:'.04em',
                    borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_,i) => (
                    <tr key={i}>
                      {[...Array(8)].map((_,j) => (
                        <td key={j} style={{ padding:14, borderBottom:'1px solid var(--border)' }}>
                          <div style={{ height:12, background:'#f1f5f9', borderRadius:4, width:'70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : requests.length === 0
                ? <tr><td colSpan={8} style={{ padding:48, textAlign:'center',
                    color:'var(--text3)', fontSize:13 }}>No pending franchise applications</td></tr>
                : requests.map((r, i) => {
                  // Handle both real API fields and mock fields
                  const rid    = r._id  || r.id
                  const rname  = r.businessName || r.franchiseName || r.name || '—'
                  const rowner = r.ownerName || r.owner || r.name || '—'
                  const rmob   = r.mobileNo   || r.mobile || '—'
                  const rcity  = r.city   || '—'
                  const rreg   = r.region || '—'
                  const rdate  = r.createdAt || r.submittedOn
                  const rstatus = r.approvalStatus || r.status || 'Pending'
                  const isLoading = actionId === rid

                  return (
                    <tr key={rid}
                      style={{ borderBottom: i<requests.length-1?'1px solid var(--border)':'none' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'var(--accent)' }}>
                        {r.partnerId || rid?.slice(-8) || '—'}
                      </td>
                      <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <FranchiseLogo name={rname} id={rid} />
                          <div>
                            <div style={{ fontSize:13, fontWeight:500 }}>{rname}</div>
                            <div style={{ fontSize:11, color:'var(--text3)' }}>{rowner}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 14px', fontSize:12 }}>{rmob}</td>
                      <td style={{ padding:'12px 14px', fontSize:13 }}>{rcity}</td>
                      <td style={{ padding:'12px 14px', fontSize:13 }}>{rreg}</td>
                      <td style={{ padding:'12px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                        {rdate ? new Date(rdate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td style={{ padding:'12px 14px' }}><Badge status={rstatus} /></td>
                      <td style={{ padding:'12px 14px' }}>
                        {(rstatus === 'Pending' || rstatus === 'pending') ? (
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => handleAction(rid, 'Approved')}
                              disabled={isLoading}
                              style={{ padding:'5px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0',
                                borderRadius:6, fontSize:11, fontWeight:600, color:'#16a34a',
                                cursor:'pointer', opacity: isLoading?.6:1 }}>
                              {isLoading ? '…' : '✓ Approve'}
                            </button>
                            <button onClick={() => handleAction(rid, 'Rejected')}
                              disabled={isLoading}
                              style={{ padding:'5px 10px', background:'#fef2f2', border:'1px solid #fecaca',
                                borderRadius:6, fontSize:11, fontWeight:600, color:'#dc2626',
                                cursor:'pointer', opacity: isLoading?.6:1 }}>
                              {isLoading ? '…' : '✕ Reject'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:'flex', gap:5 }}>
                            <button style={actBtn}>👁</button>
                            <button style={actBtn}>⋯</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Performance
// ─────────────────────────────────────────────────────────────────────────────
function Performance() {
  const sorted = [...MOCK].sort((a,b) => b.revenue - a.revenue)
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <KpiCard icon="📈" iconBg="#eff6ff" label="Top Revenue"    value={fmt(sorted[0]?.revenue||0)} sub={sorted[0]?.name} />
        <KpiCard icon="⭐" iconBg="#fff7ed" label="Top Rated"      value={`★ ${Math.max(...MOCK.map(f=>f.rating||0))}`} sub={MOCK.find(f=>f.rating===Math.max(...MOCK.map(x=>x.rating||0)))?.name} />
        <KpiCard icon="📦" iconBg="#f0fdf4" label="Most Bookings"  value={Math.max(...MOCK.map(f=>f.bookings))} sub={MOCK.find(f=>f.bookings===Math.max(...MOCK.map(x=>x.bookings)))?.name} />
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)',
          fontSize:14, fontWeight:700 }}>Franchise Performance Rankings</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Rank','Franchise','City','Bookings','Revenue','Rating','Status'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                    fontSize:11, fontWeight:600, color:'var(--text3)',
                    textTransform:'uppercase', letterSpacing:'.04em',
                    borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f,i) => (
                <tr key={f.id}
                  style={{ borderBottom: i<sorted.length-1?'1px solid var(--border)':'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ width:26, height:26, borderRadius:'50%',
                      background: i===0?'#fef9c3':i===1?'#f1f5f9':i===2?'#fef3c7':'#f8fafc',
                      color: i===0?'#d97706':i===1?'#64748b':i===2?'#92400e':'var(--text3)',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700 }}>
                      {i+1}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <FranchiseLogo name={f.name} id={f.id} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{f.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{f.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13 }}>{f.city}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>{f.bookings}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>
                    {f.revenue>0 ? `₹ ${f.revenue.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13 }}>
                    {f.rating>0 ? <span style={{ color:'#d97706', fontWeight:600 }}>★ {f.rating}</span> : '—'}
                  </td>
                  <td style={{ padding:'12px 14px' }}><Badge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const lbl = {
  fontSize:10, fontWeight:600, color:'var(--text3)',
  textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4,
}
const actBtn = {
  background:'none', border:'1px solid var(--border)', borderRadius:6,
  width:28, height:28, display:'flex', alignItems:'center',
  justifyContent:'center', cursor:'pointer', fontSize:13,
}
const pgBtn = {
  width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
  border:'1px solid var(--border)', borderRadius:6, fontSize:13,
  cursor:'pointer', background:'transparent', color:'var(--text)',
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FranchisePartners() {
  const [activeTab, setActiveTab] = useState('all')

  const TABS = [
    { key:'all',         label:'All Franchises'     },
    { key:'approvals',   label:'Franchise Approvals', badge: MOCK_APPROVALS.filter(r=>r.status==='Pending').length },
    { key:'performance', label:'Performance'         },
    { key:'settlements', label:'Settlements'         },
    { key:'documents',   label:'Documents'           },
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

      {/* Sub-nav */}
      <div style={{ display:'flex', gap:0, marginBottom:20,
        borderBottom:'2px solid var(--border)', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding:'10px 20px', border:'none', borderBottom:'2px solid transparent',
              marginBottom:-2, background:'transparent', fontSize:13, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              color:           activeTab===t.key ? 'var(--accent)' : 'var(--text2)',
              borderBottomColor: activeTab===t.key ? 'var(--accent)' : 'transparent' }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ marginLeft:6, background:'#fef3c7', color:'#d97706',
                fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'all'         && <AllFranchises />}
      {activeTab === 'approvals'   && <FranchiseApprovals />}
      {activeTab === 'performance' && <Performance />}
      {activeTab === 'settlements' && (
        <div style={{ padding:48, textAlign:'center', color:'var(--text3)',
          background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
          Settlements module — coming soon
        </div>
      )}
      {activeTab === 'documents' && (
        <div style={{ padding:48, textAlign:'center', color:'var(--text3)',
          background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
          Documents module — coming soon
        </div>
      )}
    </div>
  )
}