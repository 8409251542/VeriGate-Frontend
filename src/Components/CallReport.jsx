import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Zap,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  LogOut,
  User,
  Calendar,
} from "lucide-react";

export default function CallReportGenerator() {
  const [file, setFile] = useState(null);
  const [reportDate, setReportDate] = useState("");
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const [usdtBalance, setUsdtBalance] = useState(0);
  const COST_PER_REPORT = 1; // 1 USDT

  const API_BASE = "https://verigate-backend.onrender.com";

  // Fetch user details on load
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/get-user-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsdtBalance(data.usdt_balance);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Check existing session on load
  useEffect(() => {
    const authData = localStorage.getItem("user");
    if (authData) {
      const userData = JSON.parse(authData);
      setUser(userData.user);
      fetchUserDetails(userData.user.id);
    }
  }, []);

  const logStatus = (msg) => {
    setStatus((prev) => prev + "\n" + msg);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStatus(`File selected: ${uploadedFile.name}`);
    }
  };

  const handleGenerate = async () => {
    if (!file) return alert("Please upload a file first!");
    if (!reportDate) return alert("Please select a report date!");
    if (!user) return alert("User not logged in. Please log in first.");

    

    setProcessing(true);
    setStatus("Processing started...");
    setDownloadUrl(null); // Reset download state
    setFileName("");
    logStatus(`Reading file: ${file.name}`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportDate", reportDate);
    formData.append("userId", user.id);

    try {
      logStatus("Uploading file to server...");
      const res = await fetch(`${API_BASE}/api/generate-report`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate report");
      }

      const data = await res.json();
      setDownloadUrl(data.downloadUrl); // API must return the URL
      setFileName(`buyer_reports_${reportDate}.zip`);

      logStatus(
        "✅ Done! Report generated successfully. Click the download button below."
      );
      // Update token balance
      const newBalance = usdtBalance - COST_PER_REPORT;
      setUsdtBalance(newBalance);

      logStatus(
        "✅ Done! Report generated successfully. Click the download button below."
      );
    } catch (err) {
      console.error(err);
      logStatus("❌ Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && fileName) {
      window.open(downloadUrl, "_blank");
      logStatus(`📥 Downloaded: ${fileName}`);
    }
  };

  

  const canAffordReport = usdtBalance >= COST_PER_REPORT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Call Report Generator
            </h1>
            <p className="text-gray-600">
              Upload your call data file (CSV/XLSX), choose report date, and get
              buyer-wise reports.
            </p>
          </div>

          {user && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.email || "User"}</span>
            </div>
          )}
        </div>

        {/* Token Balance Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3>USDT Balance</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {(usdtBalance || 0).toFixed(2)} USDT
                </p>

                <span>Cost per report: 1 USDT</span>
              </div>
              

            </div>
          </div>

          
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Call Data File (.csv, .xlsx, .xls)
            </label>
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {file ? file.name : "Click to upload your file"}
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, XLSX, and XLS formats
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Report Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              disabled={!file || !reportDate || processing || !canAffordReport}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                !file || !reportDate || processing || !canAffordReport
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Generate Reports ({COST_PER_REPORT} USDT)</span>
                </div>
              )}
            </button>
          </div>

          {/* Download Button - Shows after successful generation */}
          {downloadUrl && fileName && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-2 text-green-700 text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Report generated successfully!</span>
                </div>
                <p className="text-green-600 text-sm">
                  Your buyer reports are ready for download.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download {fileName}</span>
                </div>
              </button>
            </div>
          )}

          {/* Status Display */}
          {status && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                Processing Status
              </h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border max-h-60 overflow-y-auto">
                {status}
              </pre>
            </div>
          )}

          {/* How it works */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How It Works
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Upload",
                  desc: "Upload your call data file",
                },
                {
                  step: "2",
                  title: "Select Date",
                  desc: "Choose the report date",
                },
                {
                  step: "3",
                  title: "Process",
                  desc: "System analyzes and groups by buyer",
                },
                {
                  step: "4",
                  title: "Download",
                  desc: "Get ZIP file with all reports",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm mb-2 mx-auto">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        
      </div>
    </div>
  );
}
