import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const userId = localStorage.getItem('userId'); // Get from your auth system
  const API_URL = 'https://verigate-backend.onrender.com';

  // Generate random invoice number on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: generateRandomInvoice()
    }));
    fetchUserBalance();
  }, []);

  const generateRandomInvoice = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const r = (n) => {
      let s = '';
      for (let i = 0; i < n; i++) {
        s += letters[Math.floor(Math.random() * letters.length)];
      }
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setDownloadUrl('');

    try {
      const response = await axios.post(`${API_URL}/api/generate-invoice`, {
        userId,
        ...formData
      });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Invoice Generator
          </h1>
          <p className="text-gray-600">
            Generate professional invoices • Cost: 2 USDT per invoice
          </p>
          <div className="mt-4 inline-block bg-white px-6 py-3 rounded-full shadow-sm">
            <span className="text-sm text-gray-600">Your Balance: </span>
            <span className="font-bold text-indigo-600">{userBalance.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Form Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., PAY PAL"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (optional)
              </label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 858 426 0634"
              />
              <p className="text-xs text-gray-500 mt-1">Appears under "Contact" on invoice</p>
            </div>

            {/* Support Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Phone
              </label>
              <input
                type="text"
                name="supportPhone"
                value={formData.supportPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 800 123 4567"
              />
              <p className="text-xs text-gray-500 mt-1">Appears in footer/assistance</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="$189.25"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="TRX-68572610"
              />
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="SK30Q-89CY-EO68V"
                />
                <button
                  onClick={handleRandomize}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                  type="button"
                >
                  🎲
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click dice to generate random</p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading || userBalance < 2}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                `Generate Invoice (2 USDT)`
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
              >
                📥 Download Invoice
              </a>
            )}
          </div>

          {userBalance < 2 && (
            <p className="mt-4 text-center text-sm text-red-600">
              Insufficient balance. Please recharge to generate invoices.
            </p>
          )}

          {/* Preview Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> The invoice will be generated as a high-quality JPG image 
              that you can download and share. Make sure all details are correct before generating.
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {downloadUrl && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Preview</h3>
            <img
              src={downloadUrl}
              alt="Generated Invoice"
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerator