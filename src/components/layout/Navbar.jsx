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

  // Optimized scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setNavbarBg("light");
      } else if (scrollY > 50) {
        setNavbarBg("transparent");
      } else {
        setNavbarBg("transparent");
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, []);

  // Handle click outside for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  // Escape key handler for logout modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (showLogoutModal) {
          setShowLogoutModal(false);
        } else if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showLogoutModal, isUserMenuOpen, isMenuOpen]);

  // Body overflow control for modals
  useEffect(() => {
    if (showLogoutModal || isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLogoutModal, isMenuOpen]);

  // Memoized navbar classes
  const navbarClasses = useMemo(() => {
    const baseClasses = "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ease-in-out";
    
    if (navbarBg === "light") {
      return `${baseClasses} bg-white/95 backdrop-blur-lg border-gray-200/80 shadow-lg`;
    }
    return `${baseClasses} bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-lg border-white/20`;
  }, [navbarBg]);

  const textColor = useMemo(() => 
    navbarBg === "light" ? "text-gray-900" : "text-white",
    [navbarBg]
  );

  const inputStyles = useMemo(() => ({
    bg: navbarBg === "light" ? "bg-white border-gray-300" : "bg-white/10 border-white/20",
    text: navbarBg === "light" ? "text-gray-900 placeholder-gray-500" : "text-white placeholder-white/70",
    icon: navbarBg === "light" ? "text-gray-500" : "text-white/70",
  }), [navbarBg]);

  // Memoized handlers
  const handleLogout = useCallback(() => {
    setShowLogoutModal(true);
    setIsUserMenuOpen(false);
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
      // Handle logout error silently or show user-friendly message
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  // Search handler
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchParams = new URLSearchParams({
      search: encodeURIComponent(searchQuery.trim())
    });

    navigate(`/discover?${searchParams.toString()}`);
    setSearchQuery("");
    setIsMenuOpen(false);
    
    // Blur input on mobile
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, [searchQuery, navigate]);

  // Voice search handler
  const handleVoiceResult = useCallback((voiceData) => {
    const query = voiceData.parsedQuery || voiceData.originalQuery || "";
    setSearchQuery(query);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Navigate after a short delay to allow UI update
    setTimeout(() => {
      const searchParams = new URLSearchParams({
        search: encodeURIComponent(query),
        isVoiceSearch: "true",
        originalQuery: encodeURIComponent(voiceData.originalQuery || query),
        confidence: voiceData.confidence || "0.5",
      });

      navigate(`/discover?${searchParams.toString()}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }, 800);
  }, [navigate]);

  // Memoized user menu items
  const userMenuItems = useMemo(() => {
    const baseItems = [
      { icon: User, label: "Profile", path: "/dashboard/profile" },
      { icon: Settings, label: "Settings", path: "/dashboard/settings" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
    ];

    if (user?.role === "organizer") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/organizer" },
        ...baseItems,
      ];
    }
    
    return [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      ...baseItems,
    ];
  }, [user?.role]);

  // Memoized nav links
  const navLinks = useMemo(() => {
    const baseLinks = [
      { path: "/discover", label: "Discover Events", icon: Ticket },
    ];

    if (!isAuthenticated) {
      return [
        ...baseLinks,
        { path: "/events/create", label: "Create Events" },
      ];
    }

    if (user?.role === "organizer") {
      return [
        ...baseLinks,
        { path: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
        { path: "/events/create", label: "Create Event" },
      ];
    }

    return [
      ...baseLinks,
      { path: "/my-tickets", label: "My Tickets", icon: Ticket },
      { path: "/dashboard/events", label: "My Events", icon: Calendar },
    ];
  }, [isAuthenticated, user?.role]);

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

  // User avatar component
  const UserAvatar = useCallback(({ size = "w-8 h-8", showBorder = true, className = "" }) => {
    const borderClass = showBorder ? "border-2 border-white/80 shadow-lg" : "";
    
    if (user?.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt="Profile"
          className={`${size} rounded-full object-cover ${borderClass} ${className} transition-all duration-200`}
          loading="lazy"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div 
        className={`${size} bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center text-white font-semibold ${borderClass} ${className} transition-all duration-200`}
      >
        {userInitials}
      </div>
    );
  }, [user?.profilePicture, userInitials]);

  // Early returns
  if (loading) {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 h-16 animate-pulse" />
        <div className="h-16" />
      </div>
    );
  }

  if (isAuthPage) return null;

  const navLinkClasses = `px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-[#FF6B35] relative after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#FF6B35] after:transition-all after:duration-300 hover:after:w-full ${textColor}`;

  return (
    <div className="relative">
      <nav className={navbarClasses}>
        <div className="w-11/12 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center group transition-transform hover:scale-105 duration-200"
            >
              <img 
                className="h-10 w-auto" 
                src={Brandlogo} 
                alt="Eventry Logo" 
                loading="eager" 
              />
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
                    className={`w-full px-4 py-2 pl-10 pr-16 rounded-full border ${inputStyles.bg} ${inputStyles.text} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm transition-all duration-200`}
                  />
                  <Search className={`absolute left-3 top-2.5 h-4 w-4 ${inputStyles.icon} transition-colors duration-200`} />
                  <div className="absolute right-2 top-1.5">
                    <VoiceSearch ref={voiceSearchRef} onVoiceResult={handleVoiceResult} navbarBg={navbarBg} />
                  </div>
                </form>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center space-x-6 ${isDiscoverPage ? "flex-1 justify-end" : ""}`}>
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  className={({ isActive }) => 
                    `${navLinkClasses} ${isActive ? 'text-[#FF6B35] after:w-full' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4">
                  <NotificationBell />

                  {user?.role === "organizer" && (
                    <NavLink 
                      to="/dashboard/wallet" 
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 group ${
                          isActive ? 'text-[#FF6B35]' : textColor
                        } hover:text-[#FF6B35]`
                      }
                    >
                      <Wallet className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
                      Wallet
                    </NavLink>
                  )}

                  <div className="relative user-menu-container">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 group ${
                        navbarBg === "light" 
                          ? "hover:bg-gray-100/80" 
                          : "hover:bg-white/10"
                      } ${isUserMenuOpen ? 'bg-white/20' : ''}`}
                    >
                      <UserAvatar className="group-hover:scale-110" />
                      <span className={`text-sm font-medium ${textColor} transition-colors duration-200`}>
                        {user?.userName || user?.firstName || "User"}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <UserAvatar size="w-10 h-10" showBorder={false} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize mt-0.5">
                                {user?.role || "attendee"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          {userMenuItems.map((item) => (
                            <NavLink 
                              key={item.label} 
                              to={item.path} 
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] transition-all duration-200 group" 
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                              {item.label}
                            </NavLink>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 pt-1">
                          <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                          >
                            <LogOut className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <NavLink 
                    to="/login" 
                    className={`px-4 py-2 transition-colors duration-200 font-medium hover:text-[#FF6B35] ${textColor}`}
                  >
                    Sign In
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8535] hover:shadow-lg transform hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`lg:hidden inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                navbarBg === "light" 
                  ? "hover:bg-gray-100/80 text-gray-700" 
                  : "hover:bg-white/10 text-white"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-200" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden border-t backdrop-blur-lg animate-in slide-in-from-top duration-300 ${
            navbarBg === "light" 
              ? "border-gray-200/80 bg-white/95" 
              : "border-white/20 bg-black/30"
          }`}>
            <div className="w-11/12 mx-auto px-4 pt-2 pb-6 space-y-1">
              {!isDiscoverPage && (
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search events, organizers..." 
                    className={`w-full px-4 py-3 pl-10 pr-16 rounded-xl border ${inputStyles.bg} ${inputStyles.text} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm transition-all duration-200`} 
                  />
                  <Search className={`absolute left-3 top-3.5 h-4 w-4 ${inputStyles.icon} transition-colors duration-200`} />
                  <div className="absolute right-2 top-2.5">
                    <VoiceSearch onVoiceResult={handleVoiceResult} navbarBg={navbarBg} />
                  </div>
                </form>
              )}

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink 
                    key={link.path} 
                    to={link.path} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                      navbarBg === "light" 
                        ? "hover:bg-gray-100/80 text-gray-700" 
                        : "hover:bg-white/10 text-white"
                    }`} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon && (
                      <link.icon className="h-4 w-4 mr-3 transition-colors duration-200 group-hover:text-[#FF6B35]" />
                    )}
                    <span className="transition-colors duration-200 group-hover:text-[#FF6B35]">
                      {link.label}
                    </span>
                  </NavLink>
                ))}
              </div>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                      <UserAvatar size="w-12 h-12" showBorder={false} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold truncate ${textColor}`}>
                          {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          navbarBg === "light" ? "text-gray-500" : "text-white/70"
                        } capitalize`}>
                          {user?.role || "attendee"}
                        </p>
                      </div>
                    </div>

                    {userMenuItems.map((item) => (
                      <NavLink 
                        key={item.label} 
                        to={item.path} 
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                          navbarBg === "light" 
                            ? "hover:bg-gray-100/80 text-gray-700" 
                            : "hover:bg-white/10 text-white"
                        }`} 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3 transition-colors duration-200 group-hover:text-[#FF6B35]" />
                        <span className="transition-colors duration-200 group-hover:text-[#FF6B35]">
                          {item.label}
                        </span>
                      </NavLink>
                    ))}

                    {user?.role === "organizer" && (
                      <NavLink 
                        to="/dashboard/wallet" 
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                          navbarBg === "light" 
                            ? "hover:bg-gray-100/80 text-gray-700" 
                            : "hover:bg-white/10 text-white"
                        }`} 
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Wallet className="h-4 w-4 mr-3 transition-colors duration-200 group-hover:text-[#FF6B35]" />
                        <span className="transition-colors duration-200 group-hover:text-[#FF6B35]">Wallet</span>
                      </NavLink>
                    )}

                    <button 
                      onClick={handleLogout} 
                      className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${
                        navbarBg === "light" 
                          ? "hover:bg-red-50 text-red-600" 
                          : "hover:bg-red-400/10 text-red-400"
                      }`}
                    >
                      <LogOut className="h-4 w-4 mr-3 transition-transform duration-200 group-hover:scale-110" />
                      <span className="transition-colors duration-200">Sign out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                  <NavLink 
                    to="/login" 
                    className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      navbarBg === "light" 
                        ? "hover:bg-gray-100/80 text-gray-700" 
                        : "hover:bg-white/10 text-white"
                    }`} 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="flex items-center justify-center px-4 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-all duration-200 transform hover:scale-105 shadow-md" 
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

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={cancelLogout} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-600">
                Are you sure you want to sign out? You'll need to sign in again to access your account.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelLogout} 
                disabled={isLoggingOut} 
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                disabled={isLoggingOut} 
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default React.memo(Navbar);