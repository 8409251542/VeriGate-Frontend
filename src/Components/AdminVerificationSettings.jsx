import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Shield, Cpu, Zap, Globe } from "lucide-react";

const API_MODE_URL = "https://verigate-backend.onrender.com/api/admin/verification-mode";

export default function AdminVerificationSettings() {
    const [mode, setMode] = useState("hybrid");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMode();
    }, []);

    const fetchMode = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_MODE_URL);
            setMode(res.data.mode);
        } catch (err) {
            toast.error("Failed to fetch verification mode");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMode = async (newMode) => {
        try {
            setLoading(true);
            await axios.post(API_MODE_URL, { mode: newMode });
            setMode(newMode);
            toast.success(`Verification mode updated to ${newMode}`);
        } catch (err) {
            toast.error("Failed to update mode");
        } finally {
            setLoading(false);
        }
    };

    const modes = [
        {
            id: "api",
            name: "API Only",
            description: "Strictly use paid Numlookupapi. Failure/limit = No verification.",
            icon: <Globe className="text-blue-500" />,
            color: "border-blue-500 bg-blue-50"
        },
        {
            id: "hybrid",
            name: "Hybrid (Recommended)",
            description: "Try API first, automatic fallback to Local Google model on errors/limits.",
            icon: <Zap className="text-amber-500" />,
            color: "border-amber-500 bg-amber-50"
        },
        {
            id: "local",
            name: "Local Only (Free)",
            description: "Bypass paid API entirely. Use Google Libphonenumber + Prefix mapping.",
            icon: <Cpu className="text-green-500" />,
            color: "border-green-500 bg-green-50"
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="bg-slate-900 p-3 rounded-xl text-white shadow-lg">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Verification Engine Settings</h1>
                    <p className="text-slate-500">Manage how numbers are verified across the platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modes.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => !loading && handleUpdateMode(m.id)}
                        className={`cursor-pointer border-2 rounded-2xl p-6 transition-all hover:shadow-lg relative overflow-hidden ${mode === m.id ? m.color : "bg-white border-slate-100 hover:border-slate-300"}`}
                    >
                        {mode === m.id && (
                            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">Active</div>
                        )}
                        <div className="mb-4">{m.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{m.name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{m.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
                <div className="text-indigo-600 pt-1"><Zap size={20} /></div>
                <div>
                    <h4 className="font-bold text-indigo-900 mb-1">About the Local Model</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                        The local model provides <b>Free</b> verification using Google's libphonenumber logic.
                        It identifies Line Type (Mobile/Landline) and Carrier Name via prefix mapping without calling any external paid services.
                    </p>
                </div>
            </div>
        </div>
    );
}
