import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, BarChart3, Users, Settings, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // AuthContext se hook import kiya
import { useNavigate } from 'react-router-dom';

// Aapki local image
import carImage from '../assets/nissan0.avif';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Login Logic States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth(); // AuthContext se login function liya
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Please fill all fields');
    }

    try {
      // AuthContext ka login function call kar rahe hain
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard'); // Login successful toh dashboard par bhejo
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row w-full bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE - Blue Section */}
      <div className="hidden md:flex md:w-[40%] lg:w-[38%] bg-[#003B95] text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-8 right-8 grid grid-cols-6 gap-2 opacity-20 pointer-events-none z-0">
          {[...Array(24)].map((_, i) => <div key={i} className="w-1 h-1 bg-white rounded-full"></div>)}
        </div>

        <div className="px-8 lg:px-12 pt-10 lg:pt-14 z-10">
          <div className="flex items-center gap-3 mb-8">
             <div className="bg-white p-2 rounded-xl">
                <img src="https://img.icons8.com/ios-filled/50/003B95/car.png" className="w-6 h-6" alt="logo" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none italic">GOMOTORCAR</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mt-1">Anything & Everything for your Car</p>
             </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight leading-tight">Welcome Back!</h2>
          <p className="text-lg font-semibold mb-2 text-blue-100">Sign in to your admin account</p>
        </div>

        <div className="w-full flex-grow flex items-center justify-center overflow-hidden">
             <img src={carImage} alt="Car" className="w-full object-cover shadow-2xl" style={{ maxHeight: '45vh' }} />
        </div>

        <div className="px-8 lg:px-12 pb-10 lg:pb-14 z-10">
          <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/10">
            {[
              { icon: <ShieldCheck size={20} />, label: "Secure" },
              { icon: <BarChart3 size={20} />, label: "Real-time" },
              { icon: <Users size={20} />, label: "Multi-role" },
              { icon: <Settings size={20} />, label: "Complete" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="mb-1 text-white/90">{item.icon}</div>
                <span className="text-[8px] lg:text-[10px] font-bold leading-tight uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form Section */}
      <div className="w-full md:w-[60%] lg:w-[62%] flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-[450px] bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-gray-100 my-auto">
            
            <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#003B95] p-2.5 rounded-xl">
                       <img src="https://img.icons8.com/ios-filled/50/ffffff/car.png" className="w-7 h-7" alt="logo" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-2xl font-black tracking-tighter text-[#003B95] italic leading-none">GOMOTORCAR</h1>
                    </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Admin Login</h2>
                <p className="text-gray-400 text-sm mt-2 font-medium">Enter your credentials to continue</p>
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-medium border border-red-100">{error}</div>}

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Email /Mobileno</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><Mail size={16} /></span>
                        <input 
                          type="text" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#003B95] outline-none text-sm shadow-sm transition-all" 
                          placeholder="Enter email or Mobileno" 
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Password</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><Lock size={16} /></span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#003B95] outline-none text-sm shadow-sm transition-all" 
                          placeholder="Enter password" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#003B95]" />
                        <span className="text-xs font-medium text-gray-500">Remember me</span>
                    </label>
                    <a href="#" className="text-xs font-bold text-[#0047FF]">Forgot Password?</a>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full ${loading ? 'bg-blue-400' : 'bg-[#0047FF] hover:bg-blue-700'} text-white py-3.5 lg:py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all`}
                >
                    {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
                </button>

                <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-3 text-gray-300 text-[9px] font-bold uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button type="button" className="w-full border border-blue-500 text-blue-600 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-blue-50">
                   <ShieldCheck size={14} /> Login with 2FA (Coming Soon)
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;