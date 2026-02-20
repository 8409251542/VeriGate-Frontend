import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
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
  RotateCw
} from "lucide-react";
import { toast } from "react-toastify";

const UserNumberVerification = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
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
  const [parsedNumbers, setParsedNumbers] = useState([]); // Store parsed numbers for batching

  const API_BASE = "https://nexauthapi.vercel.app";

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
        // const userId = authData?.user?.id;
        // Mocking balance/limit fetching
        // if (userId) ...
        setUserLimit(1000); // placeholder
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

  // Storage and Progress Logic (kept same, logic-wise)
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
    const avgLatency = 5.8;
    const expectedProcessed = Math.min(elapsed / avgLatency, savedProgress.totalNumbers);
    setProcessedNumbers(Math.floor(expectedProcessed));
    startProgressSimulation(savedProgress.totalNumbers, savedProgress.startTime);
  };

  const fetchHistory = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;
      if (userId) {
        const res = await fetch(`https://nexauthapi.vercel.app/user-history?userId=${userId}`);
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
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    else if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    else return `${seconds}s`;
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();

    if (["txt", "csv"].includes(ext)) {
      processTextFile(selectedFile);
    } else if (["xlsx", "xls"].includes(ext)) {
      processExcelFile(selectedFile);
    } else {
      setUploadStatus({ type: "error", message: "Invalid file type. Use CSV, TXT, XLSX." });
    }
  };

  const processTextFile = (selectedFile) => {
    setFile(selectedFile);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter(line => line.trim());
        const numbers = lines.map(line => {
          const val = line.split(",")[0].trim().replace(/['"]/g, "");
          return /[\d\+\-\(\)\s]{8,}/.test(val) ? val : null;
        }).filter(Boolean);

        if (numbers.length > 0) {
          setParsedNumbers(numbers);
          calculateStats(numbers);
        } else {
          setUploadStatus({ type: "error", message: "No numbers found." });
        }
      } catch (err) { setUploadStatus({ type: "error", message: "Read error: " + err.message }); }
    };
    reader.readAsText(selectedFile);
  };

  const processExcelFile = (selectedFile) => {
    setFile(selectedFile);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        const numbers = sheet.map(row => row[0]).filter(Boolean).map(String);

        if (numbers.length > 0) {
          setParsedNumbers(numbers);
          calculateStats(numbers);
        } else {
          setUploadStatus({ type: "error", message: "No numbers found." });
        }
      } catch (err) { setUploadStatus({ type: "error", message: "Read error: " + err.message }); }
    };
    reader.readAsArrayBuffer(selectedFile);
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
      message: `${uniqueCount} unique numbers ready to verify.`
    });
    toast.info(`${uniqueCount} unique numbers found`);
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
      setTimeRemaining(Math.max(0, (total - newProcessed) * avgLatency));

      saveProgressToStorage({
        progress: newProgress,
        totalNumbers: total,
        processedNumbers: newProcessed,
        estimatedTime: total * avgLatency,
        uploading: true,
        startTime: actualStartTime,
        pauseTime: pauseTimeRef.current
      });

      if (newProgress >= 100) clearInterval(progressIntervalRef.current);
    }, 500);
  };

  const pauseProgress = () => {
    setIsPaused(true);
    const pauseStart = Date.now();
    pauseTimeRef.current += pauseStart - (startTime + pauseTimeRef.current);
  };
  const resumeProgress = () => setIsPaused(false);

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
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file || parsedNumbers.length === 0) return;

    setUploading(true);
    setUploadStatus(null);
    setProgress(0);
    setProcessedNumbers(0);
    const startT = Date.now();
    setStartTime(startT);

    try {
      const authData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = authData?.user?.id;
      if (!userId) throw new Error("User not logged in");

      // Phase 1: Upload Unverified File to Supabase via Signed URL
      setUploadStatus({ type: "info", message: "Uploading original file to secure storage..." });
      const urlRes = await fetch(`${API_BASE}/api/get-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name })
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl: unverifiedFilePath } = await urlRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      // Phase 2: Batch Processing
      const batchSize = 50;
      const chunks = [];
      for (let i = 0; i < parsedNumbers.length; i += batchSize) {
        chunks.push(parsedNumbers.slice(i, i + batchSize));
      }

      let allVerifiedRows = [];
      setUploadStatus({ type: "info", message: "Verifying numbers in batches..." });

      for (let i = 0; i < chunks.length; i++) {
        // Pause check
        if (isPaused) {
          while (isPaused) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        const res = await fetch(`${API_BASE}/api/verify-batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            numbers: chunks[i],
            countryCode: countryCodes[selectedCountry]
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Batch ${i + 1} failed: ${errorText}`);
          continue;
        }

        const { results } = await res.json();
        allVerifiedRows = [...allVerifiedRows, ...results];

        const processed = Math.min((i + 1) * batchSize, parsedNumbers.length);
        const currentProgress = Math.min((processed / parsedNumbers.length) * 100, 99);
        setProcessedNumbers(processed);
        setProgress(currentProgress);

        // Update time remaining
        const elapsed = Date.now() - startT;
        const timePerNum = elapsed / processed;
        setTimeRemaining((parsedNumbers.length - processed) * timePerNum);
      }

      // Phase 3: Finalize (Local CSV Gen + Direct Upload)
      setUploadStatus({ type: "info", message: "Preparing verified results..." });

      const csv = Papa.unparse(allVerifiedRows);
      const csvBlob = new Blob([csv], { type: "text/csv" });

      setUploadStatus({ type: "info", message: "Uploading results to secure storage..." });
      const finalUrlRes = await fetch(`${API_BASE}/api/get-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: `verified-${Date.now()}.csv` })
      });
      if (!finalUrlRes.ok) throw new Error("Failed to get results upload URL");
      const { uploadUrl: resultsUploadUrl, publicUrl: verifiedFilePath } = await finalUrlRes.json();

      await fetch(resultsUploadUrl, {
        method: "PUT",
        body: csvBlob,
        headers: { "Content-Type": "text/csv" }
      });

      setUploadStatus({ type: "info", message: "Finalizing history..." });
      const finalizeRes = await fetch(`${API_BASE}/api/finalize-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          verifiedFilePath,
          verifiedCount: allVerifiedRows.length,
          totalUploaded: parsedNumbers.length,
          uniqueCount: totalNumbers,
          unverifiedFilePath
        })
      });

      if (finalizeRes.ok) {
        setProgress(100);
        setProcessedNumbers(parsedNumbers.length);
        setTimeRemaining(0);
        setDownloadUrl(verifiedFilePath);
        setUploadStatus({ type: "success", message: `Verification complete! Found ${allVerifiedRows.length} valid numbers.` });
      } else {
        throw new Error("Finalization failed");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus({ type: "error", message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) window.open(downloadUrl, "_blank");
  };

  const resetComponent = () => {
    setFile(null);
    setUploadStatus(null);
    setDownloadUrl(null);
    resetProgress();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Number Verification</h1>
        <p className="text-slate-400 text-sm">Upload bulk lists to detect carrier types and active status.</p>
      </div>

      {/* Configuration Bar */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Region</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500/50"
          >
            {Object.keys(countryCodes).map((country) => (
              <option key={country} value={country}>{country} ({countryCodes[country]})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 text-slate-500 text-xs pb-2">
          Supports .csv, .txt, .xlsx with numbers in first column.
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`bg-slate-900 border-2 border-dashed rounded-2xl p-10 transition-all text-center mb-8 relative overflow-hidden group ${dragOver ? "border-cyan-400 bg-cyan-500/5" :
          file ? "border-emerald-500/50 bg-emerald-500/5" :
            "border-slate-700 hover:border-cyan-500/30 hover:bg-slate-800"
          }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".csv,.txt,.xlsx" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />

        {file ? (
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{file.name}</h3>
            <p className="text-slate-400 mb-4">{(file.size / 1024).toFixed(1)} KB • {totalNumbers.toLocaleString()} numbers</p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={uploading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-3 rounded-xl disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {uploading && <RotateCw className="animate-spin" size={18} />}
                {uploading ? 'Verifying...' : 'Start Verification'}
              </button>
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetComponent(); }}
                  className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  Change File
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${dragOver ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-cyan-400'}`}>
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Drop your list here</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">Drag and drop your customer list to begin duplicate removal and carrier verification.</p>
            <button className="px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-medium hover:bg-slate-700 hover:border-slate-600 transition-all">
              Browse Files
            </button>
          </div>
        )}
      </div>

      {/* Progress & Status */}
      {(uploading || progress > 0 || uploadStatus) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          {uploadStatus && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${uploadStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              uploadStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
              {uploadStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <div>
                <strong className="block font-bold text-sm mb-1">{uploadStatus.type === 'error' ? 'Error' : uploadStatus.type === 'success' ? 'Success' : 'Info'}</strong>
                <p className="text-sm opacity-90">{uploadStatus.message}</p>
              </div>
            </div>
          )}

          {(uploading || progress > 0) && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">Processing...</span>
                <span className="text-cyan-400 font-mono">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full transition-all duration-300 ${isPaused ? 'bg-amber-500' : 'bg-cyan-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Processed", val: processedNumbers.toLocaleString(), color: "text-white" },
                  { label: "Total", val: totalNumbers.toLocaleString(), color: "text-slate-400" },
                  { label: "Remaining", val: formatTime(timeRemaining), color: "text-blue-400" },
                  { label: "Speed", val: "12ms/num", color: "text-emerald-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.val}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {uploading && (
                <div className="flex justify-center mt-6">
                  <button onClick={isPaused ? resumeProgress : pauseProgress} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {downloadUrl && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDownload}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                <Download size={18} /> Download Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Verifications</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{new Date(item.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{item.unique_count} numbers verification</p>
                  </div>
                </div>
                <a href={item.downloadUrl} target="_blank" className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Download size={18} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNumberVerification;