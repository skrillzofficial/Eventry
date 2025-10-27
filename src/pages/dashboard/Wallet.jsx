import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  CreditCard, 
  History,
  Shield,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Loader,
  Edit,
  Trash2
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { walletAPI, apiCall } from '../../services/api';

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWithdrawalMethod, setSelectedWithdrawalMethod] = useState('');
  
  // New method form state
  const [newMethodType, setNewMethodType] = useState('bank');
  const [newMethodData, setNewMethodData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    walletAddress: '',
    walletType: 'Solana'
  });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all wallet data from backend
      const [balanceResult, transactionsResult, withdrawalMethodsResult, statsResult] = await Promise.all([
        apiCall(walletAPI.getWalletBalance),
        apiCall(walletAPI.getTransactions, { limit: 10, page: 1 }),
        apiCall(walletAPI.getPaymentMethods),
        apiCall(walletAPI.getWalletStats)
      ]);
      
      setWalletData({
        balance: balanceResult.data.balance || 0,
        available: balanceResult.data.available || 0,
        pending: balanceResult.data.pending || 0,
        currency: balanceResult.data.currency || 'NGN',
        transactions: transactionsResult.data.transactions || [],
        withdrawalMethods: withdrawalMethodsResult.data.methods || [],
        stats: {
          totalEarned: statsResult.data.totalEarned || 0,
          totalWithdrawn: statsResult.data.totalWithdrawn || 0,
          activeEvents: statsResult.data.activeEvents || 0,
          pendingPayouts: statsResult.data.pendingPayouts || 0
        }
      });
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet data. Please try again.');
      
      // Fallback to demo data if backend fails
      setWalletData({
        balance: 125600.50,
        available: 115200.75,
        pending: 10399.75,
        currency: 'NGN',
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
          }
        ],
        withdrawalMethods: [
          {
            id: 1,
            type: 'bank',
            name: 'Guaranty Trust Bank',
            accountNumber: '****1234',
            accountName: 'John Doe',
            primary: true
          },
          {
            id: 2,
            type: 'crypto',
            name: 'Solana Wallet',
            walletAddress: '0x742d...8D',
            walletType: 'Solana',
            primary: false
          }
        ],
        stats: {
          totalEarned: 856000,
          totalWithdrawn: 730400,
          activeEvents: 3,
          pendingPayouts: 10399.75
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleTabChange = async (tabId) => {
    setTabLoading(true);
    setActiveTab(tabId);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTabLoading(false);
  };

  const handleAddMethod = async () => {
    try {
      const methodData = newMethodType === 'bank' 
        ? {
            type: 'bank',
            bankName: newMethodData.bankName,
            accountNumber: newMethodData.accountNumber,
            accountName: newMethodData.accountName
          }
        : {
            type: 'crypto',
            walletAddress: newMethodData.walletAddress,
            walletType: newMethodData.walletType
          };

      const result = await apiCall(walletAPI.addPaymentMethod, methodData);

      if (result.success) {
        alert('Withdrawal method added successfully!');
        setShowAddMethodModal(false);
        resetMethodForm();
        loadWalletData();
      }
    } catch (err) {
      alert('Failed to add withdrawal method: ' + err.message);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm('Are you sure you want to delete this withdrawal method?')) {
      return;
    }

    try {
      const result = await apiCall(walletAPI.deletePaymentMethod, methodId);
      
      if (result.success) {
        alert('Withdrawal method deleted successfully!');
        loadWalletData();
      }
    } catch (err) {
      alert('Failed to delete withdrawal method: ' + err.message);
    }
  };

  const handleSetPrimary = async (methodId) => {
    try {
      const result = await apiCall(walletAPI.setPrimaryPaymentMethod, methodId);
      
      if (result.success) {
        alert('Primary withdrawal method updated!');
        loadWalletData();
      }
    } catch (err) {
      alert('Failed to update primary method: ' + err.message);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || !selectedWithdrawalMethod) {
      alert('Please enter amount and select withdrawal method');
      return;
    }

    if (parseFloat(withdrawAmount) > walletData.available) {
      alert('Insufficient available balance');
      return;
    }

    try {
      const result = await apiCall(walletAPI.requestWithdrawal, {
        amount: parseFloat(withdrawAmount),
        paymentMethodId: selectedWithdrawalMethod
      });

      if (result.success) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setSelectedWithdrawalMethod('');
        loadWalletData();
      }
    } catch (err) {
      alert('Withdrawal failed: ' + err.message);
    }
  };

  const resetMethodForm = () => {
    setNewMethodType('bank');
    setNewMethodData({
      bankName: '',
      accountNumber: '',
      accountName: '',
      walletAddress: '',
      walletType: 'ethereum'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(Math.abs(amount));
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

  const maskWalletAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Secure</span>
                </div>
              </div>
              <p className="text-gray-600">
                Manage your earnings, withdrawals, and payment methods
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Connection Issue</p>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-yellow-600 hover:text-yellow-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-2xl p-6 text-white shadow-lg">
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

              <div className="flex">
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 bg-white text-[#FF6B35] py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'transactions', label: 'Transactions', icon: History },
                    { id: 'withdrawal-methods', label: 'Withdrawal Methods', icon: CreditCard }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      disabled={tabLoading}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center disabled:opacity-50 ${
                        activeTab === tab.id
                          ? 'border-[#FF6B35] text-[#FF6B35] scale-105'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:scale-102'
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
                {tabLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-[#FF6B35]" />
                  </div>
                ) : (
                  <>
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Overview</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      </div>
                    )}

                    {activeTab === 'transactions' && (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
                          <div className="flex space-x-2">
                            <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
                              <option>All Transactions</option>
                              <option>Credits Only</option>
                              <option>Debits Only</option>
                              <option>Pending</option>
                            </select>
                            <input
                              type="date"
                              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                              placeholder="Filter by date"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          {walletData.transactions && walletData.transactions.length > 0 ? (
                            walletData.transactions.map(transaction => (
                              <TransactionItem key={transaction.id} transaction={transaction} formatCurrency={formatCurrency} formatDate={formatDate} />
                            ))
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p>No transactions yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'withdrawal-methods' && (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Withdrawal Methods</h3>
                          <button 
                            onClick={() => setShowAddMethodModal(true)}
                            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#FF8535] transition-all duration-200 hover:scale-105 flex items-center"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Method
                          </button>
                        </div>

                        <div className="space-y-4">
                          {walletData.withdrawalMethods && walletData.withdrawalMethods.length > 0 ? (
                            walletData.withdrawalMethods.map(method => (
                              <WithdrawalMethodCard 
                                key={method.id} 
                                method={method}
                                maskWalletAddress={maskWalletAddress}
                                onDelete={handleDeleteMethod}
                                onSetPrimary={handleSetPrimary}
                              />
                            ))
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <p className="mb-4">No withdrawal methods added yet</p>
                              <button 
                                onClick={() => setShowAddMethodModal(true)}
                                className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#FF8535] transition-colors"
                              >
                                Add Withdrawal Method
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-blue-800 mb-1">Security & Privacy</h4>
                              <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Your withdrawal methods are encrypted end-to-end</li>
                                <li>• Bank details are never fully displayed for security</li>
                                <li>• Crypto wallet addresses are stored securely</li>
                                <li>• All withdrawals require verification</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Earnings</span>
                  <span className="text-green-600 font-semibold">+₦45,600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Withdrawals</span>
                  <span className="text-red-600 font-semibold">-₦15,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fees</span>
                  <span className="text-gray-500">-₦2,400</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">Net</span>
                    <span className="text-gray-900 font-semibold">+₦28,200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-[#FF6B35] mr-2" />
                Security Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Never share your withdrawal method details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Enable 2FA for additional security</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Verify payment addresses before confirming</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">Monitor your transaction history regularly</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-white/80 text-sm mb-4">
                Our support team is here to help with any wallet issues.
              </p>
              <Link 
                to="/contact"
                className="block w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 text-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Withdrawal Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Withdrawal Method</h3>
              <button
                onClick={() => {
                  setShowAddMethodModal(false);
                  resetMethodForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Method Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Method Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewMethodType('bank')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      newMethodType === 'bank'
                        ? 'border-[#FF6B35] bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-2 text-[#FF6B35]" />
                    <span className="font-medium text-sm">Bank Account</span>
                  </button>
                  <button
                    onClick={() => setNewMethodType('crypto')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      newMethodType === 'crypto'
                        ? 'border-[#FF6B35] bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Wallet className="h-6 w-6 mb-2 text-[#FF6B35]" />
                    <span className="font-medium text-sm">Crypto Wallet</span>
                  </button>
                </div>
              </div>

              {/* Bank Account Form */}
              {newMethodType === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <select
                      value={newMethodData.bankName}
                      onChange={(e) => setNewMethodData({...newMethodData, bankName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option value="">Select your bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="GTBank">Guaranty Trust Bank</option>
                      <option value="First Bank">First Bank of Nigeria</option>
                      <option value="UBA">United Bank for Africa</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Ecobank">Ecobank Nigeria</option>
                      <option value="Fidelity Bank">Fidelity Bank</option>
                      <option value="FCMB">First City Monument Bank</option>
                      <option value="Sterling Bank">Sterling Bank</option>
                      <option value="Wema Bank">Wema Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={newMethodData.accountNumber}
                      onChange={(e) => setNewMethodData({...newMethodData, accountNumber: e.target.value})}
                      placeholder="Enter 10-digit account number"
                      maxLength="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={newMethodData.accountName}
                      onChange={(e) => setNewMethodData({...newMethodData, accountName: e.target.value})}
                      placeholder="Account holder's name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>
                </>
              )}

              {/* Crypto Wallet Form */}
              {newMethodType === 'crypto' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Type
                    </label>
                    <select
                      value={newMethodData.walletType}
                      onChange={(e) => setNewMethodData({...newMethodData, walletType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option value="ethereum">Ethereum (ETH)</option>
                      <option value="bitcoin">Bitcoin (BTC)</option>
                      <option value="usdt">Tether (USDT)</option>
                      <option value="usdc">USD Coin (USDC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={newMethodData.walletAddress}
                      onChange={(e) => setNewMethodData({...newMethodData, walletAddress: e.target.value})}
                      placeholder="Enter your wallet address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Double-check your wallet address. Funds sent to wrong address cannot be recovered.
                    </p>
                  </div>
                </>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">Important Security Notice</h4>
                    <p className="text-amber-700 text-sm">
                      {newMethodType === 'bank' 
                        ? 'Ensure your bank details are correct. Your account will be verified before first withdrawal.'
                        : 'Crypto transactions are irreversible. Always verify your wallet address is correct.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddMethodModal(false);
                    resetMethodForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMethod}
                  disabled={
                    newMethodType === 'bank' 
                      ? !newMethodData.bankName || !newMethodData.accountNumber || !newMethodData.accountName
                      : !newMethodData.walletAddress
                  }
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (NGN)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {formatCurrency(walletData.available)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Method
                </label>
                <select
                  value={selectedWithdrawalMethod}
                  onChange={(e) => setSelectedWithdrawalMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                  <option value="">Select withdrawal method</option>
                  {walletData.withdrawalMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.type === 'bank' 
                        ? `${method.name} (${method.accountNumber})`
                        : `${method.name} (${maskWalletAddress(method.walletAddress)})`}
                    </option>
                  ))}
                </select>
                {walletData.withdrawalMethods.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Please add a withdrawal method first
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">Processing Time</h4>
                    <p className="text-blue-700 text-sm">
                      Bank withdrawals: 1-3 business days<br/>
                      Crypto withdrawals: 10-30 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={walletData.withdrawalMethods.length === 0}
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, change, trend }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#FF6B35] transition-all duration-200 hover:scale-105">
    <div className="text-gray-600 text-sm mb-1">{title}</div>
    <div className="text-gray-900 font-semibold text-lg mb-2">{value}</div>
    <div className={`text-xs flex items-center ${
      trend === 'up' ? 'text-green-600' :
      trend === 'down' ? 'text-red-600' :
      'text-yellow-600'
    }`}>
      <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
      {change}
    </div>
  </div>
);

const TransactionItem = ({ transaction, formatCurrency, formatDate }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-all duration-200 hover:scale-102">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${
        transaction.type === 'credit' 
          ? 'bg-green-100 text-green-600' 
          : 'bg-red-100 text-red-600'
      }`}>
        {transaction.type === 'credit' ? 
          <ArrowDownLeft className="h-5 w-5" /> : 
          <ArrowUpRight className="h-5 w-5" />
        }
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{transaction.description}</h4>
        <p className="text-gray-500 text-xs mt-1">
          {formatDate(transaction.date)}
          {transaction.event && ` • ${transaction.event}`}
          {transaction.bank && ` • ${transaction.bank}`}
        </p>
      </div>
    </div>
    <div className="text-right">
      <div className={`font-semibold ${
        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
      </div>
      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
        transaction.status === 'completed' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {transaction.status}
      </div>
    </div>
  </div>
);

const WithdrawalMethodCard = ({ method, maskWalletAddress, onDelete, onSetPrimary }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-orange-100 rounded-lg">
        {method.type === 'bank' ? (
          <CreditCard className="h-6 w-6 text-[#FF6B35]" />
        ) : (
          <Wallet className="h-6 w-6 text-[#FF6B35]" />
        )}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">
          {method.type === 'bank' ? method.name : `${method.walletType?.toUpperCase() || 'Crypto'} Wallet`}
        </h4>
        <p className="text-gray-500 text-xs mt-1">
          {method.type === 'bank' 
            ? `${method.accountNumber} • ${method.accountName}` 
            : maskWalletAddress(method.walletAddress)}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {method.primary ? (
        <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-medium">
          Primary
        </span>
      ) : (
        <button 
          onClick={() => onSetPrimary(method.id)}
          className="text-xs text-gray-600 hover:text-[#FF6B35] px-3 py-1 border border-gray-300 rounded-full hover:border-[#FF6B35] transition-colors"
        >
          Set Primary
        </button>
      )}
      <button 
        onClick={() => onDelete(method.id)}
        disabled={method.primary}
        className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={method.primary ? "Cannot delete primary method" : "Delete method"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default WalletComponent;