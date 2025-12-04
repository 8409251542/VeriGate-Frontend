import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileText,
  Download,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "react-toastify";


const UserNumberVerification = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  
  // Progress tracking states
  const [progress, setProgress] = useState(0);
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [processedNumbers, setProcessedNumbers] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const progressIntervalRef = useRef(null);
  const pauseTimeRef = useRef(0);
const [userLimit, setUserLimit] = useState(null);
const [usedLimit, setUsedLimit] = useState(0);

  const [history, setHistory] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("USA");

const countryCodes = {
  USA: "+1",
  UK: "+44",
  Australia: "+61",
  India: "+91"
};


  useEffect(() => {
    const fetchUserDetails = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;
      if (!userId) return;

      const res = await fetch(`https://verigate-backend.onrender.com/user-details?userId=${userId}`);
      const data = await res.json();

    setUserLimit(data.usdt_balance);

    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  fetchUserDetails();
    fetchHistory();
    loadProgressFromStorage();
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [downloadUrl]);

  const saveProgressToStorage = (progressData) => {
    const authData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = authData?.user?.id;
    if (userId) {
      localStorage.setItem(`upload_progress_${userId}`, JSON.stringify({
        ...progressData,
        timestamp: Date.now()
      }));
    }
  };

  const loadProgressFromStorage = () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;
      if (userId) {
        const saved = localStorage.getItem(`upload_progress_${userId}`);
        if (saved) {
          const progressData = JSON.parse(saved);
          // Only restore if timestamp is recent (within 1 hour)
          if (Date.now() - progressData.timestamp < 3600000) {
            setProgress(progressData.progress || 0);
            setTotalNumbers(progressData.totalNumbers || 0);
            setProcessedNumbers(progressData.processedNumbers || 0);
            setEstimatedTime(progressData.estimatedTime || 0);
            setUploading(progressData.uploading || false);
            setStartTime(progressData.startTime);
            
            if (progressData.uploading && progressData.progress < 100) {
              resumeProgressTracking(progressData);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const clearProgressFromStorage = () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;
      if (userId) {
        localStorage.removeItem(`upload_progress_${userId}`);
      }
    } catch (error) {
      console.error("Error clearing progress:", error);
    }
  };

  const resumeProgressTracking = (savedProgress) => {
    const elapsed = Date.now() - savedProgress.startTime - (savedProgress.pauseTime || 0);
    const avgLatency = 12.8; // ms per number
    const expectedProcessed = Math.min(elapsed / avgLatency, savedProgress.totalNumbers);
    
    setProcessedNumbers(Math.floor(expectedProcessed));
    startProgressSimulation(savedProgress.totalNumbers, savedProgress.startTime);
  };

  const fetchHistory = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;

      if (userId) {
        const res = await fetch(
          `https://verigate-backend.onrender.com/user-history?userId=${userId}`
        );
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      setHistory([]);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
 // make sure you install: npm install xlsx

const handleFileSelect = (selectedFile) => {
  if (!selectedFile) return;

  const ext = selectedFile.name.split(".").pop().toLowerCase();

  if (ext === "txt" || ext === "csv") {
    setFile(selectedFile);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());

        const numbers = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim();
          if (!line) continue;

          // Always take first column
          let phoneCandidate = line.split(",")[0].trim().replace(/['"]/g, "");

          // If first row and not numeric → skip
          if (i === 0 && isNaN(Number(phoneCandidate))) {
            continue;
          }

          // Handle scientific notation (e.g. 8.41E+09)
          if (phoneCandidate.includes("E")) {
            const num = Number(phoneCandidate);
            if (!isNaN(num)) phoneCandidate = num.toFixed(0);
          }

          // Accept only numeric-looking values
          if (/[\d\+\-\(\)\s]{8,}/.test(phoneCandidate)) {
            numbers.push(phoneCandidate);
          }
        }

        if (numbers.length > 0) {
          calculateStats(numbers);
        } else {
          setUploadStatus({
            type: "error",
            message:
              "No phone numbers found in the file. Please check the format.",
          });
        }
      } catch (error) {
        setUploadStatus({
          type: "error",
          message: "Error reading file: " + error.message,
        });
      }
    };

    reader.readAsText(selectedFile);
  } else if (ext === "xlsx" || ext === "xls") {
    setFile(selectedFile);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 }); 
        // 👆 header:1 returns raw rows as arrays

        const numbers = sheet
          .map((row, i) => {
            let phone = row[0]; // always first column

            // Skip first row if not numeric
            if (i === 0 && (phone === null || phone === undefined || isNaN(Number(phone)))) {
              return null;
            }

            if (typeof phone === "number") phone = phone.toFixed(0);
            if (typeof phone === "string" && phone.includes("E")) {
              const num = Number(phone);
              if (!isNaN(num)) phone = num.toFixed(0);
            }

            return phone ? phone.toString().trim() : null;
          })
          .filter(Boolean);

        if (numbers.length > 0) {
          calculateStats(numbers);
        } else {
          setUploadStatus({
            type: "error",
            message:
              "No phone numbers found in the Excel file. Please check the format.",
          });
        }
      } catch (error) {
        setUploadStatus({
          type: "error",
          message: "Error reading Excel file: " + error.message,
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  } else {
    setUploadStatus({
      type: "error",
      message: "Please select a valid CSV, TXT, XLSX, or XLS file.",
    });
  }
};



  const calculateStats = (numbers) => {
   const unique = new Set(numbers);
  const duplicates = numbers.length - unique.size;
  const uniqueCount = unique.size;

  setTotalNumbers(uniqueCount);

  const avgLatency = 33.3;
  const estimatedTimeMs = uniqueCount * avgLatency;
  setEstimatedTime(estimatedTimeMs);

  setUploadStatus({
    type: "info",
    message: `File Analysis: ${uniqueCount} unique numbers, ${duplicates} duplicates. Estimated time: ${formatTime(estimatedTimeMs)}`
  });

  // ✅ Toastify notification
  toast.info(`${uniqueCount} unique numbers, ${duplicates} duplicates`, {
    position: "top-right",
    autoClose: 4000,
    theme: "colored"
  });
  };

  const startProgressSimulation = (total, startTimeOverride = null) => {
    const actualStartTime = startTimeOverride || Date.now();
    if (!startTimeOverride) setStartTime(actualStartTime);
    
    progressIntervalRef.current = setInterval(() => {
      if (isPaused) return;
      
      const elapsed = Date.now() - actualStartTime - pauseTimeRef.current;
      const avgLatency = 77.8;
      const expectedProcessed = Math.min(elapsed / avgLatency, total);
      
      const newProcessed = Math.floor(expectedProcessed);
      const newProgress = Math.min((newProcessed / total) * 100, 98);
      
      setProcessedNumbers(newProcessed);
      setProgress(newProgress);
      
      const remaining = Math.max(0, (total - newProcessed) * avgLatency);
      setTimeRemaining(remaining);
      
      saveProgressToStorage({
        progress: newProgress,
        totalNumbers: total,
        processedNumbers: newProcessed,
        estimatedTime: total * avgLatency,
        uploading: true,
        startTime: actualStartTime,
        pauseTime: pauseTimeRef.current
      });
      
      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        setTimeRemaining(0);
      }
    }, 500);
  };

  const pauseProgress = () => {
    setIsPaused(true);
    const pauseStart = Date.now();
    pauseTimeRef.current += pauseStart - (startTime + pauseTimeRef.current);
  };

  const resumeProgress = () => {
    setIsPaused(false);
  };

  const resetProgress = () => {
    setProgress(0);
    setProcessedNumbers(0);
    setTotalNumbers(0);
    setEstimatedTime(0);
    setTimeRemaining(0);
    setStartTime(null);
    setIsPaused(false);
    pauseTimeRef.current = 0;
    clearProgressFromStorage();
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
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
    if (!file || totalNumbers === 0) return;
    if (userLimit && usedLimit + totalNumbers > userLimit) {
  toast.error(`❌ Upload exceeds your limit! You can only verify ${userLimit - usedLimit} more numbers.`, {
    position: "top-right",
    autoClose: 5000,
    theme: "colored"
  });

  setUploadStatus({
    type: "error",
    message: `Upload exceeds your plan. You can only verify ${userLimit - usedLimit} more numbers.`
  });

  return;
}

    setUploading(true);
    setUploadStatus(null);
    
    startProgressSimulation(totalNumbers);

    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;

      if (!userId) {
        setUploadStatus({
          type: "error",
          message: "User not logged in. Please login again.",
        });
        setUploading(false);
        resetProgress();
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      formData.append("countryCode", countryCodes[selectedCountry]);


      const response = await fetch("https://verigate-backend.onrender.com/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        setProgress(100);
        setProcessedNumbers(totalNumbers);
        setTimeRemaining(0);
        
        setDownloadUrl(result.fileUrl);
        setUploadStatus({
          type: "success",
          message: "Phone numbers verified successfully! Your file is ready for download.",
        });
        
        clearProgressFromStorage();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Upload failed. Please try again or check your file format. " + error.message,
      });
      resetProgress();
    } finally {
      setUploading(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const resetComponent = () => {
    setFile(null);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();
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
            Upload your CSV/TXT file to separate mobile and landline numbers | 
            <a
  href="/demo.txt"
  download="demo.txt"
  className="px-4 font-bold py-2 text-blue-700 rounded "
>
  Download Demo File
</a>

          </p>
        </div>

        {/* Country Selection */}
<div className="mb-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Select Country
  </label>
  <select
    value={selectedCountry}
    onChange={(e) => setSelectedCountry(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    {Object.keys(countryCodes).map((country) => (
      <option key={country} value={country}>
        {country}
      </option>
    ))}
  </select>
</div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
  accept=".csv,.txt,.xlsx,.xls"
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
                    {totalNumbers > 0 && (
                      <p className="text-sm text-red-600 font-medium mt-2">
                        {totalNumbers.toLocaleString()} numbers • Est. {formatTime(estimatedTime)}
                      </p>
                    )}
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
                      Drop your xlsx/CSV/TXT file here
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
                    : uploadStatus.type === "info" 
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                ) : uploadStatus.type === "info" ? (
                  <Phone className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-medium ${
                    uploadStatus.type === "success"
                      ? "text-green-700"
                      : uploadStatus.type === "info"
                      ? "text-blue-700"
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
                  disabled={!file || uploading || totalNumbers === 0}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    !file || uploading || totalNumbers === 0
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
              
        {/* Progress Bar */}
        {(uploading || progress > 0) && (
          <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Processing Progress</h3>
              <div className="flex items-center gap-2">
                {uploading && (
                  <button
                    onClick={isPaused ? resumeProgress : pauseProgress}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Pause className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                )}
                <span className="text-sm font-medium text-gray-600">
                  {progress.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isPaused ? 'bg-yellow-500' : 'bg-gradient-to-r from-red-600 to-red-800'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{processedNumbers.toLocaleString()}</div>
                <div className="text-gray-500">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totalNumbers.toLocaleString()}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-gray-500">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">16.8ms</div>
                <div className="text-gray-500">Avg/Number</div>
              </div>
            </div>
            
            {isPaused && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <Pause className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Processing paused - click play to resume</span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Previous Verifications */}
        {history.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 shadow-lg">
            <h3 className="font-bold text-red-800 mb-4 text-xl flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-red-700" />
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
                    href={h.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Upload a CSV/TXT file containing phone numbers in a "phone" column</p>
            <p>• The system will verify each number and classify it as mobile or landline</p>
            <p>• Download the results as a new CSV with separated columns</p>
            <p>• Progress is automatically saved and restored across page refreshes</p>
            <p>• Estimated processing time: 16.8ms per unique phone number</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNumberVerification;