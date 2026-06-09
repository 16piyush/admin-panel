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
const MOCK_ALL = [
  { _id:'1',  regId:'REG-CL-10234', role:'CL', name:'Ramesh Kumar',    business:'Individual',     mobile:'+91 98765 43210', email:'ramesh.kumar@email.com',  location:'Green View Heights', city:'Bangalore', submittedOn:'2025-05-24T10:15:00', docs:5, totalDocs:6, status:'Pending'  },
  { _id:'2',  regId:'REG-SU-10187', role:'SU', name:'Suresh Yadav',    business:'Individual',     mobile:'+91 87654 32109', email:'suresh.yadav@email.com',   location:'Skyline Residency',  city:'Bangalore', submittedOn:'2025-05-24T09:45:00', docs:6, totalDocs:6, status:'Pending'  },
  { _id:'3',  regId:'REG-NC-10876', role:'NC', name:'Shine Auto Care', business:'Company',        mobile:'+91 99876 54321', email:'info@shineauto.com',       location:'HSR Layout',         city:'Bangalore', submittedOn:'2025-05-24T09:30:00', docs:7, totalDocs:7, status:'Pending'  },
  { _id:'4',  regId:'REG-FR-10565', role:'FR', name:'Speed Auto Care', business:'Company',        mobile:'+91 90123 45678', email:'contact@speedauto.com',    location:'Koramangala',        city:'Bangalore', submittedOn:'2025-05-24T09:10:00', docs:8, totalDocs:8, status:'Pending'  },
  { _id:'5',  regId:'REG-FS-10456', role:'FS', name:'Aqua Steam Wash', business:'Company',        mobile:'+91 78945 61230', email:'info@aquasteam.com',       location:'Whitefield',         city:'Bangalore', submittedOn:'2025-05-24T08:50:00', docs:6, totalDocs:7, status:'Pending'  },
  { _id:'6',  regId:'REG-CL-10233', role:'CL', name:'Vikram Singh',    business:'Individual',     mobile:'+91 76543 21098', email:'vikram.singh@email.com',   location:'Sunrise Apartments', city:'Bangalore', submittedOn:'2025-05-24T08:20:00', docs:4, totalDocs:6, status:'Pending'  },
  { _id:'7',  regId:'REG-NC-10875', role:'NC', name:'Tyre Experts',    business:'Company',        mobile:'+91 81234 56789', email:'hello@tyreexperts.com',    location:'Jayanagar',          city:'Bangalore', submittedOn:'2025-05-23T19:15:00', docs:6, totalDocs:7, status:'Pending'  },
  { _id:'8',  regId:'REG-SU-10186', role:'SU', name:'Anita Devi',      business:'Individual',     mobile:'+91 95432 10987', email:'anita.devi@email.com',     location:'Lake View Towers',   city:'Bangalore', submittedOn:'2025-05-23T18:45:00', docs:5, totalDocs:6, status:'Pending'  },
  { _id:'9',  regId:'REG-CL-10232', role:'CL', name:'Pooja Sharma',    business:'Individual',     mobile:'+91 65432 10987', email:'pooja.sharma@email.com',   location:'Green View Heights', city:'Bangalore', submittedOn:'2025-05-23T17:30:00', docs:3, totalDocs:6, status:'Pending'  },
  { _id:'10', regId:'REG-FR-10564', role:'FR', name:'QuickFix Auto',   business:'Company',        mobile:'+91 74321 09876', email:'info@quickfix.com',        location:'Electronic City',    city:'Bangalore', submittedOn:'2025-05-23T16:00:00', docs:8, totalDocs:8, status:'Pending'  },
  // Approved
  { _id:'11', regId:'REG-CL-10231', role:'CL', name:'Manoj Kumar',     business:'Individual',     mobile:'+91 93210 98765', email:'manoj.kumar@email.com',    location:'BTM Layout',         city:'Bangalore', submittedOn:'2025-05-22T10:00:00', docs:6, totalDocs:6, status:'Approved' },
  { _id:'12', regId:'REG-NC-10874', role:'NC', name:'AutoCare Pro',    business:'Company',        mobile:'+91 82109 87654', email:'info@autocare.com',        location:'Indiranagar',        city:'Bangalore', submittedOn:'2025-05-22T09:00:00', docs:7, totalDocs:7, status:'Approved' },
  // Rejected
  { _id:'13', regId:'REG-CL-10230', role:'CL', name:'Deepak Yadav',    business:'Individual',     mobile:'+91 71098 76543', email:'deepak.yadav@email.com',   location:'Marathahalli',       city:'Bangalore', submittedOn:'2025-05-21T11:00:00', docs:2, totalDocs:6, status:'Rejected' },
]

