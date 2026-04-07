import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { appendLocalCustomers, readLocalCustomers } from '../utils/localCustomerStore';

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

interface AddCustomerProps {
  onCustomerAdded: () => void;
  isDarkMode?: boolean;
}

export default function AddCustomer({ onCustomerAdded, isDarkMode = false }: AddCustomerProps) {
  const demoUserId = 'public-demo';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    upi_id: '',
    outstanding_amount: '',
    days_overdue: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const calculateRiskScore = (amount: number, daysOverdue: number): number => {
    let score = 0;

    if (daysOverdue > 90) score += 40;
    else if (daysOverdue > 60) score += 30;
    else if (daysOverdue > 30) score += 20;
    else if (daysOverdue > 0) score += 10;

    if (amount > 10000) score += 30;
    else if (amount > 5000) score += 20;
    else if (amount > 1000) score += 10;

    score += Math.min(30, Math.floor(Math.random() * 30));

    return Math.min(100, score);
  };

  const isConnectivityError = (error: any): boolean => {
    const message = (error?.message || '').toLowerCase();
    const details = (error?.details || '').toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('name_not_resolved') ||
      details.includes('failed to fetch')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }

      const name = formData.name.trim();
      const email = formData.email.trim() || null;
      const phone = formData.phone.trim() || null;
      const upiId = formData.upi_id.trim() || null;
      const localCustomers = readLocalCustomers();

      // Check for duplicate email
      if (email) {
        try {
          const { data: existingEmail, error: existingEmailError } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .limit(1);

          if (existingEmailError) throw existingEmailError;

          if (existingEmail && existingEmail.length > 0) {
            throw new Error('A customer with this email already exists');
          }
        } catch (emailError: any) {
          if (!isConnectivityError(emailError)) throw emailError;

          const existsLocally = localCustomers.some(
            customer => customer.email?.toLowerCase() === email.toLowerCase()
          );

          if (existsLocally) {
            throw new Error('A customer with this email already exists');
          }
        }
      }

      // Check for duplicate UPI ID
      if (upiId) {
        try {
          const { data: existingUPI, error: existingUPIError } = await supabase
            .from('customers')
            .select('id')
            .eq('upi_id', upiId)
            .limit(1);

          if (existingUPIError) throw existingUPIError;

          if (existingUPI && existingUPI.length > 0) {
            throw new Error('A customer with this UPI ID already exists');
          }
        } catch (upiError: any) {
          if (!isConnectivityError(upiError)) throw upiError;

          const existsLocally = localCustomers.some(
            customer => customer.upi_id?.toLowerCase() === upiId.toLowerCase()
          );

          if (existsLocally) {
            throw new Error('A customer with this UPI ID already exists');
          }
        }
      }

      const outstanding = parseFloat(formData.outstanding_amount) || 0;
      const daysOverdue = parseInt(formData.days_overdue) || 0;

      const riskScore = calculateRiskScore(outstanding, daysOverdue);

      let savedInLocalMode = false;

      try {
        const { error: insertError } = await supabase.from('customers').insert({
          user_id: demoUserId,
          name,
          email,
          phone,
          upi_id: upiId,
          outstanding_amount: outstanding,
          days_overdue: daysOverdue,
          risk_score: riskScore,
          status: riskScore >= 70 ? 'high_risk' : riskScore >= 40 ? 'moderate_risk' : 'low_risk',
        });

        if (insertError) throw insertError;
      } catch (insertError: any) {
        if (!isConnectivityError(insertError)) {
          throw insertError;
        }

        appendLocalCustomers([
          {
            user_id: demoUserId,
            name,
            email,
            phone,
            upi_id: upiId,
            outstanding_amount: outstanding,
            days_overdue: daysOverdue,
            risk_score: riskScore,
            status: riskScore >= 70 ? 'high_risk' : riskScore >= 40 ? 'moderate_risk' : 'low_risk',
          },
        ]);
        savedInLocalMode = true;
      }

      setSuccess(
        savedInLocalMode
          ? 'Customer added in local demo mode. Supabase is currently unreachable.'
          : 'Customer added successfully!'
      );
      setFormData({
        name: '',
        email: '',
        phone: '',
        upi_id: '',
        outstanding_amount: '',
        days_overdue: '',
      });

      setTimeout(() => {
        onCustomerAdded();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      upi_id: '',
      outstanding_amount: '',
      days_overdue: '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.primary }} />
          <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
            Add New Customer
          </h2>
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS.primary }} />
        </div>
        <p style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
          Manually add a new customer to the system
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}05, ${COLORS.secondary}05)`,
            borderColor: `${COLORS.primary}20`,
          }}
        >
          <div className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="Enter customer name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="customer@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="+91 1234567890"
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                UPI ID <span className="text-xs font-normal" style={{ color: COLORS.secondary }}>(Optional - for automatic payment tracking)</span>
              </label>
              <input
                type="text"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="customer@paytm or customer@ybl"
              />
              <p className="text-xs mt-1" style={{ color: COLORS.secondary }}>
                Examples: username@paytm, username@ybl, username@oksbi
              </p>
            </div>

            {/* Outstanding Amount */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                Outstanding Amount (₹)
              </label>
              <input
                type="number"
                name="outstanding_amount"
                value={formData.outstanding_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="0.00"
              />
            </div>

            {/* Days Overdue */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>
                Days Overdue
              </label>
              <input
                type="number"
                name="days_overdue"
                value={formData.days_overdue}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: `${COLORS.primary}30`,
                  backgroundColor: 'white',
                }}
                placeholder="0"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mt-4 flex items-center space-x-2 rounded-xl p-4 border"
              style={{
                backgroundColor: `${COLORS.danger}10`,
                borderColor: `${COLORS.danger}20`,
                color: COLORS.danger,
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              className="mt-4 flex items-center space-x-2 rounded-xl p-4 border"
              style={{
                backgroundColor: `${COLORS.success}10`,
                borderColor: `${COLORS.success}20`,
                color: COLORS.success,
              }}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                boxShadow: `0 8px 32px ${COLORS.primary}40`,
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Customer...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Add Customer</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{
                backgroundColor: `${COLORS.secondary}15`,
                border: `1px solid ${COLORS.secondary}30`,
                color: COLORS.secondary,
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}10)`,
          borderColor: `${COLORS.primary}20`,
        }}
      >
        <div className="flex items-start space-x-3">
          <UserPlus className="w-5 h-5 mt-0.5" style={{ color: COLORS.primary }} />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>Manual Entry Guidelines:</h3>
            <ul className="text-sm space-y-2" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
              <li>• Customer name is required, all other fields are optional</li>
              <li>• Risk score will be calculated automatically based on outstanding amount and days overdue</li>
              <li>• Email and phone number can be added later if not available</li>
              <li>• This form follows the same schema as CSV uploads for consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
