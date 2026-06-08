import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'

const STATUS_STYLE = {
  active:           { bg:'#dcfce7', color:'#16a34a', label:'Active'        },
  inactive:         { bg:'#f1f5f9', color:'#64748b', label:'Inactive'      },
  pending_approval: { bg:'#fef9c3', color:'#ca8a04', label:'Pending'       },
  rejected:         { bg:'#fee2e2', color:'#dc2626', label:'Rejected'      },
}

const getInitials = (name='') =>
  name.split(' ').map(p=>p[0]||'').join('').slice(0,2).toUpperCase()

const AVATAR_COLORS = [
  '#2563eb','#16a34a','#d97706','#7c3aed','#dc2626',
  '#0891b2','#ea580c','#65a30d','#db2777','#9333ea'
]
const avatarColor = (name='') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

// ── Add Customer Modal ────────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:'', mobileNo:'', email:'', apartment:'', notes:''
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setError('') }

  const handleSubmit = async () => {
    if (!form.name)                                     return setError('Name is required')
    if (!form.mobileNo || form.mobileNo.length !== 10)  return setError('Valid 10-digit mobile required')
    setLoading(true)
    try {
      await adminAPI.createInternal({
        name:     form.name,
        mobile:   form.mobileNo,
        email:    form.email,
        password: 'User@123',
        role:     'CU',
        notes:    `Apartment: ${form.apartment}. ${form.notes}`,
      })
      onSuccess()
      onClose()
    } catch(e) {
      setError(e.response?.data?.message || 'Failed to create customer')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:300, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:24, width:560,
        boxShadow:'0 24px 64px rgba(0,0,0,.15)', overflow:'hidden' }}>

        <div style={{ padding:'24px 28px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'flex-start',
          background:'var(--bg3)' }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:'-.02em' }}>
              Add New Customer
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:3,
              textTransform:'uppercase', letterSpacing:'.06em' }}>
              Manual Database Entry
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'transparent', border:'none',
              fontSize:20, color:'var(--text3)', cursor:'pointer',
              padding:'4px 6px' }}>✕</button>
        </div>

        <div style={{ padding:'28px' }}>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:'var(--radius)', padding:'10px 14px',
              fontSize:13, color:'var(--red)', marginBottom:16 }}>
              ⚠ {error}
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16,
            marginBottom:16 }}>
            {[
              ['Full Name *',     'name',     'text',  'e.g. Rahul Kumar',    true ],
              ['Mobile Number *', 'mobileNo', 'tel',   '10-digit mobile',     true ],
              ['Email',           'email',    'email', 'email@example.com',   false],
              ['Apartment',       'apartment','text',  'e.g. Green View Hts', false],
            ].map(([label,key,type,ph,req]) => (
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, display:'block',
                  marginBottom:6, color:'var(--text2)',
                  textTransform:'uppercase', letterSpacing:'.05em' }}>
                  {label}
                </label>
                <input type={type} placeholder={ph} value={form[key]}
                  maxLength={key==='mobileNo'?10:undefined}
                  onChange={e => set(key, key==='mobileNo'
                    ? e.target.value.replace(/\D/g,'') : e.target.value)}
                  style={{ background:'var(--bg3)', border:'none',
                    borderRadius:12, padding:'12px 14px' }} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, display:'block',
              marginBottom:6, color:'var(--text2)',
              textTransform:'uppercase', letterSpacing:'.05em' }}>
              Notes
            </label>
            <textarea rows={2} placeholder="Any additional notes..."
              value={form.notes} onChange={e => set('notes', e.target.value)}
              style={{ background:'var(--bg3)', border:'none',
                borderRadius:12, padding:'12px 14px', resize:'none' }} />
          </div>
          <div style={{ marginTop:16, padding:'10px 14px', background:'#eff6ff',
            borderRadius:10, fontSize:12, color:'#1d4ed8' }}>
            ℹ Default password will be set as <strong>User@123</strong> — share with customer
          </div>
        </div>

        <div style={{ padding:'16px 28px', borderTop:'1px solid var(--border)',
          display:'flex', gap:12, background:'var(--bg3)' }}>
          <button onClick={onClose}
            style={{ flex:1, padding:'13px', fontSize:13, fontWeight:700,
              background:'#e2e8f0', color:'var(--text2)',
              borderRadius:14, textTransform:'uppercase',
              letterSpacing:'.05em' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ flex:1, padding:'13px', fontSize:13, fontWeight:700,
              background:'var(--accent)', color:'#fff',
              borderRadius:14, textTransform:'uppercase', letterSpacing:'.05em',
              boxShadow:'0 4px 14px rgba(37,99,235,.3)',
              opacity: loading ? .7:1 }}>
            {loading ? 'Processing...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── View Customer Modal ───────────────────────────────────────────────────────
function ViewCustomerModal({ customer, onClose, onAction }) {
  const [acting, setActing] = useState(false)
  const st = STATUS_STYLE[customer.status] || STATUS_STYLE.inactive
  const color = avatarColor(customer.name)

  const toggle = async () => {
    setActing(true)
    try {
      if (customer.status === 'active') await adminAPI.deactivateUser(customer._id)
      else                              await adminAPI.activateUser(customer._id)
      onAction()
      onClose()
    } catch(e) { alert(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:300, padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:24, width:480,
        boxShadow:'0 24px 64px rgba(0,0,0,.15)', overflow:'hidden' }}>

        <div style={{ padding:'24px 28px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:16, fontWeight:700 }}>Customer Details</div>
          <button onClick={onClose} style={{ background:'transparent',
            fontSize:20, color:'var(--text3)' }}>✕</button>
        </div>

        <div style={{ padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:'50%',
              background:`${color}15`, border:`2px solid ${color}33`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, fontWeight:800, color, flexShrink:0 }}>
              {getInitials(customer.name)}
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:700 }}>{customer.name}</div>
              <div style={{ fontSize:12, color:'var(--text3)',
                fontFamily:'var(--mono)', marginTop:2 }}>
                {customer.partnerId || customer._id?.slice(-8)}
              </div>
            </div>
            <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600,
              padding:'4px 12px', borderRadius:20,
              background:st.bg, color:st.color }}>
              {st.label}
            </span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              ['Mobile',      customer.mobileNo || customer.mobile],
              ['Email',       customer.email || '—'],
              ['Role',        'Customer (CU)'],
              ['Registered',  new Date(customer.createdAt).toLocaleDateString('en-IN',{
                day:'numeric', month:'short', year:'numeric' })],
              ['Status',      customer.status],
              ['Partner ID',  customer.partnerId || '—'],
            ].map(([l,v]) => (
              <div key={l} style={{ background:'var(--bg3)', borderRadius:10,
                padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:'var(--text3)',
                  textTransform:'uppercase', letterSpacing:'.05em',
                  marginBottom:3, fontWeight:600 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:'16px 28px', borderTop:'1px solid var(--border)',
          display:'flex', gap:10 }}>
          <button onClick={toggle} disabled={acting}
            style={{ flex:1, padding:'11px', fontWeight:700, fontSize:13,
              background: customer.status==='active'
                ? 'rgba(239,68,68,.08)' : 'rgba(22,163,74,.08)',
              color: customer.status==='active' ? 'var(--red)':'var(--green)',
              border:`1px solid ${customer.status==='active'
                ? 'rgba(239,68,68,.2)':'rgba(22,163,74,.2)'}`,
              borderRadius:12, opacity: acting?.6:1 }}>
            {acting?'Processing...'
              : customer.status==='active'?'Block Customer':'Activate Customer'}
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:'11px', fontWeight:700, fontSize:13,
              background:'var(--accent)', color:'#fff', borderRadius:12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Users() {
  const [customers, setCustomers] = useState([])
  const [meta,      setMeta]      = useState({ total:0, pages:1 })
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [selected,  setSelected]  = useState(null)
  const [viewModal, setViewModal] = useState(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const LIMIT = 10

  const load = useCallback(() => {
    setLoading(true)
    const params = { role:'CU', page, limit:LIMIT }
    if (search) params.search = search
    if (status) params.status = status
    adminAPI.getUsers(params)
      .then(r => {
        setCustomers(Array.isArray(r.data.data) ? r.data.data : [])
        setMeta(r.data.meta || { total:0, pages:1 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  // KPI
  const total    = meta.total || 0
  const active   = customers.filter(c => c.status==='active').length
  const inactive = customers.filter(c => c.status==='inactive').length

  const toggleStatus = async (customer) => {
    try {
      if (customer.status==='active') await adminAPI.deactivateUser(customer._id)
      else                            await adminAPI.activateUser(customer._id)
      load()
    } catch(e) { alert(e.response?.data?.message || 'Failed') }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 104px)' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8,
            fontSize:12, color:'var(--text3)', marginBottom:6 }}>
            <a href="/dashboard" style={{ color:'var(--text3)' }}>Dashboard</a>
            <span>›</span>
            <span style={{ color:'var(--text)' }}>All Customers</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-.02em',
            textTransform:'uppercase', fontStyle:'italic' }}>
            Customer Management
          </h1>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ display:'flex', alignItems:'center', gap:6,
            padding:'10px 18px', background:'#fff',
            border:'1px solid var(--border)', borderRadius:12,
            fontSize:13, fontWeight:600, color:'var(--text2)' }}>
            ↓ Export
          </button>
          <button onClick={() => setShowAdd(true)}
            style={{ display:'flex', alignItems:'center', gap:6,
              padding:'10px 18px', background:'var(--accent)', color:'#fff',
              borderRadius:12, fontSize:13, fontWeight:700,
              boxShadow:'0 4px 14px rgba(37,99,235,.3)' }}>
            + Add Customer
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
        gap:14, marginBottom:20 }}>
        {[
          { label:'Total Customers',   value:total,    icon:'👤', sub:'100% of total',           color:'var(--text)'  },
          { label:'Active Customers',  value:active,   icon:'✅', sub:`${total>0?((active/total)*100).toFixed(2):0}% of total`, color:'var(--green)' },
          { label:'Inactive Customers',value:inactive, icon:'⏸', sub:`${total>0?((inactive/total)*100).toFixed(2):0}% of total`, color:'#64748b'      },
          { label:'New This Month',    value:'—',      icon:'🕐', sub:'2.86% of total',           color:'#d97706'      },
          { label:'Total Vehicles',    value:'—',      icon:'🚗', sub:'Across all customers',      color:'var(--accent)'},
        ].map(k => (
          <div key={k.label} style={{ background:'#fff',
            border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
            padding:'18px 20px', boxShadow:'var(--shadow)',
            display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12,
              background:'var(--bg3)', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:20, flexShrink:0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--text2)', fontWeight:600,
                textTransform:'uppercase', letterSpacing:'.05em',
                marginBottom:2 }}>{k.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:k.color,
                letterSpacing:'-.02em', lineHeight:1 }}>
                {loading ? '—' : k.value}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>
                {k.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', padding:'14px 16px',
        display:'flex', gap:10, marginBottom:16, flexWrap:'wrap',
        alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 280px', maxWidth:380 }}>
          <span style={{ position:'absolute', left:12, top:'50%',
            transform:'translateY(-50%)', color:'var(--text3)',
            fontSize:14, pointerEvents:'none' }}>🔍</span>
          <input placeholder="Search by name, mobile, email or customer ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ paddingLeft:34, borderRadius:10 }} />
        </div>
        <select value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ width:140, borderRadius:10 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select style={{ width:140, borderRadius:10 }}>
          <option>All</option>
          <option>Subscribed</option>
          <option>Unsubscribed</option>
        </select>
        <select style={{ width:130, borderRadius:10 }}>
          <option>All Cities</option>
        </select>
        <select style={{ width:160, borderRadius:10 }}>
          <option>All Apartments</option>
        </select>
        <button style={{ display:'flex', alignItems:'center', gap:6,
          padding:'8px 14px', background:'var(--bg3)',
          border:'1px solid var(--border)', borderRadius:10,
          fontSize:12, color:'var(--text2)', fontWeight:500 }}>
          🔧 Filter
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'1px solid var(--border)',
        borderRadius:24, overflow:'hidden', boxShadow:'var(--shadow)' }}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center',
            color:'var(--text3)', fontSize:13 }}>
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding:60, textAlign:'center', color:'var(--text3)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>👤</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>
              No customers found
            </div>
            <button onClick={() => setShowAdd(true)}
              style={{ padding:'9px 20px', background:'var(--accent)',
                color:'#fff', borderRadius:12, fontSize:13, fontWeight:600 }}>
              + Add First Customer
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table style={{ minWidth:1100 }}>
                <thead>
                  <tr style={{ background:'rgba(248,250,252,.5)' }}>
                    <th style={{ fontSize:10, fontWeight:800, color:'#94a3b8',
                      textTransform:'uppercase', letterSpacing:'.08em',
                      padding:'14px 20px', textAlign:'left',
                      borderBottom:'1px solid var(--border)' }}>
                      Customer ID
                    </th>
                    {['Name','Mobile','Email','Apartment','Vehicles',
                      'Subscription','Assigned Cleaner','Assigned Supervisor',
                      'Status','Actions'].map(h => (
                      <th key={h} style={{ fontSize:10, fontWeight:800,
                        color:'#94a3b8', textTransform:'uppercase',
                        letterSpacing:'.08em', padding:'14px 20px',
                        textAlign: h==='Vehicles'||h==='Status'||h==='Actions'
                          ? 'center' : 'left',
                        borderBottom:'1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const st    = STATUS_STYLE[c.status] || STATUS_STYLE.inactive
                    const color = avatarColor(c.name)
                    const isSel = selected === c._id
                    return (
                      <tr key={c._id}
                        style={{ borderBottom:'1px solid #f8fafc',
                          background: isSel ? '#eff6ff' : 'transparent',
                          cursor:'default' }}>
                        <td style={{ padding:'14px 20px', fontSize:11,
                          fontWeight:800, color:'var(--accent)',
                          fontFamily:'var(--mono)' }}>
                          {c.partnerId || `CU-${c._id?.slice(-5)}`}
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:'50%',
                              background:`${color}15`,
                              border:`1px solid ${color}33`,
                              display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:11,
                              fontWeight:800, color, flexShrink:0 }}>
                              {getInitials(c.name)}
                            </div>
                            <span style={{ fontWeight:700, fontSize:13,
                              color:'#1e293b' }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:13,
                          fontWeight:600, color:'#64748b',
                          fontFamily:'var(--mono)' }}>
                          {c.mobileNo || c.mobile || '—'}
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:13,
                          color:'#64748b' }}>
                          {c.email || '—'}
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:13,
                          color:'#64748b' }}>—</td>
                        <td style={{ padding:'14px 20px', textAlign:'center',
                          fontSize:13, fontWeight:600 }}>—</td>
                        <td style={{ padding:'14px 20px', textAlign:'center' }}>
                          <span style={{ fontSize:11, fontWeight:700,
                            padding:'4px 12px', borderRadius:20,
                            background:'#dcfce7', color:'#16a34a' }}>
                            Active
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:12,
                          color:'#64748b' }}>—</td>
                        <td style={{ padding:'14px 20px', fontSize:12,
                          color:'#64748b' }}>—</td>
                        <td style={{ padding:'14px 20px', textAlign:'center' }}>
                          <span style={{ fontSize:11, fontWeight:700,
                            padding:'4px 12px', borderRadius:20,
                            background:st.bg, color:st.color }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px', textAlign:'center' }}>
                          <div style={{ display:'flex', gap:4,
                            justifyContent:'center' }}>
                            <button
                              onClick={() => setViewModal(c)}
                              title="View"
                              style={{ width:30, height:30, borderRadius:8,
                                background:'var(--bg3)',
                                border:'1px solid var(--border)',
                                fontSize:13, cursor:'pointer' }}>👁</button>
                            <button
                              onClick={() => toggleStatus(c)}
                              title={c.status==='active'?'Block':'Activate'}
                              style={{ width:30, height:30, borderRadius:8,
                                background: c.status==='active'
                                  ? '#fef2f2' : '#f0fdf4',
                                border:'1px solid var(--border)',
                                fontSize:13, cursor:'pointer' }}>
                              {c.status==='active' ? '🚫' : '✅'}
                            </button>
                            <button title="More"
                              style={{ width:30, height:30, borderRadius:8,
                                background:'var(--bg3)',
                                border:'1px solid var(--border)',
                                fontSize:13, cursor:'pointer' }}>⋮</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding:'14px 20px',
              borderTop:'1px solid var(--border)',
              display:'flex', justifyContent:'space-between',
              alignItems:'center', background:'var(--bg3)',
              flexWrap:'wrap', gap:8 }}>
              <span style={{ fontSize:12, color:'var(--text2)' }}>
                Showing {((page-1)*LIMIT)+1} to {Math.min(page*LIMIT,total)} of {total} customers
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button onClick={() => setPage(p=>Math.max(1,p-1))}
                  disabled={page===1}
                  style={{ width:30, height:30, borderRadius:8, background:'#fff',
                    border:'1px solid var(--border)', fontSize:14,
                    opacity:page===1?.4:1, cursor:'pointer' }}>‹</button>
                {Array.from({length:Math.min(meta.pages||1,3)},(_,i)=>i+1).map(n=>(
                  <button key={n} onClick={()=>setPage(n)}
                    style={{ width:30, height:30, borderRadius:8,
                      background:page===n?'var(--accent)':'#fff',
                      color:page===n?'#fff':'var(--text)',
                      border:'1px solid var(--border)', fontSize:12,
                      fontWeight:page===n?700:400, cursor:'pointer' }}>
                    {n}
                  </button>
                ))}
                {(meta.pages||1)>3 && (
                  <>
                    <span style={{ color:'var(--text3)' }}>...</span>
                    <button onClick={()=>setPage(meta.pages)}
                      style={{ width:30, height:30, borderRadius:8,
                        background:'#fff', border:'1px solid var(--border)',
                        fontSize:12, cursor:'pointer' }}>
                      {meta.pages}
                    </button>
                  </>
                )}
                <button onClick={()=>setPage(p=>Math.min(meta.pages||1,p+1))}
                  disabled={page===(meta.pages||1)}
                  style={{ width:30, height:30, borderRadius:8, background:'#fff',
                    border:'1px solid var(--border)', fontSize:14,
                    opacity:page===(meta.pages||1)?.4:1, cursor:'pointer' }}>›</button>
                <select style={{ width:110, fontSize:12, padding:'5px 8px',
                  borderRadius:8 }}>
                  <option>10 / page</option>
                  <option>20 / page</option>
                  <option>50 / page</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddCustomerModal onClose={()=>setShowAdd(false)} onSuccess={load} />
      )}
      {viewModal && (
        <ViewCustomerModal
          customer={viewModal}
          onClose={()=>setViewModal(null)}
          onAction={load} />
      )}
    </div>
  )
}