const ROLE_LABEL = { CL:'Car Cleaner', SU:'Supervisor', NC:'NCSP Partner', FR:'Franchise (CSP)', FS:'Steam Wash' }
const ROLE_COLOR = { CL:'#2563eb', SU:'#059669', NC:'#7c3aed', FR:'#d97706', FS:'#0891b2' }
const ROLE_BG    = { CL:'#eff6ff', SU:'#f0fdf4', NC:'#fdf4ff', FR:'#fff7ed', FS:'#f0fdfa' }
const ROLE_ICON  = { CL:'🧹', SU:'👮', NC:'🏢', FR:'🏪', FS:'🚿' }

// ── Partner Type Badge ────────────────────────────────────────────────────────
function TypeBadge({ role }) {
  return (
    <span style={{ background:ROLE_BG[role]||'#f1f5f9', color:ROLE_COLOR[role]||'#64748b',
      fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
      {ROLE_LABEL[role] || role}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    Pending:  { bg:'#fff7ed', color:'#d97706' },
    Approved: { bg:'#dcfce7', color:'#16a34a' },
    Rejected: { bg:'#fee2e2', color:'#dc2626' },
  }
  const s = map[status] || { bg:'#f1f5f9', color:'#64748b' }
  return <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:600,
    padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{status}</span>
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, label, value, sub }) {
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)', padding:'16px 18px',
      boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:iconBg, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
        {icon}
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)',
          textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--text)', lineHeight:1, marginBottom:2 }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>{sub}</div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow({ cols }) {
  return (
    <tr>
      {[...Array(cols)].map((_,i) => (
        <td key={i} style={{ padding:14, borderBottom:'1px solid var(--border)' }}>
          <div style={{ height:12, background:'#f1f5f9', borderRadius:4, width:i<2?100:'65%' }} />
        </td>
      ))}
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PartnerApprovals() {
  const w = useWindowWidth()
  const isMobile = w <= 768

  const [allData,   setAllData]   = useState(MOCK_ALL)
  const [loading,   setLoading]   = useState(true)
  const [actionId,  setActionId]  = useState(null)

  const [search,    setSearch]    = useState('')
  const [typeF,     setTypeF]     = useState('')
  const [statusF,   setStatusF]   = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page,      setPage]      = useState(1)
  const [dateF, setDateF] = useState('')
  const perPage = 10

  // Fetch all pending from all role types
  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      adminAPI.getUsers({ role:'CL', limit:100 }).catch(()=>null),
      adminAPI.getUsers({ role:'SU', limit:100 }).catch(()=>null),
      adminAPI.getUsers({ role:'NC', limit:100 }).catch(()=>null),
      adminAPI.getUsers({ role:'FR', limit:100 }).catch(()=>null),
      adminAPI.getUsers({ role:'FS', limit:100 }).catch(()=>null),
    ]).then(([cl, su, nc, fr, fs]) => {
      const merge = (res, role) =>
        (res?.data?.data || [])
          .filter(u => !u.isApproved || u.approvalStatus === 'Pending' || u.status === 'Pending')
          .map(u => ({ ...u, role, regId: u.partnerId || `REG-${role}-${u._id?.slice(-5)}` }))

      const combined = [
        ...merge(cl,'CL'), ...merge(su,'SU'),
        ...merge(nc,'NC'), ...merge(fr,'FR'), ...merge(fs,'FS'),
      ]
      if (combined.length > 0) setAllData(combined)
      else setAllData(MOCK_ALL)
    })
    .catch(() => setAllData(MOCK_ALL))
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (id, role, action) => {
    setActionId(id)
    try {
    if (action === 'Approved') {
  await adminAPI.approveUser(id, {})
} else {
  await adminAPI.rejectUser(id, {
    reason: 'Rejected by admin'
  })
}
      // Update local state immediately
      setAllData(prev => prev.map(p =>
        p._id === id ? { ...p, status: action, isApproved: action === 'Approved' } : p
      ))
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action.toLowerCase()}`)
    } finally {
      setActionId(null)
    }
  }

  // Tab filter
  const TAB_ROLE = { all:null, cleaners:'CL', supervisors:'SU', ncsp:'NC', franchise:'FR', steamwash:'FS' }

 const counts = {
  all: allData.length,
  cleaners: allData.filter(p => p.role === 'CL').length,
  supervisors: allData.filter(p => p.role === 'SU').length,
  ncsp: allData.filter(p => p.role === 'NC').length,
  franchise: allData.filter(p => p.role === 'FR').length,
  steamwash: allData.filter(p => p.role === 'FS').length,
}

const totalPending = allData.filter(p => p.status === 'pending_approval').length

  // Filter display data
  const filtered = allData.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || (p.name||'').toLowerCase().includes(q)
      || (p.mobile||p.mobileNo||'').includes(q)
      || (p.email||'').toLowerCase().includes(q)
      || (p.regId||'').toLowerCase().includes(q)
    const matchType   = !typeF   || p.role === typeF
    const matchStatus = !statusF || p.status === statusF || (statusF==='Pending' && !p.status)
    const matchDate = !dateF || ( (p.submittedOn || p.createdAt) && new Date(p.submittedOn || p.createdAt)
    .toISOString()
    .slice(0, 10) === dateF)
    const matchTab    = activeTab === 'all' || p.role === TAB_ROLE[activeTab]
   return matchSearch && matchType && matchStatus && matchDate && matchTab
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const rows = filtered.slice((page-1)*perPage, page*perPage)

  const TABS = [
    { key:'all',         label:`All Pending (${counts.all})`         },
    { key:'cleaners',    label:`Car Cleaners (${counts.cleaners})`    },
    { key:'supervisors', label:`Supervisors (${counts.supervisors})`  },
    { key:'ncsp',        label:`NCSP Partners (${counts.ncsp})`       },
    { key:'franchise',   label:`Franchise (CSP) (${counts.franchise})` },
    { key:'steamwash',   label:`Steam Wash (${counts.steamwash})`     },
  ]

  const sel = {
    padding:'8px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius)',
    fontSize:12, color:'var(--text)', background:'#fff', cursor:'pointer', outline:'none',
  }

  return (
    <div style={{ maxWidth:1400 }}>
      {/* Page header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'var(--text)' }}>
          Partner Approval Center
        </h1>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
          Dashboard › Partner Approvals › Pending Approvals
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid',
        gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(6,1fr)',
        gap:12, marginBottom:20 }}>
        <KpiCard icon="👥" iconBg="#eff6ff" label="Total Pending"    value={totalPending} sub="All partner registrations" />
        <KpiCard icon="🧹" iconBg={ROLE_BG.CL} label="Car Cleaners"  value={counts.cleaners}    sub={`${totalPending?((counts.cleaners/totalPending)*100).toFixed(1):0}% of total`} />
        <KpiCard icon="👮" iconBg={ROLE_BG.SU} label="Supervisors"   value={counts.supervisors} sub={`${totalPending?((counts.supervisors/totalPending)*100).toFixed(1):0}% of total`} />
        <KpiCard icon="🏢" iconBg={ROLE_BG.NC} label="NCSP Partners" value={counts.ncsp}        sub={`${totalPending?((counts.ncsp/totalPending)*100).toFixed(1):0}% of total`} />
        <KpiCard icon="🏪" iconBg={ROLE_BG.FR} label="Franchise (CSP)" value={counts.franchise} sub={`${totalPending?((counts.franchise/totalPending)*100).toFixed(1):0}% of total`} />
        <KpiCard icon="🚿" iconBg={ROLE_BG.FS} label="Steam Wash"    value={counts.steamwash}   sub={`${totalPending?((counts.steamwash/totalPending)*100).toFixed(1):0}% of total`} />
      </div>

      {/* Search + Filters */}
      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'14px 16px',
        boxShadow:'var(--shadow)', marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:9, top:'50%',
                transform:'translateY(-50%)', color:'var(--text3)', fontSize:13 }}>🔍</span>
              <input type="text" value={search}
                onChange={e=>{setSearch(e.target.value);setPage(1)}}
                placeholder="Search by name, mobile, email or registration ID…"
                style={{ width:'100%', padding:'9px 10px 9px 30px', fontSize:12,
                  border:'1px solid var(--border)', borderRadius:'var(--radius)',
                  outline:'none', boxSizing:'border-box', color:'var(--text)' }} />
            </div>
          </div>
          <div>
            <div style={lbl}>Partner Type</div>
            <select value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1)}} style={sel}>
              <option value="">All Types</option>
              <option value="CL">Car Cleaner</option>
              <option value="SU">Supervisor</option>
              <option value="NC">NCSP Partner</option>
              <option value="FR">Franchise (CSP)</option>
              <option value="FS">Steam Wash</option>
            </select>
          </div>
          <div>
            <div style={lbl}>Status</div>
            <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}} style={sel}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <div style={lbl}>Submitted On</div>
            <input type="date" value={dateF} onChange={e => {
            setDateF(e.target.value)
            setPage(1)
           }}
           style={{ ...sel, color:'var(--text2)' }}/>
          </div>
          <button onClick={()=>{setSearch('');setTypeF('');setStatusF('')}}
            style={{ padding:'9px 14px', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', background:'#fff',
              fontSize:12, cursor:'pointer', color:'var(--text2)', alignSelf:'flex-end' }}>
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:0,
        borderBottom:'2px solid var(--border)', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>{setActiveTab(t.key);setPage(1)}}
            style={{ padding:'10px 18px', border:'none', borderBottom:'2px solid transparent',
              marginBottom:-2, background:'transparent', fontSize:13, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              color:           activeTab===t.key ? 'var(--accent)' : 'var(--text2)',
              borderBottomColor: activeTab===t.key ? 'var(--accent)' : 'transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderTop:'none', borderRadius:'0 0 var(--radius-lg) var(--radius-lg)',
        boxShadow:'var(--shadow)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Registration ID','Partner Type','Name / Business','Mobile / Email',
                  'Location','Submitted On','Documents','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 14px', textAlign:'left',
                    fontSize:11, fontWeight:600, color:'var(--text3)',
                    textTransform:'uppercase', letterSpacing:'.04em',
                    borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_,i) => <SkeletonRow key={i} cols={9} />)
                : rows.length === 0
                ? <tr><td colSpan={9} style={{ padding:48, textAlign:'center',
                    color:'var(--text3)', fontSize:13 }}>No registrations found</td></tr>
                : rows.map((p, i) => {
                  const pid      = p._id || p.id
                  const name     = p.name || p.businessName || '—'
                  const business = p.business || (p.role==='CL'||p.role==='SU' ? 'Individual' : 'Company')
                  const mobile   = p.mobileNo || p.mobile || '—'
                  const email    = p.email || '—'
                  const location = p.location || p.apartment?.name || '—'
                  const city     = p.city || '—'
                  const date     = p.submittedOn || p.createdAt
                  const status   = p.status || 'Pending'
                  const isLoading = actionId === pid

                  return (
                    <tr key={pid}
                      style={{ borderBottom: i<rows.length-1?'1px solid var(--border)':'none' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                      {/* Reg ID */}
                      <td style={{ padding:'13px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                            background:ROLE_BG[p.role]||'#f1f5f9',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                            {ROLE_ICON[p.role]||'👤'}
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)', whiteSpace:'nowrap' }}>
                            {p.regId || pid?.slice(-8)?.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Partner Type */}
                      <td style={{ padding:'13px 14px' }}>
                        <TypeBadge role={p.role} />
                      </td>

                      {/* Name / Business */}
                      <td style={{ padding:'13px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{business}</div>
                      </td>

                      {/* Mobile / Email */}
                      <td style={{ padding:'13px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:13 }}>{mobile}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{email}</div>
                      </td>

                      {/* Location */}
                      <td style={{ padding:'13px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:13 }}>{location}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{city}</div>
                      </td>

                      {/* Submitted On */}
                      <td style={{ padding:'13px 14px', whiteSpace:'nowrap' }}>
                        <div style={{ fontSize:12 }}>
                          {date ? new Date(date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>
                          {date ? new Date(date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : ''}
                        </div>
                      </td>

                      {/* Documents */}
                      <td style={{ padding:'13px 14px', textAlign:'center' }}>
                        <span style={{
                          fontSize:12, fontWeight:700,
                          color: p.docs < p.totalDocs ? '#ea580c' : '#16a34a',
                          background: p.docs < p.totalDocs ? '#fff7ed' : '#f0fdf4',
                          padding:'3px 10px', borderRadius:20,
                        }}>
                          {p.docs || 0}/{p.totalDocs || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding:'13px 14px' }}>
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding:'13px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          {/* View */}
                          <button title="View Details"
                            style={{ ...iBtn, color:'var(--text2)' }}>👁</button>

                          {/* Approve — show for pending/unverified/not approved */}
                          <button title="Approve"
                            onClick={()=>handleAction(pid, p.role, 'Approved')}
                            disabled={isLoading}
                            style={{ ...iBtn, color:'#16a34a', background:'#f0fdf4',
                              border:'1px solid #bbf7d0', opacity:isLoading?.5:1 }}>
                            {isLoading ? '…' : '✓'}
                          </button>

                          {/* Reject */}
                          <button title="Reject"
                            onClick={()=>handleAction(pid, p.role, 'Rejected')}
                            disabled={isLoading}
                            style={{ ...iBtn, color:'#dc2626', background:'#fef2f2',
                              border:'1px solid #fecaca', opacity:isLoading?.5:1 }}>
                            {isLoading ? '…' : '✕'}
                          </button>

                          {/* More */}
                          <button title="More" style={{ ...iBtn, color:'var(--text2)' }}>⋯</button>
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
            Showing {Math.min((page-1)*perPage+1, filtered.length)}–{Math.min(page*perPage, filtered.length)} of {filtered.length} pending registrations
          </span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ ...pgBtn, opacity:page===1?.4:1 }}>‹</button>
            {[...Array(Math.min(totalPages,5))].map((_,i)=>(
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
            <option>10 / page</option><option>25 / page</option><option>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const lbl   = { fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }
const iBtn  = { width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', borderRadius:6, cursor:'pointer', fontSize:13, background:'none' }
const pgBtn = { width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', borderRadius:6, fontSize:13, cursor:'pointer', background:'transparent', color:'var(--text)' }