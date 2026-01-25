import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BulkAppDetection = ({ user }) => {
    const [file, setFile] = useState(null);
    const [appType, setAppType] = useState('');
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(null);
    const [sendID, setSendID] = useState(null);
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState(null); // { active: 0, inactive: 0, total: 0 }

    const APP_OPTIONS = [
        "Viber", "Zalo", "Botim", "Momo", "Signal", "Skype", "Snapchat", "Line",
        "LinkedIn", "Amazon", "Ws", "Fb", "Tg", "Tk", "Vk", "Ios(ss)", "Ios(hc)",
        "Twitter", "Band", "Rcs", "Ins", "Moniepoint", "Coupang", "Line(TW)",
        "Mint", "FBMessage", "Microsoft", "Paytm", "Hh", "Sideline", "check24",
        "Gate", "RummyCircle", "Cian", "Htx", "Magicbricks", "Flipkart",
        "Binance", "Bybit", "CoinW", "Kucoin", "OKX", "Xt", "Bitmart",
        "WS Business", "DHL", "Shopee", "GroupMe"
    ];

    useEffect(() => {
        fetchBalance();
    }, [user]);

    const fetchBalance = async () => {
        if (!user) return;
        try {
            const res = await axios.post('http://localhost:5000/get-user-details', { userId: user.id });
            setBalance(res.data.usdt_balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !appType) {
            toast.error("Please select a file and an app type.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        formData.append('appType', appType);

        try {
            const res = await axios.post('http://localhost:5000/api/app-detect/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(`Uploaded! ID: ${res.data.sendID}. Cost: $${res.data.deductedCost}`);
            setSendID(res.data.sendID);
            setStats({ total: res.data.count, active: '...', inactive: '...' });

            // Start polling status
            pollStatus(res.data.sendID);
            fetchBalance(); // refresh balance
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed");
            setLoading(false);
        }
    };

    const pollStatus = (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.post('http://localhost:5000/api/app-detect/status', { sendID: id });
                console.log('Status polling:', res.data);

                if (res.data.RES === "100") {
                    const data = res.data.DATA;
                    // status: "2" means complete
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
                } else {
                    // Error from API
                    // clearInterval(interval);
                    // setLoading(false);
                    // toast.error(`Status Error: ${res.data.ERR}`);
                }
            } catch (error) {
                console.error('Poll error', error);
            }
        }, 5000); // Poll every 5s
    };

    const handleDownload = async (type) => { // 1=zip, 2=active, 3=unregistered
        if (!sendID) return;
        try {
            const res = await axios.post('http://localhost:5000/api/app-detect/download', {
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
        <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-purple-400">Bulk App Detection</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-xl">Balance: <span className="font-bold text-green-400">${balance !== null ? balance.toFixed(4) : '...'} USDT</span></p>
                    <p className="text-sm text-gray-400">Cost: $10 per 10,000 numbers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Select App</label>
                            <select
                                value={appType}
                                onChange={(e) => setAppType(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-purple-500"
                            >
                                <option value="">-- Select --</option>
                                {APP_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Upload File (TXT, CSV, XLSX)</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full p-2 bg-gray-700 rounded border border-gray-600 file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 hover:file:bg-purple-700"
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className={`w-full py-3 rounded font-bold transition ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
                        >
                            {loading ? 'Processing...' : 'Upload & Detect'}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-900 p-4 rounded border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">Status</h3>

                        {sendID ? (
                            <div className="space-y-4">
                                <p>Task ID: <span className="font-mono text-yellow-400">{sendID}</span></p>
                                <p>Status: <span className={`font-bold ${status === 'Completed' ? 'text-green-500' : 'text-blue-400'}`}>{status || "Initializing..."}</span></p>

                                {stats && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="bg-gray-800 p-3 rounded text-center">
                                            <p className="text-gray-400 text-sm">Active</p>
                                            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                                        </div>
                                        <div className="bg-gray-800 p-3 rounded text-center">
                                            <p className="text-gray-400 text-sm">Inactive</p>
                                            <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
                                        </div>
                                    </div>
                                )}

                                {status === 'Completed' && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleDownload(2)}
                                            className="flex-1 py-2 bg-green-600 rounded hover:bg-green-700 text-sm font-semibold"
                                        >
                                            Download Active
                                        </button>
                                        <button
                                            onClick={() => handleDownload(3)}
                                            className="flex-1 py-2 bg-red-600 rounded hover:bg-red-700 text-sm font-semibold"
                                        >
                                            Download Inactive
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center mt-10">Upload a file to see results here.</p>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" theme="dark" />
        </div>
    );
};

export default BulkAppDetection;
