import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CreditCard, Activity, TrendingUp, Download, ArrowUpRight } from "lucide-react";

const UserDashboard = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("user"));
        if (!authData?.user?.id) {
          toast.error("User not logged in");
          return;
        }

        const res = await fetch("https://nexauthapi.vercel.app/get-user-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authData.user.id }),
        });

        const data = await res.json();
        if (res.ok) {
          setDetails(data);
        } else {
          toast.error(data.message || "Failed to load user details");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!details) return <div className="text-red-400 p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">Failed to load details</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back, here's what's happening with your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors shadow-lg">
          <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">
              <CreditCard size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" /> Active
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-3xl font-mono text-white tracking-tight">{details.usdt_balance} <span className="text-sm text-slate-500 font-sans">USDT</span></h2>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-cyan-500/30 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Account Status</p>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Active Member
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            {/* <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All</button> */}
          </div>

          <div className="space-y-4">
            {details.last_recharge ? (
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">Wallet Recharge</p>
                    <p className="text-slate-400 text-sm">{new Date(details.last_recharge.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold">+{details.last_recharge.usdt_amount} USDT</p>
                  <p className={`text-xs font-bold uppercase ${details.last_recharge.status === 'approved' ? 'text-emerald-500' : 'text-yellow-500'
                    }`}>{details.last_recharge.status}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No recent transactions found
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left group">
              <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                <Download size={16} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Download Report</p>
                <p className="text-slate-500 text-xs">PDF for last 30 days</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left group">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Add Funds</p>
                <p className="text-slate-500 text-xs">Crypto or Card</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
