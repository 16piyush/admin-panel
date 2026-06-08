import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  ClipboardList, CheckCircle, Hourglass, IndianRupee, 
  Search, Filter, Download, Plus, Eye, Edit, MoreVertical, 
  ChevronLeft, ChevronRight, X, Save, Check, Ban, Trash2 
} from 'lucide-react';

// ── Helpers ──
const getInitials = (name = '') => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('all');
  
  // MODAL & SELECTION STATES
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPkgModal, setShowEditPkgModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);

  // --- DATA: ALL SUBSCRIPTIONS ---
  const [subscriptions] = useState([
    { id:'SUB-0001', customer:'Rahul Kumar', mobile:'+91 98765 43210', pkg:'Premium Monthly', vehicle:'KA 01 AB 1234', model:'CRETA 2022', apt:'Green View Heights', city:'Bangalore', start:'01 May 2025', end:'31 May 2025', balance:12, status:'Active' },
    { id:'SUB-0002', customer:'Amit Patel', mobile:'+91 87654 32109', pkg:'Standard Monthly', vehicle:'KA 03 MN 5678', model:'I20 2021', apt:'Skyline Residency', city:'Bangalore', start:'04 May 2025', end:'03 Jun 2025', balance:8, status:'Active' },
  ]);

  // --- DATA: PACKAGES (EXACT FROM PHOTO) ---
  const packages = [
    { id:'PKG-001', name:'Basic Monthly', price:999, cleanings:10, active:'2,341', duration:'1 Month', color:'#2563eb', features:['10 Cleanings/month', 'Basic wash', 'Standard timing'] },
    { id:'PKG-002', name:'Standard Monthly', price:1499, cleanings:20, active:'3,456', duration:'1 Month', color:'#7c3aed', features:['20 Cleanings/month', 'Interior + Exterior', 'Priority booking'] },
    { id:'PKG-003', name:'Premium Monthly', price:1999, cleanings:30, active:'1,890', duration:'1 Month', color:'#d97706', features:['30 Cleanings/month', 'Deep clean', 'Dedicated cleaner'] },
    { id:'PKG-004', name:'Premium Quarterly', price:4999, cleanings:90, active:'858', duration:'3 Months', color:'#059669', features:['90 Cleanings/quarter', 'Deep clean', 'Priority support'] },
  ];

  // --- DATA: REQUESTS ---
  const [requests, setRequests] = useState([
    { id:'REQ-001', customer:'Kartik Sharma', mobile:'+91 77665 44332', pkg:'Premium Monthly', apt:'Green View Heights', status:'Pending' },
    { id:'REQ-002', customer:'Divya Reddy', mobile:'+91 66554 33221', pkg:'Standard Monthly', apt:'Skyline Residency', status:'Approved' },
  ]);

  // ACTION FUNCTIONS
  const handleViewDetails = (item) => { setSelectedItem(item); setShowDetailsModal(true); };
  const handleRequestAction = (id, action) => {
    alert(`Subscription ${action} successfully!`);
    setRequests(requests.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase italic">Subscription Management</h1>
          <nav className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-widest italic">Dashboard &gt; Subscriptions</nav>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 shadow-sm transition-all hover:bg-slate-50"><Download size={14} /> Export</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0047FF] text-white rounded-xl text-xs font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
            <Plus size={18} /> Add Subscription
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <Kpi icon={ClipboardList} label="Total" value="8,945" sub="↑ 8.4%" color="#2563eb" />
        <Kpi icon={CheckCircle} label="Active" value="7,542" sub="84.3%" color="#16a34a" />
        <Kpi icon={Hourglass} label="Expiring" value="1,256" sub="14.0%" color="#f59e0b" />
        <Kpi icon={IndianRupee} label="Revenue" value="₹ 18,76,540" sub="↑ 15.6%" color="#7c3aed" />
      </div>

      {/* TABS MENU */}
      <div className="flex gap-2 mb-8 bg-slate-200/30 w-fit p-1 rounded-2xl">
        <button onClick={() => setActiveTab('all')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>📋 All Subscriptions</button>
        <button onClick={() => setActiveTab('packages')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'packages' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>📦 Packages</button>
        <button onClick={() => setActiveTab('requests')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>📩 Requests <span className="ml-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md">3</span></button>
      </div>

      {/* ── TAB 1: ALL SUBSCRIPTIONS ── */}
      {activeTab === 'all' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="px-6 py-5">Subscription ID</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Package</th>
                  <th className="px-6 py-5">Vehicle</th>
                  <th className="px-6 py-5 text-center">Balance</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-600">
                {subscriptions.map((s, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-black text-blue-600 uppercase tracking-tighter">{s.id}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] border border-blue-100">{getInitials(s.customer)}</div>
                      <span className="font-bold text-slate-800">{s.customer}</span>
                    </td>
                    <td className="px-6 py-4">{s.pkg}</td>
                    <td className="px-6 py-4 uppercase font-bold text-slate-500">{s.model}</td>
                    <td className="px-6 py-4 text-center font-black text-blue-600 text-lg">{s.balance}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black border ${s.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{s.status}</span></td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => handleViewDetails(s)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PACKAGES GRID ── */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {packages.map((pkg, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-xl">
              <div className="h-2" style={{ backgroundColor: pkg.color }} />
              <div className="p-7 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight italic">{pkg.name}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{pkg.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600 tracking-tighter italic">₹{pkg.price}</div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">per 1 month</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center font-black uppercase">
                    <div className="text-[8px] text-slate-400">Cleanings</div>
                    <div className="text-sm text-blue-600 mt-1">{pkg.cleanings}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center font-black uppercase">
                    <div className="text-[8px] text-slate-400">Active Subs</div>
                    <div className="text-sm text-slate-700 mt-1">{pkg.active}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center font-black uppercase">
                    <div className="text-[8px] text-slate-400">Duration</div>
                    <div className="text-[10px] text-slate-700 mt-1">{pkg.duration}</div>
                  </div>
                </div>

                <ul className="space-y-2 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Check size={14} className="text-blue-500" strokeWidth={3} /> {f}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => { setSelectedPkg(pkg); setShowEditPkgModal(true); }} className="flex items-center justify-center gap-2 flex-1 py-3 bg-white text-orange-500 rounded-2xl text-[11px] font-black border border-slate-100 hover:bg-orange-50 transition-all">
                    <Edit size={14}/> Edit
                  </button>
                  <button onClick={() => setActiveTab('all')} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase">
                    Subscribers
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: SUBSCRIPTION REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-300">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <th className="px-6 py-5">Request ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5 text-center">Status</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] font-bold">
                   {requests.map((r, i) => (
                     <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 font-black text-slate-500 uppercase">{r.id}</td>
                        <td className="px-6 py-4 text-slate-800">{r.customer}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${r.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{r.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {r.status === 'Pending' ? (
                            <div className="flex justify-center gap-2">
                               <button onClick={() => handleRequestAction(r.id, 'Approved')} className="px-4 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-white transition-all">✓ Approve</button>
                               <button onClick={() => handleRequestAction(r.id, 'Rejected')} className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all">✕ Reject</button>
                            </div>
                          ) : <button onClick={() => handleViewDetails(r)} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Eye size={18}/></button>}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200 italic font-black">
            <div className="flex justify-between items-center mb-6 uppercase tracking-tighter text-xl"><h3>Details</h3><button onClick={() => setShowDetailsModal(false)}><X className="text-slate-300"/></button></div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 uppercase tracking-widest text-[10px] text-slate-400">Customer <p className="text-slate-800 text-lg not-italic">{selectedItem?.customer}</p></div>
              <button onClick={() => setShowDetailsModal(false)} className="w-full mt-4 py-3 bg-[#0047FF] text-white rounded-2xl text-xs uppercase">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 italic font-black p-8">
            <div className="flex justify-between mb-8 uppercase tracking-tighter text-xl"><h3>New Subscription</h3><button onClick={() => setShowAddModal(false)}><X className="text-slate-300"/></button></div>
            <button onClick={() => setShowAddModal(false)} className="w-full py-4 bg-[#0047FF] text-white rounded-2xl text-xs uppercase shadow-xl shadow-blue-100">Save Subscription</button>
          </div>
        </div>
      )}

      {showEditPkgModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 italic font-black p-8">
            <div className="flex justify-between mb-8 uppercase tracking-tighter text-xl"><h3>Edit Plan: {selectedPkg?.n}</h3><button onClick={() => setShowEditPkgModal(false)}><X className="text-slate-300"/></button></div>
            <button onClick={() => setShowEditPkgModal(false)} className="w-full py-4 bg-[#0047FF] text-white rounded-2xl text-xs uppercase shadow-xl shadow-blue-100">Update Plan</button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── KPI COMPONENT ──
const Kpi = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" style={{ backgroundColor: `${color}15`, color }}> <Icon size={24} /> </div>
    <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div><div className="text-2xl font-black text-slate-800 leading-none">{value}</div><div className="text-[10px] font-bold mt-1 text-green-500">{sub} <span className="text-slate-400 font-medium lowercase italic">vs last month</span></div></div>
  </div>
);