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
  Eye
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
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {localStorage.getItem('userName') || 'User'}! 👋
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
                color="blue"
              />
              <StatCard 
                title="Upcoming Events" 
                value={stats.upcomingEvents} 
                icon={Eye}
                color="green"
              />
              <StatCard 
                title="Total Attendees" 
                value={stats.totalAttendees?.toLocaleString()} 
                icon={Users}
                change="+24% growth"
                color="purple"
              />
              <StatCard 
                title="Revenue" 
                value={`₦${stats.revenue?.toLocaleString()}`} 
                icon={TrendingUp}
                change="+18% from last month"
                color="orange"
              />
            </>
          ) : (
            <>
              <StatCard 
                title="Events Attended" 
                value={stats.eventsAttended} 
                icon={Calendar}
                color="blue"
              />
              <StatCard 
                title="Upcoming Events" 
                value={stats.upcomingEvents} 
                icon={Eye}
                color="green"
              />
              <StatCard 
                title="My Tickets" 
                value={stats.tickets} 
                icon={Ticket}
                color="purple"
              />
              <StatCard 
                title="Wallet Balance" 
                value={`₦${stats.walletBalance}`} 
                icon={Wallet}
                change="+₦200 recent"
                color="orange"
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
      <div className="bg-[#005a55]">
        <Footer />
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, change, color }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change && (
          <p className={`text-sm ${change.includes('+') ? 'text-green-300' : 'text-red-300'} flex items-center mt-1`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 bg-white/20 rounded-lg`}>
        <Icon className={`h-6 w-6 text-white`} />
      </div>
    </div>
  </div>
);

// Quick Actions Section
const QuickActionsSection = ({ userRole }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userRole === 'organizer' ? (
        <>
          <Link to="/create-event" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#00E8D9] transition-colors group">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Create Event</p>
              <p className="text-sm text-white/80">Start a new event</p>
            </div>
          </Link>
          <Link to="/dashboard/analytics" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#00E8D9] transition-colors group">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">View Analytics</p>
              <p className="text-sm text-white/80">Event performance</p>
            </div>
          </Link>
        </>
      ) : (
        <>
          <Link to="/discover" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#00E8D9] transition-colors group">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Discover Events</p>
              <p className="text-sm text-white/80">Find new experiences</p>
            </div>
          </Link>
          <Link to="/dashboard/tickets" className="flex items-center p-4 border border-white/20 rounded-lg hover:border-[#00E8D9] transition-colors group">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">My Tickets</p>
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
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      <Link to="/dashboard/activity" className="text-sm text-[#00E8D9] hover:text-[#00fff0] flex items-center">
        View all <ArrowRight className="h-4 w-4 ml-1" />
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
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
      <Link to="/discover" className="text-sm text-[#00E8D9] hover:text-[#00fff0] flex items-center">
        View all <ArrowRight className="h-4 w-4 ml-1" />
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
  <div className="bg-gradient-to-br from-[#006F6A] to-[#005a55] rounded-xl shadow-sm p-6 text-white">
    <h3 className="text-lg font-semibold mb-3">Blockchain Features</h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Wallet className="h-4 w-4" />
        </div>
        <span className="text-sm">Secure Digital Wallet</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Ticket className="h-4 w-4" />
        </div>
        <span className="text-sm">NFT Ticket Verification</span>
      </div>
      {userRole === 'organizer' && (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
  <div className="flex items-start space-x-3">
    <div className={`p-2 rounded-lg ${type === 'purchase' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
      <Icon className={`h-4 w-4 ${type === 'purchase' ? 'text-green-300' : 'text-blue-300'}`} />
    </div>
    <div className="flex-1">
      <p className="font-medium text-white">{title}</p>
      <p className="text-sm text-white/80">{description}</p>
      <p className="text-xs text-white/60 mt-1">{time}</p>
    </div>
  </div>
);

const EventItem = ({ title, date, location, attendees }) => (
  <div className="flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-colors">
    <div>
      <p className="font-medium text-white text-sm">{title}</p>
      <p className="text-xs text-white/80">{date} • {location}</p>
    </div>
    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
      {attendees}
    </span>
  </div>
);

export default UserProfile