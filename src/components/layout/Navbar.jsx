import React, { useState, useEffect, useRef } from "react";
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

// Add styles for animations
const modalStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [navbarBg, setNavbarBg] = useState("transparent");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const voiceSearchRef = useRef(null);

  const { isAuthenticated, user, logout, loading } = useAuth();
  const isDiscoverPage = location.pathname === "/discover";

  // Check if current page is auth page (login, signup, forgot-password)
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(location.pathname);

  // Track scroll position and detect background color
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);

      const navbarHeight = 64;
      const elementBehind = document.elementFromPoint(
        window.innerWidth / 2,
        navbarHeight + 10
      );

      if (elementBehind) {
        const bgColor = window.getComputedStyle(elementBehind).backgroundColor;
        const computedStyle = window.getComputedStyle(elementBehind);

        const isDark = checkIfDark(bgColor, computedStyle);

        if (position > 50) {
          setNavbarBg(isDark ? "dark" : "light");
        } else {
          setNavbarBg("transparent");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  // Handle click outside for voice search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (voiceSearchRef.current?.isListening) {
        const isVoiceSearchButton = event.target.closest('[data-voice-search]');
        const isSearchInput = event.target.closest('input[type="text"]');
        
        if (!isVoiceSearchButton && !isSearchInput) {
          voiceSearchRef.current.stopListening();
        }
      }

      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showLogoutModal) {
        cancelLogout();
      }
    };

    if (showLogoutModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showLogoutModal]);

  const checkIfDark = (bgColor, computedStyle) => {
    const bgImage = computedStyle.backgroundImage;
    if (bgImage && bgImage !== "none") {
      if (location.pathname.includes("organizer")) return false;
    }

    const rgb = bgColor.match(/\d+/g);
    if (!rgb) return false;

    const [r, g, b] = rgb.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
  };

  const getNavbarClasses = () => {
    const baseClasses = "top-0 left-0 fixed right-0 z-30 border-b transition-all duration-300";

    switch (navbarBg) {
      case "light":
        return `${baseClasses} bg-white/95 backdrop-blur-md border-gray-200 shadow-sm`;
      case "dark":
        return `${baseClasses} bg-black/40 backdrop-blur-md border-white/10`;
      default:
        return `${baseClasses} bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-md border-white/10`;
    }
  };

  const getTextColor = () => {
    return navbarBg === "light" ? "text-gray-900" : "text-white";
  };

  const getHoverColor = () => {
    return "hover:text-[#FF6B35]";
  };

  useEffect(() => {
    console.log("Navbar - Auth State Changed:", {
      isAuthenticated,
      user,
      userRole: user?.role,
      loading,
      profilePicture: user?.profilePicture,
    });
  }, [isAuthenticated, user, loading]);

  const navLinkClasses = `px-3 py-2 text-sm font-medium ${getTextColor()} ${getHoverColor()} relative after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#FF6B35] after:transition-all hover:after:w-full`;

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
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
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let searchRoute = "/discover";

    if (isAuthenticated) {
      if (user?.role === "organizer") {
        searchRoute = "/dashboard/organizer";
      } else {
        searchRoute = "/dashboard";
      }
    }

    navigate(`${searchRoute}?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setIsMenuOpen(false);
  };

  const handleVoiceResult = (voiceData) => {
    console.log("Voice search result:", voiceData);

    const searchQuery = voiceData.parsedQuery || voiceData.originalQuery;

    setSearchQuery(searchQuery);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    setTimeout(() => {
      let searchRoute = "/discover";

      if (isAuthenticated) {
        if (user?.role === "organizer") {
          searchRoute = "/dashboard/organizer";
        } else {
          searchRoute = "/dashboard";
        }
      }

      const searchParams = new URLSearchParams({
        search: encodeURIComponent(searchQuery),
        isVoiceSearch: "true",
        originalQuery: encodeURIComponent(voiceData.originalQuery),
        confidence: voiceData.confidence || "0.5",
      });

      if (voiceData.searchParams) {
        Object.entries(voiceData.searchParams).forEach(([key, value]) => {
          if (value) {
            searchParams.append(key, value);
          }
        });
      }

      navigate(`${searchRoute}?${searchParams.toString()}`);

      setSearchQuery("");
      setIsMenuOpen(false);
    }, 500);
  };

  const userMenuItems = user?.role === "organizer"
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
      ];

  const authenticatedLinks = [
    { path: "/discover", label: "Discover Events", icon: Ticket },
    ...(user?.role === "organizer"
      ? [
          { path: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
          ...(!location.pathname.includes("/create-event")
            ? [{ path: "/create-event", label: "Create Event" }]
            : []),
        ]
      : [
          { path: "/my-tickets", label: "My Tickets", icon: Ticket },
          { path: "/dashboard/events", label: "My Events", icon: Calendar },
        ]),
  ];

  const unauthenticatedLinks = [
    { path: "/discover", label: "Discover Events", icon: Ticket },
    ...(!location.pathname.includes("/create-event")
      ? [{ path: "/create-event", label: "Create Events" }]
      : []),
  ];

  // Function to get user's initials for fallback avatar
  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  // Function to render user avatar
  const renderUserAvatar = (size = "w-8 h-8", showBorder = true) => {
    const borderClass = showBorder ? "border-2 border-white shadow-lg" : "";
    
    if (user?.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt={`${user.userName || user.firstName}'s profile`}
          className={`${size} rounded-full object-cover ${borderClass} group-hover:scale-110 transition-transform`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <div className={`${size} bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center text-white font-semibold ${borderClass} group-hover:scale-110 transition-transform`}>
        {getUserInitials()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative">
        <nav className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-md border-b border-white/10 h-16">
          <div className="flex justify-center items-center h-full">
            <div className="text-white">Loading...</div>
          </div>
        </nav>
        <div className="h-16"></div>
      </div>
    );
  }

  const navLinks = isAuthenticated ? authenticatedLinks : unauthenticatedLinks;
  const inputBgClass = navbarBg === "light" ? "bg-gray-100" : "bg-white/10";
  const inputTextClass = navbarBg === "light" ? "text-gray-900 placeholder-gray-500" : "text-white placeholder-white/70";
  const inputBorderClass = navbarBg === "light" ? "border-gray-300" : "border-white/20";
  const iconColor = navbarBg === "light" ? "text-gray-500" : "text-white/70";

  // Don't render navbar on auth pages (after all hooks have been called)
  if (isAuthPage) {
    return null;
  }

  return (
    <div className="relative">
      <nav className={getNavbarClasses()}>
        <div className="w-11/12 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink
              to={isAuthenticated ? (user?.role === "organizer" ? "/dashboard/organizer" : "/dashboard") : "/"}
              className="flex items-center group"
            >
              <img className="h-13 w-auto" src={Brandlogo} alt="Logo" />
              <span className="ml-2 text-xl font-bold text-[#FF6B35] transition-colors">Eventry</span>
            </NavLink>

            {/* Search Bar - Desktop with Voice Search */}
            {!isDiscoverPage && (
              <div className="hidden lg:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, organizers..."
                    className={`w-full px-4 py-2 pl-10 pr-16 rounded-full ${inputBgClass} ${inputTextClass} border ${inputBorderClass} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm transition-all`}
                  />
                  <Search className={`absolute left-3 top-2.5 h-4 w-4 ${iconColor}`} />
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
                    <NavLink to="/dashboard/wallet" className={`flex items-center px-3 py-2 text-sm font-medium ${getTextColor()} ${getHoverColor()} transition-colors group`}>
                      <Wallet className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      Wallet
                    </NavLink>
                  )}

                  <div className="relative user-menu-container">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center space-x-2 p-2 rounded-lg ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} transition-colors group`}>
                      {renderUserAvatar()}
                      <span className={`text-sm font-medium ${getTextColor()}`}>
                        {user?.userName || user?.firstName || "User"}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3 mb-2">
                            {renderUserAvatar("w-10 h-10", false)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{user?.role || "attendee"}</p>
                            </div>
                          </div>
                        </div>

                        {userMenuItems.map((item) => (
                          <NavLink key={item.label} to={item.path} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FF6B35] hover:text-white transition-colors group" onClick={() => setIsUserMenuOpen(false)}>
                            <item.icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                            {item.label}
                          </NavLink>
                        ))}

                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 group">
                          <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <NavLink to="/login" className={`px-4 py-2 ${getTextColor()} ${getHoverColor()} transition-colors font-medium`}>
                    Sign In
                  </NavLink>
                  <NavLink to="/signup" className="bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8535] hover:shadow-lg transform hover:scale-105 transition-all flex items-center">
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md ${getTextColor()} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} transition-colors`}>
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
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events, organizers..." className={`w-full px-4 py-2 pl-10 pr-16 rounded-full ${inputBgClass} ${inputTextClass} border ${inputBorderClass} focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm`} />
                  <Search className={`absolute left-3 top-2.5 h-4 w-4 ${iconColor}`} />
                  <div className="absolute right-2 top-1.5">
                    <VoiceSearch onVoiceResult={handleVoiceResult} navbarBg={navbarBg} />
                  </div>
                </form>
              )}

              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={`flex items-center px-3 py-2 ${getTextColor()} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} onClick={() => setIsMenuOpen(false)}>
                  {link.icon && <link.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />}
                  <span className="group-hover:text-[#FF6B35] transition-colors">{link.label}</span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <React.Fragment>
                  {/* User info in mobile menu */}
                  <div className="flex items-center space-x-3 px-3 py-2 border-b border-white/10 mb-2">
                    {renderUserAvatar("w-10 h-10", false)}
                    <div>
                      <p className={`text-sm font-medium ${getTextColor()}`}>
                        {user?.userName || `${user?.firstName} ${user?.lastName}` || "User"}
                      </p>
                      <p className={`text-xs ${navbarBg === "light" ? "text-gray-500" : "text-white/70"} capitalize`}>
                        {user?.role || "attendee"}
                      </p>
                    </div>
                  </div>

                  {userMenuItems.map((item) => (
                    <NavLink key={item.label} to={item.path} className={`flex items-center px-3 py-2 ${getTextColor()} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} onClick={() => setIsMenuOpen(false)}>
                      <item.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">{item.label}</span>
                    </NavLink>
                  ))}

                  {user?.role === "organizer" && (
                    <NavLink to="/dashboard/wallet" className={`flex items-center px-3 py-2 ${getTextColor()} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors group`} onClick={() => setIsMenuOpen(false)}>
                      <Wallet className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">Wallet</span>
                    </NavLink>
                  )}

                  <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors group">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </React.Fragment>
              ) : (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <NavLink to="/login" className={`flex items-center justify-center px-3 py-2 ${getTextColor()} ${navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"} rounded-md transition-colors`} onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </NavLink>
                  <NavLink to="/signup" className="flex items-center justify-center px-3 py-2 bg-[#FF6B35] text-white rounded-md font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-5"></div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={cancelLogout}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scaleIn">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-gray-600">
                Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={cancelLogout} disabled={isLoggingOut} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button onClick={confirmLogout} disabled={isLoggingOut} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {isLoggingOut ? (
                  <React.Fragment>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing Out...
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </React.Fragment>
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