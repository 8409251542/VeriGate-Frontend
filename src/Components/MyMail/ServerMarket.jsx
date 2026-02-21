import React, { useState, useEffect } from "react";
import { Server, ShoppingCart, Clock, ShieldCheck, Globe, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = "https://verigate-backend.onrender.com/api/mymail";

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

    const handlePlanRent = async (planId, duration, price) => {
        if (!confirm(`Rent ALL ${available.length} IPs for ${duration} hours for $${price}?`)) return;

        try {
            const userId = user.user?.id || user.id;
            const res = await axios.post(`${API_URL}/servers/rent-plan`, {
                userId: userId,
                planId: planId
            });
            toast.success(res.data.message);
            fetchMyServers(); // Update active list
            if (onRent) onRent();
        } catch (err) {
            toast.error(err.response?.data?.message || "Purchase failed");
        }
    };

    return (
        <div className="p-6 text-slate-200">
            {/* PLANS UI */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="text-cyan-400" /> Rotating Proxy Plans
                    <span className="text-sm font-normal text-slate-500 ml-2">({available.length} IPs Available)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* PLAN 1: 1 HOUR */}
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col items-center text-center hover:border-cyan-500 transition-all shadow-lg hover:shadow-cyan-900/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">1 Hour Access</h3>
                        <div className="text-5xl font-bold text-white mb-6">$2.00<span className="text-lg text-slate-500 font-medium">/hr</span></div>

                        <div className="w-full bg-slate-800/50 rounded-xl p-4 mb-8 text-left space-y-3">
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-cyan-400" size={20} />
                                <span>Access to <strong>ALL {available.length} IPs</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-cyan-400" size={20} />
                                <span>Unlimited Rotation</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-cyan-400" size={20} />
                                <span>SOCKS5 Tunneling</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePlanRent('1h_pack', 1, 2.0)}
                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Purchase Plan
                        </button>
                    </div>

                    {/* PLAN 2: 3 HOURS */}
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col items-center text-center hover:border-purple-500 transition-all shadow-lg hover:shadow-purple-900/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            BEST VALUE
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">3 Hours Access</h3>
                        <div className="text-5xl font-bold text-white mb-6">$3.50<span className="text-lg text-slate-500 font-medium">/total</span></div>

                        <div className="w-full bg-slate-800/50 rounded-xl p-4 mb-8 text-left space-y-3">
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-purple-400" size={20} />
                                <span>Access to <strong>ALL {available.length} IPs</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-purple-400" size={20} />
                                <span>Save 41% vs Hourly</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <CheckCircle className="text-purple-400" size={20} />
                                <span>Priority Speed</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePlanRent('3h_pack', 3, 3.5)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white text-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Purchase Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: MY SERVERS */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="text-green-400" /> My Active Servers
                </h2>
                {myServers.length === 0 ? (
                    <div className="text-slate-500 italic text-center py-8 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        No active servers. Purchase a plan above to start sending.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myServers.map(srv => (
                            <div key={srv.id} className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-900/50 rounded-full flex items-center justify-center text-green-400 font-bold">
                                        <Server size={20} />
                                    </div>
                                    <div>
                                        <div className="font-mono text-green-300 text-lg">{srv.ip}</div>
                                        <div className="text-xs text-slate-400 mt-1">Username: {srv.username}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs font-bold inline-block mb-1">ACTIVE</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 justify-end">
                                        <Clock size={14} /> {new Date(srv.expires_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
