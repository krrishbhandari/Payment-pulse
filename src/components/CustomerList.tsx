import { useState } from 'react';
import { Customer, supabase } from '../lib/supabase';
import {
  Search,
  Brain,
  TrendingUp,
  Download,
  Phone,
  Mail,
  Calendar,
  Loader,
  Target,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';
import CustomerAnalysis from './CustomerAnalysis';
import { generateCustomerPDF } from '../utils/pdfGenerator';
import { generateMockTransactions, Transaction } from '../utils/transactionUtils';
import { getRiskCategory, calculateAdvancedRiskScore } from '../utils/riskScoreCalculator';

const COLORS = {
  primary: '#1b4079',
  secondary: '#4d7c8a',
  accent1: '#7f9c96',
  accent2: '#8fad88',
  accent3: '#cbdf90',
  dark: '#0a1931',
  light: '#f8f9fa',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => void;
  isDarkMode?: boolean;
}

export default function CustomerList({ customers, loading, onRefresh, isDarkMode = false }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactionsCache, setTransactionsCache] = useState<Record<string, Transaction[]>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Bulk Selection State
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());



  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCustomers.size} customers?`)) return;

    setDeleting(true);
    try {
      const allIds = Array.from(selectedCustomers);
      const batchSize = 20; // Supabase/URL limit safety

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize);
        console.log(`Deleting batch ${i / batchSize + 1} of ${Math.ceil(allIds.length / batchSize)}`);

        const { error } = await supabase
          .from('customers')
          .delete()
          .in('id', batch);

        if (error) throw error;
      }

      setSelectedCustomers(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Failed to delete some customers. Please check console.');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Select by Filter
  const handleSelectByFilter = (criteria: string) => {
    let toSelect: string[] = [];

    switch (criteria) {
      case 'all':
        toSelect = filteredCustomers.map((c: any) => c.id);
        break;
      case 'none':
        toSelect = [];
        break;
      case 'high_risk':
        toSelect = filteredCustomers.filter((c: any) => getRiskCategory(c.calculatedScore).category === 'high_risk').map((c: any) => c.id);
        break;
      case 'moderate_risk':
        toSelect = filteredCustomers.filter((c: any) => getRiskCategory(c.calculatedScore).category === 'moderate_risk').map((c: any) => c.id);
        break;
      case 'low_risk':
        toSelect = filteredCustomers.filter((c: any) => getRiskCategory(c.calculatedScore).category === 'low_risk').map((c: any) => c.id);
        break;
    }

    setSelectedCustomers(new Set(toSelect));
  };

  type CustomerWithScore = Customer & { calculatedScore: number };

  const filteredCustomers = (customers as Customer[])
    .map((c) => ({
      ...c,
      calculatedScore: calculateAdvancedRiskScore({ daysOverdue: c.days_overdue, outstandingAmount: Number(c.outstanding_amount), isFirstDefault: true }),
    }) as CustomerWithScore)
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm);

      const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const getRiskColor = (score: number) => {
    return getRiskCategory(Math.round(score)).color;
  };

  const getRiskLabel = (score: number) => {
    const category = getRiskCategory(score).category;
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAnalyzeCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAnalysis(true);
    setShowTransactions(false);
    setShowEditModal(false);
  };

  const handleViewTransactions = (customer: Customer) => {
  let tx = transactionsCache[customer.id];

  if (!tx) {
    tx = generateMockTransactions(customer);
    setTransactionsCache(prev => ({ ...prev, [customer.id]: tx }));
  }

  setSelectedCustomer(customer);
  setShowTransactions(true);
  setShowAnalysis(false);
  setShowEditModal(false);
};

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      outstanding_amount: customer.outstanding_amount,
      days_overdue: customer.days_overdue,
    });
    setShowEditModal(true);
    setShowAnalysis(false);
    setShowTransactions(false);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editFormData.name,
          email: editFormData.email || null,
          phone: editFormData.phone || null,
          outstanding_amount: editFormData.outstanding_amount,
          days_overdue: editFormData.days_overdue,
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedCustomer(null);
      setEditFormData({});
      onRefresh();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // use shared generator from utils to keep UI and PDF consistent

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 animate-spin mb-4" style={{ color: COLORS.primary }} />
        <p className="font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: COLORS.secondary }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-300"
            style={{
              backgroundColor: `${COLORS.primary}10`,
              border: `1px solid ${COLORS.primary}20`,
              color: isDarkMode ? '#e6eef8' : COLORS.dark,
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-6 py-3 rounded-xl focus:outline-none transition-all duration-300"
          style={{
            backgroundColor: `${COLORS.primary}10`,
            border: `1px solid ${COLORS.primary}20`,
            color: isDarkMode ? '#e6eef8' : COLORS.dark,
          }}
        >
          <option value="all">All Status</option>
          <option value="high_risk">High Risk</option>
          <option value="moderate_risk">Moderate Risk</option>
          <option value="low_risk">Low Risk</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center justify-between px-2 bg-opacity-50 rounded-lg p-2"
        style={{ backgroundColor: selectedCustomers.size > 0 ? `${COLORS.primary}10` : 'transparent' }}>
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => {
              handleSelectByFilter(e.target.value);
              e.target.value = 'none'; // Reset dropdown
            }}
            className="px-3 py-1.5 rounded-lg text-sm border focus:outline-none cursor-pointer hover:bg-gray-50 bg-white"
            style={{ borderColor: `${COLORS.primary}40`, color: COLORS.secondary }}
            defaultValue="none"
          >
            <option value="none" disabled>Select Options</option>
            <option value="all">All</option>
            <option value="none">None</option>
            <option value="high_risk">High Risk</option>
            <option value="moderate_risk">Moderate Risk</option>
            <option value="low_risk">Low Risk</option>
          </select>
          <span className="text-sm font-medium" style={{ color: COLORS.secondary }}>
            {selectedCustomers.size > 0 ? `${selectedCustomers.size} selected` : ''}
          </span>
        </div>


        {selectedCustomers.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: COLORS.danger, color: 'white' }}
          >
            {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Selected
          </button>
        )}
      </div>

      {/* Customer Cards */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl border"
            style={{
              backgroundColor: `${COLORS.primary}5`,
              borderColor: `${COLORS.primary}20`,
            }}
          >
            <p style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>No customers found. Upload a CSV file to get started.</p>
          </div>
        ) : (
          filteredCustomers.map((customer: any) => {
            const displayScore = Math.round(customer.calculatedScore);
            return (
              <div key={customer.id}>
                <div
                  className="rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    backgroundColor: selectedCustomers.has(customer.id)
                      ? (isDarkMode ? `${COLORS.primary}25` : `${COLORS.primary}10`)
                      : (isDarkMode ? `${COLORS.primary}12` : 'white'),
                    borderColor: selectedCustomers.has(customer.id)
                      ? COLORS.primary
                      : `${COLORS.accent1}30`,
                    boxShadow: `0 4px 20px ${COLORS.primary}10`,
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">


                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-1" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                            {customer.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
                            {customer.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-semibold border"
                          style={{
                            backgroundColor: `${getRiskColor(displayScore)}20`,
                            borderColor: `${getRiskColor(displayScore)}30`,
                            color: getRiskColor(displayScore),
                          }}
                        >
                          {getRiskLabel(displayScore)} ({displayScore})
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div
                          className="flex items-center space-x-2 p-3 rounded-lg"
                          style={{ backgroundColor: `${COLORS.accent2}10` }}
                        >
                          <Target className="w-4 h-4" style={{ color: COLORS.accent2 }} />
                          <div>
                            <p className="text-xs" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Outstanding</p>
                            <p className="font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                              ₹{Number(customer.outstanding_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex items-center space-x-2 p-3 rounded-lg"
                          style={{ backgroundColor: `${COLORS.accent3}10` }}
                        >
                          <Calendar className="w-4 h-4" style={{ color: COLORS.accent3 }} />
                          <div>
                            <p className="text-xs" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Days Overdue</p>
                            <p className="font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                              {customer.days_overdue}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex items-center space-x-2 p-3 rounded-lg"
                          style={{ backgroundColor: `${COLORS.secondary}10` }}
                        >
                          <TrendingUp className="w-4 h-4" style={{ color: COLORS.secondary }} />
                          <div>
                            <p className="text-xs" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Status</p>
                            <p className="font-semibold capitalize" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                              {getRiskLabel(displayScore)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAnalyzeCustomer(customer)}
                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 whitespace-nowrap"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                          color: 'white',
                          boxShadow: `0 4px 20px ${COLORS.primary}40`,
                        }}
                      >
                        <Brain className="w-5 h-5" />
                        <span>AI Analysis</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTransactions(customer)}
                          className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-1"
                          style={{
                            backgroundColor: `${COLORS.primary}15`,
                            border: `1px solid ${COLORS.primary}30`,
                            color: COLORS.primary,
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Transactions</span>
                        </button>

                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: `${COLORS.accent2}15`,
                            border: `1px solid ${COLORS.accent2}30`,
                            color: COLORS.accent2,
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                           let tx = transactionsCache[customer.id];

if (!tx) {
  tx = generateMockTransactions(customer);
  setTransactionsCache(prev => ({ ...prev, [customer.id]: tx }));
}

generateCustomerPDF(customer, tx);

                          }}
                          title={`Export ${customer.name} report`}
                          className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: `${COLORS.primary}10`,
                            border: `1px solid ${COLORS.primary}20`,
                            color: COLORS.primary,
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: `${COLORS.danger}15`,
                            border: `1px solid ${COLORS.danger}30`,
                            color: COLORS.danger,
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {showAnalysis && selectedCustomer?.id === customer.id && (
                    <div className="mt-4">
                      <CustomerAnalysis
                        customer={selectedCustomer as Customer}
                        onClose={() => {
                          setShowAnalysis(false);
                          setSelectedCustomer(null);
                          onRefresh();
                        }}
                        inline
                      />
                    </div>
                  )}

                  {showTransactions && selectedCustomer?.id === customer.id && (
                    <div className="mt-4">
                      <div
                        className="rounded-xl p-6 border"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}10)`,
                          borderColor: `${COLORS.primary}20`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                            Last 3 Transactions
                          </h3>
                          <button
                            onClick={() => setShowTransactions(false)}
                            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                            style={{ color: COLORS.secondary }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(transactionsCache[customer.id] || []).map((transaction, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg"
                              style={{
                                backgroundColor: 'white',
                                border: `1px solid ${COLORS.primary}10`,
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor:
                                      transaction.status === 'Paid'
                                        ? `${COLORS.success}15`
                                        : `${COLORS.warning}15`,
                                    border: `1px solid ${transaction.status === 'Paid'
                                      ? `${COLORS.success}30`
                                      : `${COLORS.warning}30`
                                      }`,
                                  }}
                                >
                                  <Calendar className="w-4 h-4" style={{
                                    color: transaction.status === 'Paid' ? COLORS.success : COLORS.warning
                                  }} />
                                </div>
                                <div>
                                  <p className="font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                                    ₹{transaction.amount.toLocaleString()}
                                  </p>
                                  <p className="text-xs" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
                                    {transaction.date}
                                  </p>
                                </div>
                              </div>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor:
                                    transaction.status === 'Paid'
                                      ? `${COLORS.success}20`
                                      : `${COLORS.warning}20`,
                                  color: transaction.status === 'Paid' ? COLORS.success : COLORS.warning,
                                  border: `1px solid ${transaction.status === 'Paid'
                                    ? `${COLORS.success}30`
                                    : `${COLORS.warning}30`
                                    }`,
                                }}
                              >
                                {transaction.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {
        showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-2xl max-w-2xl w-full p-6"
              style={{
                backgroundColor: isDarkMode ? COLORS.dark : 'white',
                border: `1px solid ${COLORS.primary}20`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                  Edit Customer
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" style={{ color: COLORS.secondary }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                    style={{
                      borderColor: `${COLORS.primary}30`,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                    style={{
                      borderColor: `${COLORS.primary}30`,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                    style={{
                      borderColor: `${COLORS.primary}30`,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                    Outstanding Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.outstanding_amount || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, outstanding_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                    style={{
                      borderColor: `${COLORS.primary}30`,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                    Days Overdue
                  </label>
                  <input
                    type="number"
                    value={editFormData.days_overdue || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, days_overdue: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none"
                    style={{
                      borderColor: `${COLORS.primary}30`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleUpdateCustomer}
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    color: 'white',
                  }}
                >
                  {updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Customer</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: `${COLORS.secondary}15`,
                    border: `1px solid ${COLORS.secondary}30`,
                    color: COLORS.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        showDeleteConfirm && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6"
              style={{
                backgroundColor: isDarkMode ? COLORS.dark : 'white',
                border: `1px solid ${COLORS.danger}20`,
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${COLORS.danger}15`,
                    border: `1px solid ${COLORS.danger}30`,
                  }}
                >
                  <AlertCircle className="w-6 h-6" style={{ color: COLORS.danger }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                  Confirm Deletion
                </h2>
              </div>

              <p className="mb-6" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
                Are you sure you want to delete <strong>{selectedCustomer.name}</strong>? This action cannot be undone. The customer will be removed from the dashboard, analytics, and all reports.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: COLORS.danger,
                    color: 'white',
                  }}
                >
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Customer</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: `${COLORS.secondary}15`,
                    border: `1px solid ${COLORS.secondary}30`,
                    color: COLORS.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
