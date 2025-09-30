import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Ticket, 
  Wallet,
  ArrowRight,
  Plus,
  Eye,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const UserProfile = () => {
  const [userRole, setUserRole] = useState('attendee');
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Get user data from localStorage/auth context
    const role = localStorage.getItem('userRole') || 'attendee';
    setUserRole(role);
    loadDashboardData(role);
  }, []);

  const loadDashboardData = async (role) => {
    // Simulated data based on role
    const data = role === 'organizer' ? {
      totalEvents: 12,
      upcomingEvents: 3,
      totalAttendees: 1247,
      revenue: 12560,
      ticketsSold: 89
    } : {
      eventsAttended: 8,
      upcomingEvents: 5,
      tickets: 12,
      walletBalance: 500
    };
    setStats(data);
  };

  return (
    <div className="Homeimg Blend-overlay min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Welcome Back!
          </div>
          <h1 className="text-3xl font-bold text-white">
            Hello, <span className="text-[#FF6B35]">{localStorage.getItem('userName') || 'User'}</span>! 👋
          </h1>
          <p className="text-white/80 mt-2">
            {userRole === 'organizer' 
              ? 'Manage your events and track your blockchain-powered event ecosystem'
              : 'Discover amazing events and manage your tickets seamlessly'
            }
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userRole === 'organizer' ? (
            <>
              <StatCard 
                title="Total Events" 
                value={stats.totalEvents} 
                icon={Calendar}
                change="+12% this month"
              />
              <StatCard 
                title="Upcoming Events" 
                value={stats.upcomingEvents} 
                icon={Eye}
              />
              <StatCard 
                title="Total Attendees" 
                value={stats.totalAttendees?.toLocaleString()} 
                icon={Users}
                change="+24% growth"
              />
              <StatCard 
                title="Revenue" 
                value={`₦${stats.revenue?.toLocaleString()}`} 
                icon={TrendingUp}
                change="+18% from last month"
              />
            </>
          ) : (
            <>
              <StatCard 
                title="Events Attended" 
                value={stats.eventsAttended} 
                icon={Calendar}
              />
              <StatCard 
                title="Upcoming Events" 
                value={stats.upcomingEvents} 
                icon={Eye}
              />
              <StatCard 
                title="My Tickets" 
                value={stats.tickets} 
                icon={Ticket}
              />
              <StatCard 
                title="Wallet Balance" 
                value={`₦${stats.walletBalance}`} 
                icon={Wallet}
                change="+₦200 recent"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActionsSection userRole={userRole} />
            
            {/* Recent Activity */}
            <ActivitySection userRole={userRole} />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <UpcomingEventsSection />
            
            {/* Blockchain Features */}
            <BlockchainFeaturesSection userRole={userRole} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#E55A2B]">
        <Footer />
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all group hover:border-[#FF6B35]/30">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 group-hover:text-[#FF6B35] transition-colors">{value}</p>
        {change && (
          <p className={`text-sm ${change.includes('+') ? 'text-green-300' : 'text-red-300'} flex items-center mt-1`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 bg-[#FF6B35] rounded-lg group-hover:scale-110 transition-transform`}>
        <Icon className={`h-6 w-6 text-white`} />
      </div>
    </div>
  </div>
);

// Quick Actions Section
const QuickActionsSection = ({ userRole }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userRole === 'organizer' ? (
        <>
          <Link to="/create-event" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] hover:bg-white/5 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">Create Event</p>
              <p className="text-sm text-white/80">Start a new event</p>
            </div>
          </Link>
          <Link to="/dashboard/analytics" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] hover:bg-white/5 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">View Analytics</p>
              <p className="text-sm text-white/80">Event performance</p>
            </div>
          </Link>
        </>
      ) : (
        <>
          <Link to="/discover" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] hover:bg-white/5 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">Discover Events</p>
              <p className="text-sm text-white/80">Find new experiences</p>
            </div>
          </Link>
          <Link to="/dashboard/tickets" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] hover:bg-white/5 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">My Tickets</p>
              <p className="text-sm text-white/80">View your tickets</p>
            </div>
          </Link>
        </>
      )}
    </div>
  </div>
);

// Activity Section
const ActivitySection = ({ userRole }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      <Link to="/dashboard/activity" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group">
        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-4">
      <ActivityItem 
        icon={Ticket}
        title="Ticket Purchased"
        description="Blockchain Conference 2024"
        time="2 hours ago"
        type="purchase"
      />
      <ActivityItem 
        icon={Calendar}
        title="Event Created"
        description="Tech Summit Lagos"
        time="1 day ago"
        type="creation"
      />
    </div>
  </div>
);

// Upcoming Events Section
const UpcomingEventsSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
      <Link to="/discover" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group">
        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-3">
      <EventItem 
        title="Blockchain Conference 2024"
        date="Dec 15, 2024"
        location="Lagos, Nigeria"
        attendees="1.2k"
      />
      <EventItem 
        title="Tech Innovation Summit"
        date="Jan 20, 2025"
        location="Accra, Ghana"
        attendees="800"
      />
    </div>
  </div>
);

// Blockchain Features Section
const BlockchainFeaturesSection = ({ userRole }) => (
  <div className="bg-[#FF6B35] rounded-2xl shadow-sm p-6 text-white hover:shadow-xl transition-all">
    <h3 className="text-lg font-semibold mb-3">Blockchain Features</h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3 group">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-sm">Secure Digital Wallet</span>
      </div>
      <div className="flex items-center space-x-3 group">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Ticket className="h-4 w-4" />
        </div>
        <span className="text-sm">NFT Ticket Verification</span>
      </div>
      {userRole === 'organizer' && (
        <div className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-sm">Smart Contract Analytics</span>
        </div>
      )}
    </div>
  </div>
);

// Reusable Components
const ActivityItem = ({ icon: Icon, title, description, time, type }) => (
  <div className="flex items-start space-x-3 group hover:bg-white/5 p-3 rounded-lg transition-all">
    <div className={`p-2 rounded-lg ${type === 'purchase' ? 'bg-green-500/20' : 'bg-[#FF6B35]/20'} group-hover:scale-110 transition-transform`}>
      <Icon className={`h-4 w-4 ${type === 'purchase' ? 'text-green-300' : 'text-[#FF6B35]'}`} />
    </div>
    <div className="flex-1">
      <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">{title}</p>
      <p className="text-sm text-white/80">{description}</p>
      <p className="text-xs text-white/60 mt-1">{time}</p>
    </div>
  </div>
);

const EventItem = ({ title, date, location, attendees }) => (
  <div className="flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group transform hover:scale-105">
    <div>
      <p className="font-medium text-white text-sm group-hover:text-[#FF6B35] transition-colors">{title}</p>
      <p className="text-xs text-white/80">{date} • {location}</p>
    </div>
    <span className="text-xs bg-[#FF6B35] text-white px-2 py-1 rounded-full group-hover:bg-[#FF8535] transition-colors">
      {attendees}
    </span>
  </div>
);

export default UserProfile;