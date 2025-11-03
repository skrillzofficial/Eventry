import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Calendar,
  Ticket,
  Search,
  Download,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { apiCall } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const ApprovalsDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadApprovalRequests();
  }, [filter]);

  const loadApprovalRequests = async () => {
    setLoading(true);
    try {
      // API call to get approval requests
      const params = {
        status: filter === "all" ? undefined : filter,
      };

      const result = await apiCall(() =>
        fetch("/api/organizer/approval-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }).then((res) => res.json())
      );

      if (result.success) {
        setRequests(result.data.requests || []);
      }
    } catch (error) {
      console.error("Error loading approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      const result = await apiCall(() =>
        fetch(`/api/organizer/approval-requests/${requestId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
      );

      if (result.success) {
        alert("✅ Request approved! Attendee will receive their ticket via email.");
        loadApprovalRequests();
      } else {
        alert(`❌ Failed to approve: ${result.error}`);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("❌ Error approving request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setActionLoading(selectedRequest.id);
    try {
      const result = await apiCall(() =>
        fetch(`/api/organizer/approval-requests/${selectedRequest.id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }).then((res) => res.json())
      );

      if (result.success) {
        alert("❌ Request rejected. Attendee has been notified.");
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason("");
        loadApprovalRequests();
      } else {
        alert(`❌ Failed to reject: ${result.error}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("❌ Error rejecting request");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleBulkApprove = async () => {
    const pendingRequests = filteredRequests.filter(
      (r) => r.status === "pending"
    );

    if (pendingRequests.length === 0) {
      alert("No pending requests to approve");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve ${pendingRequests.length} pending request(s)?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const ids = pendingRequests.map((r) => r.id);
      const result = await apiCall(() =>
        fetch("/api/organizer/approval-requests/bulk-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestIds: ids }),
        }).then((res) => res.json())
      );

      if (result.success) {
        alert(
          `✅ Approved ${result.data.approved} request(s) successfully!`
        );
        loadApprovalRequests();
      } else {
        alert(`❌ Bulk approve failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error bulk approving:", error);
      alert("❌ Error during bulk approval");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Email", "Event", "Tickets", "Type", "Status", "Requested Date"],
      ...filteredRequests.map((r) => [
        r.userName,
        r.userEmail,
        r.eventTitle,
        r.quantity,
        r.ticketType,
        r.status,
        new Date(r.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `approval-requests-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    total: requests.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto w-11/12 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Ticket Approvals
              </h1>
              <p className="text-gray-600">
                Review and manage ticket requests for approval-required events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadApprovalRequests}
                disabled={loading}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Approved</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-xs text-gray-500 mt-1">Tickets issued</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Rejected</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-xs text-gray-500 mt-1">Declined requests</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <Ticket className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">All requests</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Status Filter */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {["pending", "approved", "rejected", "all"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      filter === status
                        ? "bg-[#FF6B35] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      {status !== "all" && (
                        <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                          {stats[status]}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {stats.pending > 0 && filter === "pending" && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleBulkApprove}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve All ({stats.pending})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Requests */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No approval requests found</p>
                  <p className="text-sm text-gray-400">
                    {filter !== "all"
                      ? `No ${filter} requests to display`
                      : "Requests will appear here when attendees book tickets"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {filteredRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={openRejectModal}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Reject Request
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedRequest?.userName}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request cannot be approved..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                The attendee will receive this message via email
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const RequestCard = ({ request, onApprove, onReject, actionLoading }) => {
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-[#FF6B35] transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {request.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{request.userName}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {request.userEmail}
              </div>
            </div>
            <div className="ml-auto">
              {getStatusBadge(request.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Event</div>
              <Link
                to={`/event/${request.eventId}`}
                className="font-medium text-gray-900 hover:text-[#FF6B35]"
              >
                {request.eventTitle}
              </Link>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {new Date(request.eventDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Tickets</div>
              <div className="font-semibold text-gray-900">
                {request.quantity} × {request.ticketType}
              </div>
              <div className="text-sm text-gray-500">
                ₦{(request.totalAmount || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Requested</div>
              <div className="text-sm text-gray-900">{formatDate(request.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {request.status === "pending" && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={() => onApprove(request.id)}
            disabled={actionLoading === request.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {actionLoading === request.id ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Approve
              </>
            )}
          </button>
          <button
            onClick={() => onReject(request)}
            disabled={actionLoading === request.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {request.status === "rejected" && request.rejectionReason && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{request.rejectionReason}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsDashboard;