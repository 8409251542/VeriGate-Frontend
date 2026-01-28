import React, { useState, useEffect } from 'react';
import axios from 'axios'; // We keep axios for the upload logic as it handles FormData well, or switch to fetch if strictly needed. I'll stick to mixed or switch to fetch for consistency if easy. Let's use axios for upload as it's cleaner for progress, but use fetch for user details.
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Zap, Upload, FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';

const BulkAppDetection = () => { // Removed user prop to rely on localStorage like other components
    const [file, setFile] = useState(null);
    const [appType, setAppType] = useState('');
    const [loading, setLoading] = useState(false);
    const [usdtBalance, setUsdtBalance] = useState(0); // Renamed to match others
    const [sendID, setSendID] = useState(null);
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);

    // COST CONSTANT
    const COST_PER_10K = 10;

    // API BASE
    const API_BASE = "http://localhost:5000";
    // Local backend for now

    const APP_OPTIONS = [
        "Viber", "Zalo", "Botim", "Momo", "Signal", "Skype", "Snapchat", "Line",
        "LinkedIn", "Amazon", "WhatsApp", "Facebook", "Telegram", "Tiktok", "Vk", "Ios(ss)", "Ios(hc)",
        "Twitter", "Band", "Rcs", "Ins", "Moniepoint", "Coupang", "Line(TW)",
        "Mint", "FBMessage", "Microsoft", "Paytm", "Hh", "Sideline", "check24",
        "Gate", "RummyCircle", "Cian", "Htx", "Magicbricks", "Flipkart",
        "Binance", "Bybit", "CoinW", "Kucoin", "OKX", "Xt", "Bitmart",
        "WS Business", "DHL", "Shopee", "GroupMe"
    ];

    // Fetch user details on load (Pattern from ImageTools/CallReport)
    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/get-user-details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                const data = await response.json();
                setUsdtBalance(data.usdt_balance || 0);
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !appType) {
            toast.error("Please select a file and an app type.");
            return;
        }

        if (!user) {
            toast.error("Please log in first.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        formData.append('appType', appType);

        try {
            // Using axios for upload for better handling, but using the same API_BASE
            const res = await axios.post(`${API_BASE}/api/app-detect/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(`Uploaded! ID: ${res.data.sendID}. Cost: $${res.data.deductedCost}`);
            setSendID(res.data.sendID);
            setStats({ total: res.data.count, active: '...', inactive: '...' });

            // Deduct locally for immediate feedback (optional, backend does it too)
            setUsdtBalance(prev => prev - res.data.deductedCost);

            // Start polling status
            pollStatus(res.data.sendID);
            fetchUserDetails(user.id); // Refresh balance from server to be sure
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed");
            setLoading(false);
        }
    };

    const pollStatus = (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.post(`${API_BASE}/api/app-detect/status`, { sendID: id });

                if (res.data.RES === "100") {
                    const data = res.data.DATA;
                    if (data.status === "2") {
                        clearInterval(interval);
                        setLoading(false);
                        setStatus("Completed");
                        setStats(prev => ({
                            ...prev,
                            active: data.number2,
                            inactive: data.number3
                        }));
                        toast.success("Detection Completed!");
                    } else {
                        setStatus("Processing...");
                    }
                }
            } catch (error) {
                console.error('Poll error', error);
            }
        }, 5000);
    };

    const handleDownload = async (type) => {
        if (!sendID) return;
        try {
            const res = await axios.post(`${API_BASE}/api/app-detect/download`, {
                sendID,
                type
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = type === 2 ? 'active_numbers.txt' : (type === 3 ? 'inactive_numbers.txt' : 'results.zip');
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Download failed");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-slate-950 text-white min-h-screen font-sans">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        Bulk App Detection
                    </h1>
                    <p className="text-slate-400 text-sm">Detect registered users on various apps.</p>
                </div>

                {/* Balance Widget (Copied from CallReport/ImageTools style) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Balance</p>
                        <p className="text-xl font-mono text-white leading-none">
                            {usdtBalance.toFixed(4)} <span className="text-xs text-slate-500">USDT</span>
                        </p>
                    </div>
                    <div className="h-8 w-px bg-slate-800 mx-2"></div>
                    <div className="text-xs text-slate-500 text-right">
                        <p>Cost/10k</p>
                        <p className="text-white font-bold">${COST_PER_10K}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Select App</label>
                        <select
                            value={appType}
                            onChange={(e) => setAppType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        >
                            <option value="">-- Select --</option>
                            {APP_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Upload File (TXT, CSV, XLSX)
                            <a href="/demo_app_detection.txt" download className="text-xs text-cyan-400 hover:text-cyan-300 ml-2">(Download Sample)</a>
                        </label>
                        <div className="relative border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-800 transition-colors group">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="pointer-events-none">
                                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2 group-hover:text-cyan-400" />
                                <p className="text-sm text-slate-300">{file ? file.name : "Drag & drop or click to upload"}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg 
                            ${loading
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20'}`}
                    >
                        {loading ? 'Processing...' : 'Start Detection'}
                    </button>
                    <p className="text-xs text-center text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                        Cost is deducted automatically based on the number of records.
                    </p>
                </div>

                {/* Results Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-cyan-400" />
                        Task Status
                    </h3>

                    {sendID ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-sm">Task ID</span>
                                <span className="font-mono text-yellow-500 text-sm">{sendID}</span>
                            </div>

                            <div className="text-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'}`}>
                                    {status === 'Completed' ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>}
                                    {status || "Initializing..."}
                                </div>
                            </div>

                            {stats && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Active</p>
                                        <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Inactive</p>
                                        <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
                                    </div>
                                </div>
                            )}

                            {status === 'Completed' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleDownload(2)}
                                        className="flex-1 py-3 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={16} /> Active
                                    </button>
                                    <button
                                        onClick={() => handleDownload(3)}
                                        className="flex-1 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={16} /> Inactive
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                                <FileText size={32} />
                            </div>
                            <p>No active tasks</p>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" theme="dark" />
        </div >
    );
};

export default BulkAppDetection;
