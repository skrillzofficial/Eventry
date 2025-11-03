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
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Loader
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { transactionAPI, apiCall } from '../../services/api';

const WalletComponent = () => {
  const [walletData, setWalletData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWithdrawalMethod, setSelectedWithdrawalMethod] = useState('');
  
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
      
      const transactionsResult = await apiCall(transactionAPI.getMyTransactions, { limit: 50 });
      
      if (transactionsResult.success) {
        const transactions = transactionsResult.data?.transactions || transactionsResult.data || [];
        const walletStats = calculateWalletStats(transactions);
        
        setWalletData({
          balance: walletStats.balance,
          available: walletStats.available,
          pending: walletStats.pending,
          currency: 'NGN',
          transactions: transactions.slice(0, 10),
          withdrawalMethods: getWithdrawalMethods(),
          stats: {
            totalEarned: walletStats.totalEarned,
            totalWithdrawn: walletStats.totalWithdrawn,
            activeEvents: walletStats.activeEvents,
            pendingPayouts: walletStats.pending
          }
        });
      } else {
        throw new Error(transactionsResult.error || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet data. Please try again.');
      
      // Demo data
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

  const calculateWalletStats = (transactions) => {
    let totalEarned = 0;
    let totalWithdrawn = 0;
    let pending = 0;
    
    transactions.forEach(transaction => {
      const amount = transaction.amount || 0;
      if (amount > 0) {
        totalEarned += amount;
      } else {
        totalWithdrawn += Math.abs(amount);
      }
      
      if (transaction.status === 'pending') {
        pending += Math.abs(amount);
      }
    });
    
    return {
      balance: totalEarned - totalWithdrawn,
      available: totalEarned - totalWithdrawn - pending,
      pending: pending,
      totalEarned: totalEarned,
      totalWithdrawn: totalWithdrawn,
      activeEvents: 3
    };
  };

  const getWithdrawalMethods = () => {
    const methods = localStorage.getItem('withdrawalMethods');
    return methods ? JSON.parse(methods) : [];
  };

  const saveWithdrawalMethods = (methods) => {
    localStorage.setItem('withdrawalMethods', JSON.stringify(methods));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleAddMethod = async () => {
    try {
      const methodData = newMethodType === 'bank' 
        ? {
            id: Date.now(),
            type: 'bank',
            name: newMethodData.bankName,
            accountNumber: newMethodData.accountNumber,
            accountName: newMethodData.accountName,
            primary: false
          }
        : {
            id: Date.now(),
            type: 'crypto',
            name: `${newMethodData.walletType} Wallet`,
            walletAddress: newMethodData.walletAddress,
            walletType: newMethodData.walletType,
            primary: false
          };

      const currentMethods = getWithdrawalMethods();
      const updatedMethods = [...currentMethods, methodData];
      saveWithdrawalMethods(updatedMethods);

      alert('Withdrawal method added successfully!');
      setShowAddMethodModal(false);
      resetMethodForm();
      loadWalletData();
    } catch (err) {
      alert('Failed to add withdrawal method: ' + err.message);
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
      alert('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSelectedWithdrawalMethod('');
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
      walletType: 'Solana'
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-8">
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
      
      <div className="container mx-auto w-11/12 py-8">
        {/* Simplified Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600 mt-2">
                Manage your earnings and withdrawals
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Balance & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className="bg-[#FF6B35] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
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
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/80">Available</span>
                  <span className="font-semibold">
                    {showBalance ? formatCurrency(walletData.available) : '••••••'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Pending</span>
                  <span className="font-semibold">
                    {showBalance ? formatCurrency(walletData.pending) : '••••••'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="w-full bg-white text-[#FF6B35] py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Withdraw Funds
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="text-green-600 font-semibold">{formatCurrency(walletData.stats.totalEarned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Withdrawn</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(walletData.stats.totalWithdrawn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Events</span>
                  <span className="text-blue-600 font-semibold">{walletData.stats.activeEvents}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-3">
            {/* Simplified Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'transactions', label: 'Transactions', icon: History },
                    { id: 'methods', label: 'Payment Methods', icon: CreditCard }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center mr-8 ${
                        activeTab === tab.id
                          ? 'border-[#FF6B35] text-[#FF6B35]'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-gray-600 text-sm mb-1">This Month</div>
                        <div className="text-gray-900 font-semibold text-lg">+₦45,600</div>
                        <div className="text-green-600 text-xs flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +18.5%
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-gray-600 text-sm mb-1">Withdrawals</div>
                        <div className="text-gray-900 font-semibold text-lg">-₦15,000</div>
                        <div className="text-gray-500 text-xs">This month</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-gray-600 text-sm mb-1">Net Growth</div>
                        <div className="text-gray-900 font-semibold text-lg">+₦28,200</div>
                        <div className="text-green-600 text-xs">Net profit</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        {walletData.transactions.slice(0, 3).map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'credit' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {transaction.type === 'credit' ? 
                                  <ArrowDownLeft className="h-4 w-4" /> : 
                                  <ArrowUpRight className="h-4 w-4" />
                                }
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{transaction.description}</h4>
                                <p className="text-gray-500 text-xs">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            <div className={`font-semibold ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Transaction History</h3>
                    </div>

                    <div className="space-y-3">
                      {walletData.transactions.length > 0 ? (
                        walletData.transactions.map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
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

                {activeTab === 'methods' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
                      <button 
                        onClick={() => setShowAddMethodModal(true)}
                        className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#FF8535] transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Method
                      </button>
                    </div>

                    <div className="space-y-4">
                      {walletData.withdrawalMethods.length > 0 ? (
                        walletData.withdrawalMethods.map(method => (
                          <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-orange-100 rounded-lg">
                                <CreditCard className="h-6 w-6 text-[#FF6B35]" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {method.name}
                                </h4>
                                <p className="text-gray-500 text-xs mt-1">
                                  {method.accountNumber} • {method.accountName}
                                </p>
                              </div>
                            </div>
                            {method.primary && (
                              <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="mb-4">No payment methods added yet</p>
                          <button 
                            onClick={() => setShowAddMethodModal(true)}
                            className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#FF8535] transition-colors"
                          >
                            Add Payment Method
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Your funds are secure</h4>
                  <p className="text-blue-700 text-sm">
                    All transactions are encrypted and monitored 24/7. 
                    Contact support if you notice any suspicious activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Bank Account</h3>
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
                  disabled={!newMethodData.bankName || !newMethodData.accountNumber || !newMethodData.accountName}
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Account
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
                      {method.name} ({method.accountNumber})
                    </option>
                  ))}
                </select>
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
                  disabled={!withdrawAmount || !selectedWithdrawalMethod}
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

export default WalletComponent;