import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  LayoutDashboard,
  Calendar,
  Wallet,
  Ticket,
  Search,
} from "lucide-react";
import Brandlogo from "../../assets/eventy orange logo.PNG";
import VoiceSearch from "../../pages/dashboard/VoiceSearch";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../pages/notification/NotificationBell";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navbarBg, setNavbarBg] = useState("transparent");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const voiceSearchRef = useRef(null);

  const { isAuthenticated, user, logout, loading } = useAuth();
  
  // Memoize computed values
  const isDiscoverPage = useMemo(() => location.pathname === "/discover", [location.pathname]);
  const isAuthPage = useMemo(() => 
    ["/login", "/signup", "/forgot-password"].includes(location.pathname),
    [location.pathname]
  );

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lastScrollY > 50) {
            setNavbarBg(lastScrollY > 100 ? "light" : "transparent");
          } else {
            setNavbarBg("transparent");
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside with optimization
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };

    if (showLogoutModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [showLogoutModal]);

  // Memoized navbar classes
  const navbarClasses = useMemo(() => {
    const baseClasses = "top-0 left-0 fixed right-0 z-30 border-b transition-colors duration-200";
    
    if (navbarBg === "light") {
      return `${baseClasses} bg-white/95 backdrop-blur-md border-gray-200 shadow-sm`;
    }
    return `${baseClasses} bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-md border-white/10`;
  }, [navbarBg]);

  const textColor = useMemo(() => 
    navbarBg === "light" ? "text-gray-900" : "text-white",
    [navbarBg]
  );

  const inputStyles = useMemo(() => ({
    bg: navbarBg === "light" ? "bg-gray-100" : "bg-white/10",
    text: navbarBg === "light" ? "text-gray-900 placeholder-gray-500" : "text-white placeholder-white/70",
    border: navbarBg === "light" ? "border-gray-300" : "border-white/20",
    icon: navbarBg === "light" ? "text-gray-500" : "text-white/70",
  }), [navbarBg]);

  // Memoized handlers
  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  // Updated handleSearch - always navigates to /discover for consistent search experience
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Always use /discover for search since it has comprehensive search functionality
    const searchRoute = "/discover";

    navigate(`${searchRoute}?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setIsMenuOpen(false);
  }, [searchQuery, navigate]);

  // Updated handleVoiceResult - always navigates to /discover for voice search
  const handleVoiceResult = useCallback((voiceData) => {
    const searchQuery = voiceData.parsedQuery || voiceData.originalQuery;
    setSearchQuery(searchQuery);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    setTimeout(() => {
      // Always navigate to /discover for voice search since it has full search functionality
      const searchRoute = "/discover";

      const searchParams = new URLSearchParams({
        search: encodeURIComponent(searchQuery),
        isVoiceSearch: "true",
        originalQuery: encodeURIComponent(voiceData.originalQuery),
        confidence: voiceData.confidence || "0.5",
      });

      // Add any additional search parameters from backend parsing
      if (voiceData.searchParams) {
        Object.entries(voiceData.searchParams).forEach(([key, value]) => {
          if (value && key !== 'query') { // Avoid duplicate query param
            searchParams.append(key, value);
          }
        });
      }

      navigate(`${searchRoute}?${searchParams.toString()}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }, 500);
  }, [navigate]);

  // Memoized user menu items
  const userMenuItems = useMemo(() => 
    user?.role === "organizer"
      ? [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/organizer" },
          { icon: User, label: "Profile", path: "/dashboard/profile" },
          { icon: Settings, label: "Settings", path: "/dashboard/settings" },
          { icon: Bell, label: "Notifications", path: "/notifications" },
        ]
      : [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: User, label: "Profile", path: "/dashboard/profile" },
          { icon: Settings, label: "Settings", path: "/dashboard/settings" },
          { icon: Bell, label: "Notifications", path: "/notifications" },
        ],
    [user?.role]
  );

  // Memoized nav links
  const navLinks = useMemo(() => {
    const baseLinks = [
      { path: "/discover", label: "Discover Events", icon: Ticket },
    ];

    if (isAuthenticated) {
      if (user?.role === "organizer") {
        return [
          ...baseLinks,
          { path: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
          ...(!location.pathname.includes("/create-event")
            ? [{ path: "/create-event", label: "Create Event" }]
            : []),
        ];
      }
      return [
        ...baseLinks,
        { path: "/my-tickets", label: "My Tickets", icon: Ticket },
        { path: "/dashboard/events", label: "My Events", icon: Calendar },
      ];
    }

    return [
      ...baseLinks,
      ...(!location.pathname.includes("/create-event")
        ? [{ path: "/create-event", label: "Create Events" }]
        : []),
    ];
  }, [isAuthenticated, user?.role, location.pathname]);

  // Memoized user initials
  const userInitials = useMemo(() => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.userName) return user.userName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }, [user]);

  // Optimized avatar renderer
  const UserAvatar = useCallback(({ size = "w-8 h-8", showBorder = true }) => {
    const borderClass = showBorder ? "border-2 border-white shadow-lg" : "";
    
    if (user?.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt="Profile"
          className={`${size} rounded-full object-cover ${borderClass} group-hover:scale-110 transition-transform`}
          loading="lazy"
        />
      );
    }

    return (
      <div className={`${size} bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center text-white font-semibold ${borderClass} group-hover:scale-110 transition-transform`}>
        {userInitials}
      </div>
    );
  }, [user?.profilePicture, userInitials]);

  // Early returns
  if (loading) {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-md border-b border-white/10 h-16" />
        <div className="h-16" />
      </div>
    );
  }

  if (isAuthPage) return null;

  const navLinkClasses = `px-3 py-2 text-sm font-medium ${textColor} hover:text-[#FF6B35] relative after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#FF6B35] after:transition-all hover:after:w-full`;

  return (
    <div className="relative">
      <nav className={navbarClasses}>
        <div className="w-11/12 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink
              to={isAuthenticated ? (user?.role === "organizer" ? "/dashboard/organizer" : "/dashboard") : "/"}
              className="flex items-center group"
            >
              <img className="h-13 w-auto" src={Brandlogo} alt="Logo" loading="eager" />
              <span className="ml-2 text-xl font-bold text-[#FF6B35]">Eventry</span>
            </NavLink>

            {/* Search Bar - Desktop */}
            {!isDiscoverPage && (
              <div className="hidden lg:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, organizers..."
                    className={`w-full px-4 py-2 pl-10 pr-16 rounded-full ${inputStyles.bg} ${inputStyles.text} border ${inputStyles.border} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm transition-all`}
                  />
                  <Search className={`absolute left-3 top-2.5 h-4 w-4 ${inputStyles.icon}`} />
                  <div className="absolute right-2 top-1.5">
                    <VoiceSearch ref={voiceSearchRef} onVoiceResult={handleVoiceResult} navbarBg={navbarBg} />
                  </div>
                </form>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center space-x-6 ${isDiscoverPage ? "flex-1 justify-end" : ""}`}>
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={navLinkClasses}>
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4">
                  <NotificationBell />

                  {user?.role === "organizer" && (
                    <NavLink 
                      to="/dashboard/wallet" 
                      className={`flex items-center px-3 py-2 text-sm font-medium ${textColor} hover:text-[#FF6B35] transition-colors group`}
                    >
                      <Wallet className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      Wallet
                    </NavLink>
                  )}

                  <div className="relative user-menu-container">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                      className={`flex items-center space-x-2 p-2 rounded-lg ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} transition-colors group`}
                    >
                      <UserAvatar />
                      <span className={`text-sm font-medium ${textColor}`}>
                        {user?.userName || user?.firstName || "User"}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3 mb-2">
                            <UserAvatar size="w-10 h-10" showBorder={false} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{user?.role || "attendee"}</p>
                            </div>
                          </div>
                        </div>

                        {userMenuItems.map((item) => (
                          <NavLink 
                            key={item.label} 
                            to={item.path} 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FF6B35] hover:text-white transition-colors group" 
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                            {item.label}
                          </NavLink>
                        ))}

                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 group"
                        >
                          <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <NavLink 
                    to="/login" 
                    className={`px-4 py-2 ${textColor} hover:text-[#FF6B35] transition-colors font-medium`}
                  >
                    Sign In
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8535] hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md ${textColor} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} transition-colors`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden border-t ${navbarBg === "light" ? "border-gray-200 bg-white" : "border-white/10 bg-black/20"} backdrop-blur-lg`}>
            <div className="w-11/12 mx-auto px-4 pt-2 pb-4 space-y-2">
              {!isDiscoverPage && (
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search events, organizers..." 
                    className={`w-full px-4 py-2 pl-10 pr-16 rounded-full ${inputStyles.bg} ${inputStyles.text} border ${inputStyles.border} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm`} 
                  />
                  <Search className={`absolute left-3 top-2.5 h-4 w-4 ${inputStyles.icon}`} />
                  <div className="absolute right-2 top-1.5">
                    <VoiceSearch onVoiceResult={handleVoiceResult} navbarBg={navbarBg} />
                  </div>
                </form>
              )}

              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  className={`flex items-center px-3 py-2 ${textColor} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />}
                  <span className="group-hover:text-[#FF6B35] transition-colors">{link.label}</span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2 border-b border-white/10 mb-2">
                    <UserAvatar size="w-10 h-10" showBorder={false} />
                    <div>
                      <p className={`text-sm font-medium ${textColor}`}>
                        {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                      </p>
                      <p className={`text-xs ${navbarBg === "light" ? "text-gray-500" : "text-white/70"} capitalize`}>
                        {user?.role || "attendee"}
                      </p>
                    </div>
                  </div>

                  {userMenuItems.map((item) => (
                    <NavLink 
                      key={item.label} 
                      to={item.path} 
                      className={`flex items-center px-3 py-2 ${textColor} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">{item.label}</span>
                    </NavLink>
                  ))}

                  {user?.role === "organizer" && (
                    <NavLink 
                      to="/dashboard/wallet" 
                      className={`flex items-center px-3 py-2 ${textColor} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Wallet className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">Wallet</span>
                    </NavLink>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors group"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <NavLink 
                    to="/login" 
                    className={`flex items-center justify-center px-3 py-2 ${textColor} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors`} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="flex items-center justify-center px-3 py-2 bg-[#FF6B35] text-white rounded-md font-semibold hover:bg-[#FF8535] transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-16" />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelLogout} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-600">
                Are you sure you want to sign out? You'll need to sign in again to access your dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelLogout} 
                disabled={isLoggingOut} 
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                disabled={isLoggingOut} 
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </>
                )}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Signed in as <span className="font-semibold text-gray-700">{user?.userName || user?.email || "User"}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;