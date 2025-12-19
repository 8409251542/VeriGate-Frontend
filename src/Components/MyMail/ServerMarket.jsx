
import React, { useState, useEffect } from "react";
import { Server, ShoppingCart, Clock, ShieldCheck, Globe } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mymail"; // Adjust if port differs

export default function ServerMarket({ user, onRent }) {
    const [available, setAvailable] = useState([]);
    const [myServers, setMyServers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedServer, setSelectedServer] = useState(null); // For modal

    useEffect(() => {
        fetchMarket();
        if (user) fetchMyServers();
    }, [user]);

    const fetchMarket = async () => {
        try {
            const res = await axios.get(`${API_URL}/servers/available`);
            setAvailable(res.data.servers);
        } catch (err) {
            console.error("Error fetching market:", err);
        }
    };

    const fetchMyServers = async () => {
        try {
            const userId = user.user?.id || user.id;
            const res = await axios.get(`${API_URL}/servers/my-servers?userId=${userId}`);
            setMyServers(res.data.servers);
        } catch (err) {
            console.error("Error fetching my servers:", err);
        }
    };

    const handleRent = async () => {
        if (!selectedServer) return;
        const userId = user.user?.id || user.id;
        try {
            const res = await axios.post(`${API_URL}/servers/rent`, {
                userId: userId,
                serverId: selectedServer.id,
                durationHours: 1 // Default 1 hour demo
            });
            toast.success(res.data.message);
            fetchMyServers();
            setSelectedServer(null); // Close modal
            if (onRent) onRent(); // Refresh parent if needed
        } catch (err) {
            toast.error(err.response?.data?.message || "Purchase failed");
        }
    };

    return (
        <div className="p-6 text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* LEFT: MARKETPLACE */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Globe className="text-cyan-400" /> Global Server Market
                    </h2>
                    <div className="space-y-3">
                        {available.map(srv => (
                            <div key={srv.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center hover:border-cyan-500/50 transition-colors">
                                <div>
                                    <div className="font-semibold text-white">{srv.provider} - {srv.country}</div>
                                    <div className="text-sm text-slate-400">{srv.ip} • Port {srv.port}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-400">{srv.price} USDT</div>
                                    <button
                                        onClick={() => setSelectedServer(srv)}
                                        className="text-xs bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-lg mt-1 flex items-center gap-1"
                                    >
                                        <ShoppingCart size={14} /> Rent
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: MY SERVERS */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Server className="text-green-400" /> My Active Servers
                    </h2>
                    {myServers.length === 0 ? (
                        <div className="text-slate-500 italic">No active servers. Rent one to enable Proxy Tunneling.</div>
                    ) : (
                        <div className="space-y-3">
                            {myServers.map(srv => (
                                <div key={srv.id} className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-mono text-green-300 text-lg">{srv.ip}</div>
                                            <div className="text-xs text-slate-400 mt-1">Username: {srv.username}</div>
                                        </div>
                                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">ACTIVE</div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                                        <Clock size={14} /> Expires: {new Date(srv.expires_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* CONFIRM MODAL */}
            {selectedServer && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
                        <p className="text-slate-300 mb-6">
                            Rent <strong>{selectedServer.provider} ({selectedServer.country})</strong> for <strong>1 Hour</strong>?
                            <br />
                            <span className="text-slate-500 text-sm">Amount will be deducted from your USDT balance.</span>
                        </p>

                        <div className="bg-slate-800 p-4 rounded-lg mb-6 flex justify-between items-center">
                            <span>Total Cost:</span>
                            <span className="text-xl font-bold text-green-400">{selectedServer.price} USDT</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedServer(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRent}
                                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold flex justify-center items-center gap-2"
                            >
                                <ShieldCheck size={18} /> Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
