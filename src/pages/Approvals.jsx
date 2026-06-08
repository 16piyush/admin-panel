import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, CheckCircle, XCircle, Clock, Search, Filter, 
  Download, Eye, Check, X, MoreVertical, Calendar, 
  UserCheck, Building2, Store, Truck, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

// ── Helpers ──
const ROLE_NAME = { CL: 'Car Cleaner', NC: 'NCSP Partner', FR: 'Franchise (CSP)', FS: 'Steam Wash', SU: 'Supervisor' };
const ROLE_COLOR = { CL: '#3b82f6', NC: '#a855f7', FR: '#f97316', FS: '#0d9488', SU: '#22c55e' };

export default function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ── 1. API: FETCH PENDING DATA ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getPending();
      const list = r.data?.data?.users || r.data?.data || [];
      setPending(Array.isArray(list) ? list : []); 
    } catch (err) { setPending([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── 2. API: APPROVE PARTNER ──
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this partner registration?")) return;
    try {
      await adminAPI.approveUser(id, { notes: 'Approved via Admin Panel' });
      alert("Approved Successfully!");
      load();
    } catch (err) { alert("Approval failed"); }
  };

  // ── 3. API: REJECT PARTNER ──
  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await adminAPI.rejectUser(id, { reason });
      alert("Partner Rejected");
      load();
    } catch (err) { alert("Rejection failed"); }
  };

  // ── Filtering Logic ──
  const filtered = pending.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.mobileNo?.includes(search);
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Partner Approval Center</h1>
          <nav className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Dashboard &gt; Partner Approvals &gt; Pending Approvals</nav>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 shadow-sm"><Download size={14}/> Export</button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0047FF] text-white rounded-xl text-xs font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">+ Add Customer</button>
        </div>
      </div>

      {/* ── KPI SECTION (6 CARDS) ── */}
      <div className="grid grid-cols-6 gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <Kpi label="Total Pending" value={pending.length} sub="All partner registrations" icon={Users} color="#6366f1" />
        <Kpi label="Car Cleaners" value={pending.filter(u=>u.role==='CL').length} sub="25.5% of total" icon={Truck} color="#3b82f6" />
        <Kpi label="Supervisors" value={pending.filter(u=>u.role==='SU').length} sub="17.0% of total" icon={UserCheck} color="#22c55e" />
        <Kpi label="NCSP Partners" value={pending.filter(u=>u.role==='NC').length} sub="29.8% of total" icon={Building2} color="#a855f7" />
        <Kpi label="Franchise (CSP)" value={pending.filter(u=>u.role==='FR').length} sub="19.1% of total" icon={Store} color="#f97316" />
        <Kpi label="Steam Wash" value={pending.filter(u=>u.role==='FS').length} sub="8.5% of total" icon={Truck} color="#0d9488" />
      </div>

      {/* ── FILTERS BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Search by name, mobile, email or registration ID..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-300" value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
        </div>
        <select className="bg-slate-50 border-none rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 uppercase outline-none w-40 cursor-pointer">
           <option>Partner Type</option>
        </select>
        <select className="bg-slate-50 border-none rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 uppercase outline-none w-40 cursor-pointer">
           <option>All Status</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"><Filter size={14}/> More Filters</button>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-6 mb-6 border-b border-slate-100">
        {[
          {id:'all', l:'All Pending', c:pending.length},
          {id:'CL', l:'Car Cleaners', c:pending.filter(u=>u.role==='CL').length},
          {id:'SU', l:'Supervisors', c:pending.filter(u=>u.role==='SU').length},
          {id:'NC', l:'NCSP Partners', c:pending.filter(u=>u.role==='NC').length},
        ].map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {tab.l} ({tab.c})
          </button>
        ))}
      </div>

      {/* ── DATA TABLE (9 COLUMNS) ── */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden border-b-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest italic">
                <th className="px-6 py-5">Registration ID</th>
                <th className="px-6 py-5">Partner Type</th>
                <th className="px-6 py-5">Name / Business</th>
                <th className="px-6 py-5">Mobile / Email</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Submitted On</th>
                <th className="px-6 py-5 text-center">Documents</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-slate-600 font-medium italic">
              {loading ? (
                <tr><td colSpan={9} className="py-24 text-center font-black animate-pulse italic text-slate-300">Syncing Requests...</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-semibold">
                  <td className="px-6 py-4 font-black text-blue-600 text-[11px] uppercase tracking-tighter italic">{u._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: `${ROLE_COLOR[u.role]}15`, color: ROLE_COLOR[u.role] }}>
                      {ROLE_NAME[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 leading-tight uppercase italic">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-black not-italic uppercase tracking-widest">Individual / Provider</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 font-black tracking-tighter">{u.mobileNo}</div>
                    <div className="text-[10px] text-slate-400 truncate w-32 not-italic">{u.email || 'No email registered'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 uppercase italic">Bangalore</div>
                    <div className="text-[9px] text-slate-400 font-black not-italic">Green View Heights</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic leading-tight">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    <div className="text-[10px] text-slate-300 font-black not-italic mt-0.5">{new Date(u.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-blue-600 uppercase italic">5/6</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-500 text-[9px] font-black border border-orange-100 uppercase italic">Pending</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5 text-slate-300">
                       <button onClick={()=>{setSelectedUser(u); setShowReviewModal(true)}} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16}/></button>
                       <button onClick={()=>handleApprove(u._id)} className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm shadow-green-100"><Check size={16}/></button>
                       <button onClick={()=>handleReject(u._id)} className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"><X size={16}/></button>
                       <button className="p-2"><MoreVertical size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer / Pagination */}
      <div className="px-8 py-6 flex justify-between items-center text-slate-400 font-bold text-[11px] uppercase tracking-widest">
         <span>Showing 1 to {filtered.length} of {pending.length} pending registrations</span>
         <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-xl bg-white"><ChevronLeft size={16}/></button>
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">1</span>
            <button className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50"><ChevronRight size={16}/></button>
         </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReviewModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-black italic">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8 uppercase tracking-tighter text-xl">
               <h3>Application Review</h3>
               <button onClick={()=>setShowReviewModal(false)}><X className="text-slate-300" size={28}/></button>
            </div>
            <div className="space-y-4 not-italic font-bold">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                  <label className="text-[10px] text-slate-300 uppercase block mb-1">Partner Name</label>
                  <p className="text-xl text-slate-800 leading-none uppercase italic tracking-tighter">{selectedUser.name}</p>
                  <p className="text-blue-600 text-xs mt-2 uppercase font-black">{ROLE_NAME[selectedUser.role] || selectedUser.role}</p>
               </div>
            </div>
            <div className="flex gap-4 mt-10 uppercase tracking-widest text-[10px]">
               <button onClick={()=>handleReject(selectedUser._id)} className="flex-1 py-5 bg-red-50 text-red-600 rounded-3xl font-black transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-100">Reject Request</button>
               <button onClick={()=>handleApprove(selectedUser._id)} className="flex-1 py-5 bg-[#0047FF] text-white rounded-3xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Approve & Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI COMPONENT ──
const Kpi = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[160px]">
    <div className="flex justify-between items-start mb-4 font-black">
      <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">{label}</div>
      <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}10`, color }}> <Icon size={20} strokeWidth={2.5} /> </div>
    </div>
    <div className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">{value || 0}</div>
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic leading-none">{sub}</div>
  </div>
);