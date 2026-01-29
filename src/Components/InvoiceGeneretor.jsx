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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setDownloadUrl('');

    try {
      const response = await axios.post(`${API_URL}/api/generate-invoice`, { userId, ...formData });
      setSuccess(response.data.message);
      setDownloadUrl(response.data.downloadUrl);
      setUserBalance(response.data.remaining_balance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = () => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: generateRandomInvoice(),
      transactionId: `TRX-${Math.floor(Math.random() * 100000000)}`
    }));
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left Side: Configuration Panel */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Invoice Generator</h1>
            <p className="text-slate-400 text-sm">Create professional proofs instantly.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
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

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
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
                {loading ? 'Processing...' : 'Generate Invoice'}
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