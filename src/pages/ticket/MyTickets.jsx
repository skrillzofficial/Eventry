import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  QrCode,
  Ticket,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { ticketAPI, apiCall } from "../../services/api";
import QRCode from "qrcode";

const MyTickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyTickets();
    }
  }, [isAuthenticated]);

  const loadMyTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(ticketAPI.getUserTickets);
      
      if (result.success) {
        let ticketsData = [];
        
        // Handle different API response structures
        if (result.data?.data?.tickets && Array.isArray(result.data.data.tickets)) {
          ticketsData = result.data.data.tickets;
        } else if (result.data?.tickets && Array.isArray(result.data.tickets)) {
          ticketsData = result.data.tickets;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          ticketsData = result.data.data;
        } else if (Array.isArray(result.data)) {
          ticketsData = result.data;
        } else if (result.data?._id) {
          ticketsData = [result.data];
        } else if (Array.isArray(result)) {
          ticketsData = result;
        }
        
        console.log("Loaded tickets:", ticketsData);
        setTickets(ticketsData);
      } else {
        setError(result.error || result.message || "Failed to load tickets");
        setTickets([]);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
      setError("Unable to load tickets. Please try again.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getTicketDisplayData = (ticket) => {
    // Handle both direct ticket objects and populated ticket objects
    const eventData = ticket.eventId || ticket.event || {};
    const userData = ticket.userId || ticket.user || {};
    
    return {
      id: ticket._id,
      ticketId: ticket._id,
      eventId: ticket.eventId?._id || ticket.event?._id || ticket.eventId,
      
      eventTitle: ticket.eventName || eventData.title || "Untitled Event",
      eventDate: ticket.eventStartDate || ticket.eventDate || eventData.startDate,
      eventTime: ticket.eventTime || eventData.time,
      eventEndTime: ticket.eventEndTime || eventData.endTime,
      eventVenue: ticket.eventVenue || eventData.venue,
      eventCity: ticket.eventCity || eventData.city,
      eventCategory: ticket.eventCategory || eventData.category,
      
      ticketNumber: ticket.ticketNumber,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity || 1,
      totalPrice: ticket.totalAmount || ticket.ticketPrice, 
      ticketPrice: ticket.ticketPrice, 
      currency: ticket.currency || "NGN",
      
      purchaseDate: ticket.purchaseDate || ticket.createdAt,
      status: ticket.status || "confirmed",
      
      isUsed: ticket.checkedInAt !== undefined && ticket.checkedInAt !== null,
      isCancelled: ticket.status === "cancelled",
      isTransferable: ticket.isTransferable !== false,
      
      qrCode: ticket.qrCode,
      barcode: ticket.barcode,
      securityCode: ticket.securityCode,
      expiresAt: ticket.expiresAt,
      paymentStatus: ticket.paymentStatus || "completed",
      organizerName: ticket.organizerName || eventData.organizerName,
      
      userName: ticket.userName || userData.name || user?.name,
      userEmail: ticket.userEmail || userData.email || user?.email,
      
      _rawData: ticket
    };
  };

  const generateQRCode = async (ticket) => {
    try {
      setIsGeneratingQR(true);
      const ticketData = getTicketDisplayData(ticket);
      
      // Create QR code data
      const qrData = JSON.stringify({
        ticketId: ticketData.ticketId,
        ticketNumber: ticketData.ticketNumber,
        eventId: ticketData.eventId,
        userId: user?._id,
        securityCode: ticketData.securityCode,
        timestamp: Date.now()
      });
      
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#FF6B35",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error("QR generation error:", err);
      // Fallback QR code
      const ticketData = getTicketDisplayData(ticket);
      setQrCodeUrl(
        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="white"/><text x="150" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23FF6B35">Ticket: ${ticketData.ticketNumber}</text></svg>`
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleShowQRCode = async (ticket) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
    await generateQRCode(ticket);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedTicket(null);
    setQrCodeUrl("");
  };

  const downloadTextTicket = (ticketData) => {
    const currencySymbol = ticketData.currency === "NGN" ? "₦" : "$";

    const ticketText = `
╔════════════════════════════════════════╗
║               EVENT TICKET             ║
╚════════════════════════════════════════╝

${ticketData.eventTitle}

📅 DATE
${new Date(ticketData.eventDate).toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

⏰ TIME
${ticketData.eventTime}${ticketData.eventEndTime ? ` - ${ticketData.eventEndTime}` : ""}

📍 VENUE
${ticketData.eventVenue}, ${ticketData.eventCity}

🎟️ TICKET DETAILS
Ticket Number: ${ticketData.ticketNumber}
Ticket Type: ${ticketData.ticketType}
Quantity: ${ticketData.quantity} ticket(s)
Price per ticket: ${currencySymbol}${(ticketData.ticketPrice || 0).toLocaleString()}
Total Amount: ${currencySymbol}${(ticketData.totalPrice || 0).toLocaleString()}
Status: ${ticketData.status.toUpperCase()}

👤 ATTENDEE
${ticketData.userName || "N/A"}
${ticketData.userEmail || "N/A"}

🏢 ORGANIZER
${ticketData.organizerName || "N/A"}

Purchased: ${new Date(ticketData.purchaseDate).toLocaleDateString("en-NG")}

╔════════════════════════════════════════╗
║   Present this ticket at venue entry   ║
╚════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticketData.ticketNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async (ticket) => {
    try {
      setIsGeneratingPDF(true);
      const ticketData = getTicketDisplayData(ticket);
      
      // Try to download from backend first
      const result = await apiCall(() => ticketAPI.downloadTicket(ticketData.ticketId));
      
      if (result.success && result.data) {
        // Handle blob response for PDF download
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticketData.ticketNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to text download
        downloadTextTicket(ticketData);
      }
    } catch (error) {
      console.error("PDF download failed:", error);
      // Fallback to text download
      const ticketData = getTicketDisplayData(ticket);
      downloadTextTicket(ticketData);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleResendEmail = async (ticket) => {
    try {
      const ticketData = getTicketDisplayData(ticket);
      const result = await apiCall(() => ticketAPI.resendTicketEmail(ticketData.ticketId));
      
      if (result.success) {
        alert("Ticket confirmation email has been sent!");
      } else {
        alert(result.error || result.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("Resend email error:", error);
      alert("Unable to resend email. Please try again.");
    }
  };

  const QRCodeModal = () => {
    if (!showQRModal || !selectedTicket) return null;

    const ticketData = getTicketDisplayData(selectedTicket);
    const isValid = !ticketData.isCancelled && !ticketData.isUsed && 
                   (ticketData.paymentStatus === "completed" || ticketData.paymentStatus === "free");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scaleIn">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Your Ticket QR Code
            </h3>
            <button
              onClick={handleCloseQRModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              {ticketData.eventTitle}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {ticketData.eventDate ? new Date(ticketData.eventDate).toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Date not set"}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {ticketData.eventTime || "Time not set"}
                {ticketData.eventEndTime ? ` - ${ticketData.eventEndTime}` : ""}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {ticketData.eventVenue || "Venue not specified"}, {ticketData.eventCity || ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            {isGeneratingQR ? (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
                  <span className="ml-3 text-gray-600 mt-3">
                    Generating QR Code...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="white"/><text x="150" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23FF6B35">Ticket: ${ticketData.ticketNumber}</text></svg>`;
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Present this QR code at the event entrance
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  {ticketData.ticketNumber}
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              {isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Valid Ticket - Ready to Use
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">
                    {ticketData.isCancelled ? "Ticket Cancelled" : 
                     ticketData.isUsed ? "Ticket Already Used" :
                     ticketData.paymentStatus !== "completed" && ticketData.paymentStatus !== "free" ? "Payment Pending" : 
                     "Ticket Not Valid"}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => handleDownloadPDF(selectedTicket)}
              disabled={isGeneratingPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PDF Ticket</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleResendEmail(selectedTicket)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Resend Email</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ Keep this QR code secure. Do not share publicly.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mb-4" />
              <p className="text-gray-600">Loading your tickets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">My Tickets</h1>
              </div>
              <p className="text-gray-600 text-lg ml-15">
                {tickets.length > 0
                  ? `${tickets.length} ticket${tickets.length > 1 ? "s" : ""} ready for your events`
                  : "Manage and access your event tickets"}
              </p>
            </div>
            <button
              onClick={loadMyTickets}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#FF6B35] transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button 
                  onClick={loadMyTickets}
                  className="text-red-600 hover:text-red-800 text-sm mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {tickets.length === 0 && !loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No tickets yet
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start your journey! Discover incredible events and secure your tickets today.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              Discover Events
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const ticketData = getTicketDisplayData(ticket);
              const eventDate = new Date(ticketData.eventDate);
              const isUpcoming = eventDate >= new Date();
              const isPast = !isUpcoming;
              const isCancelled = ticketData.isCancelled;
              const isUsed = ticketData.isUsed;
              const isPaid = ticketData.paymentStatus === "completed" || ticketData.paymentStatus === "free";

              let statusBadge = {
                color: "bg-green-500 text-white",
                text: "Active",
                icon: CheckCircle,
              };

              if (isCancelled) {
                statusBadge = {
                  color: "bg-red-500 text-white",
                  text: "Cancelled",
                  icon: X,
                };
              } else if (!isPaid) {
                statusBadge = {
                  color: "bg-yellow-500 text-white",
                  text: "Payment Pending",
                  icon: AlertCircle,
                };
              } else if (isUsed) {
                statusBadge = {
                  color: "bg-gray-500 text-white",
                  text: "Used",
                  icon: CheckCircle,
                };
              } else if (isPast) {
                statusBadge = {
                  color: "bg-gray-500 text-white",
                  text: "Past Event",
                  icon: Clock,
                };
              } else if (isUpcoming) {
                statusBadge = {
                  color: "bg-green-500 text-white",
                  text: "Upcoming",
                  icon: CheckCircle,
                };
              }

              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={ticketData.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100"
                >
                  <div className="h-2 bg-[#FF6B35]" />

                  <div className="md:flex">
                    <div className="md:w-1/3 relative bg-[#FF6B35] p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-2 mb-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadge.color}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusBadge.text}
                          </span>
                          {ticketData.quantity > 1 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                              <Ticket className="h-3.5 w-3.5" />
                              {ticketData.quantity} Tickets
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                          {ticketData.eventTitle}
                        </h3>
                        
                        <div className="text-white/80 text-sm font-medium mb-4">
                          {ticketData.ticketType}
                        </div>

                        <div className="space-y-3 text-white/90">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span className="font-medium">
                              {ticketData.eventDate ? eventDate.toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) : "Date not set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span className="font-medium">
                              {ticketData.eventTime || "Time not set"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="text-white/70 text-xs font-medium mb-1">
                          TICKET NUMBER
                        </div>
                        <div className="text-white font-mono text-lg font-bold">
                          {ticketData.ticketNumber}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-2/3 p-8">
                      <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Total Amount
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {ticketData.currency === "NGN" ? "₦" : "$"}
                            {(ticketData.totalPrice || 0).toLocaleString()}
                          </div>
                          {ticketData.quantity > 1 && (
                            <div className="text-sm text-gray-600 mt-1">
                              {ticketData.quantity} × {ticketData.currency === "NGN" ? "₦" : "$"}
                              {(ticketData.ticketPrice || 0).toLocaleString()} each
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            Quantity
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {ticketData.quantity}
                          </div>
                          <div className="text-xs text-gray-500">
                            ticket{ticketData.quantity > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-start gap-3 text-gray-700">
                          <MapPin className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-1" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {ticketData.eventVenue || "Venue not specified"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {ticketData.eventCity || ""}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <button
                          onClick={() => handleDownloadPDF(ticket)}
                          disabled={isGeneratingPDF || isCancelled || !isPaid}
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingPDF ? (
                            <div className="animate-spin h-4 w-4 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => handleShowQRCode(ticket)}
                          disabled={isCancelled || !isPaid}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>QR Code</span>
                        </button>

                        {ticketData.eventId && (
                          <Link
                            to={`/event/${ticketData.eventId}`}
                            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl hover:bg-[#FFF6F2] transition-all font-medium"
                          >
                            <span>View Event</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <span>
                          Purchased on{" "}
                          {ticketData.purchaseDate ? new Date(ticketData.purchaseDate).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) : "Unknown date"}
                        </span>
                        <div className="text-right">
                          {!isPaid && (
                            <span className="text-yellow-600 font-medium">
                              Payment Pending
                            </span>
                          )}
                          {isPast && isPaid && (
                            <span className="text-gray-400 italic">
                              Event ended
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-red-500 font-medium">
                              Ticket cancelled
                            </span>
                          )}
                          {isUsed && (
                            <span className="text-gray-500 font-medium">
                              Already used
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-2">
                  Important Ticket Information
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Present your QR code at the venue entrance for verification</li>
                  <li>• Download PDF tickets for offline access and professional printing</li>
                  <li>• Arrive early to avoid queues at the entrance</li>
                  <li>• Contact support if you encounter any issues with your ticket</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <QRCodeModal />

      <div className="bg-black mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default MyTickets;