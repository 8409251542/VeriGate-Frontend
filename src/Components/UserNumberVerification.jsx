import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Papa from "papaparse"; // install: npm install papaparse
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserNumberVerification = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState(0);
  useEffect(() => {
    fetchHistory();
  }, [setDownloadUrl]);
  const fetchHistory = async () => {
    const authData = JSON.parse(localStorage.getItem("user"));
    const userId = authData?.user?.id;

    const res = await fetch(
      `https://verigate-backend.onrender.com/user-history?userId=${userId}`
    );
    const data = await res.json();
    setHistory(data);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop().toLowerCase();

    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      setFile(selectedFile);
      setUploadStatus(null);
      setDownloadUrl(null);

      const reader = new FileReader();

      reader.onload = (e) => {
        let numbers = [];

        if (ext === "csv") {
          Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              // Keep full rows for reference
              const rows = result.data.filter(Boolean);

              // Extract only phone column for stats
              const numbers = rows.map((row) => row["phone"]).filter(Boolean);

              calculateStats(numbers); // shows duplicates count but doesn't mutate file
            },
          });
        } else {
          const wb = XLSX.read(e.target.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws);
          numbers = json.map((row) => row["phone"]).filter(Boolean);
          calculateStats(numbers);
        }
      };

      if (ext === "csv") reader.readAsText(selectedFile);
      else reader.readAsBinaryString(selectedFile);
    } else {
      setUploadStatus({
        type: "error",
        message: "Please select a valid CSV/Excel file.",
      });
    }
  };

  const calculateStats = (numbers) => {
    const unique = new Set(numbers);
    const duplicates = numbers.length - unique.size;

    toast.info(
      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "6px" }}
        >
          📊 File Analysis
        </div>
        <div style={{ fontSize: "1.1rem", margin: "4px 0" }}>
          ✅ <b>Token Use:</b> {unique.size}
        </div>
        <div style={{ fontSize: "1.1rem", margin: "4px 0" }}>
          ♻️ <b>Duplicates:</b> {duplicates}
        </div>
        <div style={{ fontSize: "1.1rem", margin: "4px 0" }}>
          📦 <b>Total Numbers:</b> {numbers.length}
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 10000, // 10 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          padding: "18px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)",
          color: "#2d2d2d",
        },
      }
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    // Get userId from localStorage
    const authData = JSON.parse(localStorage.getItem("user"));
    const userId = authData?.user?.id;

    if (!userId) {
      setUploadStatus({
        type: "error",
        message: "User not logged in. Please login again.",
      });
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId); // ✅ important

    try {
      const response = await fetch("https://verigate-backend.onrender.com/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDownloadUrl(result.fileUrl); // ✅ use Supabase signed URL
        setUploadStatus({
          type: "success",
          message:
            "Phone numbers verified successfully! Your file is ready for download.",
        });
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message:
          "Upload failed. Please try again or check your file format. " +
          error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank"); // ✅ direct Supabase link
    }
  };

  const resetComponent = () => {
    setFile(null);
    setUploadStatus(null);
    setDownloadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-3 rounded-full">
              <Phone className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Phone Number Verifier
          </h1>
          <p className="text-gray-600">
            Upload your CSV file to separate mobile and landline numbers
          </p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div
            className={`relative p-8 border-2 border-dashed transition-all duration-300 ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="text-center cursor-pointer">
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-700">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • Ready to upload
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetComponent();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <Upload className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drop your CSV/XLSX file here
                    </p>
                    <p className="text-gray-500 mb-4">
                      or click to browse and select a file
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus && (
            <div className="px-8 pb-6">
              <div
                className={`flex items-center p-4 rounded-lg ${
                  uploadStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-medium ${
                    uploadStatus.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {uploadStatus.message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <div className="flex gap-4">
              {!downloadUrl ? (
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    !file || uploading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Verify Phone Numbers
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Results
                  </button>
                  <button
                    onClick={resetComponent}
                    className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    Upload New File
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* previous verification    */}
        {history.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 shadow-lg">
            <h3 className="font-bold text-red-800 mb-4 text-xl flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-red-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Previous Verifications
            </h3>
            <ul className="space-y-3">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex justify-between items-center bg-white rounded-lg p-4 border border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col space-y-1">
                    <span className="text-red-800 font-medium">
                      {new Date(h.created_at).toLocaleString()}
                    </span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                        {h.unique_count} unique
                      </span>
                      <span className="text-red-700 flex items-center">
                        <span className="w-2 h-2 bg-red-700 rounded-full mr-2"></span>
                        {h.duplicates} duplicates
                      </span>
                    </div>
                  </div>
                  <a
                    href={h.downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Download</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How it works:
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Upload a CSV file containing phone numbers in a "phone" column
            </p>
            <p>
              • The system will verify each number and classify it as mobile or
              landline
            </p>
            <p>
              • Download the results as a new CSV with separated mobile and
              landline columns
            </p>
            <p>• Supported format: CSV files with phone numbers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNumberVerification;
