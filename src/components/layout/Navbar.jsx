import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Use AuthContext for authentication state
  const { isAuthenticated, user, logout, loading } = useAuth();

  // Debug: Log auth state changes
  useEffect(() => {
    console.log("Navbar - Auth State Changed:", {
      isAuthenticated,
      user,
      userRole: user?.role,
      loading,
    });
  }, [isAuthenticated, user, loading]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const navLinkClasses =
    "px-3 py-2 text-sm font-medium text-white hover:text-[#FF6B35] relative after:content-[''] after:block after:h-0.5 after:w-0 after:bg-[#FF6B35] after:transition-all hover:after:w-full";

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/");
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

  // User menu items based on role
  const userMenuItems =
    user?.role === "organizer"
      ? [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/dashboard/organizer",
          },
          { icon: User, label: "Profile", path: "/dashboard/profile" },
          { icon: Settings, label: "Settings", path: "/dashboard/settings" },
        ]
      : [
          { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
          { icon: User, label: "Profile", path: "/dashboard/profile" },
          { icon: Settings, label: "Settings", path: "/dashboard/settings" },
        ];

  // Navigation links based on authentication
  const authenticatedLinks = [
    { path: "/discover", label: "Discover Events", icon: Ticket },
    { path: "/dashboard/events", label: "My Events", icon: Calendar },
    ...(user?.role === "organizer" &&
    !location.pathname.includes("/create-event")
      ? [{ path: "/create-event", label: "Create Event" }]
      : []),
  ];

  const unauthenticatedLinks = [
    { path: "/discover", label: "Discover Events", icon: Ticket },
    ...(!location.pathname.includes("/create-event")
      ? [{ path: "/create-event", label: "Create Events" }]
      : []),
    { path: "/team", label: "Team", icon: null },
  ];

  // Show loading state
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

  // Determine which links to show
  const navLinks = isAuthenticated ? authenticatedLinks : unauthenticatedLinks;

  return (
    <div className="relative">
      <nav className="top-0 left-0 fixed right-0 z-30 bg-gradient-to-r from-black/20 to-black/10 backdrop-blur-md border-b border-white/10">
        <div className="w-11/12 mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center group"
            >
              <img className="h-13 w-auto" src={Brandlogo} alt="Logo" />
              <span className="ml-2 text-xl font-bold  text-[#FF6B35] transition-colors">
                Eventry
              </span>
            </NavLink>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, organizers..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm transition-all"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={navLinkClasses}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Authenticated User Section */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-4">
                  {/* Notifications */}
                  <button className="relative p-2 text-white hover:text-[#FF6B35] transition-colors group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-1 right-1 block h-2 w-2 bg-[#FF6B35] rounded-full"></span>
                  </button>

                  {/* Wallet - Organizer Only */}
                  {user?.role === "organizer" && (
                    <NavLink
                      to="/dashboard/wallet"
                      className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-[#FF6B35] transition-colors group"
                    >
                      <Wallet className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      Wallet
                    </NavLink>
                  )}

                  {/* User Menu */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {user?.userName || user?.firstName || "User"}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.userName ||
                              `${user?.firstName} ${user?.lastName}` ||
                              "User"}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user?.role || "attendee"}
                          </p>
                        </div>

                        {/* Menu Items */}
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

                        {/* Logout */}
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
                // Unauthenticated User Section
                <div className="flex items-center space-x-4">
                  <NavLink
                    to="/login"
                    className="px-4 py-2 text-white hover:text-[#FF6B35] transition-colors font-medium"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8535] hover:shadow-lg transform hover:scale-105 transition-all flex items-center"
                  >
                    Get Started
                  </NavLink>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="w-11/12 mx-auto px-4 pt-2 pb-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, organizers..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
              </form>

              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && (
                    <link.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                  )}
                  <span className="group-hover:text-[#FF6B35] transition-colors">
                    {link.label}
                  </span>
                </NavLink>
              ))}

              {/* Mobile Authenticated Menu */}
              {isAuthenticated ? (
                <>
                  {userMenuItems.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}

                  <button className="flex items-center w-full px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors group">
                    <Bell className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                    <span className="group-hover:text-[#FF6B35] transition-colors">
                      Notifications
                    </span>
                  </button>

                  {user?.role === "organizer" && (
                    <NavLink
                      to="/dashboard/wallet"
                      className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Wallet className="h-4 w-4 mr-2 group-hover:text-[#FF6B35] transition-colors" />
                      <span className="group-hover:text-[#FF6B35] transition-colors">
                        Wallet
                      </span>
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
                // Mobile Unauthenticated Menu
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <NavLink
                    to="/login"
                    className="flex items-center justify-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="flex items-center justify-center px-3 py-2 bg-[#FF6B35] text-white rounded-md font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105"
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

      {/* Spacer */}
      <div className="h-16"></div>
    </div>
  );
};

export default Navbar;
