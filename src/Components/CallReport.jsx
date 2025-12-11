import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Zap,
  CheckCircle,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function CallReportGenerator() {
  const [file, setFile] = useState(null);
  const [reportDate, setReportDate] = useState("");
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const [usdtBalance, setUsdtBalance] = useState(0);
  const COST_PER_REPORT = 3.5; // 1 USDT

  const API_BASE = "https://verigate-backend.onrender.com";

  // Fetch user details on load
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/get-user-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsdtBalance(data.usdt_balance);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Check existing session on load
  useEffect(() => {
    const authData = localStorage.getItem("user");
    if (authData) {
      const userData = JSON.parse(authData);
      setUser(userData.user);
      fetchUserDetails(userData.user.id);
    }
  }, []);

  const logStatus = (msg, type = 'info') => {
    // Basic logging, could be enhanced
    setStatus((prev) => prev + "\n" + msg);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStatus(`File selected: ${uploadedFile.name}`);
    }
  };

  const handleGenerate = async () => {
    if (!file) return alert("Please upload a file first!");
    if (!reportDate) return alert("Please select a report date!");
    if (!user) return alert("User not logged in. Please log in first.");

    setProcessing(true);
    setStatus("Processing started...");
    setDownloadUrl(null);
    setFileName("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportDate", reportDate);
    formData.append("userId", user.id);

    try {
      logStatus("Uploading file to server...");
      const res = await fetch(`${API_BASE}/api/generate-report`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate report");
      }

      const data = await res.json();
      setDownloadUrl(data.downloadUrl);
      setFileName(`buyer_reports_${reportDate}.zip`);

      const newBalance = usdtBalance - COST_PER_REPORT;
      setUsdtBalance(newBalance);

      logStatus("✅ Done! Report generated successfully.");
    } catch (err) {
      console.error(err);
      logStatus("❌ Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && fileName) {
      window.open(downloadUrl, "_blank");
      logStatus(`📥 Downloaded: ${fileName}`);
    }
  };

  const canAffordReport = usdtBalance >= COST_PER_REPORT;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Call Report Generator</h1>
          <p className="text-slate-400 text-sm">Convert raw call data into buyer-wise performance reports.</p>
        </div>

        {/* Balance Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Balance</p>
            <p className="text-xl font-mono text-white leading-none">
              {usdtBalance.toFixed(2)} <span className="text-xs text-slate-500">USDT</span>
            </p>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2"></div>
          <div className="text-xs text-slate-500 text-right">
            <p>Cost/Report</p>
            <p className="text-white font-bold">{COST_PER_REPORT.toFixed(2)} USDT</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Upload Call Data (.csv, .xlsx)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800'
                  }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950'
                  }`}>
                  {file ? <FileSpreadsheet size={28} /> : <Upload size={28} />}
                </div>

                <p className={`text-lg font-medium mb-1 ${file ? 'text-white' : 'text-slate-300'}`}>
                  {file ? file.name : "Click to upload file"}
                </p>
                <p className="text-sm text-slate-500">
                  {(file && (file.size / 1024).toFixed(1) + ' KB') || 'Supports CSV, XLSX, XLS'}
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Report Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleGenerate}
              disabled={!file || !reportDate || processing || !canAffordReport}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/20"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  Generate Report
                </>
              )}
            </button>

            {!canAffordReport && (
              <p className="text-red-400 text-sm text-center mt-3 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                ⚠️ Insufficient balance. Please recharge.
              </p>
            )}
          </div>

          {/* Success / Download Area */}
          {downloadUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900">
                  <CheckCircle size={18} />
                </div>
                <h3 className="text-emerald-400 font-bold">Report Ready!</h3>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                <Download size={18} />
                Download Result ({fileName})
              </button>
            </div>
          )}

          {/* Status Log */}
          {status && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                SYS.LOG
              </div>
              <pre className="whitespace-pre-wrap">{status}</pre>
            </div>
          )}
        </div>

        {/* Sidebar / Instructions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">How it works</h3>
            <div className="space-y-6 relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-800"></div>
              {[
                { step: 1, title: "Upload Data", desc: "Upload your raw call logs (CSV/XLSX)" },
                { step: 2, title: "Select Date", desc: "Choose the reporting date to filter" },
                { step: 3, title: "Process", desc: "System aggregates data by buyer" },
                { step: 4, title: "Download", desc: "Get a ZIP file with individual reports" },
              ].map((item) => (
                <div key={item.step} className="relative flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 z-10 shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h4 className="text-slate-200 font-bold text-sm">{item.title}</h4>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-400 shrink-0" size={20} />
              <div>
                <h4 className="text-blue-400 font-bold text-sm mb-1">Pro Tip</h4>
                <p className="text-blue-200/60 text-xs leading-relaxed">Ensure your file has standard headers. The system automatically detects common formats.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
