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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventAPI, apiCall } from "../../services/api";
import QRCode from "qrcode";
import { TicketPDFGenerator } from "../../services/ticketGenerator";

const MyTickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyTickets();
    }
  }, [isAuthenticated]);

  const loadMyTickets = async () => {
    setLoading(true);
    try {
      const result = await apiCall(eventAPI.getMyBookings);

      if (result.success) {
        const bookings = result.data?.bookings || result.data || [];

        const formattedTickets = bookings.map((booking) => {
          console.log("Raw booking data:", booking);

          const ticketId =
            booking._id ||
            booking.id ||
            Math.random().toString(36).substr(2, 9);
          const ticketNumber =
            booking.ticketNumber ||
            booking.confirmationCode ||
            `TKT-${ticketId.slice(-8).toUpperCase()}`;

          const price =
            booking.totalAmount ||
            booking.ticketPrice ||
            (booking.ticketPrice && booking.quantity
              ? booking.ticketPrice * booking.quantity
              : 0) ||
            booking.amount ||
            0;

          console.log("Price calculation:", {
            totalAmount: booking.totalAmount,
            ticketPrice: booking.ticketPrice,
            quantity: booking.quantity,
            finalPrice: price,
          });

          return {
            id: ticketId,
            eventId: booking.eventId || booking.event?._id || ticketId,
            eventTitle:
              booking.eventName ||
              booking.event?.title ||
              booking.eventTitle ||
              "Untitled Event",
            eventDate:
              booking.eventDate ||
              booking.event?.date ||
              new Date().toISOString(),
            eventTime: booking.eventTime || booking.event?.time || "TBA",
            eventEndTime: booking.eventEndTime || booking.event?.endTime || "",
            eventVenue:
              booking.eventVenue || booking.event?.venue || "Venue TBA",
            eventCity: booking.eventCity || booking.event?.city || "Lagos",
            eventCategory:
              booking.eventCategory || booking.event?.category || "",
            ticketNumber: ticketNumber,
            quantity: booking.quantity || booking.tickets || 1,
            totalPrice: price,
            currency: booking.currency || "NGN",
            purchaseDate:
              booking.purchaseDate ||
              booking.createdAt ||
              booking.bookingDate ||
              new Date().toISOString(),
            status: booking.status || "confirmed",
            qrCode: booking.qrCode || booking.ticketNumber || ticketNumber,
            isCheckedIn: booking.isCheckedIn || false,
            isTransferable:
              booking.isTransferable !== undefined
                ? booking.isTransferable
                : true,
            _rawData: booking,
          };
        });

        console.log("Formatted tickets:", formattedTickets);
        setTickets(formattedTickets);
      } else {
        console.warn("Failed to load bookings:", result.error);
        setTickets([]);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (ticket) => {
    try {
      setIsGeneratingQR(true);
      const qrData = ticket.qrCode || ticket.ticketNumber;
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#FF6B35",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error("QR Code generation failed:", err);
      // Fallback: create a simple data URL
      setQrCodeUrl(
        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="white"/><text x="150" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="%23FF6B35">QR: ${ticket.ticketNumber}</text></svg>`
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

  const handleDownloadPDF = async (ticket) => {
    try {
      setIsGeneratingPDF(true);
      const success = await TicketPDFGenerator.downloadPDF(ticket);

      if (!success) {
        // Fallback to text download if PDF fails
        console.warn("PDF generation failed, falling back to text download");
        downloadTextTicket(ticket);
      }
    } catch (error) {
      console.error("PDF download failed:", error);
      // Fallback to text download
      downloadTextTicket(ticket);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadTextTicket = (ticket) => {
    const currencySymbol = ticket.currency === "NGN" ? "₦" : "$";

    const ticketData = `
╔════════════════════════════════════════╗
║          EVENT TICKET                  ║
╚════════════════════════════════════════╝

${ticket.eventTitle}

📅 DATE
${new Date(ticket.eventDate).toLocaleDateString("en-NG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}

TIME
${ticket.eventTime}${ticket.eventEndTime ? ` - ${ticket.eventEndTime}` : ""}

 VENUE
${ticket.eventVenue}, ${ticket.eventCity}

 TICKET DETAILS
Ticket Number: ${ticket.ticketNumber}
Quantity: ${ticket.quantity} ticket(s)
Total: ${currencySymbol}${(ticket.totalPrice || 0).toLocaleString()}
Status: ${ticket.status.toUpperCase()}
QR Code: ${ticket.qrCode}

Purchased: ${new Date(ticket.purchaseDate).toLocaleDateString("en-NG")}

╔════════════════════════════════════════╗
║  Present this ticket at venue entrance ║
╚════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([ticketData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticket.ticketNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // QR Code Modal Component
  const QRCodeModal = () => {
    if (!showQRModal || !selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scaleIn">
          {/* Header */}
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

          {/* Event Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              {selectedTicket.eventTitle}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(selectedTicket.eventDate).toLocaleDateString(
                  "en-NG",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {selectedTicket.eventTime}
                {selectedTicket.eventEndTime
                  ? ` - ${selectedTicket.eventEndTime}`
                  : ""}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {selectedTicket.eventVenue}, {selectedTicket.eventCity}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            {isGeneratingQR ? (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
                <span className="ml-3 text-gray-600">
                  Generating QR Code...
                </span>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="white"/><text x="150" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="%23FF6B35">QR: ${selectedTicket.ticketNumber}</text></svg>`;
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Present this QR code at the event entrance
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ticket: {selectedTicket.ticketNumber}
                </p>
              </>
            )}
          </div>

          {/* Status & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                Valid Ticket - Ready to Use
              </span>
            </div>

            <button
              onClick={() => handleDownloadPDF(selectedTicket)}
              disabled={isGeneratingPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium"
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
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
               Keep this QR code secure. Do not share publicly.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Please sign in to view and manage your tickets.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Sign In to Continue
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="animate-spin h-16 w-16 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
              <Ticket className="absolute inset-0 m-auto h-6 w-6 text-[#FF6B35]" />
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">
              Loading your tickets...
            </p>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-xl flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">My Tickets</h1>
          </div>
          <p className="text-gray-600 text-lg ml-15">
            {tickets.length > 0
              ? `${tickets.length} ticket${
                  tickets.length > 1 ? "s" : ""
                } ready for your events`
              : "Manage and access your event tickets"}
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No tickets yet
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start your journey! Discover incredible events and secure your
              tickets today.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              Discover Events
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const eventDate = new Date(ticket.eventDate);
              const isUpcoming = eventDate >= new Date();
              const isPast = !isUpcoming;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.01] border border-gray-100"
                >
                  {/* Decorative Top Bar */}
                  <div className="h-2 bg-gradient-to-r from-[#FF6B35] via-[#FF8535] to-[#FF6B35]" />

                  <div className="md:flex">
                    {/* Left Side - Event Info */}
                    <div className="md:w-1/3 relative bg-gradient-to-br from-[#FF6B35] to-[#FF8535] p-8 flex flex-col justify-between">
                      <div>
                        {/* Status Badge */}
                        <div className="flex gap-2 mb-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isUpcoming
                                ? "bg-green-500 text-white"
                                : isPast
                                ? "bg-gray-500 text-white"
                                : "bg-white/20 text-white"
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {isUpcoming
                              ? "Upcoming"
                              : isPast
                              ? "Past Event"
                              : ticket.status}
                          </span>
                        </div>

                        {/* Event Title */}
                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                          {ticket.eventTitle}
                        </h3>

                        {/* Date & Time */}
                        <div className="space-y-3 text-white/90">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <span className="font-medium">
                              {eventDate.toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span className="font-medium">
                              {ticket.eventTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Number */}
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="text-white/70 text-xs font-medium mb-1">
                          TICKET NUMBER
                        </div>
                        <div className="text-white font-mono text-lg font-bold">
                          {ticket.ticketNumber}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Details & Actions */}
                    <div className="md:w-2/3 p-8">
                      {/* Price & Quantity */}
                      <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Total Amount
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {ticket.currency === "NGN" ? "₦" : "$"}
                            {(ticket.totalPrice || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            Quantity
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {ticket.quantity}
                          </div>
                          <div className="text-xs text-gray-500">
                            ticket{ticket.quantity > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="mb-6">
                        <div className="flex items-start gap-3 text-gray-700">
                          <MapPin className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-1" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {ticket.eventVenue}
                            </div>
                            <div className="text-sm text-gray-600">
                              {ticket.eventCity}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <button
                          onClick={() => handleDownloadPDF(ticket)}
                          disabled={isGeneratingPDF}
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingPDF ? (
                            <div className="animate-spin h-4 w-4 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {isGeneratingPDF ? "Generating..." : "Download PDF"}
                          </span>
                        </button>

                        <button
                          onClick={() => handleShowQRCode(ticket)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">QR Code</span>
                        </button>

                        <Link
                          to={`/event/${ticket.eventId}`}
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl hover:bg-[#FFF6F2] transition-all font-medium"
                        >
                          <span className="hidden sm:inline">View Event</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      {/* Purchase Date */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                        <span>
                          Purchased on{" "}
                          {new Date(ticket.purchaseDate).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {isPast && (
                          <span className="text-gray-400 italic">
                            Event ended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        {tickets.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-2">
                  Important Ticket Information
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Present your QR code at the venue entrance for
                    verification
                  </li>
                  <li>
                    • Download PDF tickets for offline access and professional
                    printing
                  </li>
                  <li>• Arrive early to avoid queues at the entrance</li>
                  <li>
                    • Contact support if you encounter any issues with your
                    ticket
                  </li>
                  <li>
                    • Keep your QR code secure and don't share it publicly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal />

      <div className="bg-black mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default MyTickets;
