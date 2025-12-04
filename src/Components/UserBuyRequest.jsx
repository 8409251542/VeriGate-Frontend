import React, { useState } from "react";
import { toast } from "react-toastify";

export default function BuyToken() {
  const [network, setNetwork] = useState("TRC20");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const usdtAddress =
    network === "TRC20"
      ? "TXYZ1234567890EXAMPLETRC20ADDRESS"
      : "0xABCDEF1234567890EXAMPLEBEP20ADDRESS";

  const handleCopy = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast.info("📋 USDT address copied!");
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

      const res = await fetch("https://verigate-backend.onrender.com/purchase", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "❌ Failed to submit purchase");
        return;
      }

      toast.success("✅ Purchase submitted successfully!");
      setUsdtAmount("");
      setTxHash("");
      setScreenshot(null);
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
  };

  return (
     <div className="max-w-lg mx-auto mt-8 mb-12 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <h2>Add USDT Balance</h2>
<p>💰 Balance will be credited in USDT directly</p>

      </div>

      <div className="p-8">
        {/* Network Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Network
          </label>
          <select 
            value={network} 
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-800 font-medium"
          >
            <option value="TRC20">TRC20</option>
            <option value="BEP20">BEP20</option>
          </select>
        </div>

        {/* Payment Address Section */}
        <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
          <div className="text-center">
            <p className="font-semibold text-gray-800 mb-3">USDT Address</p>
            
            <div className="bg-white p-4 rounded-lg border border-red-200 mb-4">
              <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                {usdtAddress}
              </p>
            </div>
            
            <button 
              type="button" 
              onClick={handleCopy}
              className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg mb-4"
            >
              Copy Address
            </button>
            
            <div className="mt-4">
              <div className="w-36 h-36 mx-auto bg-white rounded-lg border-2 border-red-300 flex items-center justify-center mb-2">
                <span className="text-red-600 font-medium text-sm">QR Code</span>
              </div>
              <p className="text-xs text-gray-500">Scan QR to pay</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              USDT Amount
            </label>
            <select 
            value={usdtAmount} 
             onChange={(e) => setUsdtAmount(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-800 font-medium"
          >
            <option value="75">75</option>
            <option value="100">100</option>
            <option value="180">180</option>
          </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Hash
            </label>
            <input
              type="text"
              placeholder="Enter transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Screenshot
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                required
                className="sr-only"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-gray-400 text-2xl mb-2">📁</div>
                  <p className="text-sm text-gray-600 font-medium">
                    {screenshot ? screenshot.name : "Click to upload screenshot"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Submit Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
