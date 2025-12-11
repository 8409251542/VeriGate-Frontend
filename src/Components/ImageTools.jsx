import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function ImageTools() {
    const [activeTab, setActiveTab] = useState(0);
    const [balance, setBalance] = useState(0);
    const authData = JSON.parse(localStorage.getItem("user"));
    const userId = authData?.user?.id;
    const API_BASE = "https://verigate-backend.onrender.com"; // Or your backend URL

    // URLS for your 5 image generator sites
    // URLS for your local tools (served via backend)
    const tools = [
        { name: "SER Tool", url: `${API_BASE}/api/tools/SER.html` },
        { name: "AMZ Tool", url: `${API_BASE}/api/tools/amztool.html` },
        { name: "APL Tool", url: `${API_BASE}/api/tools/apl.html` },
        { name: "AZM Tool", url: `${API_BASE}/api/tools/azmtool.html` },
        { name: "Loot Tool", url: `${API_BASE}/api/tools/loot.html` },
        { name: "Meta Receipt", url: `${API_BASE}/api/tools/meta_receipt.html` },
        { name: "Nurton", url: `${API_BASE}/api/tools/nurton.html` },
        { name: "PP Tool", url: `${API_BASE}/api/tools/pp.html` },
    ];

    // Fetch initial balance
    useEffect(() => {
        fetchUserDetails();
    }, []);

    // Listen for messages from iFrame
    useEffect(() => {
        const handleMessage = async (event) => {
            // Security check: verify event.origin if possible
            // if (event.origin !== "https://your-child-site.com") return;

            if (event.data && event.data.type === "IMAGE_GENERATION_SUCCESS") {
                console.log("Creating deduction for image generation...");
                await deductCost(event.data.cost || 2);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const fetchUserDetails = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/get-user-details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId }),
            });
            const data = await res.json();
            if (res.ok) {
                setBalance(data.usdt_balance || 0);
            }
        } catch (err) {
            console.error("Failed to fetch balance", err);
        }
    };

    const deductCost = async (amount) => {
        try {
            const res = await fetch(`${API_BASE}/api/deduct-image-cost`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId, cost: amount }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.info(`Generated! ${amount} USDT deducted.`);
                setBalance(data.newBalance);
            } else {
                toast.error(data.message || "Failed to deduct balance");
            }
        } catch (err) {
            console.error("Deduction error:", err);
            toast.error("Network error during deduction");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        AI Image Tools
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Generate premium AI images. Cost: <span className="text-cyan-400 font-bold">2 USDT</span> / image.
                    </p>
                </div>
                <div className="bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="text-slate-400 text-sm font-medium">Balance</span>
                    <span className="text-xl font-bold text-cyan-400">{balance.toFixed(4)} USDT</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tools.map((tool, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === index
                            ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                            }`}
                    >
                        {tool.name}
                    </button>
                ))}
            </div>

            {/* iFrame Container */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden h-[800px] relative">

                {/* Balance Check Overlay */}
                {balance < 2 && (
                    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md shadow-2xl">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Loader2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Insufficient Balance</h3>
                            <p className="text-slate-400 mb-6">
                                You need at least <span className="text-cyan-400 font-bold">2 USDT</span> to use this tool.
                                Your current balance is <span className="text-red-400">{balance.toFixed(4)} USDT</span>.
                            </p>
                            <button
                                onClick={() => window.location.href = '/buy-token'}
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all"
                            >
                                Add Funds
                            </button>
                        </div>
                    </div>
                )}

                <iframe
                    src={tools[activeTab].url}
                    title={tools[activeTab].name}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                />

                {/* Helper overlay for demo (Remove in production if needed) */}
                {!tools[activeTab].url.includes("http") && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        Select a valid tool URL in the code to load.
                    </div>
                )}
            </div>
        </div>
    );
}
