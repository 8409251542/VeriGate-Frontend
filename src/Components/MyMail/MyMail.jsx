
import React, { useState, useEffect, useRef } from "react";
import { Mail, Server, Users, FileText, Settings, Play, Pause, RefreshCw, Upload, CheckCircle, X, Globe } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { toast } from "react-toastify";
import axios from "axios";
import CredentialRotator from "./Logic/CredentialRotator";
import ServerMarket from "./ServerMarket";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const API_URL = "https://nexauthapi.vercel.app/api/mymail";
//const API_URL = "http://localhost:5000/api/mymail";
//file updated

export default function MyMail({ user }) {
    const [activeTab, setActiveTab] = useState("control"); // control, emails, smtp, template, market

    // Data State
    const [recipients, setRecipients] = useState([]);
    const [smtpCredentials, setSmtpCredentials] = useState([]);
    const [myServers, setMyServers] = useState([]);

    // Logic State
    const rotator = useRef(new CredentialRotator());
    const [rotateIPs, setRotateIPs] = useState(false);
    const [selectedServerId, setSelectedServerId] = useState("direct");

    // Template State
    const [template, setTemplate] = useState({
        senderName: "Support Team",
        subject: "Hello {{name}}",
        text: "Hi {{name}}, your code is {{c3}}.",
        html: "<p>Hi <strong>{{name}}</strong>,</p><p>Your code is <code>{{c3}}</code></p>"
    });
    const [attachments, setAttachments] = useState([]); // Array of { filename, content, encoding: 'base64' }
    const [pdfHtml, setPdfHtml] = useState(""); // State for PDF HTML input

    // generate PDF
    const generatePdf = async () => {
        if (!pdfHtml) return;
        const target = document.getElementById('pdf-render-target');
        target.innerHTML = pdfHtml;

        try {
            const canvas = await html2canvas(target, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Get base64 without prefix
            const base64String = pdf.output('datauristring').split(',')[1];

            const newFile = {
                filename: `generated-${Date.now()}.pdf`,
                content: base64String,
                encoding: 'base64'
            };

            setAttachments(prev => [...prev, newFile]);
            toast.success("PDF generated and attached!");
            setPdfHtml(""); // clear input
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF");
        }
        target.innerHTML = ""; // cleanup
    };

    // Attachment Handler
    const handleAttachmentUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newAttachments = [];
        for (const file of files) {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]); // Remove data:application/pdf;base64, prefix
                reader.readAsDataURL(file);
            });
            newAttachments.push({
                filename: file.name,
                content: base64,
                encoding: 'base64'
            });
        }
        setAttachments(prev => [...prev, ...newAttachments]);
        toast.success(`Added ${files.length} attachment(s)`);
    };

    // Sending State
    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
    const [logs, setLogs] = useState([]);

    // Refs for loop control
    const stopRef = useRef(false);

    useEffect(() => {
        fetchMyServers();
    }, [activeTab]);

    const fetchMyServers = async () => {
        try {
            const userId = user?.user?.id || user?.id; // Robust check
            const res = await axios.get(`${API_URL}/servers/my-servers?userId=${userId}`);
            setMyServers(res.data.servers);
        } catch (e) { }
    };

    // ==========================
    // 2. SENDING LOGIC
    // ==========================
    const startCampaign = async () => {
        if (recipients.length === 0) return toast.error("No recipients loaded");
        if (rotator.current.getCount() === 0) return toast.error("No SMTP credentials loaded");

        // Validate server selection
        if (selectedServerId === "direct" && !rotateIPs) {
            // It's allowed, but maybe warn?
        }
        if (rotateIPs && myServers.length === 0) {
            return toast.error("Rotation enabled but no active servers found!");
        }

        setIsSending(true);
        stopRef.current = false;
        setProgress({ sent: 0, failed: 0, total: recipients.length });
        setLogs([]);

        // BATCH LOOP
        for (let i = 0; i < recipients.length; i++) {
            if (stopRef.current) break;

            const recipient = recipients[i];
            const credential = rotator.current.getNext();

            // SOCKS5 Rotation Logic
            let activeServerId = selectedServerId;
            if (rotateIPs && myServers.length > 0) {
                // Round Robin: i % servers.length
                const serverIndex = i % myServers.length;
                activeServerId = myServers[serverIndex].id;
            }

            try {
                // Call Backend
                const res = await axios.post(`${API_URL}/send-batch`, {
                    userId: user?.user?.id || user?.id,
                    serverId: activeServerId, // Dynamic ID
                    smtpConfig: credential,
                    messageConfig: {
                        senderName: template.senderName,
                        subject: template.subject, // Backend handles tags
                        text: template.text,
                        html: template.html,
                        attachments: attachments, // Pass base64 files
                        headers: {} // TODO: Custom headers UI
                    },
                    recipient: recipient
                });

                if (res.data.success) {
                    setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
                    const srvLabel = activeServerId === "direct" ? "Direct" : `Server #${activeServerId}`;
                    addLog(`✅ Sent to ${recipient.email} via ${credential.hostname || credential.user} [${srvLabel}]`);
                } else {
                    throw new Error("Backend reported failure");
                }

            } catch (err) {
                console.error(err);
                setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));

                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown Error";
                addLog(`❌ Failed ${recipient.email}: ${errorMsg}`);
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
        toast.info("Stopping campaign...");
    };

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 500));
    };

    const downloadSample = (type) => {
        let csvContent = "";
        if (type === "recipients") {
            csvContent = "email,name,c3,c4,c5\nuser1@example.com,John,123,ABC,Test";
        } else {
            csvContent = "user,pass,host,port,type\nsender@gmail.com,apppass,smtp.gmail.com,587,smtp\nclient-id,client-secret,refresh-token,,gmail_api";
        }
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${type}_sample.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRecipientsUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    // Validate header - robust check
                    const firstRow = results.data[0];
                    const hasEmail = Object.keys(firstRow).some(k => k.toLowerCase() === 'email');

                    if (!hasEmail) {
                        return toast.error("CSV must contain an 'email' column");
                    }
                    setRecipients(results.data);
                    toast.success(`Loaded ${results.data.length} recipients`);
                }
            },
            error: (err) => {
                toast.error("Failed to parse CSV");
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
                if (results.data && results.data.length > 0) {
                    const newCreds = results.data.map(row => {
                        // Auto-detect type
                        if (row.clientId || row.refreshToken) {
                            return { type: 'gmail_api', ...row };
                        } else {
                            return { type: 'smtp', ...row };
                        }
                    });
                    setSmtpCredentials(newCreds);
                    // Also load into rotator
                    rotator.current.load(newCreds);
                    toast.success(`Loaded ${newCreds.length} senders`);
                }
            },
            error: (err) => {
                toast.error("Failed to parse CSV");
            }
        });
    };

    // ==========================
    // 3. UI RENDER
    // ==========================
    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200">
            {/* ... HEADER ... */}
            <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50">
                {/* ... header content ... */}

                {/* ... existing header content ... */}
                <div className="font-bold text-xl flex items-center gap-2">
                    <Mail className="text-cyan-400" /> MyMail <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded">PRO</span>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1">
                    {/* ... tabs ... */}
                    <TabBtn id="control" label="Control" icon={<Settings size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="emails" label="Emails (CSV)" icon={<Users size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="smtp" label="SMTP / Gmail" icon={<Server size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="template" label="Template" icon={<FileText size={16} />} active={activeTab} set={setActiveTab} />
                    <TabBtn id="market" label="Servers (RDP)" icon={<GlobeIcon />} active={activeTab} set={setActiveTab} />
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 relative">

                {/* TAB: CONTROL */}
                {activeTab === "control" && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* STATS */}
                        <div className="grid grid-cols-3 gap-6">
                            <StatCard label="Recipients" val={recipients.length} color="text-blue-400" />
                            <StatCard label="Senders" val={rotator.current.getCount()} color="text-purple-400" />
                            <StatCard label="Active IPs" val={myServers.length} color="text-green-400" />
                        </div>

                        {/* SENDING CONFIG (Simplified) */}
                        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-200">Proxy Rotation</h3>
                                <p className="text-xs text-slate-500">
                                    {myServers.length > 0
                                        ? `Routing through ${myServers.length} active servers.`
                                        : "Direct connection (No proxies active)."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-400">Enable Rotation</label>
                                <input
                                    type="checkbox"
                                    checked={rotateIPs}
                                    onChange={(e) => setRotateIPs(e.target.checked)}
                                    className="scale-125 accent-cyan-500"
                                />
                            </div>
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


                        {/* HTML TO PDF GENERATION */}
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <FileText size={16} /> Generate PDF from HTML
                            </h4>
                            <div className="flex flex-col gap-3">
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-3 font-mono text-xs h-32"
                                    placeholder="<div style='color:red;'><h1>My PDF Content</h1>...</div>"
                                    value={pdfHtml}
                                    onChange={(e) => setPdfHtml(e.target.value)}
                                />
                                <button
                                    onClick={generatePdf}
                                    disabled={!pdfHtml}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm w-fit transition-colors disabled:opacity-50"
                                >
                                    + Generate & Attach PDF
                                </button>
                            </div>
                            {/* Hidden container for rendering PDF */}
                            <div id="pdf-render-target" style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', backgroundColor: 'white', color: 'black' }}></div>
                        </div>

                        {/* ATTACHMENTS SECTION */}
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Upload size={16} /> Attachments (Docs / Images / Zip)
                            </h4>
                            <div className="flex gap-4 items-start">
                                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm font-medium transition-colors border border-slate-600">
                                    <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                                    + Add Files
                                </label>
                                <div className="flex-1 flex flex-wrap gap-2">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="bg-slate-800 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-slate-600">
                                            <span>{file.filename}</span>
                                            <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {attachments.length === 0 && <span className="text-slate-500 text-sm italic py-2">No attachments selected.</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: MARKET */}
                {activeTab === "market" && (
                    <ServerMarket user={user} onRent={fetchMyServers} />
                )}

            </div>
        </div >
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


function StatCard({ label, val, color }) {
    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${color} mb-1`}>{val}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
