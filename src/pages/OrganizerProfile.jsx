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
  Share2
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';    

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const loadOrganizerData = async () => {
    // Simulated organizer data
    const data = {
      totalEvents: 15,
      activeEvents: 3,
      totalAttendees: 2847,
      totalRevenue: 85600,
      ticketsSold: 1245,
      conversionRate: 12.5,
      walletBalance: 12560.50
    };
    
    const events = [
      {
        id: 1,
        title: "Blockchain Conference 2024",
        date: "2024-12-15",
        attendees: 1200,
        revenue: 45000,
        status: "active",
        ticketsSold: 890,
        capacity: 1500,
        location: "Lagos, Nigeria"
      },
      {
        id: 2,
        title: "Tech Innovation Summit",
        date: "2024-11-20",
        attendees: 847,
        revenue: 28600,
        status: "completed",
        ticketsSold: 847,
        capacity: 1000,
        location: "Accra, Ghana"
      },
      {
        id: 3,
        title: "AI & Machine Learning Workshop",
        date: "2025-01-25",
        attendees: 0,
        revenue: 12000,
        status: "upcoming",
        ticketsSold: 120,
        capacity: 300,
        location: "Nairobi, Kenya"
      }
    ];

    setStats(data);
    setRecentEvents(events);
    setUpcomingEvents(events.filter(event => event.status === 'upcoming'));
    
    setRevenueData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [12000, 18500, 14200, 23400, 18900, 28600]
    });
  };

  return (
    <div className="min-h-screen Organizerimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-300">
                Organizer Dashboard 🎪
              </h1>
              <p className="text-gray-500 mt-2">
                Manage your events and track performance with blockchain analytics
              </p>
            </div>
            <Link
              to="/create-event"
              className="bg-[#006F6A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#005a55] transition-colors flex items-center"
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
            color="blue"
          />
          <StatCard 
            title="Active Events" 
            value={stats.activeEvents} 
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
            title="Total Revenue" 
            value={`₦${stats.totalRevenue?.toLocaleString()}`} 
            icon={DollarSign}
            change="+18% from last month"
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActionsSection />
            
            {/* Events Management */}
            <EventsManagementSection events={recentEvents} />
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
      
      <Footer />
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon: Icon, change, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-sm ${change.includes('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const QuickActionsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Link to="/create-event" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-[#006F6A] transition-colors group">
        <div className="p-3 bg-blue-100 rounded-lg mb-2">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Create Event</span>
      </Link>
      <Link to="/dashboard/analytics" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-[#006F6A] transition-colors group">
        <div className="p-3 bg-green-100 rounded-lg mb-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Analytics</span>
      </Link>
      <Link to="/dashboard/attendees" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-[#006F6A] transition-colors group">
        <div className="p-3 bg-purple-100 rounded-lg mb-2">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Attendees</span>
      </Link>
      <Link to="/dashboard/wallet" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-[#006F6A] transition-colors group">
        <div className="p-3 bg-orange-100 rounded-lg mb-2">
          <Wallet className="h-6 w-6 text-orange-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Wallet</span>
      </Link>
    </div>
  </div>
);

const EventsManagementSection = ({ events }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Events Management</h3>
      <Link to="/dashboard/events" className="text-sm text-[#006F6A] hover:text-[#005a55] flex items-center">
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  </div>
);

const EventCard = ({ event }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#006F6A] transition-colors">
    <div className="flex-1">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          event.status === 'active' ? 'bg-green-100 text-green-600' :
          event.status === 'completed' ? 'bg-gray-100 text-gray-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {event.status === 'active' ? <Eye className="h-4 w-4" /> :
           event.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
           <Clock className="h-4 w-4" />}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{event.title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {event.location}
            </span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{event.ticketsSold} tickets</div>
          <div className="text-gray-600">₦{event.revenue?.toLocaleString()}</div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const RevenueSection = ({ revenueData }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
    <div className="h-48 flex items-end space-x-2">
      {revenueData.values?.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-gradient-to-t from-[#006F6A] to-[#00E8D9] rounded-t transition-all hover:opacity-80"
            style={{ height: `${(value / 30000) * 100}%` }}
          />
          <span className="text-xs text-gray-600 mt-2">{revenueData.labels?.[index]}</span>
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center mt-4">
      <span className="text-sm text-gray-600">Monthly revenue distribution</span>
      <span className="text-sm font-semibold text-[#006F6A]">+18% growth</span>
    </div>
  </div>
);

const UpcomingEventsSection = ({ events }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
      <Link to="/dashboard/events" className="text-sm text-[#006F6A] hover:text-[#005a55] flex items-center">
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div>
            <p className="font-medium text-gray-900 text-sm">{event.title}</p>
            <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {event.ticketsSold} sold
          </span>
        </div>
      ))}
    </div>
  </div>
);

const BlockchainWalletSection = ({ balance }) => (
  <div className="bg-gradient-to-br from-[#006F6A] to-[#005a55] rounded-xl shadow-sm p-6 text-white">
    <h3 className="text-lg font-semibold mb-3">Blockchain Wallet</h3>
    <div className="mb-4">
      <p className="text-2xl font-bold">₦{balance?.toLocaleString()}</p>
      <p className="text-white/80 text-sm">Available balance</p>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Pending</span>
        <span>₦2,400.00</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>Total Earned</span>
        <span>₦85,600.00</span>
      </div>
    </div>
    <button className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors text-sm">
      Withdraw Funds
    </button>
  </div>
);

const PerformanceMetricsSection = ({ stats }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
    <div className="space-y-4">
      <MetricItem label="Ticket Conversion Rate" value={`${stats.conversionRate}%`} trend="up" />
      <MetricItem label="Average Ticket Price" value="₦2,500" trend="up" />
      <MetricItem label="Event Capacity Usage" value="78%" trend="stable" />
      <MetricItem label="Customer Satisfaction" value="4.8/5" trend="up" />
    </div>
  </div>
);

const MetricItem = ({ label, value, trend }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center space-x-2">
      <span className="font-semibold text-gray-900">{value}</span>
      <div className={`p-1 rounded ${
        trend === 'up' ? 'bg-green-100 text-green-600' :
        trend === 'down' ? 'bg-red-100 text-red-600' :
        'bg-gray-100 text-gray-600'
      }`}>
        <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
      </div>
    </div>
  </div>
);

export default OrganizerDashboard;