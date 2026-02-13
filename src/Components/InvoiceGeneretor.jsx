import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Download, Dice5, AlertCircle, Check } from 'lucide-react';

const InvoiceGenerator = () => {
  const [formData, setFormData] = useState({
    companyName: 'PAY PAL',
    phoneNumber: '+1 858 426 0634',
    supportPhone: '+1 800 123 4567',
    date: new Date().toISOString().split('T')[0],
    amount: '$189.25',
    transactionId: `TRX-${Math.floor(Math.random() * 100000000)}`,
    invoiceNumber: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user?.id;
  const API_URL = 'https://nexauthapi.vercel.app';

  useEffect(() => {
    setFormData(prev => ({ ...prev, invoiceNumber: generateRandomInvoice() }));
    if (userId) fetchUserBalance();
    else setError("User not logged in");
  }, []);

  const generateRandomInvoice = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const r = (n) => {
      let s = '';
      for (let i = 0; i < n; i++) s += letters[Math.floor(Math.random() * letters.length)];
      return s;
    };
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    return `${r(2)}${Math.floor(10 + Math.random() * 89)}-${digits}-${r(2)}`;
  };

  const fetchUserBalance = async () => {
    try {
      const response = await axios.post(`${API_URL}/get-user-details`, { userId });
      setUserBalance(response.data.usdt_balance || 0);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // State for Email & Attachments
  const [emailData, setEmailData] = useState({
    emailTo: "",
    emailSubject: "Your Invoice",
    emailBody: "Please find the attached invoice.",
    smtpConfig: {
      host: "smtp.gmail.com",
      port: 587,
      user: "",
      pass: ""
    }
  });
  const [attachments, setAttachments] = useState([]); // { filename, content, encoding: 'base64' }
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  // ... existing useEffect ...

  // Handler for Email/SMTP fields
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("smtp.")) {
      const field = name.split(".")[1];
      setEmailData(prev => ({
        ...prev,
        smtpConfig: { ...prev.smtpConfig, [field]: value }
      }));
    } else {
      setEmailData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handler for File Upload (max 5MB)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    const newAttachments = [];
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} exceeds 5MB limit and will be skipped.`);
        continue;
      }

      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          filename: file.name,
          content: base64,
          encoding: 'base64'
        });
      } catch (err) {
        console.error("File read error:", err);
      }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };


  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setDownloadUrl('');

    try {
      // Prepare payload
      const payload = {
        userId,
        ...formData,
        // Include email data if recipient is provided
        ...(emailData.emailTo ? {
          emailTo: emailData.emailTo,
          emailSubject: emailData.emailSubject,
          emailBody: emailData.emailBody,
          smtpConfig: emailData.smtpConfig,
          attachments: attachments
        } : {})
      };

      const response = await axios.post(`${API_URL}/api/generate-invoice`, payload);

      const msg = response.data.message;
      setSuccess(msg);
      if (response.data.email_status && response.data.email_status.startsWith("failed")) {
        setError(`Invoice generated but email failed: ${response.data.email_status}`);
      }

      setDownloadUrl(response.data.downloadUrl);
      setUserBalance(response.data.remaining_balance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  // ... handleRandomize ...

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left Side: Configuration Panel */}
        <div className="flex-1 min-w-0 pb-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Invoice Generator</h1>
            <p className="text-slate-400 text-sm">Create professional proofs instantly.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              📝 Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {[
                { label: "Company Name", name: "companyName", ph: "e.g., PAY PAL" },
                { label: "Amount", name: "amount", ph: "$189.25" },
                { label: "Contact Phone", name: "phoneNumber", ph: "+1 858..." },
                { label: "Support Phone", name: "supportPhone", ph: "+1 800..." },
                { label: "Transaction ID", name: "transactionId", ph: "TRX-..." },
                { label: "Date", name: "date", type: "date" },
                { label: "Logo URL", name: "logoUrl", ph: "https://..." },
              ].map((field) => (
                <div key={field.name} className={field.name === 'logoUrl' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.ph}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-700"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500/50"
                  />
                  <button onClick={handleRandomize} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-cyan-400 transition-colors">
                    <Dice5 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EMAIL SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowEmailSettings(!showEmailSettings)}>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                📧 Email Delivery (Optional)
              </h3>
              <button className="text-slate-500 hover:text-white text-sm">
                {showEmailSettings ? "Hide" : "Show"}
              </button>
            </div>

            {showEmailSettings && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Email</label>
                    <input name="emailTo" value={emailData.emailTo} onChange={handleEmailChange} placeholder="client@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                    <input name="emailSubject" value={emailData.emailSubject} onChange={handleEmailChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-cyan-500/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Attachments (Max 5MB)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold border border-slate-700 transition-colors">
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                      + Upload Files
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="bg-slate-800 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-slate-700 text-slate-300">
                          {file.filename}
                          <button onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-300">x</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SMTP Configuration (Sender)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input name="smtp.host" value={emailData.smtpConfig.host} onChange={handleEmailChange} placeholder="Host (e.g. smtp.gmail.com)" className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                    <input name="smtp.port" value={emailData.smtpConfig.port} onChange={handleEmailChange} placeholder="Port" className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                    <input name="smtp.user" value={emailData.smtpConfig.user} onChange={handleEmailChange} placeholder="Email User" className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                    <input name="smtp.pass" type="password" value={emailData.smtpConfig.pass} onChange={handleEmailChange} placeholder="Password/App Pass" className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="text-slate-400">Cost per generation</p>
                <p className="text-white font-bold">2.00 USDT</p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || userBalance < 2}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                {loading && <RefreshCw size={18} className="animate-spin" />}
                {loading ? 'Processing...' : (emailData.emailTo ? 'Generate & Email' : 'Generate Invoice')}
              </button>
            </div>
            {userBalance < 2 && <p className="text-red-400 text-xs mt-3 text-right">Insufficient balance ({userBalance} USDT)</p>}
            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            {success && <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2"><Check size={16} />{success}</div>}
          </div>
        </div>

        {/* Right Side: Preview Panel */}
        <div className="lg:w-96 flex flex-col gap-6">
          {/* Balance Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Available Balance</p>
            <div className="text-3xl font-mono text-white">{userBalance.toFixed(2)} <span className="text-sm text-slate-500">USDT</span></div>
          </div>

          {/* Preview Area */}
          <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] shadow-lg ${!downloadUrl && 'border-dashed'}`}>
            {downloadUrl ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden relative group mb-4 border border-slate-800">
                  <img src={downloadUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(downloadUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `invoice-${formData.invoiceNumber}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Download failed:', error);
                      window.open(downloadUrl, '_blank');
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 cursor-pointer"
                >
                  <Download size={18} /> Download JPG
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-600">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={24} />
                </div>
                <p className="font-medium">No invoice generated yet</p>
                <p className="text-sm mt-1">Fill out the form to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;