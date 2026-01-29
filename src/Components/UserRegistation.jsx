import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Mail, Lock, User, AlertCircle, Check } from "lucide-react";
import { toast } from "react-toastify";

export default function UserRegistration({ setUser }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim() || !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      newErrors.email = "Please enter a valid email.";
    if (!form.password) newErrors.password = "Password is required.";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const foundErrors = validate();
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://nexauthapi.vercel.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Registration failed: " + data.message);
      } else {
        toast.success(data.message);
        setForm({ email: "", password: "", confirmPassword: "" });
        navigate('/login');
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans">
      {/* Left Side - Brand / Visual */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150"></div>
        {/* Abstract Blobs */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={12} fill="currentColor" />
            Join NexusAuth
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Start Verifying <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              In Seconds.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Create your account to access enterprise-grade phone verification tools, detailed reporting, and automated fraud detection.
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 bg-slate-950 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 text-cyan-400 font-bold text-2xl" onClick={() => navigate('/')}>
            <Zap size={24} fill="currentColor" />
            NexusAuth
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-500">Get started with your free trial today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 pl-11 text-slate-200 outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/50'
                    }`}
                  placeholder="name@company.com"
                />
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              {errors.email && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 pl-11 text-slate-200 outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/50'
                    }`}
                  placeholder="Create a password"
                />
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              {errors.password && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 pl-11 text-slate-200 outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/50'
                    }`}
                  placeholder="Confirm your password"
                />
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <a onClick={() => navigate("/login")} className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
