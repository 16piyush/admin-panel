import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { data } from 'react-router-dom'

const StatusBadge = ({ status }) => {
  const colors = {
    active:    { bg:'#052e16', color:'#4ade80' },
    expired:   { bg:'#1e293b', color:'#94a3b8' },
    cancelled: { bg:'#450a0a', color:'#f87171' },
    paused:    { bg:'#431407', color:'#fb923c' },
  }
  const c = colors[status] || colors.expired
  return (
    <span style={{ background:c.bg, color:c.color, padding:'4px 10px', borderRadius:20, fontSize:12 }}>
      {status || 'unknown'}
    </span>
  )
}

const FILTERS = ['All', 'active', 'expired', 'cancelled', 'paused']

export default function Bookings() {
  const [bookings, setBookings] = useState([
    {
      _id:'1',
      bookings:"Bk001",
      customer:"Piyush Gupta",
      status:"Pending",
      amount:499,
      createdAt:new Date()
    }
  ])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({})
  const [filter, setFilter]     = useState('All')
  const [selected, setSelected] = useState(null)

  const fetchBookings = (f = 'All', p = 1) => {
    setLoading(true)
    const params = { page: p, limit: 10 }
    if (f !== 'All') params.status = f
    adminAPI.getBookings(params)
      .then(res => {
        setBookings(Array.isArray(res.data?.data?.bookings) ? res.data.data.bookings : [])
        setMeta({ total: res.data?.data?.total, pages: res.data?.data?.totalPages })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const handleStatus = async (id, status) => {
    try {
      await adminAPI.updateBookingStatus(id, { status })
      setSelected(null)
      fetchBookings(filter, page)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>📋 Bookings</h1>
        <p style={{ color:'#64748b' }}>Total: {meta?.total || 0} bookings</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); fetchBookings(f, 1) }}
            style={{
              padding:'8px 16px',
              background: filter === f ? '#3b82f6' : '#1e293b',
              color: filter === f ? '#fff' : '#94a3b8',
              border:'none', borderRadius:8, cursor:'pointer', fontSize:13,
              textTransform:'capitalize'
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#1e293b', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#0f172a' }}>
              {['Customer', 'Vehicle', 'Cleaner', 'Type', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding:'14px 16px', textAlign:'left', color:'#64748b', fontSize:13, fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#64748b' }}>Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#64748b' }}>No bookings found</td></tr>
            ) : bookings.map(b => (
              <tr key={b._id} style={{ borderTop:'1px solid #334155' }}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontWeight:500 }}>{b.customerId?.name || 'N/A'}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>{b.customerId?.mobileNo}</div>
                </td>
                <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:13 }}>
                  {b.vehicleId?.carNumber || 'N/A'}
                  <div style={{ color:'#64748b', fontSize:12 }}>{b.vehicleId?.carModel}</div>
                </td>
                <td style={{ padding:'12px 16px', color:'#94a3b8', fontSize:13 }}>
                  {b.cleanerId?.name || 'Not assigned'}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{ background:'#1d4ed820', color:'#60a5fa', padding:'3px 8px', borderRadius:20, fontSize:12 }}>
                    {b.subscriptionType}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', color:'#4ade80', fontWeight:500 }}>
                  ₹{b.amount || 0}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <StatusBadge status={b.status} />
                </td>
                <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>
                  {new Date(b.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <button onClick={() => setSelected(b)}
                    style={{ padding:'6px 12px', background:'#1e3a5f', color:'#60a5fa', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta?.pages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:20 }}>
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => { setPage(p); fetchBookings(filter, p) }}
              style={{ padding:'8px 14px', background: page === p ? '#3b82f6' : '#1e293b', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#1e293b', borderRadius:16, padding:32, width:540, maxHeight:'85vh', overflowY:'auto' }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:20 }}>📋 Booking Details</h2>
              <button onClick={() => setSelected(null)}
                style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer' }}>✕</button>
            </div>

            {[
              { label:'Customer',    value: `${selected.customerId?.name} (${selected.customerId?.mobileNo})` },
              { label:'Vehicle',     value: `${selected.vehicleId?.carNumber} - ${selected.vehicleId?.carModel}` },
              { label:'Cleaner',     value: selected.cleanerId?.name || 'Not assigned' },
              { label:'Type',        value: selected.subscriptionType },
              { label:'Amount',      value: `₹${selected.amount}` },
              { label:'Payment',     value: selected.paymentStatus },
              { label:'Status',      value: selected.status },
              { label:'Start Date',  value: new Date(selected.startDate).toLocaleDateString('en-IN') },
              { label:'End Date',    value: new Date(selected.endDate).toLocaleDateString('en-IN') },
              { label:'External Cleanings', value: `${selected.completedExternalCleanings}/${selected.totalExternalCleanings}` },
              { label:'Internal Cleanings', value: `${selected.completedInternalCleanings}/${selected.totalInternalCleanings}` },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #334155' }}>
                <span style={{ color:'#64748b' }}>{item.label}</span>
                <span style={{ fontWeight:500 }}>{item.value}</span>
              </div>
            ))}

            {/* Status Actions */}
            <div style={{ marginTop:20 }}>
              <p style={{ color:'#64748b', fontSize:13, marginBottom:10 }}>Change Status:</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['active','paused','cancelled'].filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => handleStatus(selected._id, s)}
                    style={{
                      padding:'8px 16px',
                      background: s === 'cancelled' ? '#450a0a' : s === 'paused' ? '#431407' : '#14532d',
                      color: s === 'cancelled' ? '#f87171' : s === 'paused' ? '#fb923c' : '#4ade80',
                      border:'none', borderRadius:8, cursor:'pointer', fontSize:13,
                      textTransform:'capitalize'
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}