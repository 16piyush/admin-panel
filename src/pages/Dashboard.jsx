import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api'; 
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Users, CheckCircle, Calendar, IndianRupee, 
  Settings, UserCheck, Building2, Store, 
  ClipboardList, Plus, ChevronDown, Activity, Star
} from 'lucide-react';

// ── Helpers ──
const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(val || 0);
};

// ── KPI Card Component ──
const KpiCard = ({ label, value, icon: Icon, change, color, loading }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={18} />
      </div>
    </div>
    <div className="mt-2">
      <div className="text-2xl font-black text-slate-800 tracking-tight">{loading ? '...' : value}</div>
      <div className="flex items-center gap-1 text-[10px] mt-1 font-bold">
        <span className="text-green-500">↑ {change}%</span>
        <span className="text-slate-400 font-medium">vs yesterday</span>
      </div>
    </div>
  </div>
);

// ── Detail Card Component ──
const DetailCard = ({ title, icon: Icon, rows, color }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[190px]">
    <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
      <Icon size={16} style={{ color }} />
      <span className="font-bold text-[12px] text-slate-700">{title}</span>
    </div>
    <div className="space-y-3">
      {rows.map(([label, value, isRed], i) => (
        <div key={i} className="flex justify-between text-[11px] font-medium">
          <span className="text-slate-500">{label}</span>
          <span className={`font-bold ${isRed ? 'text-red-500' : 'text-slate-700'}`}>{value || 0}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qaOpen, setQaOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];

    Promise.all([
      adminAPI.getUsers({ limit: 1, role: 'CU' }).catch(() => null),
      adminAPI.getUsers({ role: 'CL', limit: 1 }).catch(() => null),
      adminAPI.getUsers({ role: 'FR', limit: 1 }).catch(() => null),
      adminAPI.getUsers({ role: 'FS', limit: 1 }).catch(() => null),
      adminAPI.getUsers({ role: 'NC', limit: 1 }).catch(() => null),
      adminAPI.getUsers({ role: 'SU', limit: 1 }).catch(() => null),
      adminAPI.getUsers({ role: 'OT', limit: 1 }).catch(() => null),
      adminAPI.getPending().catch(() => null),
      adminAPI.getUsers({ limit: 5, sort: '-createdAt' }).catch(() => null),
      adminAPI.getSubscriptions?.({ status: 'active', limit: 1 }).catch(() => null),
      adminAPI.getBookings?.({ date: todayStr, limit: 1 }).catch(() => null),
      adminAPI.getRevenueStats?.().catch(() => null),
    ]).then(([all, cl, fr, fs, nc, su, ot, pend, rec, subs, bks, rev]) => {
      setStats({
        customers: all?.data?.meta?.total || 0,
        cleaners: cl?.data?.meta?.total || 0,
        fr_csp: fr?.data?.meta?.total || 0,
        fr_steam: fs?.data?.meta?.total || 0,
        ncsp: nc?.data?.meta?.total || 0,
        supervisor: su?.data?.meta?.total || 0,
        ops: ot?.data?.meta?.total || 0,
        pending: Array.isArray(pend?.data?.data) ? pend.data.data.length : 0,
        activeSubs: subs?.data?.meta?.total || 0,
        todayBookings: bks?.data?.meta?.total || 0,
        revenue: rev?.data?.totalRevenue || 0,
      });
      setRecent(Array.isArray(rec?.data?.data) ? rec.data.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const CHART_DATA = [
    { name: '19 May', rev: 12, bks: 400 },
    { name: '20 May', rev: 18, bks: 600 },
    { name: '21 May', rev: 15, bks: 500 },
    { name: '22 May', rev: 25, bks: 800 },
    { name: '23 May', rev: 20, bks: 700 },
  ];

  return (
    <div className="p-4 lg:p-6 bg-[#F8FAFC] min-h-screen font-sans flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex justify-end items-center">
        <div className="relative">
          <button onClick={() => setQaOpen(!qaOpen)} className="bg-[#0047FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
            <Plus size={16} /> Quick Action <ChevronDown size={14} className={qaOpen ? 'rotate-180 transition-transform' : ''} />
          </button>
          {qaOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQaOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                {['Add Cleaner', 'Add Supervisor', 'View Approvals'].map(item => (
                  <button key={item} className="w-full text-left px-5 py-3 text-[13px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border-b border-slate-50 last:border-0">{item}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Total Customers" value={stats?.customers?.toLocaleString('en-IN')} icon={Users} change="8.5" color="#2563eb" loading={loading} />
        <KpiCard label="Active Subscriptions" value={stats?.activeSubs?.toLocaleString('en-IN')} icon={CheckCircle} change="6.3" color="#16a34a" loading={loading} />
        <KpiCard label="Total Bookings (Today)" value={stats?.todayBookings?.toLocaleString('en-IN')} icon={Calendar} change="12.8" color="#7c3aed" loading={loading} />
        <KpiCard label="Today's Revenue" value={formatINR(stats?.revenue)} icon={IndianRupee} change="15.6" color="#f59e0b" loading={loading} />
      </div>

      {/* ROW 2: DETAIL CARDS */}
      <div className="flex flex-wrap gap-4">
        <DetailCard title="Car Cleaners" icon={ClipboardList} color="#2563eb" rows={[['Total', stats?.cleaners], ['Active', '-'], ['Pending', stats?.pending, stats?.pending > 0]]} />
        <DetailCard title="Supervisors" icon={UserCheck} color="#0891b2" rows={[['Total', stats?.supervisor], ['Active', stats?.supervisor]]} />
        <DetailCard title="NCSP Partners" icon={Building2} color="#16a34a" rows={[['Total', stats?.ncsp], ['Active', stats?.ncsp]]} />
        <DetailCard title="Franchises" icon={Store} color="#d97706" rows={[['CSP', stats?.fr_csp], ['Steam', stats?.fr_steam]]} />
        <DetailCard title="Operations" icon={Settings} color="#475569" rows={[['Ops Team', stats?.ops], ['Complaints', 0]]} />
      </div>

      {/* ROW 3: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-72">
          <h3 className="text-[11px] font-black text-slate-800 mb-6 uppercase tracking-widest">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={CHART_DATA}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize:10, fontWeight:700}} axisLine={false} />
              <YAxis tick={{fontSize:10, fontWeight:700}} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="rev" stroke="#2563eb" strokeWidth={3} dot={{r:4, fill:'#2563eb', stroke:'#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-72">
          <h3 className="text-[11px] font-black text-slate-800 mb-6 uppercase tracking-widest">Bookings Overview</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={CHART_DATA}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize:10, fontWeight:700}} axisLine={false} />
              <YAxis tick={{fontSize:10, fontWeight:700}} axisLine={false} />
              <Line type="monotone" dataKey="bks" stroke="#7c3aed" strokeWidth={3} dot={{r:4, fill:'#7c3aed', stroke:'#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-72 flex flex-col items-center">
          <h3 className="text-[11px] font-black text-slate-800 mb-2 uppercase self-start tracking-widest">Customer Growth</h3>
          <div className="relative w-full h-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{v:70, c:'#2563eb'}, {v:20, c:'#16a34a'}, {v:10, c:'#f59e0b'}]} innerRadius={55} outerRadius={75} dataKey="v" strokeWidth={0}>
                  {[0,1,2].map(i => <Cell key={i} fill={['#2563eb', '#16a34a', '#f59e0b'][i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="text-xl font-black text-slate-800 tracking-tighter">{stats?.customers || 0}</div>
              <div className="text-[9px] text-slate-400 font-black uppercase">Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: BOTTOM TABLES (RECENT + TOP + PENDING) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-72">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-[11px] uppercase text-slate-500 flex items-center gap-2">
            <Activity size={14} /> Recent Activities
          </div>
          <div className="p-2 overflow-y-auto h-full">
            {recent.length === 0 ? <div className="p-10 text-center text-slate-400 text-sm italic">No recent registrations</div> :
              recent.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1">
                    <div className="text-[12px] font-bold text-slate-700">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">New User Registration</div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-72">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-[11px] uppercase text-slate-500 flex items-center gap-2">
            <Star size={14} /> Top Performing Cleaners
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[9px]">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Earn</th></tr>
            </thead>
            <tbody>
              {[{n:'Ramesh Kumar', r:4.8, e:'28,450'}, {n:'Suresh Yadav', r:4.7, e:'25,890'}].map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-700">{row.n}</td>
                  <td className="px-5 py-3 text-amber-500 font-black">★ {row.r}</td>
                  <td className="px-6 py-3 font-bold text-slate-800">₹{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PENDING APPROVALS - ORIGINAL DESIGN RESTORED */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-72">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-black text-[11px] uppercase text-slate-500 flex items-center justify-between">
            <span>Pending Approvals</span>
          </div>
          <div className="p-3 space-y-2 flex-grow overflow-y-auto">
            {[
              ['Car Cleaners', '🧹', stats?.pending || 0, '#2563eb'],
              ['Supervisors', '👮', 0, '#0891b2'],
              ['NCSP Partners', '🏢', 0, '#16a34a'],
              ['CSP Franchise', '🏪', 0, '#d97706'],
              ['Steam Wash', '🚿', 0, '#7c3aed'],
            ].map(([label, icon, count, color]) => (
              <div key={label} className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm">{icon}</span>
                  <span className="text-[12px] font-bold text-slate-600">{label}</span>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${count > 0 ? 'bg-red-500 text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 mt-auto border-t border-slate-50">
            <a href="/approvals" className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white transition-all">
              Go to Approvals →
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}