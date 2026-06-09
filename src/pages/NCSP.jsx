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

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK = [
  { _id:'1', partnerId:'NCSP-1001', name:'Speed Auto Care',    mobileNo:'+91 98765 43210', email:'info@speedauto.com',    city:'Bangalore', region:'South', status:'Active',   isActive:true,  createdAt:'2024-01-15', revenue:235640, rating:4.7, ratings:128, address:'#45, 2nd Main, Koramangala, Bangalore - 560034', gstin:'29ABCDE1234F1Z5', bookings:256, payouts:212076, balance:23564, kycVerified:true, agreementSigned:true },
  { _id:'2', partnerId:'NCSP-1002', name:'Shine Auto Services',mobileNo:'+91 87654 32109', email:'contact@shineauto.com', city:'Mumbai',    region:'West',  status:'Active',   isActive:true,  createdAt:'2024-02-28', revenue:185230, rating:4.5, ratings:98,  address:'12, Carter Road, Bandra, Mumbai - 400050',        gstin:'27FGHIJ5678K2L6', bookings:198, payouts:166707, balance:18523, kycVerified:true, agreementSigned:true },
  { _id:'3', partnerId:'NCSP-1003', name:'QuickFix Solutions', mobileNo:'+91 90123 45678', email:'hello@quickfix.com',   city:'Delhi',     region:'North', status:'Active',   isActive:true,  createdAt:'2024-03-10', revenue:162450, rating:4.6, ratings:112, address:'Plot 7, Sector 18, Noida - 201301',               gstin:'07KLMNO9012P3Q7', bookings:175, payouts:146205, balance:16245, kycVerified:true, agreementSigned:true },
  { _id:'4', partnerId:'NCSP-1004', name:'DriveCare Experts',  mobileNo:'+91 93210 98765', email:'support@drivecare.com',city:'Hyderabad', region:'South', status:'Pending',  isActive:false, createdAt:'2025-05-05', revenue:0,      rating:0,   ratings:0,   address:'8-2-293, Jubilee Hills, Hyderabad',               gstin:'36PQRST3456U4V8', bookings:0,   payouts:0,      balance:0,     kycVerified:false,agreementSigned:false },
  { _id:'5', partnerId:'NCSP-1005', name:'AutoPro Services',   mobileNo:'+91 74321 09876', email:'info@autopro.com',    city:'Pune',      region:'West',  status:'Active',   isActive:true,  createdAt:'2024-04-12', revenue:128900, rating:4.4, ratings:76,  address:'FC Road, Shivajinagar, Pune - 411005',            gstin:'27UVWXY7890Z5A9', bookings:142, payouts:116010, balance:12890, kycVerified:true, agreementSigned:true },
  { _id:'6', partnerId:'NCSP-1006', name:'CarzCare Network',   mobileNo:'+91 98701 23456', email:'care@carzcare.com',   city:'Chennai',   region:'South', status:'Active',   isActive:true,  createdAt:'2024-05-18', revenue:105760, rating:4.3, ratings:64,  address:'Anna Salai, Teynampet, Chennai - 600018',         gstin:'33ABCDE1111B1C1', bookings:118, payouts:95184,  balance:10576, kycVerified:true, agreementSigned:true },
  { _id:'7', partnerId:'NCSP-1007', name:'Elite Auto Care',    mobileNo:'+91 81234 56789', email:'info@eliteauto.com',  city:'Kolkata',   region:'East',  status:'Inactive', isActive:false, createdAt:'2023-12-22', revenue:0,      rating:4.1, ratings:45,  address:'Park Street, Kolkata - 700016',                   gstin:'19FGHIJ2222C2D2', bookings:0,   payouts:0,      balance:0,     kycVerified:true, agreementSigned:true },
  { _id:'8', partnerId:'NCSP-1008', name:'Prime Auto Wash',    mobileNo:'+91 99887 66554', email:'hello@primewash.com', city:'Ahmedabad', region:'West',  status:'Active',   isActive:true,  createdAt:'2024-01-30', revenue:98700,  rating:4.2, ratings:53,  address:'SG Highway, Bodakdev, Ahmedabad - 380054',        gstin:'24KLMNO3333D3E3', bookings:108, payouts:88830,  balance:9870,  kycVerified:true, agreementSigned:true },
  { _id:'9', partnerId:'NCSP-1009', name:'GoCar Services',     mobileNo:'+91 78945 61230', email:'info@gocar.com',      city:'Lucknow',   region:'North', status:'Pending',  isActive:false, createdAt:'2025-05-20', revenue:0,      rating:0,   ratings:0,   address:'Hazratganj, Lucknow - 226001',                    gstin:'09PQRST4567V5W9', bookings:0,   payouts:0,      balance:0,     kycVerified:false,agreementSigned:false },
  { _id:'10',partnerId:'NCSP-1010', name:'AutoMates',          mobileNo:'+91 90909 11223', email:'support@automates.com',city:'Bhubaneswar',region:'East',status:'Active',  isActive:true,  createdAt:'2024-03-08', revenue:89000,  rating:4.0, ratings:38,  address:'Saheed Nagar, Bhubaneswar - 751007',              gstin:'21UVWXY8901A6B0', bookings:96,  payouts:80100,  balance:8900,  kycVerified:true, agreementSigned:true },
]

