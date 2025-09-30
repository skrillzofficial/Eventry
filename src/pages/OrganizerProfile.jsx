// pages/dashboard/OrganizerDashboard.jsx
import React, { useState, useEffect } from 'react';
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
  BarChart3,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { eventsApi } from '../data/EventsApi';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      
      // Load all events from API
      const events = await eventsApi.getAllEvents();
      setAllEvents(events);
      
      // Get organizer name from localStorage or use default
      const organizerName = localStorage.getItem('userName') || 'Tech Innovation NG';
      
      // Filter events created by this organizer
      const organizerEvents = events.filter(event => 
        event.organizer.name === organizerName
      );

      // Calculate statistics
      const today = new Date();
      const activeEvents = organizerEvents.filter(event => 
        new Date(event.date) >= today
      );
      const completedEvents = organizerEvents.filter(event => 
        new Date(event.date) < today
      );
      
      const totalAttendees = organizerEvents.reduce((sum, event) => sum + event.attendees, 0);
      const totalRevenue = organizerEvents.reduce((sum, event) => sum + (event.price * event.attendees), 0);
      const ticketsSold = totalAttendees;

      const statsData = {
        totalEvents: organizerEvents.length,
        activeEvents: activeEvents.length,
        totalAttendees: totalAttendees,
        totalRevenue: totalRevenue,
        ticketsSold: ticketsSold,
        conversionRate: Math.round((ticketsSold / (ticketsSold + 500)) * 100), // Simulated conversion
        walletBalance: Math.round(totalRevenue * 0.8) // 80% of revenue available
      };

      setStats(statsData);

      // Prepare events for display with status
      const eventsWithStatus = organizerEvents.map(event => ({
        ...event,
        status: new Date(event.date) >= today ? 'active' : 'completed',
        revenue: event.price * event.attendees,
        ticketsSold: event.attendees,
        capacity: event.capacity,
        location: `${event.venue}, ${event.city}`
      }));

      setRecentEvents(eventsWithStatus.slice(0, 5));
      setUpcomingEvents(activeEvents.slice(0, 3));

      // Generate revenue data for chart
      const monthlyRevenue = generateMonthlyRevenue(organizerEvents);
      setRevenueData(monthlyRevenue);

    } catch (error) {
      console.error('Error loading organizer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (events) => {
    // Group events by month and calculate revenue
    const monthlyData = {};
    
    events.forEach(event => {
      const date = new Date(event.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const revenue = event.price * event.attendees;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += revenue;
    });

    // Convert to chart format
    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);

    return { labels, values };
  };

  const shareEvent = (event) => {
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const text = `Check out my event: ${event.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
    };

    window.open(shareUrls.twitter, '_blank', 'width=600,height=400');
  };

  const downloadEventReport = (event) => {
    // Simulate report download
    alert(`Downloading report for ${event.title}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen Organizerimg Blend-overlay">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen Organizerimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  Organizer Dashboard
                </h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-xs font-medium text-white">Pro Organizer</span>
                </div>
              </div>
              <p className="text-gray-300">
                Manage your events and track performance with blockchain analytics
              </p>
            </div>
            <Link
              to="/create-event"
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A2B] transition-all duration-200 hover:scale-105 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Events" 
            value={stats.totalEvents} 
            icon={Calendar}
            change="+3 this month"
          />
          <StatCard 
            title="Active Events" 
            value={stats.activeEvents} 
            icon={Eye}
          />
          <StatCard 
            title="Total Attendees" 
            value={stats.totalAttendees?.toLocaleString()} 
            icon={Users}
            change="+24% growth"
          />
          <StatCard 
            title="Total Revenue" 
            value={`₦${stats.totalRevenue?.toLocaleString()}`} 
            icon={DollarSign}
            change="+18% from last month"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActionsSection />
            
            {/* Revenue Analytics */}
            <RevenueSection revenueData={revenueData} />
            
            {/* Events Management */}
            <EventsManagementSection 
              events={recentEvents} 
              onShareEvent={shareEvent}
              onDownloadReport={downloadEventReport}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <UpcomingEventsSection events={upcomingEvents} />
            
            {/* Blockchain Wallet */}
            <BlockchainWalletSection balance={stats.walletBalance} />
            
            {/* Performance Metrics */}
            <PerformanceMetricsSection stats={stats} />
          </div>
        </div>
      </div>
      
      <div className="bg-[#FF6B35]">
        <Footer />
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change && (
          <p className={`text-sm ${change.includes('+') ? 'text-green-400' : 'text-red-400'} flex items-center mt-1`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-[#FF6B35]/20 rounded-lg">
        <Icon className="h-6 w-6 text-[#FF6B35]" />
      </div>
    </div>
  </div>
);

const QuickActionsSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Link to="/create-event" className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Plus className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Create Event</span>
      </Link>
      <Link to="/dashboard/analytics" className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <BarChart3 className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Analytics</span>
      </Link>
      <Link to="/dashboard/attendees" className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Users className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Attendees</span>
      </Link>
      <Link to="/dashboard/wallet" className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Wallet className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Wallet</span>
      </Link>
    </div>
  </div>
);

const RevenueSection = ({ revenueData }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
    {revenueData.values && revenueData.values.length > 0 ? (
      <>
        <div className="h-48 flex items-end space-x-2">
          {revenueData.values.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className="w-full bg-[#FF6B35] rounded-t transition-all duration-300 hover:bg-[#FF8535] group-hover:scale-105"
                style={{ height: `${(value / Math.max(...revenueData.values)) * 100}%` }}
              />
              <span className="text-xs text-gray-300 mt-2 group-hover:text-white transition-colors">
                {revenueData.labels[index]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-300">Monthly revenue distribution</span>
          <span className="text-sm font-semibold text-[#FF6B35]">
            +{Math.round(((revenueData.values[revenueData.values.length - 1] - revenueData.values[0]) / revenueData.values[0]) * 100)}% growth
          </span>
        </div>
      </>
    ) : (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <p>No revenue data available</p>
      </div>
    )}
  </div>
);

const EventsManagementSection = ({ events, onShareEvent, onDownloadReport }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Events Management</h3>
      <Link to="/dashboard/events" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center transition-all duration-200 hover:scale-105">
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onShare={() => onShareEvent(event)}
          onDownload={() => onDownloadReport(event)}
        />
      ))}
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No events created yet</p>
          <Link to="/create-event" className="text-[#FF6B35] hover:text-[#FF8535] text-sm">
            Create your first event
          </Link>
        </div>
      )}
    </div>
  </div>
);

