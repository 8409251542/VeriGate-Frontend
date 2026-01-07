import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { Server, Plus, Trash2, Shield, Globe, Upload } from "lucide-react";

const API_URL = "https://verigate-backend.onrender.com/api/mymail/admin/servers"; // Admin endpoints
const PUBLIC_URL = "https://verigate-backend.onrender.com/api/mymail/servers/available";

export default function AdminServerManager() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        ip: "",
        port: 1080,
        username: "",
        password: "",
        provider: "",
        country: "USA",
        price: 10
    });

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(PUBLIC_URL); // Re-use public list to see inventory
            setServers(res.data.servers);
        } catch (err) {
            toast.error("Failed to fetch servers");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, form);
            toast.success("Server added successfully");
            fetchServers();
            // Reset form partially
            setForm({ ...form, ip: "", username: "", password: "" });
        } catch (err) {
            toast.error("Add failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this server? This will NOT stop active rentals, but removes it from future sales.")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            toast.success("Server deleted");
            fetchServers();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const handleProxyUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (results) => {
                const proxies = [];
                results.data.forEach(row => {
                    let parts = [];
                    if (Array.isArray(row)) {
                        if (row.length === 1 && typeof row[0] === 'string' && row[0].includes(':')) {
                            parts = row[0].split(':');
                        } else {
                            parts = row;
                        }
                    } else if (typeof row === 'object') {
                        parts = Object.values(row);
                    }

                    if (parts.length >= 2) { // Minimal validation
                        proxies.push({
                            ip: parts[0]?.trim(),
                            port: parts[1]?.trim(),
                            username: parts[2]?.trim() || "",
                            password: parts[3]?.trim() || "",
                            provider: "Webshare",
                            country: "Premium",
                        });
                    }
                });

                if (proxies.length === 0) return toast.error("No valid proxies found");

                try {
                    const res = await axios.post(`${API_URL}/bulk`, { servers: proxies });
                    toast.success(res.data.message);
                    fetchServers();
                } catch (err) {
                    toast.error("Bulk upload failed");
                }
            }
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg shadow-red-500/20">
                    <Server size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">RDP / Proxy Management</h1>
                    <p className="text-slate-500">Add SOCKS5 capable servers to the marketplace.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: ADD FORM */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 sticky top-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="text-red-500" /> Add New Server
                        </h2>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IP Address</label>
                                <input required placeholder="1.2.3.4" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm" value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Port</label>
                                    <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm" value={form.port} onChange={e => setForm({ ...form, port: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (USDT)</label>
                                    <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 font-bold text-green-600" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proxy User</label>
                                    <input placeholder="Optional" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proxy Pass</label>
                                    <input placeholder="Optional" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider Name</label>
                                <input placeholder="AWS, Azure..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
                                <input placeholder="USA" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
                                Add to Inventory
                            </button>

                        </form>
                    </div>
                </div>

                {/* RIGHT: LIST */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <div className="font-bold text-slate-600">Total Inventory: {servers.length}</div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleProxyUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <Upload size={14} /> Import List
                                </button>
                            </div>
                            <button onClick={fetchServers} className="text-sm text-blue-500 hover:underline">Refresh</button>
                        </div>
                    </div>

                    {/* ... list ... */}

                    {servers.map((s) => (
                        <div key={s.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        {s.ip} <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">:{s.port}</span>
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-3">
                                        <span>{s.provider}</span>
                                        <span>•</span>
                                        <span>{s.country}</span>
                                        {s.username && (
                                            <span className="bg-yellow-50 text-yellow-700 px-1.5 rounded text-xs border border-yellow-200">Auth Enabled</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="font-bold text-green-600 text-lg">{s.price} USDT</div>
                                    <div className="text-xs text-slate-400">per hour</div>
                                </div>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {servers.length === 0 && !loading && (
                        <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            No servers in inventory. Add one to get started.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
