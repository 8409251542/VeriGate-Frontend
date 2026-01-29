import React, { useState } from "react";
import { toast } from "react-toastify";
import { CreditCard, Upload, Copy, Check, QrCode } from "lucide-react";

export default function BuyToken() {
  const [network, setNetwork] = useState("TRC20");
  const [usdtAmount, setUsdtAmount] = useState("75");
  const [txHash, setTxHash] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const usdtAddress =
    network === "TRC20"
      ? "TTYm1bMYQH7tBBuvodSmYgpDSer9a6NhhB"
      : "0x39afc2bf5dce60727AD37fa439bBdbd427e6340e";

  const handleCopy = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast.info("📋 Address copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const userId = authData?.user?.id;

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("network", network);
      formData.append("usdt_amount", usdtAmount);
      formData.append("tx_hash", txHash);
      if (screenshot) formData.append("screenshot", screenshot);

      const res = await fetch("https://nexauthapi.vercel.app/purchase", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "❌ Failed to submit purchase");
        return;
      }

      toast.success("✅ Purchase submitted! Waiting for approval.");
      setUsdtAmount("75");
      setTxHash("");
      setScreenshot(null);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Add Funds</h1>
        <p className="text-slate-400 text-sm">Top up your account using Crypto (USDT)</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Network Selection */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Network</label>
          <div className="grid grid-cols-2 gap-4">
            {['TRC20', 'BEP20'].map((net) => (
              <button
                key={net}
                onClick={() => setNetwork(net)}
                className={`py-3 px-4 rounded-xl border font-bold transition-all ${network === net
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
              >
                USDT {net}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* QR and Address */}
          <div className="bg-white rounded-xl p-6 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-4">Scan to Pay</p>

            <div className="w-40 h-40 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-300">
              <QrCode size={64} className="text-slate-800" />
            </div>

            <p className="text-xs text-slate-400 mb-1">Deposit Address ({network})</p>
            <div
              onClick={handleCopy}
              className="bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-sm font-mono text-slate-700 break-all cursor-pointer hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group"
            >
              {usdtAddress}
              <Copy size={14} className="text-slate-400 group-hover:text-slate-600" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (USDT)</label>
                <select
                  value={usdtAmount}
                  onChange={(e) => setUsdtAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-all font-mono"
                >
                  <option value="75">75.00 USDT</option>
                  <option value="100">100.00 USDT</option>
                  <option value="180">180.00 USDT</option>
                  <option value="500">500.00 USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proof Screenshot</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    className="hidden"
                    id="proof-upload"
                    required
                  />
                  <label
                    htmlFor="proof-upload"
                    className={`w-full flex items-center justify-center px-4 py-3 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 transition-all ${screenshot ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-slate-400'
                      }`}
                  >
                    {screenshot ? (
                      <>
                        <Check size={18} className="mr-2" />
                        <span className="truncate">{screenshot.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        <span>Upload Image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Hash (TXID)</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="e.g. 8a3429..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-all font-mono placeholder:text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Submit Payment Request
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        Payments are processed manually within 1-2 hours.
      </p>
    </div>
  );
}
