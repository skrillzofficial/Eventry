import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Ticket,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Shield,
  Sparkles,
  AlertCircle,
  Navigation,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import CheckoutFlow from "../../checkout/Checkout";
import { eventAPI, apiCall } from "../../services/api";

// Local images
import eventOne from "../../assets/Vision one.png";
import eventTwo from "../../assets/Vision 2.png";
import eventThree from "../../assets/vision 3.png";

const imageMap = {
  "/src/assets/Vision one.png": eventOne,
  "/src/assets/Vision 2.png": eventTwo,
  "/src/assets/vision 3.png": eventThree,
  "/assets/Vision one.png": eventOne,
  "/assets/Vision 2.png": eventTwo,
  "/assets/vision 3.png": eventThree,
};

const fallbackImage = eventOne;

export default function EventPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(() => eventAPI.getEventById(id));

      if (result.success) {
        const eventData = result.data.event || result.data;

        if (!eventData) {
          throw new Error("Event not found");
        }

        const rawImages = eventData.images || [];
        const mappedImages =
          rawImages.length > 0
            ? rawImages.map((img) => {
                if (img && typeof img === "object" && img.url) {
                  return img.url;
                }
                if (typeof img === "string") {
                  return img;
                }
                return imageMap[img] || fallbackImage;
              })
            : [fallbackImage];

        const eventWithImages = {
          ...eventData,
          id: eventData._id || eventData.id,
          images: mappedImages,

          organizer: {
            name:
              eventData.organizerInfo?.name ||
              eventData.organizerInfo?.companyName ||
              "Unknown Organizer",
            email: eventData.organizerInfo?.email || "",
            companyName: eventData.organizerInfo?.companyName || "",
            verified: eventData.blockchainData?.verified || false,
            description:
              eventData.organizerInfo?.description || "Event organizer",
            eventsHosted: eventData.organizerInfo?.eventsHosted || "Multiple",
            rating: eventData.organizerInfo?.rating || 4.5,
          },

          tags:
            Array.isArray(eventData.tags) && eventData.tags.length > 0
              ? eventData.tags
              : [eventData.category].filter(Boolean),

          requirements: (() => {
            if (Array.isArray(eventData.requirements)) {
              return eventData.requirements;
            }
            if (
              typeof eventData.requirements === "string" &&
              eventData.requirements.trim()
            ) {
              return [eventData.requirements];
            }
            return ["Valid ID", "Ticket confirmation"];
          })(),

          rating: eventData.rating || 4.5,
          reviews: eventData.totalLikes || 0,
          attendees: eventData.totalAttendees || 0,
          availableTickets:
            eventData.availableTickets || eventData.capacity || 0,
          featured: eventData.isFeatured || false,
          status: eventData.status || "published",
          isActive: eventData.isActive !== false,
          views: eventData.views || 0,
          totalLikes: eventData.totalLikes || 0,
          bookings: eventData.bookings || 0,
          totalRevenue: eventData.totalRevenue || 0,
          refundPolicy: eventData.refundPolicy || "partial",
          currency: eventData.currency || "NGN",
          agenda: Array.isArray(eventData.agenda) ? eventData.agenda : [],
          faqs: Array.isArray(eventData.faqs) ? eventData.faqs : [],
          longDescription: eventData.longDescription || eventData.description,

          location: eventData.location || null,

          ticketTypes:
            Array.isArray(eventData.ticketTypes) &&
            eventData.ticketTypes.length > 0
              ? eventData.ticketTypes
              : null,

          requiresApproval: eventData.requiresApproval || false,
          approvalCriteria: eventData.approvalCriteria || null,
        };

        setEvent(eventWithImages);

        if (
          eventWithImages.ticketTypes &&
          eventWithImages.ticketTypes.length > 0
        ) {
          setSelectedTicketType(eventWithImages.ticketTypes[0]);
        }

        loadRelatedEvents(eventData.category, eventData._id || eventData.id);
      } else {
        throw new Error(result.error || "Failed to load event");
      }
    } catch (err) {
      console.error("Error loading event:", err);
      setError(err?.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedEvents = async (category, currentEventId) => {
    try {
      const result = await apiCall(eventAPI.getAllEvents);

      if (result.success) {
        const allEvents = result.data.events || result.data || [];
        const relatedEvents = allEvents
          .filter((ev) => {
            const eventId = ev._id || ev.id;
            return (
              eventId !== currentEventId &&
              ev.category === category &&
              ev.status !== "cancelled"
            );
          })
          .slice(0, 3)
          .map((ev) => {
            const img =
              ev.images && ev.images[0] ? ev.images[0] : fallbackImage;

            let imageUrl = fallbackImage;
            if (img && typeof img === "object" && img.url) {
              imageUrl = img.url;
            } else if (typeof img === "string") {
              imageUrl = img;
            } else {
              imageUrl = imageMap[img] || fallbackImage;
            }

            return {
              ...ev,
              id: ev._id || ev.id,
              image: imageUrl,
            };
          });

        setRelated(relatedEvents);
      }
    } catch (err) {
      console.error("Error loading related events:", err);
    }
  };

  const handlePaymentSuccess = (bookingData) => {
    setShowCheckout(false);

    const ticketCount = bookingData?.quantity || ticketQuantity;
    const ticketTypeName =
      bookingData?.ticketType || selectedTicketType?.name || "Regular";
    const reference =
      bookingData?.transactionId || bookingData?._id || "Confirmed";

    alert(
      `🎉 Booking Successful!\n\n` +
        `Event: ${event.title}\n` +
        `Tickets: ${ticketCount} x ${ticketTypeName}\n` +
        `Reference: ${reference}\n\n` +
        `Check your email for confirmation details.`
    );

    loadEvent();
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      console.log("Sign in to save favorites");
    }
    setIsFavorite((s) => !s);
  };

  const shareEvent = (platform) => {
    const url = window.location.href;
    const text = `Check out this event: ${event?.title}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const handleGetTickets = () => {
    if (!isAuthenticated) {
      alert("Please sign in to purchase tickets");
      return;
    }
    setShowCheckout(true);
  };

  const getPriceDisplay = (ev) => {
    if (ev.ticketTypes && ev.ticketTypes.length > 0) {
      const prices = ev.ticketTypes.map((t) => t.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === 0 && maxPrice === 0) {
        return "Free";
      }
      if (minPrice === maxPrice) {
        return `₦${minPrice.toLocaleString()}`;
      }
      return `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`;
    }

    return ev.price === 0 ? "Free" : `₦${ev.price.toLocaleString()}`;
  };

  const openDirections = () => {
    if (!event) return;

    let lat, lng;

    if (event.location?.coordinates) {
      lat = event.location.coordinates.lat;
      lng = event.location.coordinates.lng;
    } else if (event.coordinates) {
      lat = event.coordinates.latitude;
      lng = event.coordinates.longitude;
    } else {
      const address = encodeURIComponent(
        `${event.venue}, ${event.address}, ${event.city}`
      );
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      window.open(url, "_blank");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Subcomponents
  const EventHeader = ({ ev }) => {
    const eventDate = new Date(ev.date);
    const isUpcoming = eventDate >= new Date();

    return (
      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="bg-[#FF6B35] text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {ev.category}
          </span>

          {ev.featured && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF6F2] border border-[#FFE6D8] rounded-full text-sm text-[#FF6B35]">
              <Sparkles className="w-4 h-4" />
              Featured
            </div>
          )}

          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              isUpcoming
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isUpcoming ? "Upcoming" : "Past event"}
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {ev.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#FF6B35]" />
            <span>
              {eventDate.toLocaleDateString("en-NG", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FF6B35]" />
            <span>
              {ev.time}
              {ev.endTime ? ` - ${ev.endTime}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF6B35]" />
            <span>
              {ev.venue}, {ev.city}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-900">{ev.rating}</span>
            <span className="text-gray-500">({ev.reviews} reviews)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title={!isAuthenticated ? "Sign in to save favorites" : ""}
            >
              <Heart
                className={
                  isFavorite
                    ? "h-5 w-5 text-red-500 fill-red-500"
                    : "h-5 w-5 text-gray-600"
                }
              />
            </button>
            <button
              onClick={() => shareEvent("twitter")}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EventGallery = ({ ev }) => (
    <div className="bg-white rounded-xl overflow-hidden mb-6">
      <div className="w-full h-96 bg-gray-100">
        <img
          src={ev.images[0] || fallbackImage}
          alt={ev.title}
          className="w-full h-full object-cover"
        />
      </div>

      {ev.images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 p-4">
          {ev.images.slice(1, 5).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${ev.title} ${i + 2}`}
              className="h-24 w-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
            />
          ))}
        </div>
      )}
    </div>
  );

  const LocationTab = ({ ev }) => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Location</h3>
          <button
            onClick={openDirections}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] transition-colors"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-6 w-6 text-[#FF6B35] mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-gray-900 text-lg">
                {ev.venue || "Venue not specified"}
              </div>
              <div className="text-gray-600 mt-1">
                {ev.address || "Address not available"}
              </div>
              <div className="text-gray-600">
                {ev.city || "City not specified"}
              </div>
            </div>
          </div>
        </div>

        <div className="h-80 w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Location map</p>
            <button
              onClick={openDirections}
              className="mt-2 text-[#FF6B35] font-medium hover:text-[#FF8535]"
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      </>
    );
  };

  const DetailsTabs = ({ ev }) => {
    const handleTabChange = (e, tabName) => {
      e.preventDefault();
      setTabLoading(true);

      requestAnimationFrame(() => {
        setActiveTab(tabName);
        setTimeout(() => {
          setTabLoading(false);
        }, 300);
      });
    };

    return (
      <div className="bg-white rounded-xl overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {["details", "organizer", "location", "reviews"].map((t) => (
              <button
                key={t}
                onClick={(e) => handleTabChange(e, t)}
                type="button"
                className={`py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === t
                    ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 min-h-[400px] relative">
          {tabLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-10 w-10 border-4 border-[#FF6B35] border-t-transparent rounded-full"></div>
                <div className="text-sm text-gray-600 font-medium">
                  Loading...
                </div>
              </div>
            </div>
          )}

          <div
            className={
              tabLoading
                ? "opacity-30"
                : "opacity-100 transition-opacity duration-200"
            }
          >
            {activeTab === "details" && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About this event
                </h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">
                    {ev.longDescription ||
                      ev.description ||
                      "No description available"}
                  </p>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#FF6B35]" /> Requirements
                  </h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {ev.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {ev.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {ev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full border border-gray-200 text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "organizer" && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Organizer
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {ev.organizer.name?.charAt(0) || "O"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {ev.organizer.name}
                      </h4>
                      {ev.organizer.verified && (
                        <Shield className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {ev.organizer.description || "Event organizer"}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">
                          Events hosted
                        </div>
                        <div className="font-bold text-gray-900 text-lg">
                          {ev.organizer.eventsHosted || "Multiple"}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Rating</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {ev.organizer.rating || ev.rating || "4.5"} ⭐
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "location" && <LocationTab ev={ev} />}

            {activeTab === "reviews" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {ev.rating}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ev.reviews} reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                      <div className="w-12 text-sm text-gray-600 font-medium">
                        {s} ⭐
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-[#FF6B35] h-3 transition-all"
                          style={{ width: `${(s / 5) * 100}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-600 text-right">
                        {Math.round((s / 5) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold">
                      C
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Chinedu O.
                      </div>
                      <div className="text-xs text-gray-500">2 weeks ago</div>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    "One of the best events I've attended. Great organization
                    and networking opportunities!"
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RelatedEvents = ({ list }) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="bg-white rounded-xl p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">
          Related events
        </h4>
        <div className="space-y-3">
          {list.map((r) => (
            <Link
              key={r.id}
              to={`/event/${r.id}`}
              className="flex items-center gap-4 border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-[#FF6B35] transition-all"
            >
              <img
                src={r.image}
                alt={r.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  {r.title}
                </div>
                <div className="text-sm text-gray-600">
                  {r.category} •{" "}
                  {r.price === 0 ? "Free" : `₦${r.price?.toLocaleString()}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const TicketCard = ({ ev }) => {
    const hasTicketTypes = ev.ticketTypes && ev.ticketTypes.length > 0;
    const requiresApproval = ev.requiresApproval;

    const getAvailableTickets = () => {
      if (hasTicketTypes && selectedTicketType) {
        return selectedTicketType.availableTickets;
      }
      return Math.max(0, ev.capacity - (ev.attendees || 0));
    };

    const available = getAvailableTickets();

    const getPrice = () => {
      if (hasTicketTypes && selectedTicketType) {
        return selectedTicketType.price;
      }
      return ev.price;
    };

    const price = getPrice();
    const total = price * ticketQuantity;

    const getButtonText = () => {
      if (available === 0) return "Sold Out";
      if (requiresApproval) return "Request Tickets";
      return "Get Tickets Now";
    };

    const getHelperText = () => {
      if (requiresApproval) {
        return "⏳ Requires organizer approval • You'll be notified via email";
      }
      if (isAuthenticated) {
        return "🔒 Secure payment • Instant confirmation";
      }
      return "Browse events • Sign in to book";
    };

    return (
      <div className="bg-white rounded-xl p-6 sticky top-24">
        <div className="space-y-5">
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="text-3xl font-bold text-[#FF6B35] mb-1">
              {getPriceDisplay(ev)}
            </div>
            <div className="text-sm text-gray-500">
              {ev.ticketTypes && ev.ticketTypes.length > 1
                ? "Price range"
                : "per ticket"}
            </div>
          </div>

          {/* Approval Notice */}
          {requiresApproval && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900 mb-1">
                    Approval Required
                  </div>
                  <div className="text-sm text-blue-700">
                    {ev.approvalCriteria || 
                      "The organizer will review your request before issuing tickets. You'll be notified via email once approved."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasTicketTypes && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Ticket Type
              </label>
              <div className="space-y-2">
                {ev.ticketTypes.map((ticketType, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedTicketType(ticketType);
                      setTicketQuantity(1);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTicketType?.name === ticketType.name
                        ? "border-[#FF6B35] bg-[#FFF6F2]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {ticketType.name}
                        </div>
                        {ticketType.description && (
                          <div className="text-xs text-gray-600 mt-1">
                            {ticketType.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#FF6B35]">
                          {ticketType.price === 0
                            ? "Free"
                            : `₦${ticketType.price.toLocaleString()}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticketType.availableTickets} left
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of tickets
            </label>
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                disabled={available === 0}
                className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center text-gray-900 font-bold text-lg">
                {ticketQuantity}
              </div>
              <button
                onClick={() =>
                  setTicketQuantity(Math.min(available, ticketQuantity + 1))
                }
                disabled={available === 0 || ticketQuantity >= available}
                className="px-6 py-3 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {available === 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center font-medium">
              {hasTicketTypes && selectedTicketType
                ? `${selectedTicketType.name} tickets sold out!`
                : "Sold out!"}
            </div>
          )}

          {available > 0 && available <= 10 && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg text-center font-medium">
              ⚠️ Only {available} tickets left!
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Price per ticket</span>
              <span className="font-semibold">
                {price === 0 ? "Free" : `₦${price.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Quantity</span>
              <span className="font-semibold">{ticketQuantity}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-[#FF6B35]">
                {price === 0 ? "Free" : `₦${total.toLocaleString()}`}
              </span>
            </div>
          </div>

          {authLoading ? (
            <div className="py-4 bg-gray-100 rounded-lg text-center text-gray-600 font-medium">
              Checking authentication...
            </div>
          ) : isAuthenticated ? (
            <button
              onClick={handleGetTickets}
              disabled={available === 0}
              className="w-full bg-[#FF6B35] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#FF8535] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Ticket className="h-5 w-5" />
              {getButtonText()}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-900 mb-1">
                    Sign in required
                  </div>
                  <div className="text-xs text-yellow-700">
                    Create an account or sign in to {requiresApproval ? "request" : "purchase"} tickets
                  </div>
                </div>
              </div>
              <Link
                to="/login"
                state={{ returnTo: `/event/${id}` }}
                className="block w-full bg-[#FF6B35] text-white py-4 rounded-lg font-bold text-center hover:bg-[#FF8535] transition-colors"
              >
                Sign In to {requiresApproval ? "Request" : "Purchase"}
              </Link>
              <Link
                to="/register"
                state={{ returnTo: `/event/${id}` }}
                className="block w-full bg-white text-[#FF6B35] py-4 rounded-lg font-bold text-center border-2 border-[#FF6B35] hover:bg-[#FFF6F2] transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center pt-2">
            {getHelperText()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-24">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
            <div className="text-gray-600 font-medium">Loading event...</div>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-20">
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Event Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Return to Discover
            </Link>
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

      <div className="container mx-auto w-11/12 py-8">
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-[#FF6B35] mb-6 hover:text-[#FF8535] transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Discover
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <EventHeader ev={event} />
            <EventGallery ev={event} />
            <DetailsTabs ev={event} />
            <RelatedEvents list={related} />
          </div>

          <div>
            <TicketCard ev={event} />
          </div>
        </div>
      </div>

      {showCheckout && isAuthenticated && (
        <CheckoutFlow
          event={{
            ...event,
            selectedTicketType: selectedTicketType,
            ticketPrice: selectedTicketType
              ? selectedTicketType.price
              : event.price,
          }}
          ticketQuantity={ticketQuantity}
          onSuccess={(bookingData) => handlePaymentSuccess(bookingData)}
          onClose={() => setShowCheckout(false)}
        />
      )}

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
}