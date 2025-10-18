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
  Sparkles,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { eventsApi } from '../data/EventsApi';

const UserProfile = () => {
  const [userRole, setUserRole] = useState('attendee');
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'attendee';
    setUserRole(role);
    loadDashboardData(role);
  }, []);

  const loadDashboardData = async (role) => {
    try {
      setLoading(true);
      
      // Load all events from API
      const allEvents = await eventsApi.getAllEvents();
      
      // Filter upcoming events (events from today onwards)
      const today = new Date();
      const upcoming = allEvents.filter(event => new Date(event.date) >= today)
                              .sort((a, b) => new Date(a.date) - new Date(b.date))
                              .slice(0, 3);
      
      setUpcomingEvents(upcoming);

      if (role === 'organizer') {
        // For organizers, show their created events
        const userCreatedEvents = allEvents.filter(event => 
          event.organizer.name === (localStorage.getItem('userName') || 'Tech Innovation NG')
        );
        
        const totalAttendees = userCreatedEvents.reduce((sum, event) => sum + event.attendees, 0);
        const totalRevenue = userCreatedEvents.reduce((sum, event) => sum + (event.price * event.attendees), 0);
        const upcomingUserEvents = userCreatedEvents.filter(event => new Date(event.date) >= today).length;

        setStats({
          totalEvents: userCreatedEvents.length,
          upcomingEvents: upcomingUserEvents,
          totalAttendees: totalAttendees,
          revenue: totalRevenue,
          ticketsSold: totalAttendees
        });

        setUserEvents(userCreatedEvents);

        // Simulate organizer activity
        setRecentActivity([
          {
            id: 1,
            icon: Ticket,
            title: "Event Created",
            description: userCreatedEvents[0]?.title || "New Event",
            time: "2 hours ago",
            type: "creation"
          },
          {
            id: 2,
            icon: Users,
            title: "New Attendees",
            description: `${userCreatedEvents[0]?.attendees || 0} registered`,
            time: "1 day ago",
            type: "attendees"
          },
          {
            id: 3,
            icon: TrendingUp,
            title: "Revenue Update",
            description: `₦${totalRevenue.toLocaleString()} earned`,
            time: "2 days ago",
            type: "revenue"
          }
        ]);

      } else {
        // For attendees, simulate ticket purchases and attendance
        const attendedEvents = allEvents.filter(event => 
          new Date(event.date) < today
        ).slice(0, 3);

        const userTickets = Math.floor(Math.random() * 12) + 1;
        const walletBalance = Math.floor(Math.random() * 1000) + 500;

        setStats({
          eventsAttended: attendedEvents.length,
          upcomingEvents: upcoming.length,
          tickets: userTickets,
          walletBalance: walletBalance
        });

        setUserEvents(attendedEvents);

        // Simulate attendee activity
        setRecentActivity([
          {
            id: 1,
            icon: Ticket,
            title: "Ticket Purchased",
            description: upcoming[0]?.title || "Blockchain Conference",
            time: "2 hours ago",
            type: "purchase"
          },
          {
            id: 2,
            icon: Calendar,
            title: "Event Attended",
            description: attendedEvents[0]?.title || "Tech Workshop",
            time: "1 day ago",
            type: "attendance"
          },
          {
            id: 3,
            icon: Wallet,
            title: "Wallet Top-up",
            description: "₦500 added to wallet",
            time: "3 days ago",
            type: "wallet"
          }
        ]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 w-11/12 mx-auto container py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      {/* Dashboard Content */}
      <div className="flex-1 w-11/12 mx-auto container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Welcome Back!
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, <span className="text-[#FF6B35]">{localStorage.getItem('userName') || 'User'}</span>! 👋
          </h1>
          <p className="text-gray-600 mt-2">
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
            <ActivitySection activities={recentActivity} userRole={userRole} />
            
            {/* User Events */}
            <UserEventsSection events={userEvents} userRole={userRole} />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <UpcomingEventsSection events={upcomingEvents} />
            
            {/* Blockchain Features */}
            <BlockchainFeaturesSection userRole={userRole} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-[#FF6B35] transition-colors">{value}</p>
        {change && (
          <p className={`text-sm ${change.includes('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
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
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userRole === 'organizer' ? (
        <>
          <Link to="/create-event" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-gray-50 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors">Create Event</p>
              <p className="text-sm text-gray-600">Start a new event</p>
            </div>
          </Link>
          <Link to="/dashboard/analytics" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-gray-50 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors">View Analytics</p>
              <p className="text-sm text-gray-600">Event performance</p>
            </div>
          </Link>
        </>
      ) : (
        <>
          <Link to="/discover" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-gray-50 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors">Discover Events</p>
              <p className="text-sm text-gray-600">Find new experiences</p>
            </div>
          </Link>
          <Link to="/my-tickets" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-gray-50 transition-all group transform hover:scale-105">
            <div className="p-2 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors">My Tickets</p>
              <p className="text-sm text-gray-600">View your tickets</p>
            </div>
          </Link>
        </>
      )}
    </div>
  </div>
);

// Activity Section
const ActivitySection = ({ activities, userRole }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <Link to="/dashboard/activity" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group">
        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-4">
      {activities.map(activity => (
        <ActivityItem 
          key={activity.id}
          icon={activity.icon}
          title={activity.title}
          description={activity.description}
          time={activity.time}
          type={activity.type}
        />
      ))}
    </div>
  </div>
);

// User Events Section
const UserEventsSection = ({ events, userRole }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {userRole === 'organizer' ? 'My Events' : 'My Event History'}
      </h3>
      <Link to={userRole === 'organizer' ? "/dashboard/events" : "/dashboard/history"} 
            className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group">
        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-4">
      {events.slice(0, 3).map(event => (
        <UserEventItem 
          key={event.id}
          event={event}
          userRole={userRole}
        />
      ))}
      {events.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No {userRole === 'organizer' ? 'events created' : 'events attended'} yet</p>
          <Link to={userRole === 'organizer' ? "/create-event" : "/discover"} 
                className="text-[#FF6B35] hover:text-[#FF8535] text-sm">
            {userRole === 'organizer' ? 'Create your first event' : 'Discover events'}
          </Link>
        </div>
      )}
    </div>
  </div>
);

// Upcoming Events Section
const UpcomingEventsSection = ({ events }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
      <Link to="/discover" className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group">
        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.map(event => (
        <EventItem 
          key={event.id}
          event={event}
        />
      ))}
      {events.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No upcoming events</p>
        </div>
      )}
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
  <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all">
    <div className={`p-2 rounded-lg ${
      type === 'purchase' ? 'bg-green-500/20' : 
      type === 'creation' ? 'bg-[#FF6B35]/20' : 
      type === 'attendance' ? 'bg-blue-500/20' : 
      'bg-purple-500/20'
    } group-hover:scale-110 transition-transform`}>
      <Icon className={`h-4 w-4 ${
        type === 'purchase' ? 'text-green-600' : 
        type === 'creation' ? 'text-[#FF6B35]' : 
        type === 'attendance' ? 'text-blue-600' : 
        'text-purple-600'
      }`} />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);

const EventItem = ({ event }) => (
  <Link to={`/event/${event.id}`}>
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all group transform hover:scale-105">
      <div>
        <p className="font-medium text-gray-900 text-sm group-hover:text-[#FF6B35] transition-colors line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-gray-600 flex items-center mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(event.date).toLocaleDateString('en-NG', { 
            month: 'short', 
            day: 'numeric' 
          })}
          <span className="mx-1">•</span>
          <MapPin className="h-3 w-3 mr-1" />
          {event.city}
        </p>
      </div>
      <span className="text-xs bg-[#FF6B35] text-white px-2 py-1 rounded-full group-hover:bg-[#FF8535] transition-colors">
        {event.attendees.toLocaleString()}
      </span>
    </div>
  </Link>
);

const UserEventItem = ({ event, userRole }) => (
  <Link to={`/event/${event.id}`}>
    <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all">
      <img 
        src={event.images && event.images[0]} 
        alt={event.title}
        className="w-12 h-12 rounded-lg object-cover group-hover:scale-110 transition-transform"
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900 group-hover:text-[#FF6B35] transition-colors text-sm">
          {event.title}
        </p>
        <div className="flex items-center text-xs text-gray-600 mt-1 space-x-2">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(event.date).toLocaleDateString('en-NG', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {event.attendees.toLocaleString()} attendees
          </span>
          {userRole === 'organizer' && (
            <span className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              ₦{(event.price * event.attendees).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

export default UserProfile;