const MOCK_PENDING = MOCK.filter(m => m.status === 'Pending')

function fmt(n) {
  if (n >= 100000) return `₹ ${(n/100000).toFixed(2)}L`
  return `₹ ${n.toLocaleString('en-IN')}`
}

// ── Shared components ─────────────────────────────────────────────────────────
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

function NCSPLogo({ name, id }) {
  const color = colorFor(id || name)
  return (
    <div style={{ width:40, height:40, borderRadius:10, flexShrink:0,
      background:`${color}15`, border:`1.5px solid ${color}30`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:12, fontWeight:700, color }}>
      {getInitials(name)}
    </div>
  )
}

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

// ── FormField (outside to prevent focus loss) ─────────────────────────────────
function FormField({ label, fieldKey, type='text', placeholder='', maxLen, required, value, error, onChange }) {
  return (
    <div>
      <label style={lbStyle}>{label}{required && <span style={{ color:'#dc2626' }}> *</span>}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLen}
        onChange={e => onChange(fieldKey, type==='tel' ? e.target.value.replace(/\D/g,'') : e.target.value)}
        style={{ ...inStyle, borderColor: error ? '#fca5a5' : '#d1d5db' }} />
      {error && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{error}</div>}
    </div>
  )
}

// ── Add NCSP Modal ────────────────────────────────────────────────────────────
function AddNCSPModal({ onClose, onSuccess }) {
  const EMPTY = { businessName:'', contactPerson:'', mobileNo:'', email:'', city:'', region:'', gstin:'', address:'', password:'' }
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [success,setSuccess]= useState(false)

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})) }

  const validate = () => {
    const e = {}
    if (!form.businessName.trim())  e.businessName  = 'Required'
    if (!form.contactPerson.trim()) e.contactPerson = 'Required'
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
      await adminAPI.createInternal({
        name:   form.contactPerson,
        mobile: form.mobileNo.replace(/\D/g,''),
        email:  form.email,
        password: form.password,
        role:   'NC',
        notes:  JSON.stringify({ businessName:form.businessName, city:form.city, region:form.region, gstin:form.gstin, address:form.address }),
      })
      setSuccess(true)
      setTimeout(() => { onSuccess?.(); onClose() }, 1500)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create NCSP partner'
      setErrors({ submit: msg })
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
            <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>Add NCSP Partner</h2>
            <p style={{ margin:'2px 0 0', fontSize:12, color:'var(--text3)' }}>Onboard a new NCSP partner</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)' }}>✕</button>
        </div>

        <div style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>
          {success && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10,
            padding:'14px 16px', marginBottom:16, fontSize:13, color:'#16a34a', fontWeight:600 }}>
            ✅ NCSP Partner created successfully!</div>}
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

          <div style={secStyle}>Contact Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Contact Person" fieldKey="contactPerson" value={form.contactPerson}
                error={errors.contactPerson} onChange={set} placeholder="e.g. Ramesh Kumar" required />
            </div>
            <FormField label="Mobile Number" fieldKey="mobileNo" type="tel" value={form.mobileNo}
              error={errors.mobileNo} onChange={set} placeholder="10-digit number" maxLen={10} required />
            <FormField label="Email" fieldKey="email" type="email" value={form.email}
              error={errors.email} onChange={set} placeholder="contact@business.com" required />
          </div>

          <div style={secStyle}>Login Credentials</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Password" fieldKey="password" type="password" value={form.password}
              error={errors.password} onChange={set} placeholder="Min 6 characters" required />
            <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:2 }}>
              <p style={{ margin:0, fontSize:11, color:'var(--text3)', lineHeight:1.5 }}>
                Partner will use mobile number and this password to login.
              </p>
            </div>
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
            {saving ? '⏳ Creating…' : '+ Add NCSP Partner'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ partner, onClose }) {
  const [tab, setTab] = useState('profile')
  const color = colorFor(partner._id || partner.partnerId)
  const tabs = ['Profile','Performance','Settlement','Documents']

  return (
    <div style={{ width:340, flexShrink:0, background:'#fff',
      border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
      boxShadow:'var(--shadow-md)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:14, fontWeight:700 }}>Partner Details</span>
        <button onClick={onClose} style={{ background:'none', border:'none',
          fontSize:18, cursor:'pointer', color:'var(--text3)', padding:4 }}>✕</button>
      </div>

      <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ width:52, height:52, borderRadius:12, flexShrink:0,
            background:`${color}15`, border:`2px solid ${color}30`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:700, color }}>
            {getInitials(partner.name)}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:14, fontWeight:700 }}>{partner.name}</span>
              <Badge status={partner.status || (partner.isActive?'Active':'Inactive')} />
            </div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>{partner.partnerId || partner._id?.slice(-8)}</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>NCSP Partner</div>
          </div>
        </div>
        {partner.rating > 0 && (
          <div style={{ fontSize:12, color:'#d97706', fontWeight:600 }}>
            ★ {partner.rating} ({partner.ratings} Ratings)
          </div>
        )}
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
        {tabs.map(t => (
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

      <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
        {tab === 'profile' && (
          <>
            <Sec title="Business Information">
              <Row label="Contact Person" value={partner.name} />
              <Row label="Email"          value={partner.email || '—'} small />
              <Row label="Mobile"         value={partner.mobileNo || partner.mobile || '—'} />
              <Row label="City"           value={partner.city || '—'} />
              <Row label="Region"         value={partner.region || '—'} />
              <Row label="Address"        value={partner.address || '—'} small />
              <Row label="GSTIN"          value={partner.gstin || '—'} />
            </Sec>
            <Sec title="Onboarding & Status">
              <Row label="Onboarded On"     value={partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'} />
              <Row label="Status"           value={partner.status || (partner.isActive?'Active':'Inactive')} />
              <Row label="KYC Verified"     value={partner.kycVerified ? 'Yes' : 'No'} />
              <Row label="Agreement Signed" value={partner.agreementSigned ? 'Yes' : 'No'} />
            </Sec>
            <Sec title="Financial Summary (This Month)">
              <Row label="Total Bookings" value={partner.bookings || 0} />
              <Row label="Revenue"        value={`₹ ${(partner.revenue||0).toLocaleString('en-IN')}`} />
              <Row label="Payouts"        value={`₹ ${(partner.payouts||0).toLocaleString('en-IN')}`} />
              <Row label="Balance"        value={`₹ ${(partner.balance||0).toLocaleString('en-IN')}`} highlight />
            </Sec>
          </>
        )}
        {tab === 'performance' && (
          <Sec title="Performance Metrics">
            <Row label="Rating"          value={partner.rating > 0 ? `★ ${partner.rating}` : '—'} />
            <Row label="Total Ratings"   value={partner.ratings || '—'} />
            <Row label="Bookings"        value={partner.bookings || 0} />
            <Row label="Revenue"         value={`₹ ${(partner.revenue||0).toLocaleString('en-IN')}`} />
            <Row label="Completion Rate" value={partner.bookings > 0 ? '94.5%' : '—'} />
          </Sec>
        )}
        {tab === 'settlement' && (
          <Sec title="Settlement Summary">
            <Row label="Total Earned" value={`₹ ${(partner.revenue||0).toLocaleString('en-IN')}`} />
            <Row label="Paid Out"     value={`₹ ${(partner.payouts||0).toLocaleString('en-IN')}`} />
            <Row label="Pending"      value={`₹ ${(partner.balance||0).toLocaleString('en-IN')}`} highlight />
            <Row label="Last Payout"  value="01 Jun 2025" />
          </Sec>
        )}
        {tab === 'documents' && (
          <div>
            {['GST Certificate','Agreement Copy','ID Proof','Business License'].map(doc => (
              <div key={doc} style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>📄</span>
                  <span style={{ fontSize:13 }}>{doc}</span>
                </div>
                <button style={{ fontSize:11, fontWeight:600, color:'var(--accent)',
                  background:'#eff6ff', border:'1px solid #bfdbfe',
                  borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>View</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)' }}>
        <button style={{ width:'100%', padding:'10px', background:'var(--accent)', border:'none',
          borderRadius:'var(--radius)', fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer' }}>
          View Full Profile
        </button>
      </div>
    </div>
  )
}

function Sec({ title, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', textTransform:'uppercase',
        letterSpacing:'.04em', marginBottom:8, paddingBottom:4, borderBottom:'1px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
function Row({ label, value, small, highlight }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      padding:'5px 0', gap:8 }}>
      <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:small?11:13, fontWeight:600, textAlign:'right',
        color:highlight?'var(--accent)':'var(--text)' }}>{value}</span>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — All NCSP Partners
// ─────────────────────────────────────────────────────────────────────────────
function AllPartners() {
  const w = useWindowWidth()
  const isMobile = w <= 768

  const [partners,  setPartners]  = useState([])
  const [meta,      setMeta]      = useState({ total:0, pages:1 })
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [statusF,   setStatusF]   = useState('')
  const [cityF,     setCityF]     = useState('')
  const [regionF,   setRegionF]   = useState('')
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const perPage = 10

  const [q, setQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true); setError('')
    adminAPI.getUsers({ page, limit:perPage, role:'NC',
      ...(q&&{search:q}), ...(statusF&&{status:statusF}) })
      .then(res => {
        const data = res.data?.data || []
        setPartners(data.length > 0 ? data : MOCK)
        setMeta(res.data?.meta || { total:MOCK.length, pages:1 })
      })
      .catch(() => { setPartners(MOCK); setMeta({ total:MOCK.length, pages:1 }) })
      .finally(() => setLoading(false))
  }, [page, q, statusF])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q, statusF])

  const display = partners.filter(p => {
    const sq = search.toLowerCase()
    return (
      (!sq || (p.name||'').toLowerCase().includes(sq) || (p.partnerId||'').toLowerCase().includes(sq)
           || (p.mobileNo||'').includes(sq) || (p.email||'').toLowerCase().includes(sq))
      && (!cityF   || (p.city||'')===cityF)
      && (!regionF || (p.region||'')===regionF)
    )
  })

  const total    = meta.total || MOCK.length
  const active   = MOCK.filter(f=>f.status==='Active').length
  const pending  = MOCK.filter(f=>f.status==='Pending').length
  const inactive = MOCK.filter(f=>f.status==='Inactive').length
  const revenue  = MOCK.reduce((s,f)=>s+f.revenue,0)
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
          <KpiCard icon="🤝" iconBg="#eff6ff" label="Total NCSP Partners" value={total}   sub="↑ 7.7% vs last month" subColor="#16a34a" />
          <KpiCard icon="✅" iconBg="#f0fdf4" label="Active Partners"     value={active}  sub={`${((active/total)*100).toFixed(1)}% of total`} />
          <KpiCard icon="⏳" iconBg="#fff7ed" label="Pending Approvals"   value={pending} sub={`${((pending/total)*100).toFixed(1)}% of total`} subColor="#d97706" />
          <KpiCard icon="❌" iconBg="#fef2f2" label="Inactive Partners"   value={inactive}sub={`${((inactive/total)*100).toFixed(1)}% of total`} subColor="#dc2626" />
          <KpiCard icon="₹" iconBg="#f0fdfa" label="This Month Revenue"  value={fmt(revenue)} sub="↑ 15.4% vs last month" subColor="#16a34a" />
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
                <input type="text" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
                  placeholder="Partner name, code, email or mobile…"
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
                  color:'#fff', cursor:'pointer' }}>+ Add NCSP Partner</button>
            </div>
          </div>
        </div>

        {showAdd && <AddNCSPModal onClose={()=>setShowAdd(false)} onSuccess={load} />}

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius:'var(--radius)', padding:'12px 16px', fontSize:13,
            color:'#dc2626', marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
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
                  {['Partner ID','Partner Name','Contact','City','Region','Status','Onboarded On','Revenue (This Month)','Actions'].map(h => (
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                      fontSize:11, fontWeight:600, color:'var(--text3)',
                      textTransform:'uppercase', letterSpacing:'.04em',
                      borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(perPage)].map((_,i)=><SkeletonRow key={i} cols={9} />)
                  : display.length === 0
                  ? <tr><td colSpan={9} style={{ padding:48, textAlign:'center', color:'var(--text3)', fontSize:13 }}>No NCSP partners found</td></tr>
                  : display.map((p, i) => {
                    const pid    = p._id || p.id
                    const status = p.status || (p.isActive ? 'Active' : 'Inactive')
                    return (
                      <tr key={pid}
                        style={{ borderBottom:i<display.length-1?'1px solid var(--border)':'none',
                          background:selected?._id===pid?'#f0f7ff':'transparent' }}
                        onMouseEnter={e=>{if(selected?._id!==pid)e.currentTarget.style.background='#f8fafc'}}
                        onMouseLeave={e=>{if(selected?._id!==pid)e.currentTarget.style.background='transparent'}}>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)', cursor:'pointer' }}
                            onClick={()=>setSelected(p)}>
                            {p.partnerId || pid?.slice(-8)?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <NCSPLogo name={p.name} id={pid} />
                            <span style={{ fontSize:13, fontWeight:500 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ fontSize:13 }}>{p.mobileNo || p.mobile || '—'}</div>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{p.email || '—'}</div>
                        </td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{p.city || '—'}</td>
                        <td style={{ padding:'12px 14px', fontSize:13 }}>{p.region || '—'}</td>
                        <td style={{ padding:'12px 14px' }}><Badge status={status} /></td>
                        <td style={{ padding:'12px 14px', fontSize:12, whiteSpace:'nowrap' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                        </td>
                        <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>
                          {(p.revenue||0) > 0 ? `₹ ${(p.revenue||0).toLocaleString('en-IN')}` : <span style={{ color:'var(--text3)' }}>₹ 0</span>}
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <div style={{ display:'flex', gap:5 }}>
                            <button title="View" onClick={()=>setSelected(p)} style={actBtn}>👁</button>
                            <button title="Edit" style={actBtn}>✏️</button>
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
              Showing {Math.min((page-1)*perPage+1,display.length)}–{Math.min(page*perPage,display.length)} of {total} partners
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

      {selected && <DetailPanel partner={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Partner Approvals
// ─────────────────────────────────────────────────────────────────────────────
function PartnerApprovals() {
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [actionId,  setActionId]  = useState(null)

  const load = useCallback(() => {
    setLoading(true); setError('')
    adminAPI.getNCSPPending()
      .then(res => {
        const data = res.data?.data || []
        setRequests(data.length > 0 ? data : MOCK_PENDING)
      })
      .catch(() => setRequests(MOCK_PENDING))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (id, action) => {
    setActionId(id)
    try {
      if (action === 'Approved') await adminAPI.approveNCSP(id)
      else                       await adminAPI.rejectNCSP(id)
      load()
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action.toLowerCase()}`)
    } finally {
      setActionId(null)
    }
  }

  const pending  = requests.filter(r=>(r.approvalStatus||r.status)==='Pending'||(!r.status&&!r.approvalStatus)).length
  const approved = requests.filter(r=>(r.approvalStatus||r.status)==='Approved').length
  const rejected = requests.filter(r=>(r.approvalStatus||r.status)==='Rejected').length

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <KpiCard icon="📥" iconBg="#fff7ed" label="Pending"  value={pending}  sub="Awaiting action"  subColor="#d97706" />
        <KpiCard icon="✅" iconBg="#f0fdf4" label="Approved" value={approved} sub="This month" />
        <KpiCard icon="❌" iconBg="#fef2f2" label="Rejected" value={rejected} sub="This month"       subColor="#dc2626" />
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius)',
          padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:16,
          display:'flex', alignItems:'center', gap:10 }}>
          ⚠ {error}
          <button onClick={load} style={{ fontSize:12, color:'#dc2626', background:'none',
            border:'1px solid #fecaca', borderRadius:4, padding:'2px 8px', cursor:'pointer' }}>Retry</button>
        </div>
      )}

      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:14, fontWeight:700 }}>
          NCSP Partner Applications
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ID / Code','Partner Name','Mobile','City','Region','Submitted On','Status','Actions'].map(h=>(
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
                ? <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:'var(--text3)', fontSize:13 }}>No pending applications</td></tr>
                : requests.map((r,i)=>{
                  const rid    = r._id || r.id
                  const rname  = r.businessName || r.name || '—'
                  const rmob   = r.mobileNo || r.mobile || '—'
                  const rcity  = r.city   || '—'
                  const rreg   = r.region || '—'
                  const rdate  = r.createdAt || r.submittedOn
                  const rstatus = r.approvalStatus || r.status || 'Pending'
                  const isLoading = actionId === rid
                  return (
                    <tr key={rid}
                      style={{ borderBottom:i<requests.length-1?'1px solid var(--border)':'none' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'var(--accent)' }}>
                        {r.partnerId || rid?.slice(-8)?.toUpperCase() || '—'}
                      </td>
                      <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <NCSPLogo name={rname} id={rid} />
                          <span style={{ fontSize:13, fontWeight:500 }}>{rname}</span>
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
                        {(rstatus==='Pending'||rstatus==='pending') ? (
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={()=>handleAction(rid,'Approved')} disabled={isLoading}
                              style={{ padding:'5px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0',
                                borderRadius:6, fontSize:11, fontWeight:600, color:'#16a34a',
                                cursor:'pointer', opacity:isLoading?.6:1 }}>
                              {isLoading?'…':'✓ Approve'}
                            </button>
                            <button onClick={()=>handleAction(rid,'Rejected')} disabled={isLoading}
                              style={{ padding:'5px 10px', background:'#fef2f2', border:'1px solid #fecaca',
                                borderRadius:6, fontSize:11, fontWeight:600, color:'#dc2626',
                                cursor:'pointer', opacity:isLoading?.6:1 }}>
                              {isLoading?'…':'✕ Reject'}
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
                })}
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
  const sorted = [...MOCK].sort((a,b)=>b.revenue-a.revenue)
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <KpiCard icon="📈" iconBg="#eff6ff" label="Top Revenue"   value={fmt(sorted[0]?.revenue||0)} sub={sorted[0]?.name} />
        <KpiCard icon="⭐" iconBg="#fff7ed" label="Top Rated"     value={`★ ${Math.max(...MOCK.map(f=>f.rating||0))}`} sub={MOCK.find(f=>f.rating===Math.max(...MOCK.map(x=>x.rating||0)))?.name} />
        <KpiCard icon="📦" iconBg="#f0fdf4" label="Most Bookings" value={Math.max(...MOCK.map(f=>f.bookings))} sub={MOCK.find(f=>f.bookings===Math.max(...MOCK.map(x=>x.bookings)))?.name} />
      </div>

      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:14, fontWeight:700 }}>
          NCSP Partner Performance Rankings
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:650 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Rank','Partner','City','Bookings','Revenue','Rating','Status'].map(h=>(
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11,
                    fontWeight:600, color:'var(--text3)', textTransform:'uppercase',
                    letterSpacing:'.04em', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p,i)=>(
                <tr key={p._id}
                  style={{ borderBottom:i<sorted.length-1?'1px solid var(--border)':'none' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ width:26, height:26, borderRadius:'50%', display:'inline-flex',
                      alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700,
                      background:i===0?'#fef9c3':i===1?'#f1f5f9':i===2?'#fef3c7':'#f8fafc',
                      color:i===0?'#d97706':i===1?'#64748b':i===2?'#92400e':'var(--text3)' }}>
                      {i+1}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <NCSPLogo name={p.name} id={p._id} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{p.partnerId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13 }}>{p.city}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>{p.bookings}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600 }}>
                    {p.revenue>0?`₹ ${p.revenue.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13 }}>
                    {p.rating>0?<span style={{ color:'#d97706', fontWeight:600 }}>★ {p.rating}</span>:'—'}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <Badge status={p.status} />
                  </td>
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
const lbl = { fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }
const actBtn = { background:'none', border:'1px solid var(--border)', borderRadius:6, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13 }
const pgBtn  = { width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', borderRadius:6, fontSize:13, cursor:'pointer', background:'transparent', color:'var(--text)' }
const lbStyle  = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }
const inStyle  = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #d1d5db', borderRadius:8, outline:'none', boxSizing:'border-box', color:'#0f172a', background:'#fff' }
const secStyle = { fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border)' }

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NCSPPartners() {
  const [activeTab, setActiveTab] = useState('all')

  const TABS = [
    { key:'all',         label:'All NCSP Partners'  },
    { key:'approvals',   label:'Partner Approvals', badge: MOCK_PENDING.length },
    { key:'performance', label:'Performance'        },
    { key:'settlement',  label:'Settlement'         },
  ]

  return (
    <div style={{ maxWidth:1400 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'var(--text)' }}>
          NCSP Partner Management
        </h1>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
          Dashboard › NCSP Partners › {TABS.find(t=>t.key===activeTab)?.label}
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
            {t.badge > 0 && (
              <span style={{ marginLeft:6, background:'#fef3c7', color:'#d97706',
                fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'all'         && <AllPartners />}
      {activeTab === 'approvals'   && <PartnerApprovals />}
      {activeTab === 'performance' && <Performance />}
      {activeTab === 'settlement'  && (
        <div style={{ padding:48, textAlign:'center', color:'var(--text3)',
          background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
          Settlement module — coming soon
        </div>
      )}
    </div>
  )
}