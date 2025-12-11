import React, { useState } from "react";
import { LayoutDashboard, FileText, Zap, Phone, CreditCard, LogOut, Menu, X, ChevronRight, Activity } from "lucide-react";
import { toast } from "react-toastify";
import UserDashboard from "./UserDashboard";
import UserNumberVerification from "./UserNumberVerification";
import UserPlans from "./UserPlans";
import BuyToken from "./UserBuyRequest";
import CallReportGenerator from "./CallReport";
import InvoiceGenerator from "./InvoiceGeneretor";
import ImageTools from "./ImageTools";

export default function UserPanel({ user, setUser }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "VerifyNumber", label: "Numbers Verification", icon: <Zap size={20} /> },
    { id: "reports", label: "Calls Reports Generator", icon: <Phone size={20} /> },
    { id: "Invoice", label: "Invoice Generator", icon: <FileText size={20} /> },
    { id: "UsdtToken", label: "Crypto Token", icon: <CreditCard size={20} /> },
    { id: "ImageTools", label: "AI Image Tools", icon: <Zap size={20} /> },
    { id: "changePassword", label: "Change Password", icon: <Zap size={20} /> },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "VerifyNumber":
        return <UserNumberVerification />;
      case "Plans":
        return <UserPlans />;
      case "Invoice":
        return <InvoiceGenerator />;
      case "reports":
        return <CallReportGenerator />;
      case "UsdtToken":
        return <BuyToken />;
      case "ImageTools":
        return <ImageTools />;
      case "changePassword":
        return <ChangePassword />;
      case "dashboard":
      default:
        return <UserDashboard setUser={setUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20 hidden md:flex`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl text-cyan-400 tracking-tight cursor-pointer" onClick={() => setActivePage("dashboard")}>
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-900">
                <Zap size={20} fill="currentColor" />
              </div>
              NexusAuth
            </div>
          ) : (
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-900 mx-auto cursor-pointer" onClick={() => setActivePage("dashboard")}>
              <Zap size={20} fill="currentColor" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
              >
                <span className={`${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {sidebarOpen && isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 relative">
          <div className="flex items-center gap-2 font-bold text-lg text-cyan-400">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-900">
              <Zap size={18} fill="currentColor" />
            </div>
            NexusAuth
          </div>
          <button
            className="text-slate-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-0 z-20 bg-slate-950/95 p-4 pt-20">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${activePage === item.id
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 mt-8 border-t border-white/5"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
