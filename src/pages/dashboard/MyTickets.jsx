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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventAPI, apiCall } from "../../services/api";

const MyTickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const result = await apiCall(eventAPI.getMyBookings);
      
      if (result.success) {
        // Process bookings from API
        const bookings = result.data?.bookings || result.data || [];
        
        // Transform bookings to ticket format
        const formattedTickets = bookings.map(booking => ({
          id: booking._id || booking.id,
          eventId: booking.event?._id || booking.eventId,
          eventTitle: booking.event?.title || booking.eventTitle || "Event",
          eventDate: booking.event?.date || booking.eventDate,
          eventTime: booking.event?.time || booking.eventTime || "TBA",
          eventVenue: booking.event?.venue || booking.eventVenue || "TBA",
          eventCity: booking.event?.city || booking.eventCity || "TBA",
          ticketNumber: booking.ticketNumber || booking.confirmationCode || `TKT-${booking._id?.slice(-6)}`,
          quantity: booking.tickets || booking.quantity || 1,
          totalPrice: booking.totalAmount || booking.amount || 0,
          purchaseDate: booking.createdAt || booking.bookingDate || new Date().toISOString(),
          status: booking.status || "confirmed",
          qrCode: booking.qrCode || `qr-${booking._id}`,
        }));
        
        setTickets(formattedTickets);
      } else {
        // If API fails, show empty state instead of error
        console.warn("Failed to load bookings:", result.error);
        setTickets([]);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
      // Show empty state instead of error for better UX
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket) => {
    // Generate ticket text content
    const ticketData = `
═══════════════════════════════════════
         EVENT TICKET
═══════════════════════════════════════

Event: ${ticket.eventTitle}
Date: ${new Date(ticket.eventDate).toLocaleDateString('en-NG', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}
Time: ${ticket.eventTime}
Venue: ${ticket.eventVenue}, ${ticket.eventCity}

Ticket Number: ${ticket.ticketNumber}
Quantity: ${ticket.quantity} ticket(s)
Total Price: ₦${ticket.totalPrice?.toLocaleString()}

Status: ${ticket.status.toUpperCase()}

═══════════════════════════════════════
Present this ticket at the venue entrance
═══════════════════════════════════════
    `.trim();
    
    const blob = new Blob([ticketData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticketNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in to view your tickets.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition"
            >
              Sign In
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mb-4" />
            <p className="text-gray-600">Loading your tickets...</p>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage and access your event tickets
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tickets yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't purchased any tickets yet. Discover amazing events and get your tickets!
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF8535] transition"
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
              
              return (
                <div key={ticket.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8535] p-4 text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{ticket.eventTitle}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm capitalize">{ticket.status}</span>
                          </div>
                          <span className="text-white/80">•</span>
                          <span className="text-sm">#{ticket.ticketNumber}</span>
                          {isUpcoming && (
                            <>
                              <span className="text-white/80">•</span>
                              <span className="text-sm bg-white/20 px-2 py-0.5 rounded">Upcoming</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold">₦{ticket.totalPrice?.toLocaleString()}</div>
                        <div className="text-sm opacity-90">{ticket.quantity} ticket(s)</div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Event Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Event Details</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 text-gray-700">
                            <Calendar className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">
                                {eventDate.toLocaleDateString('en-NG', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-gray-700">
                            <Clock className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                            <div className="font-medium">{ticket.eventTime}</div>
                          </div>

                          <div className="flex items-start gap-3 text-gray-700">
                            <MapPin className="h-5 w-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">{ticket.eventVenue}</div>
                              <div className="text-sm text-gray-600">{ticket.eventCity}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Actions */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Quick Actions</h4>
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => downloadTicket(ticket)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            <Download className="h-4 w-4" />
                            Download Ticket
                          </button>

                          <Link
                            to={`/ticket/${ticket.id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors font-medium"
                          >
                            <QrCode className="h-4 w-4" />
                            View QR Code
                          </Link>

                          <Link
                            to={`/event/${ticket.eventId}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FFF6F2] transition-colors font-medium"
                          >
                            View Event
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Purchased on</span>
                        <span className="font-medium text-gray-900">
                          {new Date(ticket.purchaseDate).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
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
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Ticket Information</p>
                <p className="text-blue-700">
                  Present your QR code at the venue entrance. Download your tickets for offline access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default MyTickets;