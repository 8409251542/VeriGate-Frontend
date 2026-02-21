import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function PurchaseAdmin() {
  const [purchases, setPurchases] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const authData = JSON.parse(localStorage.getItem("user"));
  const adminId = authData?.user?.id;

  useEffect(() => {
    fetch("https://verigate-backend.onrender.com/purchases")
      .then((res) => res.json())
      .then((data) => setPurchases(data.purchases)).then((data) => console.log(data))
      .catch(() => {
        // Show error without toast
        console.error("Failed to load purchases");
      });
  }, []);

  const showNotification = (message, type = 'info') => {
    // Simple notification without external library
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${type === 'success' ? 'bg-green-600' :
      type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  const approvePurchase = async (id) => {
    try {
      const res = await fetch("https://verigate-backend.onrender.com/approve-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: id, adminId }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Failed to approve purchase", 'error');
        return;
      }

      showNotification(`Purchase approved (+${data.credited} USDT)`, 'success');

      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
      );
    } catch (err) {
      console.error(err);
      showNotification("Something went wrong", 'error');
    }
  };

  const openRejectModal = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedPurchaseId(null);
    setRejectionReason("");
    setIsRejecting(false);
  };

  const rejectPurchase = async () => {
    if (!rejectionReason.trim()) {
      showNotification("Please provide a rejection reason", 'error');
      return;
    }

    setIsRejecting(true);

    try {
      const res = await fetch("https://verigate-backend.onrender.com/reject-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId: selectedPurchaseId,
          reason: rejectionReason.trim()
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || "Failed to reject purchase", 'error');
        return;
      }

      showNotification("Purchase rejected successfully", 'success');
      setPurchases((prev) =>
        prev.map((p) => (p.id === selectedPurchaseId ? { ...p, status: "rejected", rejection_reason: rejectionReason.trim() } : p))
      );

      closeRejectModal();
    } catch (err) {
      console.error(err);
      showNotification("Something went wrong", 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";

    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-300`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`;
    }
  };

  const truncateHash = (hash) => {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Admin Purchase Requests</h2>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-red-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Network
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Amount (USDT)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Tx Hash
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Screenshot
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((p, index) => (
                <tr
                  key={p.id}
                  className={`transition-all duration-200 hover:bg-red-50 hover:shadow-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {p.user_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {p.network}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    ${p.usdt_amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {truncateHash(p.tx_hash)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.screenshot ? (
                      <a
                        href={p.screenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                      >
                        View Screenshot
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No screenshot</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={getStatusBadge(p.status)}>
                      {p.status}
                    </span>
                    {p.status === "rejected" && p.rejection_reason && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        Reason: {p.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approvePurchase(p.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(p.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {p.status === "approved" && (
                      <span className="text-green-600 font-medium">✓ Approved</span>
                    )}
                    {p.status === "rejected" && (
                      <span className="text-red-600 font-medium">✗ Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {purchases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No purchase requests found</div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Purchase Request
                </h3>
              </div>
              <button
                onClick={closeRejectModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this purchase request. This will help the user understand why their request was declined.
              </p>

              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  id="rejectionReason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeRejectModal}
                  disabled={isRejecting}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectPurchase}
                  disabled={!rejectionReason.trim() || isRejecting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRejecting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isRejecting ? 'Rejecting...' : 'Reject Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
