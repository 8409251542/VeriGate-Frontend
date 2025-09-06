import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PurchaseAdmin() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/purchases")
      .then((res) => res.json())
      .then((data) => setPurchases(data.purchases))
      .catch(() => toast.error("❌ Failed to load purchases"));
  }, []);

  const approvePurchase = async (id) => {
    try {
      const res = await fetch("http://localhost:5000/approve-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: id, tokenRate: 100 }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "❌ Failed to approve purchase");
        return;
      }

      toast.success(`✅ Purchase approved (+${data.tokensAdded} tokens)`);
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
      );
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
  };

   const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    
    switch(status) {
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
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((p, index) => (
              <tr 
                key={p.id} 
                className={`transition-all duration-200 hover:bg-red-50 hover:shadow-sm ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
                      href={`/uploads/${p.screenshot}`}
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
                </td>
                <td className="px-4 py-3 text-sm">
                  {p.status === "pending" && (
                    <button 
                      onClick={() => approvePurchase(p.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Approve
                    </button>
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
  );
}
