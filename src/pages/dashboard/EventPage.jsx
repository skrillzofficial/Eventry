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
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

  // Map refs only
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load event data
  useEffect(() => {
    if (id) {
      loadEvent();
    }

    return () => {
      // Cleanup map only
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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
          .slice(0, 4)
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

  const handlePaymentSuccess = (result) => {
    setShowCheckout(false);
    alert(
      `Payment successful — ${result.tickets} tickets for ${result.event.title}. Transaction: ${result.transactionId}`
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

  // Simple function to open directions in Google Maps
  const openDirections = () => {
    if (!event) return;

    let lat, lng;

    // Get coordinates from event data
    if (event.location?.coordinates) {
      lat = event.location.coordinates.lat;
      lng = event.location.coordinates.lng;
    } else if (event.coordinates) {
      lat = event.coordinates.latitude;
      lng = event.coordinates.longitude;
    } else {
      // If no coordinates, use address for directions
      const address = encodeURIComponent(
        `${event.venue}, ${event.address}, ${event.city}`
      );
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      window.open(url, "_blank");
      return;
    }

    // Use coordinates for directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Simple map initialization
  const initializeMap = () => {
    if (!event || !mapRef.current) return;

    try {
      // Get coordinates from event
      let lat, lng;

      if (event.location?.coordinates) {
        lat = event.location.coordinates.lat;
        lng = event.location.coordinates.lng;
      } else if (event.coordinates) {
        lat = event.coordinates.latitude;
        lng = event.coordinates.longitude;
      } else {
        // Default to Lagos coordinates if no location data
        lat = 6.5244;
        lng = 3.3792;
      }

      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add marker
      markerRef.current = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<b>${event.title}</b><br>${event.venue}<br>${event.address}, ${event.city}`
        )
        .openPopup();
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Initialize map when location tab is active
  useEffect(() => {
    if (activeTab === "location" && event && mapRef.current) {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Small delay to ensure DOM is ready
      setTimeout(initializeMap, 100);
    }
  }, [activeTab, event]);

  // Subcomponents
  const EventHeader = ({ ev }) => {
    const eventDate = new Date(ev.date);
    const isUpcoming = eventDate >= new Date();

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-start flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium">
                {ev.category}
              </span>

              {ev.featured && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#FFF6F2] border border-[#FFE6D8] rounded-full text-sm text-[#FF6B35]">
                  <Sparkles className="w-4 h-4" />
                  Featured
                </div>
              )}

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isUpcoming
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isUpcoming ? "Upcoming" : "Past event"}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">
              {ev.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF6B35]" />
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
                <Clock className="h-4 w-4 text-[#FF6B35]" />
                <span>
                  {ev.time}
                  {ev.endTime ? ` - ${ev.endTime}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF6B35]" />
                <span>
                  {ev.venue}, {ev.city}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <div className="text-lg text-gray-700 font-semibold">
                {getPriceDisplay(ev)}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {ev.ticketTypes && ev.ticketTypes.length > 1
                  ? "Price range"
                  : "per ticket"}
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                  title={!isAuthenticated ? "Sign in to save favorites" : ""}
                >
                  <Heart
                    className={
                      isFavorite
                        ? "h-4 w-4 text-red-500"
                        : "h-4 w-4 text-gray-600"
                    }
                  />
                </button>
                <button
                  onClick={() => shareEvent("twitter")}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-gray-800">{ev.rating}</span>
                <span className="text-gray-500">({ev.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EventGallery = ({ ev }) => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="w-full h-72 bg-gray-100">
        <img
          src={ev.images[0] || fallbackImage}
          alt={ev.title}
          className="w-full h-full object-cover"
        />
      </div>

      {ev.images.length > 1 && (
        <div className="grid grid-cols-3 gap-1 p-2 bg-white">
          {ev.images.slice(1).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${ev.title} ${i + 2}`}
              className="h-24 w-full object-cover rounded-md cursor-pointer"
            />
          ))}
        </div>
      )}
    </div>
  );

  const LocationTab = ({ ev }) => {
    return (
      <>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <button
            onClick={openDirections}
            className="flex items-center gap-2 px-3 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF8535] transition-colors"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded p-4">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-5 w-5 text-[#FF6B35] mt-1" />
            <div>
              <div className="font-semibold text-gray-900">
                {ev.venue || "Venue not specified"}
              </div>
              <div className="text-gray-600">
                {ev.address || "Address not available"}
              </div>
              <div className="text-gray-600">
                {ev.city || "City not specified"}
              </div>
            </div>
          </div>

          {/* Simple Map Container */}
          <div
            ref={mapRef}
            className="h-64 w-full bg-white border border-gray-100 rounded"
            style={{ zIndex: 1, minHeight: "256px" }}
          />
        </div>
      </>
    );
  };

  const DetailsTabs = ({ ev }) => {
    const handleTabChange = (e, tabName) => {
      e.preventDefault();
      setTabLoading(true);
      
      // Use requestAnimationFrame to ensure state updates properly
      requestAnimationFrame(() => {
        setActiveTab(tabName);
        setTimeout(() => {
          setTabLoading(false);
        }, 300);
      });
    };

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="border-b border-gray-100">
          <nav className="flex px-4">
            {["details", "organizer", "location", "reviews"].map((t) => (
              <button
                key={t}
                onClick={(e) => handleTabChange(e, t)}
                type="button"
                className={`py-3 px-2 text-sm font-medium ${
                  activeTab === t
                    ? "text-gray-900 border-b-2 border-[#FF6B35]"
                    : "text-gray-600"
                }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 min-h-[300px] relative">
          {tabLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-b-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-10 w-10 border-4 border-[#FF6B35] border-t-transparent rounded-full"></div>
                <div className="text-sm text-gray-600 font-medium">Loading...</div>
              </div>
            </div>
          )}
          
          <div className={tabLoading ? "opacity-30" : "opacity-100 transition-opacity duration-200"}>
            {activeTab === "details" && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  About this event
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap">
                    {ev.longDescription ||
                      ev.description ||
                      "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#FF6B35]" /> Requirements
                    </h4>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {ev.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {ev.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {ev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Organizer
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-semibold text-lg">
                    {ev.organizer.name?.charAt(0) || "O"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {ev.organizer.name}
                      </h4>
                      {ev.organizer.verified && (
                        <Shield className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {ev.organizer.description || "Event organizer"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded">
                        <div className="text-sm text-gray-500">Events hosted</div>
                        <div className="font-semibold text-gray-900">
                          {ev.organizer.eventsHosted || "Multiple"}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded">
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="font-semibold text-gray-900">
                          {ev.organizer.rating || ev.rating || "4.5"}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                  <div className="text-right">
                    <div className="text-xl font-semibold">{ev.rating}</div>
                    <div className="text-sm text-gray-600">
                      {ev.reviews} reviews
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-8 text-sm text-gray-600">{s}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#FF6B35] h-2"
                          style={{ width: `${(s / 5) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600 text-right">
                        {Math.round((s / 5) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded">
                    <div className="font-semibold text-gray-900">Chinedu O.</div>
                    <div className="text-sm text-gray-600">
                      "One of the best events I've attended. Great organization
                      and networking opportunities!"
                    </div>
                  </div>
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
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Related events
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((r) => (
            <Link
              key={r.id}
              to={`/event/${r.id}`}
              className="flex items-center gap-3 border border-gray-100 rounded p-3 hover:shadow-sm transition"
            >
              <img
                src={r.image}
                alt={r.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <div className="font-medium text-gray-900">{r.title}</div>
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

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="space-y-4">
          {hasTicketTypes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
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
                          <div className="text-xs text-gray-600 mt-0.5">
                            {ticketType.description}
                          </div>
                        )}
                        {ticketType.benefits &&
                          ticketType.benefits.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              • {ticketType.benefits.join(" • ")}
                            </div>
                          )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#FF6B35]">
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

          <label className="block text-sm text-gray-700">
            Number of tickets
          </label>
          <div className="flex items-center border border-gray-100 rounded">
            <button
              onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
              disabled={available === 0}
              className="px-4 py-2 text-gray-700 disabled:opacity-50"
            >
              -
            </button>
            <div className="flex-1 text-center text-gray-900 font-medium">
              {ticketQuantity}
            </div>
            <button
              onClick={() =>
                setTicketQuantity(Math.min(available, ticketQuantity + 1))
              }
              disabled={available === 0 || ticketQuantity >= available}
              className="px-4 py-2 text-gray-700 disabled:opacity-50"
            >
              +
            </button>
          </div>

          {available === 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center">
              {hasTicketTypes && selectedTicketType
                ? `${selectedTicketType.name} tickets sold out!`
                : "Sold out!"}
            </div>
          )}

          {available > 0 && available <= 10 && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded text-center">
              Only {available} tickets left!
            </div>
          )}

          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Price</span>
              <span>{price === 0 ? "Free" : `₦${price.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>{ticketQuantity}</span>
            </div>
            {hasTicketTypes && selectedTicketType && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ticket Type</span>
                <span>{selectedTicketType.name}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 mt-2 pt-2 border-t">
              <span>Total</span>
              <span>{price === 0 ? "Free" : `₦${total.toLocaleString()}`}</span>
            </div>
          </div>

          {authLoading ? (
            <div className="py-3 bg-gray-50 rounded text-center">
              Checking auth...
            </div>
          ) : isAuthenticated ? (
            <button
              onClick={handleGetTickets}
              disabled={available === 0}
              className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Ticket className="inline-block h-4 w-4 mr-2" />
              {available === 0 ? "Sold Out" : "Get tickets now"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900 mb-1">
                    Sign in required
                  </div>
                  <div className="text-xs text-yellow-700">
                    Create an account or sign in to purchase tickets for this
                    event
                  </div>
                </div>
              </div>
              <Link
                to="/login"
                state={{ returnTo: `/event/${id}` }}
                className="block w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold text-center hover:bg-[#FF8535] transition-colors"
              >
                Sign in to purchase
              </Link>
              <Link
                to="/register"
                state={{ returnTo: `/event/${id}` }}
                className="block w-full bg-white text-[#FF6B35] py-3 rounded-lg font-semibold text-center border-2 border-[#FF6B35] hover:bg-[#FFF6F2] transition-colors"
              >
                Create account
              </Link>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center mt-2">
            {isAuthenticated
              ? "Secure payment • Instant confirmation"
              : "Browse events • Sign in to book"}
          </div>
        </div>
      </div>
    );
  };

  // Show loading only while fetching event data
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24">
          <div className="flex justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center text-[#FF6B35] font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/discover"
          className="inline-flex items-center text-[#FF6B35] mb-6 hover:text-[#FF8535] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Discover
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <EventHeader ev={event} />
            <EventGallery ev={event} />
            <DetailsTabs ev={event} />
            <RelatedEvents list={related} />
          </div>

          <div className="space-y-6">
            <TicketCard ev={event} />

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">
                Event statistics
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-3">
                      {event.ticketTypes.map((tt, idx) => (
                        <div
                          key={idx}
                          className="pb-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                            <span>{tt.name}</span>
                            <span>₦{tt.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Capacity: {tt.capacity}</span>
                            <span>Available: {tt.availableTickets}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-1.5 bg-[#FF6B35]"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((tt.capacity - tt.availableTickets) /
                                    tt.capacity) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between font-medium">
                        <span>Total Capacity</span>
                        <span>{event.capacity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Attendees</span>
                        <span>{(event.attendees || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Available</span>
                        <span>
                          {event.ticketTypes
                            .reduce((sum, tt) => sum + tt.availableTickets, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Capacity</span>
                      <span>{(event.capacity || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendees</span>
                      <span>{(event.attendees || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available</span>
                      <span>
                        {Math.max(
                          0,
                          (event.capacity || 0) - (event.attendees || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-[#FF6B35]"
                          style={{
                            width: `${Math.min(
                              100,
                              ((event.attendees || 0) / (event.capacity || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>
                          {Math.round(
                            ((event.attendees || 0) / (event.capacity || 1)) *
                              100
                          )}
                          % booked
                        </span>
                        <span>
                          {Math.max(
                            0,
                            (event.capacity || 0) - (event.attendees || 0)
                          )}{" "}
                          left
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {!authLoading && (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <div className="text-sm text-gray-700">
                      Your status:{" "}
                      <span
                        className={
                          isAuthenticated
                            ? "text-green-600 font-medium"
                            : "text-gray-600 font-medium"
                        }
                      >
                        {isAuthenticated
                          ? "Ready to book"
                          : "Browsing as guest"}
                      </span>
                    </div>
                    {!isAuthenticated && (
                      <div className="text-xs text-gray-500 mt-1">
                        Sign in to purchase tickets
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
}