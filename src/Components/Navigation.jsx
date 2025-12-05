import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";

export default function NavigationTab() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", path: "/#features" },
    { name: "Pricing", path: "/#pricing" },
    { name: "API", path: "/#api" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              NexusAuth
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl animate-slide-up">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="px-4 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-cyan-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-white/10 my-1"></div>
          <button
            onClick={() => {
              navigate("/login");
              setMobileMenuOpen(false);
            }}
            className="w-full py-3 rounded-xl hover:bg-white/5 text-slate-300 transition-colors text-left px-4"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              navigate("/signup");
              setMobileMenuOpen(false);
            }}
            className="w-full py-3 rounded-xl bg-cyan-500 text-slate-900 font-bold text-center"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}
