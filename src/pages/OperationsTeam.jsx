import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../services/api'

const STATUS_COLOR = {
  active:           { bg:'rgba(74,222,128,.12)',  color:'#4ade80' },
  pending_approval: { bg:'rgba(251,146,60,.12)',  color:'#fb923c' },
  rejected:         { bg:'rgba(248,113,113,.12)', color:'#f87171' },
  inactive:         { bg:'rgba(100,116,139,.12)', color:'#64748b' },
}

function OTModal({ user, onClose, onAction }) {
  const [acting, setActing] = useState(false)

  const handleToggle = async () => {
    setActing(true)
    try {
      if (user.status === 'active') await adminAPI.deactivateUser(user._id)
      else await adminAPI.activateUser(user._id)
      onAction()
      onClose()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed')
    } finally {
      setActing(false)
    }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:200, padding:16 }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', width:480, overflow:'hidden' }}>

        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:'50%',
              background:'rgba(6,182,212,.15)', border:'1px solid rgba(6,182,212,.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, fontWeight:700, color:'#06b6d4' }}>
              {user.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600 }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:1 }}>
                {user.mobileNo}
                {user.partnerId &&
                  <span style={{ marginLeft:8, color:'var(--accent)',
                    fontFamily:'monospace' }}>{user.partnerId}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'transparent', color:'var(--text3)', fontSize:18, padding:'0 6px' }}>✕</button>
        </div>

        <div style={{ padding:'20px 22px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[
              ['Status',     user.status],
              ['Role',       'Operations Team'],
              ['Partner ID', user.partnerId || '—'],
              ['Email',      user.email || '—'],
              ['Joined',     new Date(user.createdAt).toLocaleDateString('en-IN')],
              ['Mobile',     user.mobileNo],
            ].map(([label, val]) => (
              <div key={label} style={{ background:'var(--bg3)',
                borderRadius:'var(--radius)', padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'var(--text3)',
                  textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }}>
                  {label}
                </div>
                <div style={{ fontSize:13 }}>{val}</div>
              </div>
            ))}
          </div>

          <button onClick={handleToggle} disabled={acting}
            style={{ width:'100%', padding:'10px', fontWeight:600, fontSize:13,
              background: user.status === 'active' ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)',
              color: user.status === 'active' ? '#f87171' : '#4ade80',
              border: `1px solid ${user.status === 'active' ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.25)'}`,
              borderRadius:'var(--radius)', opacity: acting ? .6 : 1 }}>
            {acting ? 'Processing...' : user.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OperationsTeam() {
  const [users,    setUsers]    = useState([])
  const [meta,     setMeta]     = useState({})
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = { role:'OT', page, limit:20 }
    if (search) params.search = search
    if (status) params.status = status
    adminAPI.getUsers(params)
      .then(r => {
        const d = r.data?.data
        setUsers(Array.isArray(d?.users) ? d.users : Array.isArray(d) ? d : [])
        setMeta({ total: d?.total, pages: d?.totalPages })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:600, marginBottom:3 }}>Operations Team</h1>
        <p style={{ color:'var(--text2)', fontSize:13 }}>{meta.total || 0} members</p>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input placeholder="Search name or mobile..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ maxWidth:300 }} />
        <select value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ width:170 }}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--text3)', fontSize:13 }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--text3)' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🛠️</div>
            <div style={{ fontSize:13 }}>No operations team members found</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Partner ID</th>
                <th>Mobile</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign:'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%',
                        background:'rgba(6,182,212,.15)', border:'1px solid rgba(6,182,212,.3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700, color:'#06b6d4', flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase() || 'O'}
                      </div>
                      <div>
                        <div style={{ fontWeight:500 }}>{u.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{u.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily:'monospace', fontSize:12, color:'var(--accent)' }}>{u.partnerId || '—'}</td>
                  <td style={{ fontFamily:'monospace', fontSize:13 }}>{u.mobileNo}</td>
                  <td style={{ fontSize:12, color:'var(--text2)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20,
                      background: STATUS_COLOR[u.status]?.bg || 'rgba(100,116,139,.12)',
                      color: STATUS_COLOR[u.status]?.color || 'var(--text2)' }}>
                      {u.status || 'unknown'}
                    </span>
                  </td>
                  <td style={{ textAlign:'right' }}>
                    <button onClick={() => setSelected(u)}
                      style={{ padding:'5px 14px', fontSize:12, fontWeight:500,
                        background:'var(--bg3)', color:'var(--text2)',
                        border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.pages > 1 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16, alignItems:'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            style={{ padding:'6px 16px', fontSize:12, background:'var(--bg2)',
              border:'1px solid var(--border)', color:'var(--text2)',
              borderRadius:'var(--radius)', opacity: page === 1 ? .4 : 1 }}>← Prev</button>
          <span style={{ fontSize:12, color:'var(--text2)', fontFamily:'monospace' }}>{page} / {meta.pages}</span>
          <button onClick={() => setPage(p => Math.min(meta.pages, p+1))} disabled={page === meta.pages}
            style={{ padding:'6px 16px', fontSize:12, background:'var(--bg2)',
              border:'1px solid var(--border)', color:'var(--text2)',
              borderRadius:'var(--radius)', opacity: page === meta.pages ? .4 : 1 }}>Next →</button>
        </div>
      )}

      {selected && <OTModal user={selected} onClose={() => setSelected(null)} onAction={load} />}
    </div>
  )
}