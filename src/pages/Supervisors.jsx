// src/pages/Surpervisors.jsx
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'

const STATUS_STYLE = {
  active:           { bg:'#dcfce7', color:'#16a34a', label:'Active'   },
  pending_approval: { bg:'#fef9c3', color:'#ca8a04', label:'Pending'  },
  rejected:         { bg:'#fee2e2', color:'#dc2626', label:'Rejected' },
  inactive:         { bg:'#f1f5f9', color:'#64748b', label:'Inactive' },
}

// ── Add Supervisor Modal ──────────────────────────────────────────────────────
function AddSupervisorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:'', mobileNo:'', email:'', password:''
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const handleSubmit = async () => {
    if (!form.name)                                    return setError('Name is required')
    if (!form.mobileNo || form.mobileNo.length !== 10) return setError('Valid 10-digit mobile required')
    if (!form.password || form.password.length < 6)    return setError('Password min 6 characters')
    setLoading(true); setError('')
    try {
      await adminAPI.createInternal({
        name: form.name, mobile: form.mobileNo,
        email: form.email, password: form.password, role:'SU',
      })
      onSuccess(); onClose()
    } catch(e) {
      setError(e.response?.data?.message || 'Failed to create supervisor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:300, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:480,
        boxShadow:'0 20px 60px rgba(0,0,0,.15)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700 }}>Add New Supervisor</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>
              Credentials will be shared with the supervisor
            </div>
          </div>
          <button onClick={onClose} style={{ background:'var(--bg3)',
            border:'1px solid var(--border)', borderRadius:8,
            width:32, height:32, fontSize:16, color:'var(--text2)' }}>✕</button>
        </div>
        <div style={{ padding:'24px' }}>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:'var(--radius)', padding:'10px 14px',
              fontSize:13, color:'var(--red)', marginBottom:16 }}>⚠ {error}</div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              ['Full Name',      'name',     'text',     'e.g. Suresh Yadav',  true ],
              ['Mobile Number',  'mobileNo', 'tel',      '10-digit mobile',    true ],
              ['Email',          'email',    'email',    'email@example.com',  false],
              ['Password',       'password', 'password', 'Min 6 characters',   true ],
            ].map(([label,key,type,ph,req]) => (
              <div key={key}>
                <label style={{ fontSize:12, fontWeight:600, display:'block',
                  marginBottom:6, color:'var(--text)' }}>
                  {label}{req && <span style={{ color:'var(--red)', marginLeft:3 }}>*</span>}
                </label>
                <input type={type} placeholder={ph} value={form[key]}
                  maxLength={key==='mobileNo' ? 10 : undefined}
                  onChange={e => set(key, key==='mobileNo'
                    ? e.target.value.replace(/\D/g,'') : e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'10px 14px',
            background:'#eff6ff', borderRadius:'var(--radius)',
            fontSize:12, color:'#1d4ed8' }}>
            ℹ Supervisor (SU) role — can manage cleaners, QR onboarding, work approvals
          </div>
        </div>
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)',
          display:'flex', gap:10, justifyContent:'flex-end', background:'var(--bg3)' }}>
          <button onClick={onClose}
            style={{ padding:'9px 20px', fontSize:13, background:'#fff',
              border:'1px solid var(--border)', color:'var(--text2)',
              borderRadius:'var(--radius)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding:'9px 24px', fontSize:13, fontWeight:600,
              background:'var(--accent)', color:'#fff',
              borderRadius:'var(--radius)', opacity: loading ? .7:1 }}>
            {loading ? 'Creating...' : '+ Add Supervisor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Side Panel ────────────────────────────────────────────────────────────────
function SupervisorPanel({ supervisor, onClose, onAction }) {
  const [tab,    setTab]    = useState('profile')
  const [acting, setActing] = useState(false)

  const toggle = async () => {
    setActing(true)
    try {
      if (supervisor.status === 'active') await adminAPI.deactivateUser(supervisor._id)
      else                                await adminAPI.activateUser(supervisor._id)
      onAction()
    } catch(e) { alert(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const st = STATUS_STYLE[supervisor.status] || STATUS_STYLE.inactive

  return (
    <div style={{ width:340, background:'#fff', borderLeft:'1px solid var(--border)',
      display:'flex', flexDirection:'column', flexShrink:0,
      height:'100%', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:700 }}>Supervisor Details</div>
        <button onClick={onClose} style={{ background:'transparent',
          color:'var(--text3)', fontSize:18, padding:'0 4px' }}>✕</button>
      </div>

      {/* Identity */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
        flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ width:52, height:52, borderRadius:'50%',
            background:'#eff6ff', border:'2px solid #bfdbfe',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
            {supervisor.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700 }}>{supervisor.name}</div>
            <div style={{ fontSize:12, color:'var(--text3)',
              fontFamily:'var(--mono)' }}>
              {supervisor.partnerId || 'Pending ID'}
            </div>
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>
              Supervisor
            </div>
          </div>
          <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px',
            borderRadius:20, background:st.bg, color:st.color, flexShrink:0 }}>
            {st.label}
          </span>
        </div>
        <div style={{ fontSize:12, color:'#f59e0b' }}>
          ★ {supervisor.rating?.toFixed(1) || '4.7'} <span style={{ color:'var(--text3)' }}>(256 Ratings)</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {['profile','apartments','cleaners','performance'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'9px 2px', fontSize:10, fontWeight:500,
              background:'transparent', textTransform:'capitalize',
              color: tab===t ? 'var(--accent)' : 'var(--text3)',
              borderBottom: tab===t ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius:0 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
        {tab === 'profile' ? (
          <>
            <SectionBlock title="Personal Information">
              {[
                ['Mobile Number', supervisor.mobileNo || supervisor.mobile],
                ['Email',         supervisor.email || '—'],
                ['Date of Birth', '—'],
                ['Address',       '—'],
              ].map(([l,v]) => <InfoRow key={l} label={l} value={v} />)}
            </SectionBlock>

            <SectionBlock title="Work Information">
              {[
                ['Joining Date',       supervisor.createdAt
                  ? new Date(supervisor.createdAt).toLocaleDateString('en-IN') : '—'],
                ['Region',             '—'],
                ['Total Apartments',   supervisor.apartmentsCount ?? '—'],
                ['Total Cleaners',     supervisor.cleanersCount ?? '—'],
                ['QR Codes Issued',    '—'],
                ['QR Codes Available', '—'],
              ].map(([l,v]) => <InfoRow key={l} label={l} value={v} />)}
            </SectionBlock>

            <SectionBlock title="Performance (This Month)">
              {[
                ['Work Approvals',  '—'],
                ['Rejections',      '—'],
                ['Completion Rate', '—'],
                ['Average Rating',  supervisor.rating?.toFixed(1) || '—'],
              ].map(([l,v]) => <InfoRow key={l} label={l} value={v} />)}
            </SectionBlock>
          </>
        ) : (
          <div style={{ color:'var(--text3)', fontSize:13, textAlign:'center',
            padding:'32px 0' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} details coming in Phase 8
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)',
        display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        <button style={{ width:'100%', padding:'9px', fontWeight:600,
          fontSize:13, background:'var(--accent)', color:'#fff',
          borderRadius:'var(--radius)' }}>
          View Full Profile
        </button>
        <button onClick={toggle} disabled={acting}
          style={{ width:'100%', padding:'9px', fontWeight:600, fontSize:13,
            background: supervisor.status === 'active'
              ? 'rgba(239,68,68,.08)' : 'rgba(22,163,74,.08)',
            color: supervisor.status === 'active' ? 'var(--red)' : 'var(--green)',
            border:`1px solid ${supervisor.status === 'active'
              ? 'rgba(239,68,68,.2)' : 'rgba(22,163,74,.2)'}`,
            borderRadius:'var(--radius)', opacity: acting ? .6:1 }}>
          {acting ? 'Processing...'
            : supervisor.status === 'active' ? 'Suspend Supervisor' : 'Activate Supervisor'}
        </button>
      </div>
    </div>
  )
}

function SectionBlock({ title, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase',
        letterSpacing:'.05em', color:'var(--text2)', marginBottom:8 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between',
      marginBottom:7, fontSize:13 }}>
      <span style={{ color:'var(--text2)', flexShrink:0, marginRight:8 }}>{label}</span>
      <span style={{ fontWeight:500, textAlign:'right',
        wordBreak:'break-all' }}>{value || '—'}</span>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Supervisors() {
  const [supervisors, setSupervisors] = useState([])
  const [meta,        setMeta]        = useState({})
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [status,      setStatus]      = useState('')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const LIMIT = 10

  const load = useCallback(() => {
    setLoading(true)
    const params = { role:'SU', page, limit:LIMIT }
    if (search) params.search = search
    if (status) params.status = status
    adminAPI.getUsers(params)
      .then(r => {
        setSupervisors(Array.isArray(r.data.data) ? r.data.data : [])
        setMeta(r.data.meta || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  const total    = meta.total || 0
  const active   = supervisors.filter(s => s.status === 'active').length
  const inactive = supervisors.filter(s => s.status === 'inactive').length
  const pending  = supervisors.filter(s => s.status === 'pending_approval').length

  return (
    <div style={{ display:'flex', height:'calc(100vh - 104px)', overflow:'hidden' }}>

      {/* Main */}
      <div style={{ flex:1, overflow:'auto', padding:20 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8,
              fontSize:12, color:'var(--text3)', marginBottom:4, flexWrap:'wrap' }}>
              <a href="/dashboard" style={{ color:'var(--text3)' }}>Dashboard</a>
              <span>›</span><span>Supervisors</span><span>›</span>
              <span style={{ color:'var(--text)' }}>All Supervisors</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:700 }}>Supervisor Management</h1>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ display:'flex', alignItems:'center', gap:6,
              padding:'9px 16px', background:'#fff',
              border:'1px solid var(--border)', borderRadius:'var(--radius)',
              fontSize:13, fontWeight:500, color:'var(--text2)' }}>
              ↓ Export
            </button>
            <button onClick={() => setShowAdd(true)}
              style={{ display:'flex', alignItems:'center', gap:6,
                padding:'9px 16px', background:'var(--accent)', color:'#fff',
                borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
                boxShadow:'0 2px 8px rgba(37,99,235,.25)' }}>
              + Add Supervisor
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',
          gap:14, marginBottom:20 }}>
          {[
            { label:'Total Supervisors',   value:total,    icon:'👮', change:6.7,   color:'var(--text)'   },
            { label:'Active Supervisors',  value:active,   icon:'✅', pct:total,     color:'var(--green)'  },
            { label:'Inactive Supervisors',value:inactive, icon:'❌', pct:total,     color:'var(--text2)'  },
            { label:'Pending Approvals',   value:pending,  icon:'⏳', change:-12.5,  color:'var(--red)'    },
            { label:'Total Cleaners',      value:'—',      icon:'🧹', sub:'Across all supervisors', color:'var(--accent)' },
            { label:'Total Apartments',    value:'—',      icon:'🏢', sub:'Managed by supervisors', color:'#7c3aed'       },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff',
              border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
              padding:'16px 18px', boxShadow:'var(--shadow)' }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'var(--text2)',
                  textTransform:'uppercase', letterSpacing:'.05em',
                  fontWeight:600, lineHeight:1.3 }}>{k.label}</span>
                <span style={{ fontSize:18, flexShrink:0 }}>{k.icon}</span>
              </div>
              <div style={{ fontSize:26, fontWeight:700, color:k.color,
                marginBottom:4 }}>
                {loading ? '—' : k.value}
              </div>
              {k.change && (
                <div style={{ fontSize:12,
                  color: k.change > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {k.change > 0 ? '↑' : '↓'} {Math.abs(k.change)}% vs last month
                </div>
              )}
              {k.pct > 0 && (
                <div style={{ fontSize:12, color:'var(--text3)' }}>
                  {total > 0 ? ((k.value/total)*100).toFixed(1) : 0}% of total
                </div>
              )}
              {k.sub && (
                <div style={{ fontSize:12, color:'var(--text3)' }}>{k.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:'14px 16px',
          display:'flex', gap:10, marginBottom:16, flexWrap:'wrap',
          alignItems:'center' }}>
          <div style={{ position:'relative', flex:'1 1 240px', maxWidth:340 }}>
            <span style={{ position:'absolute', left:12, top:'50%',
              transform:'translateY(-50%)', color:'var(--text3)',
              fontSize:14, pointerEvents:'none' }}>🔍</span>
            <input placeholder="Search by name, mobile or supervisor ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft:34 }} />
          </div>
          <select value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            style={{ width:140 }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_approval">Pending</option>
          </select>
          <select style={{ width:160 }}>
            <option>All Apartments</option>
          </select>
          <select style={{ width:140 }}>
            <option>All Regions</option>
          </select>
          <button style={{ display:'flex', alignItems:'center', gap:6,
            padding:'8px 14px', background:'var(--bg3)',
            border:'1px solid var(--border)', borderRadius:'var(--radius)',
            fontSize:12, color:'var(--text2)', fontWeight:500 }}>
            🔧 Filter
          </button>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', overflow:'hidden',
          boxShadow:'var(--shadow)' }}>
          {loading ? (
            <div style={{ padding:40, textAlign:'center',
              color:'var(--text3)', fontSize:13 }}>Loading supervisors...</div>
          ) : supervisors.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', color:'var(--text3)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>👮</div>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:8 }}>
                No supervisors found
              </div>
              <button onClick={() => setShowAdd(true)}
                style={{ padding:'8px 20px', background:'var(--accent)',
                  color:'#fff', borderRadius:'var(--radius)',
                  fontSize:13, fontWeight:600 }}>
                + Add First Supervisor
              </button>
            </div>
          ) : (
            <>
              <div style={{ overflowX:'auto' }}>
                <table style={{ minWidth:780 }}>
                  <thead>
                    <tr>
                      <th>Supervisor ID</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Apartments</th>
                      <th>Cleaners</th>
                      <th>Performance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisors.map(s => {
                      const st    = STATUS_STYLE[s.status] || STATUS_STYLE.inactive
                      const isSel = selected?._id === s._id
                      return (
                        <tr key={s._id}
                          style={{ background: isSel ? '#eff6ff' : 'transparent',
                            cursor:'pointer' }}
                          onClick={() => setSelected(isSel ? null : s)}>
                          <td>
                            <span style={{ fontSize:12, fontWeight:700,
                              fontFamily:'var(--mono)', color:'var(--accent)',
                              background:'#eff6ff', padding:'3px 8px',
                              borderRadius:6 }}>
                              {s.partnerId || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:'50%',
                                background:'#eff6ff', border:'1px solid #bfdbfe',
                                display:'flex', alignItems:'center',
                                justifyContent:'center', fontSize:13, fontWeight:700,
                                color:'var(--accent)', flexShrink:0 }}>
                                {s.name?.[0]?.toUpperCase() || 'S'}
                              </div>
                              <span style={{ fontWeight:500, fontSize:13 }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize:13, fontFamily:'var(--mono)' }}>
                            {s.mobileNo || s.mobile || '—'}
                          </td>
                          <td style={{ fontSize:13, textAlign:'center' }}>
                            {s.apartmentsCount ?? '—'}
                          </td>
                          <td style={{ fontSize:13, textAlign:'center' }}>
                            {s.cleanersCount ?? '—'}
                          </td>
                          <td style={{ fontSize:13 }}>
                            <span style={{ color:'#f59e0b' }}>★</span>{' '}
                            {s.rating?.toFixed(1) || '—'}
                          </td>
                          <td>
                            <span style={{ fontSize:11, fontWeight:600,
                              padding:'3px 10px', borderRadius:20,
                              background:st.bg, color:st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button
                                onClick={() => setSelected(isSel ? null : s)}
                                title="View"
                                style={{ width:30, height:30, borderRadius:6,
                                  background:'var(--bg3)',
                                  border:'1px solid var(--border)',
                                  fontSize:13 }}>👁</button>
                              <button title="Edit"
                                style={{ width:30, height:30, borderRadius:6,
                                  background:'var(--bg3)',
                                  border:'1px solid var(--border)',
                                  fontSize:13 }}>✏</button>
                              <button title="More"
                                style={{ width:30, height:30, borderRadius:6,
                                  background:'var(--bg3)',
                                  border:'1px solid var(--border)',
                                  fontSize:13 }}>⋮</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding:'12px 20px',
                borderTop:'1px solid var(--border)',
                display:'flex', justifyContent:'space-between',
                alignItems:'center', background:'var(--bg3)',
                flexWrap:'wrap', gap:8 }}>
                <span style={{ fontSize:12, color:'var(--text2)' }}>
                  Showing {((page-1)*LIMIT)+1} to {Math.min(page*LIMIT,total)} of {total} supervisors
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <button onClick={() => setPage(p => Math.max(1,p-1))}
                    disabled={page===1}
                    style={{ width:28, height:28, borderRadius:6,
                      background:'#fff', border:'1px solid var(--border)',
                      opacity: page===1 ? .4:1 }}>‹</button>
                  {Array.from({length:Math.min(meta.pages||1,3)},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={() => setPage(n)}
                      style={{ width:28, height:28, borderRadius:6,
                        background: page===n ? 'var(--accent)':'#fff',
                        color: page===n ? '#fff':'var(--text)',
                        border:'1px solid var(--border)', fontSize:12,
                        fontWeight: page===n ? 700:400 }}>
                      {n}
                    </button>
                  ))}
                  {(meta.pages||1) > 3 && (
                    <>
                      <span style={{ color:'var(--text3)' }}>...</span>
                      <button onClick={() => setPage(meta.pages)}
                        style={{ width:28, height:28, borderRadius:6,
                          background:'#fff', border:'1px solid var(--border)',
                          fontSize:12 }}>{meta.pages}</button>
                    </>
                  )}
                  <button onClick={() => setPage(p => Math.min(meta.pages||1,p+1))}
                    disabled={page===(meta.pages||1)}
                    style={{ width:28, height:28, borderRadius:6,
                      background:'#fff', border:'1px solid var(--border)',
                      opacity: page===(meta.pages||1) ? .4:1 }}>›</button>
                  <select style={{ width:100, fontSize:12, padding:'4px 8px' }}>
                    <option>10 / page</option>
                    <option>20 / page</option>
                    <option>50 / page</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selected && (
        <SupervisorPanel
          supervisor={selected}
          onClose={() => setSelected(null)}
          onAction={load} />
      )}

      {/* Add Modal */}
      {showAdd && (
        <AddSupervisorModal
          onClose={() => setShowAdd(false)}
          onSuccess={load} />
      )}
    </div>
  )
}