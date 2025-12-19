
import React, { useState, useEffect, useRef } from "react";
import { Mail, Server, Users, FileText, Settings, Play, Pause, RefreshCw, Upload, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { toast } from "react-toastify";
import axios from "axios";
import CredentialRotator from "./Logic/CredentialRotator";
import ServerMarket from "./ServerMarket";

const API_URL = "http://localhost:5000/api/mymail";

export default function MyMail({ user }) {
    const [activeTab, setActiveTab] = useState("control"); // control, emails, smtp, template, market

    // Data State
    const [recipients, setRecipients] = useState([]);
    const [smtpCredentials, setSmtpCredentials] = useState([]);
    const [myServers, setMyServers] = useState([]);

    // Logic State
    const rotator = useRef(new CredentialRotator());
    const [selectedServerId, setSelectedServerId] = useState("direct");

    // Template State
    const [template, setTemplate] = useState({
        senderName: "Support Team",
        subject: "Hello {{name}}",
        text: "Hi {{name}}, your code is {{c3}}.",
        html: "<p>Hi <strong>{{name}}</strong>,</p><p>Your code is <code>{{c3}}</code></p>"
    });

    // Sending State
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
    const [logs, setLogs] = useState([]);

    // Refs for loop control
    const stopRef = useRef(false);

    useEffect(() => {
        fetchMyServers();
    }, []);

    const fetchMyServers = async () => {
        try {
            const userId = user?.user?.id || user?.id; // Robust check
            const res = await axios.get(`${API_URL}/servers/my-servers?userId=${userId}`);
            setMyServers(res.data.servers);
        } catch (e) { }
    };


    // ==========================
    // 1. FILE HANDLERS
    // ==========================
    const handleRecipientsUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setRecipients(results.data);
                toast.success(`Loaded ${results.data.length} recipients`);
            }
        });
    };

    const handleSmtpUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const count = rotator.current.load(results.data);
                setSmtpCredentials(rotator.current.credentials);
                toast.success(`Loaded ${count} credentials`);
            }
        });
    };

    // ==========================
    // 2. SENDING LOGIC
    // ==========================
    const startCampaign = async () => {
        if (recipients.length === 0) return toast.error("No recipients loaded");
        if (rotator.current.getCount() === 0) return toast.error("No SMTP credentials loaded");

        setIsSending(true);
        stopRef.current = false;
        setProgress({ sent: 0, failed: 0, total: recipients.length });
        setLogs([]);

        // BATCH LOOP
        for (let i = 0; i < recipients.length; i++) {
            if (stopRef.current) break;

            const recipient = recipients[i];
            const credential = rotator.current.getNext();

            try {
                // Call Backend
                const res = await axios.post(`${API_URL}/send-batch`, {
                    userId: user?.user?.id || user?.id,
                    serverId: selectedServerId, // "direct" or ID
                    smtpConfig: credential,
                    messageConfig: {
                        senderName: template.senderName,
                        subject: template.subject, // Backend handles tags
                        text: template.text,
                        html: template.html,
                        headers: {} // TODO: Custom headers UI
                    },
                    recipient: recipient
                });

                if (res.data.success) {
                    setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
                    addLog(`✅ Sent to ${recipient.email} via ${credential.hostname || credential.user}`);
                } else {
                    throw new Error("Backend reported failure");
                }

            } catch (err) {
                console.error(err);
                setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                addLog(`❌ Failed ${recipient.email}: ${err.message}`);
            }

            // Small delay to prevent UI freeze
            await new Promise(r => setTimeout(r, 100));
        }

        setIsSending(false);
        toast.info("Campaign finished");
    };

    const stopCampaign = () => {
        stopRef.current = true;
        setIsSending(false);
    };

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 100));
    };

    const downloadSample = (type) => {
        let content = "";
        let filename = "";

        if (type === "recipients") {
            content = "email,name,c3,c4,c5,c6\ntest1@example.com,John Doe,Order-101,VIP,USA,FreeShipping\ntest2@example.com,Jane Smith,Order-102,Standard,UK,Paid";
            filename = "sample_recipients.csv";
        } else {
            content = "user,pass,host,port,hostname,clientId,clientSecret,refreshToken\nsender@example.com,secret123,smtp.mailtrap.io,2525,my-app.local,,,\nmy-gmail@gmail.com,,,,,YOUR_CLIENT_ID,YOUR_CLIENT_SECRET,YOUR_REFRESH_TOKEN";
            filename = "sample_smtp_credentials.csv";
        }

        const blob = new Blob([content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };


    // ==========================
    // 3. UI RENDER
    // ==========================
    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200">
            {/* HEADER */}
            <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50">
                <div className="font-bold text-xl flex items-center gap-2">
                    <Mail className="text-cyan-400" /> MyMail <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded">PRO</span>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1">
                    <TabBtn id="control" label="Control" icon={<Settings size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="emails" label="Emails (CSV)" icon={<Users size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="smtp" label="SMTP / Gmail" icon={<Server size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="template" label="Template" icon={<FileText size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="market" label="Servers (RDP)" icon={<GlobeIcon />} active={activeTab} set={setActiveTab} />
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden p-6 relative">

                {/* TAB: CONTROL */}
                {activeTab === "control" && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* STATS */}
                        <div className="grid grid-cols-3 gap-6">
                            <StatCard label="Recipients" val={recipients.length} color="text-blue-400" />
                            <StatCard label="Senders" val={rotator.current.getCount()} color="text-purple-400" />
                            <StatCard label="Servers" val={myServers.length} color="text-green-400" />
                        </div>

                        {/* SENDING CONFIG */}
                        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
                            <label className="block text-sm font-bold text-slate-400 mb-2">Networking Tunnel (RDP)</label>
                            <select
                                value={selectedServerId}
                                onChange={(e) => setSelectedServerId(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="direct">Direct Connection (No Proxy)</option>
                                {myServers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        Server {s.id} - {s.ip} ({s.username})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                                Select an active RDP server to route your SMTP traffic through.
                                If secure proxying is required, ensure the server is rented.
                            </p>
                        </div>

                        {/* ACTION */}
                        <div className="flex gap-4">
                            {!isSending ? (
                                <button onClick={startCampaign} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-bold flex justify-center items-center gap-2 text-lg shadow-lg shadow-cyan-900/20">
                                    <Play fill="currentColor" /> START CAMPAIGN
                                </button>
                            ) : (
                                <button onClick={stopCampaign} className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-xl font-bold flex justify-center items-center gap-2 text-lg animate-pulse">
                                    <Pause fill="currentColor" /> STOP
                                </button>
                            )}
                        </div>

                        {/* LOGS */}
                        <div className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs border border-slate-800">
                            {logs.length === 0 && <div className="text-slate-600 italic">Ready to send...</div>}
                            {logs.map((L, i) => (
                                <div key={i} className="mb-1 border-b border-white/5 pb-1">{L}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: EMAILS */}
                {activeTab === "emails" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Manage Recipients</h3>
                            <button
                                onClick={() => downloadSample("recipients")}
                                className="text-sm bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700"
                            >
                                <FileText size={16} /> Download Sample CSV
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center hover:border-blue-500 transition-colors bg-slate-900/30 mb-8">
                            <Upload className="mx-auto text-slate-500 mb-3" size={48} />
                            <h3 className="text-lg font-bold mb-1">Upload Recipients CSV</h3>
                            <p className="text-slate-500 text-sm mb-4">Required: header row with 'email' column</p>
                            <input type="file" accept=".csv" onChange={handleRecipientsUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        {recipients.length > 0 && (
                            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-800 text-slate-400">
                                        <tr>
                                            {Object.keys(recipients[0]).slice(0, 5).map(k => <th key={k} className="p-3">{k}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recipients.slice(0, 10).map((r, i) => (
                                            <tr key={i} className="border-t border-slate-800">
                                                {Object.values(r).slice(0, 5).map((v, j) => <td key={j} className="p-3 text-slate-300">{v}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-2 text-center text-xs text-slate-500 bg-slate-950">Showing first 10 rows</div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: SMTP */}
                {activeTab === "smtp" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Manage Senders</h3>
                            <button
                                onClick={() => downloadSample("smtp")}
                                className="text-sm bg-slate-800 hover:bg-slate-700 text-purple-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700"
                            >
                                <FileText size={16} /> Download Sample CSV
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center hover:border-purple-500 transition-colors bg-slate-900/30 mb-8">
                            <Upload className="mx-auto text-slate-500 mb-3" size={48} />
                            <h3 className="text-lg font-bold mb-1">Upload SMTP / Gmail CSV</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                Auto-detects columns: <code>user, pass, host, port</code> OR <code>clientId, clientSecret, refreshToken</code>
                            </p>
                            <input type="file" accept=".csv" onChange={handleSmtpUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                        </div>
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                            <h4 className="font-bold mb-4">Current Credentials ({smtpCredentials.length})</h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {smtpCredentials.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-800 p-3 rounded text-sm">
                                        <span className="font-mono text-cyan-400">{c.type === 'gmail_api' ? 'GMAIL_API' : 'SMTP'}</span>
                                        <span className="text-slate-300">{c.user}</span>
                                        <span className="text-slate-500">{c.host || 'google-oauth'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: TEMPLATE */}
                {activeTab === "template" && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sender Name</label>
                            <input className="w-full bg-slate-900 border border-slate-700 rounded p-3" value={template.senderName} onChange={e => setTemplate({ ...template, senderName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                            <input className="w-full bg-slate-900 border border-slate-700 rounded p-3" value={template.subject} onChange={e => setTemplate({ ...template, subject: e.target.value })} />
                            <div className="text-xs text-slate-500 mt-1">Tags: <code>{`{{name}}, {{email}}, {{id}}`}</code></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 h-96">
                            <div className="flex flex-col">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plain Text Body</label>
                                <textarea className="flex-1 w-full bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm" value={template.text} onChange={e => setTemplate({ ...template, text: e.target.value })} />
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HTML Body</label>
                                <textarea className="flex-1 w-full bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm" value={template.html} onChange={e => setTemplate({ ...template, html: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: MARKET */}
                {activeTab === "market" && (
                    <ServerMarket user={user} />
                )}

            </div>
        </div>
    );
}

// Sub-components
function TabBtn({ id, label, icon, active, set }) {
    const isActive = active === id;
    return (
        <button onClick={() => set(id)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${isActive ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            {icon} {label}
        </button>
    );
}

function GlobeIcon() {
    return <Globe size={16} />
}
import { Globe } from "lucide-react";

function StatCard({ label, val, color }) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${color} mb-1`}>{val}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
