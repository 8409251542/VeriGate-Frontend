import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Globe, Lock, Smartphone, Database, ChevronRight, Check } from "lucide-react";
import NavigationTab from "./Navigation";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-sans">
      <NavigationTab />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            The New Standard in Verification
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-slide-up">
            Identity Verification <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Reimagined for Scale.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            NexusAuth provides enterprise-grade phone verification, carrier detection, and fraud prevention application APIs. Secure your platform today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transform hover:-translate-y-1"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white font-bold rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Feature Section */}
      <section className="py-20 bg-slate-900/50 border-y border-white/5 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why NexusAuth?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built for developers who demand speed, accuracy, and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 bg-slate-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={200} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Global Coverage</h3>
                <p className="text-slate-400 text-lg max-w-md">
                  Verify numbers from over 190+ countries with direct carrier connections.
                  Our smart routing ensures the highest delivery rates in the industry.
                </p>
              </div>
            </div>

            {/* Tall Card */}
            <div className="row-span-2 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 flex flex-col justify-between group hover:border-cyan-500/30 transition-colors">
              <div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
                <p className="text-slate-400">
                  Sub-second latency for real-time verification. Don't keep your users waiting.
                </p>
              </div>
              <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-white/5 font-mono text-xs text-cyan-400">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Latency</span>
                  <span>45ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Medium Card */}
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 group hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fraud Protection</h3>
              <p className="text-slate-400">
                Detect VoIP, temporary, and high-risk numbers instantly.
              </p>
            </div>

            {/* Medium Card */}
            <div className="bg-slate-950 border border-white/10 rounded-3xl p-8 group hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Carrier Data</h3>
              <p className="text-slate-400">
                Get distinct mobile vs landline categorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser / CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-slate-950"></div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to integrate?</h2>
          <p className="text-slate-400 text-lg mb-10">
            Get started with 50 free verifications. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-cyan-50 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900 border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-slate-200">NexusAuth</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
          <div className="text-slate-600 text-sm">
            © 2025 NexusAuth Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
