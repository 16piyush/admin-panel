import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.jpeg'
import { 
  LayoutDashboard, Users, ClipboardList, CheckCircle, 
  Truck, UserCog, Building2, Store, Users2, 
  Calendar, MessageSquare, CreditCard, Box, 
  Building, BarChart3, Bell, Settings, 
  ShieldCheck, History, LogOut, Menu, Plus 
} from 'lucide-react'


const NAV = [
  { to:'/dashboard',          icon: <LayoutDashboard size={18}/>,  label:'Dashboard' },
  { label:'MANAGEMENT', type:'section' },
  { to:'/users',              icon: <Users size={18}/>,            label:'Customers' },
  { to:'/subscriptions',      icon: <ClipboardList size={18}/>,    label:'Subscriptions' },
  { to:'/approvals',          icon: <CheckCircle size={18}/>,      label:'Partner Approvals', badge:true },
  { to:'/cleaners',           icon: <Truck size={18}/>,            label:'Car Cleaners' },
  { to:'/supervisors',        icon: <UserCog size={18}/>,          label:'Supervisors' },
  {
  label: 'NCSP Partners',
  icon: <Building2 size={18}/>,
  children: [
    { to: '/ncsp-partners', label: 'All NCSP Partners' },
    { to: '/ncsp-partners/add', label: 'Add Partner' },
    { to: '/ncsp-partners/approvals', label: 'Partner Approvals' },
    { to: '/ncsp-partners/performance', label: 'Performance' },
    { to: '/ncsp-partners/settlement', label: 'Settlement' },
  ],
},
  { to:'/franchises', icon: <Store size={18}/>, label:'Franchise Partners' },
  { to:'/create-user',        icon: <Users2 size={18}/>,           label:'Internal Team' },
  { label:'OPERATIONS', type:'section' },
  { to:'/bookings',           icon: <Calendar size={18}/>,         label:'Bookings' },
  { to:'/complaints',         icon: <MessageSquare size={18}/>,    label:'Complaints' },
  { to:'/payments',           icon: <CreditCard size={18}/>,       label:'Payments & Invoices' },
  { to:'/inventory',          icon: <Box size={18}/>,              label:'Inventory' },
  { to:'/apartments',         icon: <Building size={18}/>,         label:'Apartments' },
  { label:'SYSTEM', type:'section' },
  { to:'/reports',            icon: <BarChart3 size={18}/>,        label:'Reports' },
  { to:'/notifications',      icon: <Bell size={18}/>,             label:'Notifications' },
  { to:'/settings',           icon: <Settings size={18}/>,         label:'Settings' },
  { to:'/admin-users',        icon: <ShieldCheck size={18}/>,      label:'Admin Users' },
  { to:'/audit-logs',         icon: <History size={18}/>,          label:'Audit Logs' },
]

export default function Layout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const initials = admin?.name
    ? admin.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day:'numeric', month:'short', year:'numeric'
  })

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">

      {/* Sidebar */}
      <aside 
        style={{ width: collapsed ? 80 : 260 }}
        className="bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-50 shadow-sm"
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
         <div className="flex items-center gap-3">
          <img src={logo} alt="GoMotorCar" className="h-12 w-auto object-contain"/>

        
          </div>
        </div>

        {/* Navigation Items */}
       {NAV.map((item, i) => {
  if (item.type === 'section') {
    return collapsed ? (
      <div key={i} className="h-px bg-slate-100 my-4 mx-2" />
    ) : (
      <div
        key={i}
        className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-3 pt-6 pb-2"
      >
        {item.label}
      </div>
    )
  }

  // NCSP Dropdown
  if (item.children) {
    return (
      <div key={item.label}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500">
          <span className="flex-shrink-0">{item.icon}</span>

          {!collapsed && (
            <span className="flex-1 whitespace-nowrap">
              {item.label}
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                end={child.to === '/ncsp-partners'}
                className={({ isActive }) => `
                  block px-3 py-2 rounded-lg text-xs font-bold transition-all
                  ${
                    isActive
                      ? 'bg-blue-50 text-[#0047FF]'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 text-[#0047FF] shadow-sm border-l-4 border-[#0047FF]'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-l-4 border-transparent'
        }
      `}
    >
      <span className="flex-shrink-0">{item.icon}</span>

      {!collapsed && (
        <span className="flex-1 whitespace-nowrap">
          {item.label}
        </span>
      )}

      {!collapsed && item.badge && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      )}
    </NavLink>
  )
})}

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-slate-50">
           {!collapsed ? (
             <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                    {initials}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold text-slate-800 truncate">{admin?.name || 'Admin User'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Super Admin</div>
                  </div>
                </div>
                <button 
                  onClick={async () => { await logout(); navigate('/login') }}
                  className="w-full py-2 bg-white border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign out
                </button>
             </div>
           ) : (
             <button onClick={async () => { await logout(); navigate('/login') }} className="w-full flex justify-center text-red-400 hover:text-red-600 p-2"><LogOut size={20}/></button>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-slate-800">Welcome back, Super Admin 👋</h2>
              <p className="text-[11px] text-slate-400 font-medium">Dashboard Overview & Real-time Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real Date Display */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 font-bold text-xs">
              <Calendar size={14} className="text-blue-500" />
              {dateStr}
            </div>

            {/* Notifications */}
            <button className="relative p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-blue-600 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">8</span>
            </button>

            {/* Profile Summary */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                 <div className="text-xs font-black text-slate-800">{admin?.name || 'Super Admin'}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase">Super Admin</div>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-sm">
                 {initials}
               </div>
            </div>
          </div>
        </header>

        {/* Main Content Scrollable */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}