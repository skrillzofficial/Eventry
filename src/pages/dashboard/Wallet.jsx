import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  Upload, 
  CreditCard, 
  History,
  Shield,
  QrCode,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const data = {
      balance: 125600.50,
      available: 115200.75,
      pending: 10399.75,
      currency: 'NGN',
      walletAddress: '0x742d35Cc6634C0532925a3b8D',
      transactions: [
        {
          id: 1,
          type: 'credit',
          amount: 45000,
          description: 'Blockchain Conference Ticket Sales',
          date: '2024-12-15T10:30:00Z',
          status: 'completed',
          event: 'Blockchain Conference 2024'
        },
        {
          id: 2,
          type: 'debit',
          amount: -15000,
          description: 'Withdrawal to Bank Account',
          date: '2024-12-10T14:20:00Z',
          status: 'completed',
          bank: 'GTBank - ****1234'
        },
        {
          id: 3,
          type: 'credit',
          amount: 28600,
          description: 'Tech Summit Ticket Sales',
          date: '2024-12-08T09:15:00Z',
          status: 'completed',
          event: 'Tech Innovation Summit'
        },
        {
          id: 4,
          type: 'credit',
          amount: 12000,
          description: 'AI Workshop Ticket Sales',
          date: '2024-12-05T16:45:00Z',
          status: 'pending',
          event: 'AI & Machine Learning Workshop'
        },
        {
          id: 5,
          type: 'debit',
          amount: -5000,
          description: 'Event Promotion Services',
          date: '2024-12-01T11:20:00Z',
          status: 'completed',
          vendor: 'Digital Marketing Pro'
        }
      ],
      paymentMethods: [
        {
          id: 1,
          type: 'bank',
          name: 'Guaranty Trust Bank',
          last4: '1234',
          primary: true
        },
        {
          id: 2,
          type: 'bank',
          name: 'Zenith Bank',
          last4: '5678',
          primary: false
        },
        {
          id: 3,
          type: 'crypto',
          name: 'Bitcoin Wallet',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          primary: false
        }
      ],
      stats: {
        totalEarned: 856000,
        totalWithdrawn: 730400,
        activeEvents: 3,
        pendingPayouts: 10399.75
      }
    };

    setWalletData(data);
    setLoading(false);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletData.walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Wallet</h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-white">Secure</span>
            </div>
          </div>
          <p className="text-gray-300">
            Manage your earnings, withdrawals, and payment methods
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-2xl p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Total Balance</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <span className="text-3xl font-bold">
                      {showBalance ? formatCurrency(walletData.balance) : '••••••'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-200 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+18.5% this month</span>
                  </div>
                  <span className="text-white/80 text-sm">Available: {showBalance ? formatCurrency(walletData.available) : '••••••'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-white/80 text-sm mb-1">Pending</div>
                  <div className="text-lg font-semibold">
                    {showBalance ? formatCurrency(walletData.pending) : '••••••'}
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-white/80 text-sm mb-1">Total Earned</div>
                  <div className="text-lg font-semibold">
                    {showBalance ? formatCurrency(walletData.stats.totalEarned) : '••••••'}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-white text-[#FF6B35] py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex items-center justify-center">
                  <Download className="h-5 w-5 mr-2" />
                  Withdraw
                </button>
                <button className="flex-1 bg-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-200 hover:scale-105 flex items-center justify-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Deposit
                </button>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Wallet Address</h3>
                <Shield className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/20">
                  <code className="text-gray-300 font-mono text-sm break-all">
                    {walletData.walletAddress}
                  </code>
                </div>
                <button
                  onClick={copyWalletAddress}
                  className="p-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-all duration-200 hover:scale-105"
                >
                  {copiedAddress ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
                <button className="p-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105">
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
              {copiedAddress && (
                <div className="mt-2 text-green-400 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Address copied to clipboard!
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 glass-morphism">
              <div className="border-b border-white/20">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'transactions', label: 'Transactions', icon: History },
                    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center ${
                        activeTab === tab.id
                          ? 'border-[#FF6B35] text-white scale-105'
                          : 'border-transparent text-gray-300 hover:text-white hover:scale-102'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <StatCard
                        title="Total Revenue"
                        value={formatCurrency(walletData.stats.totalEarned)}
                        change="+12.4%"
                        trend="up"
                      />
                      <StatCard
                        title="Total Withdrawn"
                        value={formatCurrency(walletData.stats.totalWithdrawn)}
                        change="+8.2%"
                        trend="up"
                      />
                      <StatCard
                        title="Active Events"
                        value={walletData.stats.activeEvents}
                        change="+1"
                        trend="up"
                      />
                      <StatCard
                        title="Pending Payouts"
                        value={formatCurrency(walletData.stats.pendingPayouts)}
                        change="Pending"
                        trend="neutral"
                      />
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Quick Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-white/5 rounded-lg border border-white/20 hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
                          <div className="flex items-center justify-between mb-2">
                            <Download className="h-6 w-6 text-[#FF6B35]" />
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B35]" />
                          </div>
                          <h5 className="font-semibold text-white mb-1">Withdraw Funds</h5>
                          <p className="text-sm text-gray-300">Transfer to your bank account</p>
                        </button>
                        
                        <button className="p-4 bg-white/5 rounded-lg border border-white/20 hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
                          <div className="flex items-center justify-between mb-2">
                            <History className="h-6 w-6 text-[#FF6B35]" />
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B35]" />
                          </div>
                          <h5 className="font-semibold text-white mb-1">Transaction History</h5>
                          <p className="text-sm text-gray-300">View all your transactions</p>
                        </button>
                        
                        <button className="p-4 bg-white/5 rounded-lg border border-white/20 hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group">
                          <div className="flex items-center justify-between mb-2">
                            <CreditCard className="h-6 w-6 text-[#FF6B35]" />
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B35]" />
                          </div>
                          <h5 className="font-semibold text-white mb-1">Payment Methods</h5>
                          <p className="text-sm text-gray-300">Manage bank accounts & cards</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">Transaction History</h3>
                      <div className="flex space-x-2">
                        <select className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
                          <option>All Transactions</option>
                          <option>Credits Only</option>
                          <option>Debits Only</option>
                          <option>Pending</option>
                        </select>
                        <input
                          type="date"
                          className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          placeholder="Filter by date"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {walletData.transactions.map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'payment-methods' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">Payment Methods</h3>
                      <button className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#FF8535] transition-all duration-200 hover:scale-105 flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                      </button>
                    </div>

                    <div className="space-y-4">
                      {walletData.paymentMethods.map(method => (
                        <PaymentMethodCard key={method.id} method={method} />
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-1">Security Notice</h4>
                          <p className="text-yellow-300 text-sm">
                            Your payment methods are securely encrypted. We never store your full bank details on our servers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <h3 className="font-semibold text-white mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Earnings</span>
                  <span className="text-green-400 font-semibold">+₦45,600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Withdrawals</span>
                  <span className="text-red-400 font-semibold">-₦15,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Fees</span>
                  <span className="text-gray-400">-₦2,400</span>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Net</span>
                    <span className="text-white font-semibold">+₦28,200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 text-[#FF6B35] mr-2" />
                Security Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Never share your wallet private keys</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Enable 2FA for additional security</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Verify payment addresses before sending</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Monitor your transaction history regularly</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-white/80 text-sm mb-4">
                Our support team is here to help with any wallet issues.
              </p>
              <button className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105">
                Contact Support
              </button>
            </div>
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
const StatCard = ({ title, value, change, trend }) => (
  <div className="bg-white/5 rounded-lg p-4 border border-white/20 hover:border-[#FF6B35] transition-all duration-200 hover:scale-105">
    <div className="text-gray-300 text-sm mb-1">{title}</div>
    <div className="text-white font-semibold text-lg mb-2">{value}</div>
    <div className={`text-xs flex items-center ${
      trend === 'up' ? 'text-green-400' :
      trend === 'down' ? 'text-red-400' :
      'text-yellow-400'
    }`}>
      <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
      {change}
    </div>
  </div>
);

const TransactionItem = ({ transaction }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20 hover:border-[#FF6B35] transition-all duration-200 hover:scale-102">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${
        transaction.type === 'credit' 
          ? 'bg-green-400/20 text-green-400' 
          : 'bg-red-400/20 text-red-400'
      }`}>
        {transaction.type === 'credit' ? 
          <ArrowDownLeft className="h-5 w-5" /> : 
          <ArrowUpRight className="h-5 w-5" />
        }
      </div>
      <div>
        <h4 className="font-semibold text-white text-sm">{transaction.description}</h4>
        <p className="text-gray-400 text-xs mt-1">
          {formatDate(transaction.date)}
          {transaction.event && ` • ${transaction.event}`}
          {transaction.bank && ` • ${transaction.bank}`}
        </p>
      </div>
    </div>
    <div className="text-right">
      <div className={`font-semibold ${
        transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
      }`}>
        {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
      </div>
      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
        transaction.status === 'completed' 
          ? 'bg-green-400/20 text-green-400' 
          : 'bg-yellow-400/20 text-yellow-400'
      }`}>
        {transaction.status}
      </div>
    </div>
  </div>
);

const PaymentMethodCard = ({ method }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/20 hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-[#FF6B35]/20 rounded-lg">
        {method.type === 'bank' ? (
          <CreditCard className="h-6 w-6 text-[#FF6B35]" />
        ) : (
          <Wallet className="h-6 w-6 text-[#FF6B35]" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-white text-sm">{method.name}</h4>
        <p className="text-gray-400 text-xs mt-1">
          {method.type === 'bank' ? `•••• ${method.last4}` : method.address.slice(0, 16) + '...'}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {method.primary && (
        <span className="bg-[#FF6B35] text-white px-2 py-1 rounded text-xs">
          Primary
        </span>
      )}
      <button className="p-2 text-gray-400 hover:text-[#FF6B35] transition-colors">
        <Minus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default WalletComponent;