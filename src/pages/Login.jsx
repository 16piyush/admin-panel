import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.jpeg";
import carImage from "../assets/Login Side Banner.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const buttonLoading = loading || isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (buttonLoading) return;

    setError("");

    if (!email || !password) {
      return setError("Please fill all fields");
    }

    try {
      setIsSubmitting(true);
      const success = await login(email, password);

      if (success) navigate("/dashboard");
      else setError("Invalid credentials. Please try again.");
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#f4f7fb] font-sans overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[48%] h-screen bg-[#003B95] text-white px-12 py-10 flex-col justify-center overflow-hidden">
        <div className="max-w-[560px]">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Welcome Back!
          </h1>

          <h2 className="text-xl xl:text-2xl font-bold mb-5">
            Sign in to your admin account
          </h2>

          <p className="text-blue-100 text-base xl:text-lg leading-7 mb-6">
            GoMotorCar Admin Panel is your central hub to manage customers,
            partners, bookings, payments and operations seamlessly.
          </p>

          <img
            src={carImage}
            alt="Car"
            className="w-full max-h-[430px] object-contain"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[52%] h-screen flex items-center justify-center px-4 sm:px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-[500px] bg-white rounded-[22px] shadow-xl shadow-blue-100/70 p-7 sm:p-9">
          <div className="text-center mb-7">
            <img
              src={logo}
              alt="GoMotorCar Logo"
              className="w-[210px] sm:w-[240px] mx-auto mb-7"
            />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#07112b] mb-2">
              Admin Login
            </h2>

            <p className="text-gray-500 text-sm sm:text-base">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email / Username
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  value={email}
                  disabled={buttonLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or username"
                  className="w-full h-[54px] pl-12 pr-4 border border-gray-300 rounded-xl outline-none text-sm sm:text-base focus:border-[#0047FF] disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={buttonLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-[54px] pl-12 pr-14 border border-gray-300 rounded-xl outline-none text-sm sm:text-base focus:border-[#0047FF] disabled:bg-gray-100"
                />

                <button
                  type="button"
                  disabled={buttonLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  disabled={buttonLoading}
                  className="w-4 h-4 rounded border-gray-300 accent-[#0047FF]"
                />
                <span className="text-sm sm:text-base">Remember me</span>
              </label>

              <a href="#" className="text-sm sm:text-base font-semibold text-[#0047FF]">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={buttonLoading}
              className={`w-full h-[54px] rounded-xl text-white text-base font-bold flex items-center justify-center gap-3 transition ${
                buttonLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-[#0047FF] hover:bg-[#003B95] active:scale-[0.98]"
              }`}
            >
              {buttonLoading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={22} /> Login
                </>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              disabled={buttonLoading}
              className="w-full h-[52px] rounded-xl border border-[#0047FF] text-[#0047FF] font-bold flex items-center justify-center gap-3 hover:bg-blue-50 transition disabled:opacity-60"
            >
              <ShieldCheck size={18} />
              Login with 2FA (Coming Soon)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;