const EventCard = ({ event, onShare, onDownload }) => (
  <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-102">
    <div className="flex-1">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          event.status === 'active' ? 'bg-green-400/20 text-green-400' :
          event.status === 'completed' ? 'bg-gray-400/20 text-gray-400' :
          'bg-[#FF6B35]/20 text-[#FF6B35]'
        }`}>
          {event.status === 'active' ? <Eye className="h-4 w-4" /> :
           event.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
           <Clock className="h-4 w-4" />}
        </div>
        <div>
          <Link to={`/event/${event.id}`}>
            <h4 className="font-semibold text-white hover:text-[#FF6B35] transition-colors">
              {event.title}
            </h4>
          </Link>
          <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-[#FF6B35]" />
              {event.location}
            </span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              event.attendees / event.capacity > 0.8 ? 'bg-green-400/20 text-green-400' :
              event.attendees / event.capacity > 0.5 ? 'bg-yellow-400/20 text-yellow-400' :
              'bg-red-400/20 text-red-400'
            }`}>
              {Math.round((event.attendees / event.capacity) * 100)}% full
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div className="font-semibold text-white">{event.ticketsSold} tickets</div>
          <div className="text-gray-300">₦{event.revenue?.toLocaleString()}</div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onShare}
            className="p-2 text-gray-400 hover:text-[#FF6B35] transition-all duration-200 hover:scale-110"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onDownload}
            className="p-2 text-gray-400 hover:text-[#FF6B35] transition-all duration-200 hover:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const UpcomingEventsSection = ({ events }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
      <Link to="/dashboard/events" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center transition-all duration-200 hover:scale-105">
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.map((event) => (
        <Link key={event.id} to={`/event/${event.id}`}>
          <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-all duration-200 hover:scale-102">
            <div>
              <p className="font-medium text-white text-sm">{event.title}</p>
              <p className="text-xs text-gray-300">
                {new Date(event.date).toLocaleDateString()} • {event.city}
              </p>
            </div>
            <span className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-1 rounded-full">
              {event.ticketsSold} sold
            </span>
          </div>
        </Link>
      ))}
      {events.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p>No upcoming events</p>
        </div>
      )}
    </div>
  </div>
);

const BlockchainWalletSection = ({ balance }) => (
  <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl shadow-sm p-6 text-white">
    <h3 className="text-lg font-semibold mb-3">Blockchain Wallet</h3>
    <div className="mb-4">
      <p className="text-2xl font-bold">₦{balance?.toLocaleString()}</p>
      <p className="text-white/80 text-sm">Available balance</p>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Pending</span>
        <span>₦{(balance * 0.2).toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Total Earned</span>
        <span>₦{(balance * 1.25).toLocaleString()}</span>
      </div>
    </div>
    <button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-all duration-200 hover:scale-105">
      Withdraw Funds
    </button>
  </div>
);

const PerformanceMetricsSection = ({ stats }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
    <div className="space-y-4">
      <MetricItem label="Ticket Conversion Rate" value={`${stats.conversionRate}%`} trend="up" />
      <MetricItem label="Average Ticket Price" value="₦2,500" trend="up" />
      <MetricItem label="Event Capacity Usage" value="78%" trend="stable" />
      <MetricItem label="Customer Satisfaction" value="4.8/5" trend="up" />
    </div>
  </div>
);

const MetricItem = ({ label, value, trend }) => (
  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
    <span className="text-sm text-gray-300">{label}</span>
    <div className="flex items-center space-x-2">
      <span className="font-semibold text-white">{value}</span>
      <div className={`p-1 rounded ${
        trend === 'up' ? 'bg-green-400/20 text-green-400' :
        trend === 'down' ? 'bg-red-400/20 text-red-400' :
        'bg-gray-400/20 text-gray-400'
      }`}>
        <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
      </div>
    </div>
  </div>
);

export default OrganizerDashboard;