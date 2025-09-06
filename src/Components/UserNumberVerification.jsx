import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const UserNumberVerification = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadStatus(null);
      setDownloadUrl(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid CSV file.' });
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
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
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
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'verified.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetComponent = () => {
    setFile(null);
    setUploadStatus(null);
    setDownloadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Phone Number Verifier</h1>
          <p className="text-gray-600">Upload your CSV file to separate mobile and landline numbers</p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Upload Area */}
          <div
            className={`relative p-8 border-2 border-dashed transition-all duration-300 ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : file 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
                    <p className="text-lg font-semibold text-green-700">{file.name}</p>
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
                      Drop your CSV file here
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
              <div className={`flex items-center p-4 rounded-lg ${
                uploadStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  uploadStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
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
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
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

        {/* Info Card */}
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Upload a CSV file containing phone numbers in a "phone" column</p>
            <p>• The system will verify each number and classify it as mobile or landline</p>
            <p>• Download the results as a new CSV with separated mobile and landline columns</p>
            <p>• Supported format: CSV files with phone numbers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNumberVerification;