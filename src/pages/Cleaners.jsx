import { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../services/api';
import { 
  Truck, CheckCircle, Clock, Timer, AlertCircle, 
  Search, Download, Plus, Eye, Edit, MoreVertical, 
  ChevronLeft, ChevronRight, X, Star, MapPin, 
  Phone, Mail, Calendar, Briefcase, Filter, Trash2, Camera, User, Save, BarChart3
} from 'lucide-react';

const getInitials = (name = '') => name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'CL';

export default function Cleaners() {
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Photo & Form States
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ 
    name: '', mobile: '', email: '', dob: '', address: '', 
    cleanerType: 'Full Time', supervisor: '', apartments: '', cars: '' 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: 'CL', limit: 10 });
      const data = res.data?.data?.users || res.data?.data || [];
      setCleaners(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        role: 'CL',
        password: "Cleaner@123",
        profilePhoto: imagePreview
      };
      await adminAPI.createInternal(payload);
      setShowAddModal(false);
      setImagePreview(null);
      fetchData();
      alert("Cleaner Registered Successfully!");
    } catch (err) { 
      alert(`FAILED: ${err.response?.data?.message || "Validation failed"}`); 
    }
    setSubmitting(false);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* ── LEFT MAIN SECTION ── */}
      <div className={`flex-1 overflow-auto p-6 transition-all duration-300 ${selectedCleaner ? 'mr-[420px]' : ''}`}>
        
        <div className="flex justify-between items-start mb-8 font-black">
          <div>
            <h1 className="text-2xl text-slate-800 tracking-tight italic uppercase leading-none">Car Cleaner Management</h1>
            <nav className="text-slate-400 text-[10px] uppercase tracking-widest mt-2">Dashboard &gt; Car Cleaners</nav>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0047FF] text-white rounded-xl text-xs font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase italic tracking-wider">
            <Plus size={18}/> Add Cleaner
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <Kpi icon={Truck} label="Total" value="2,456" sub="↑ 8.6%" color="#2563eb" />
          <Kpi icon={CheckCircle} label="Active" value="2,102" sub="85.6%" color="#16a34a" />
          <Kpi icon={AlertCircle} label="Pending" value="24" sub="12.5%" color="#ef4444" />
          <Kpi icon={Timer} label="Part Time" value="1,245" sub="50.7%" color="#f59e0b" />
          <Kpi icon={Briefcase} label="Full Time" value="857" sub="34.9%" color="#7c3aed" />
        </div>

        {/* DATA TABLE (10 COLUMNS) */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden border-b-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest italic">
                  <th className="px-6 py-5">Cleaner ID</th>
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Mobile</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5 text-center">Apartments</th>
                  <th className="px-6 py-5 text-center">Cars</th>
                  <th className="px-6 py-5">Supervisor</th>
                  <th className="px-6 py-5">Rating</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] text-slate-600 font-medium">
                {loading ? (
                  <tr><td colSpan={10} className="py-24 text-center animate-pulse italic">Syncing Database...</td></tr>
                ) : cleaners.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4 font-black text-blue-600 text-[11px] uppercase">{c.partnerId || 'Pending'}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden font-black text-blue-600 text-[10px]">
                        {c.profilePhoto ? <img src={c.profilePhoto} className="w-full h-full object-cover" /> : getInitials(c.name)}
                      </div>
                      <span className="font-bold text-slate-800">{c.name}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500">{c.mobileNo || c.mobile}</td>
                    <td className="px-6 py-4 italic"><span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider italic">{c.cleanerType || 'Full Time'}</span></td>
                    <td className="px-6 py-4 text-center">{c.apartments || '3'}</td>
                    <td className="px-6 py-4 text-center font-black">{c.assignedCars || '20'}</td>
                    <div className="text-[11px] font-black text-slate-700">{c.supervisor || '—'}</div>
                    <td className="px-6 py-4 text-amber-500 font-black flex items-center gap-1"><Star size={12} fill="currentColor"/> 4.8</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black border border-green-100 uppercase italic">Active</span></td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => setSelectedCleaner(c)} className="p-2 text-slate-300 hover:text-blue-600 transition-all"><Eye size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── RIGHT DETAILS SIDEBAR (REPLICATING SCREENSHOT) ── */}
      {selectedCleaner && (
        <aside className="fixed right-0 top-0 w-[420px] h-screen bg-white shadow-2xl z-[100] border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-300 italic font-black">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-slate-800 uppercase text-xs tracking-widest">Cleaner Details</h3>
            <button onClick={() => setSelectedCleaner(null)} className="p-2 text-slate-300 hover:text-slate-800 focus:outline-none"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white text-2xl flex items-center justify-center font-black overflow-hidden shadow-xl border-2 border-white">
                {selectedCleaner.profilePhoto ? <img src={selectedCleaner.profilePhoto} className="w-full h-full object-cover" /> : getInitials(selectedCleaner.name)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h4 className="text-xl font-black text-slate-800 leading-tight uppercase italic">{selectedCleaner.name}</h4>
                   <span className="bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full text-[9px] border border-green-100 uppercase">Active</span>
                </div>
                <p className="text-blue-600 font-bold text-xs mt-1 uppercase tracking-widest">{selectedCleaner.partnerId || 'Pending'}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Full Time Cleaner</p>
                <div className="flex items-center gap-1 text-amber-500 mt-2">
                   <Star size={12} fill="currentColor"/> <span className="text-[11px] font-black tracking-tighter italic">4.8 (156 Ratings)</span>
                </div>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex gap-4 border-b border-slate-100 italic">
              {['Profile', 'Documents', 'Earnings', 'Activity'].map(t => (
                <button key={t} className={`pb-2 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all ${t === 'Profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>{t}</button>
              ))}
            </div>

            <div className="space-y-10 not-italic font-bold">
               {/* Personal Information */}
               <section>
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-4 tracking-widest italic border-b border-slate-50 pb-1">Personal Information</label>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                     <DetailBox label="Mobile Number" value={selectedCleaner.mobileNo || selectedCleaner.mobile} />
                     <DetailBox label="Email" value={selectedCleaner.email || "ramesh.kumar@gmail.com"} />
                     <DetailBox label="Date of Birth" value={selectedCleaner.dob || "12 Jan 1988"} />
                     <DetailBox label="Address" value={selectedCleaner.address || "#123, 1st Main, Bangalore"} />
                  </div>
               </section>

               {/* Work Information */}
               <section>
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-4 tracking-widest italic border-b border-slate-50 pb-1">Work Information</label>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                     <DetailBox label="Type" value={selectedCleaner.cleanerType || "Full Time"} />
                     <DetailBox label="Join Date" value="10 Feb 2023" />
                    <DetailBox label="Supervisor" value={selectedCleaner.supervisor || '—'} />
                     <DetailBox label="Apartments" value={selectedCleaner.apartments || "Green View Heights"} />
                     <DetailBox label="Assigned Cars" value="28 Cars" />
                  </div>
               </section>

               {/* Performance */}
               <section>
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-4 tracking-widest italic border-b border-slate-50 pb-1">Performance</label>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-slate-800 font-black italic">
                     <DetailBox label="Total Cleanings" value="1,256" />
                     <DetailBox label="This Month" value="95" />
                  </div>
               </section>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100"><button className="w-full py-4 bg-[#0047FF] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-200">View Full Profile</button></div>
        </aside>
      )}

      {/* ── ADD CLEANER MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 italic font-black">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 uppercase leading-none">
              <div><h3 className="text-xl text-slate-800">Register New Cleaner</h3><p className="text-[9px] text-slate-400 not-italic uppercase tracking-widest mt-2 font-bold">Full Profile Data Entry</p></div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-slate-800"><X size={24}/></button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar font-black uppercase text-[9px] text-slate-400">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 shadow-inner">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover animate-in fade-in" /> : <Camera size={28} className="text-slate-300 mx-auto" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-xl border-2 border-white"><Plus size={14} strokeWidth={4} /></div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <p className="mt-2 italic tracking-widest">Upload Photo</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 italic">
                <Input label="Name *" placeholder="Rahul" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required />
                <Input label="Mobile *" placeholder="9876543210" value={formData.mobile} onChange={(v) => setFormData({...formData, mobile: v})} required />
                <Input label="Email" placeholder="rahul@gmail.com" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                <Input label="DOB" placeholder="16/09/2002" value={formData.dob} onChange={(v) => setFormData({...formData, dob: v})} />
                <div className="md:col-span-2"><Input label="Address" placeholder="shaganj agra" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} /></div>
                <div className="md:col-span-2"><Input label="Supervisor Name" placeholder="e.g. Suresh Yadav" value={formData.supervisor} onChange={(v) => setFormData({...formData, supervisor: v})} /></div>
                </div>
              <div className="flex gap-4 pt-4 border-t border-slate-50 uppercase tracking-widest">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl">Cancel</button>
                <button disabled={submitting} type="submit" className="flex-1 py-4 bg-[#0047FF] text-white rounded-2xl shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50">
                   {submitting ? 'Registering...' : <><Save size={16} className="inline mr-1"/> Save Cleaner</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── UI HELPERS ──
const Kpi = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[150px]">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}10`, color }}> <Icon size={20} strokeWidth={2.5} /> </div>
    </div>
    <div className="text-2xl font-black text-slate-800 leading-none mb-1 tracking-tighter italic">{value}</div>
    <div className="text-[9px] font-bold text-green-500 uppercase tracking-tighter leading-none italic">{sub}</div>
  </div>
);

const Input = ({ label, value, onChange, type="text", placeholder, required }) => (
  <div className="flex flex-col gap-2">
    <label className="ml-1 uppercase tracking-widest text-slate-400 font-black">{label}</label>
    <input required={required} type={type} placeholder={placeholder} className="w-full px-5 py-5 bg-slate-50 border-none rounded-[1.5rem] text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-inner italic" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const DetailBox = ({ label, value }) => (
  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-inner">
    <label className="text-[9px] font-black text-slate-300 uppercase block mb-1 tracking-widest italic">{label}</label>
    <p className="text-sm font-bold text-slate-800 leading-none">{value || '—'}</p>
  </div>
);