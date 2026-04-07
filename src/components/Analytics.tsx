import { Customer } from '../lib/supabase';
import { sendEmailReminder } from '../utils/emailService';
import { TrendingUp, Users, AlertCircle, Calendar, BarChart3, Target } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface AnalyticsProps {
  customers: Customer[];
  isDarkMode?: boolean;
}

export default function Analytics({ customers, isDarkMode = false }: AnalyticsProps) {
  const highRiskCustomers = customers.filter((c) => c.risk_score >= 70);
  const moderateRiskCustomers = customers.filter((c) => c.risk_score >= 40 && c.risk_score < 70);
  const lowRiskCustomers = customers.filter((c) => c.risk_score < 40);

  const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.outstanding_amount), 0);
  const avgDaysOverdue =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + c.days_overdue, 0) / customers.length
      : 0;

  const riskDistribution = [
    { label: 'High Risk', count: highRiskCustomers.length, color: 'bg-red-500', percentage: (highRiskCustomers.length / customers.length) * 100 },
    { label: 'Moderate Risk', count: moderateRiskCustomers.length, color: 'bg-amber-500', percentage: (moderateRiskCustomers.length / customers.length) * 100 },
    { label: 'Low Risk', count: lowRiskCustomers.length, color: 'bg-emerald-500', percentage: (lowRiskCustomers.length / customers.length) * 100 },
  ];

  const overdueRanges = [
    { label: '0-30 days', count: customers.filter((c) => c.days_overdue <= 30).length },
    { label: '31-60 days', count: customers.filter((c) => c.days_overdue > 30 && c.days_overdue <= 60).length },
    { label: '61-90 days', count: customers.filter((c) => c.days_overdue > 60 && c.days_overdue <= 90).length },
    { label: '90+ days', count: customers.filter((c) => c.days_overdue > 90).length },
  ];

  const amountRanges = [
    { label: '₹0-₹1,000', count: customers.filter((c) => Number(c.outstanding_amount) <= 1000).length },
    { label: '₹1,001-₹5,000', count: customers.filter((c) => Number(c.outstanding_amount) > 1000 && Number(c.outstanding_amount) <= 5000).length },
    { label: '₹5,001-₹10,000', count: customers.filter((c) => Number(c.outstanding_amount) > 5000 && Number(c.outstanding_amount) <= 10000).length },
    { label: '₹10,000+', count: customers.filter((c) => Number(c.outstanding_amount) > 10000).length },
  ];

  const topCustomers = [...customers]
    .sort((a, b) => Number(b.outstanding_amount) - Number(a.outstanding_amount))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>Analytics Dashboard</h2>
        <p style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Comprehensive insights into your customer portfolio</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div
          className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}15)`,
            border: `1px solid ${COLORS.primary}30`,
            boxShadow: `0 8px 32px ${COLORS.primary}15`,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${COLORS.primary}20`,
                  border: `1px solid ${COLORS.primary}30`,
                }}
              >
                <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Total Portfolio</p>
                <p className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{customers.length}</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Active customer accounts</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${COLORS.success}10, ${COLORS.accent2}15)`,
            border: `1px solid ${COLORS.success}30`,
            boxShadow: `0 8px 32px ${COLORS.success}15`,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${COLORS.success}20`,
                  border: `1px solid ${COLORS.success}30`,
                }}
              >
                <Target className="w-6 h-6" style={{ color: COLORS.success }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Total Outstanding</p>
                <p className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>₹{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Across all accounts</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${COLORS.warning}10, ${COLORS.accent3}15)`,
            border: `1px solid ${COLORS.warning}30`,
            boxShadow: `0 8px 32px ${COLORS.warning}15`,
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${COLORS.warning}20`,
                  border: `1px solid ${COLORS.warning}30`,
                }}
              >
                <Calendar className="w-6 h-6" style={{ color: COLORS.warning }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Avg Days Overdue</p>
                <p className="text-2xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{avgDaysOverdue.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Portfolio average</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6"
          style={{
            background: isDarkMode ? `${COLORS.primary}12` : 'white',
            border: `1px solid ${COLORS.primary}20`,
            boxShadow: `0 8px 32px ${COLORS.primary}10`,
          }}
        >
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2" style={{ color: COLORS.primary }}>
            <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />
            <span>Risk Distribution</span>
          </h3>
          
          {/* Pie Chart */}
          {customers.length > 0 ? (
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${((entry.value / riskDistribution.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    <Cell fill={COLORS.danger} />
                    <Cell fill={COLORS.warning} />
                    <Cell fill={COLORS.success} />
                  </Pie>
                  <Tooltip formatter={(value) => `${value} customers`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {/* Data Table */}
          <div className="space-y-4">
            {riskDistribution.map((risk, index) => {
              let barColor = COLORS.danger;
              if (risk.label === 'Moderate Risk') barColor = COLORS.warning;
              if (risk.label === 'Low Risk') barColor = COLORS.success;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{risk.label}</span>
                    <span style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
                      {risk.count} ({risk.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full rounded-full h-3" style={{ backgroundColor: `${COLORS.primary}15` }}>
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ width: `${risk.percentage}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: isDarkMode ? `${COLORS.primary}12` : 'white',
            border: `1px solid ${COLORS.primary}20`,
            boxShadow: `0 8px 32px ${COLORS.primary}10`,
          }}
        >
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2" style={{ color: COLORS.primary }}>
            <Calendar className="w-5 h-5" style={{ color: COLORS.warning }} />
            <span>Overdue Distribution</span>
          </h3>
          
          {/* Bar Chart */}
          {customers.length > 0 ? (
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overdueRanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.primary}20`} />
                  <XAxis dataKey="label" stroke={`${COLORS.primary}60`} />
                  <YAxis stroke={`${COLORS.primary}60`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? COLORS.dark : 'white',
                      border: `1px solid ${COLORS.primary}30`,
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value} customers`, 'Count']}
                  />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {/* Data Table */}
          <div className="space-y-3">
            {overdueRanges.map((range, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50/50"
                style={{
                  backgroundColor: `${COLORS.primary}05`,
                  border: `1px solid ${COLORS.primary}10`,
                }}
              >
                <span style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{range.label}</span>
                <span className="font-semibold" style={{ color: COLORS.primary }}>{range.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: isDarkMode ? `${COLORS.primary}12` : 'white',
          border: `1px solid ${COLORS.primary}20`,
          boxShadow: `0 8px 32px ${COLORS.primary}10`,
        }}
      >
        <h3 className="text-lg font-bold mb-6 flex items-center space-x-2" style={{ color: COLORS.primary }}>
          <Target className="w-5 h-5" style={{ color: COLORS.success }} />
          <span>Outstanding Amount Distribution</span>
        </h3>
        
        {/* Bar Chart */}
        {customers.length > 0 ? (
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={amountRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.primary}20`} />
                <XAxis dataKey="label" stroke={`${COLORS.primary}60`} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke={`${COLORS.primary}60`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? COLORS.dark : 'white',
                    border: `1px solid ${COLORS.primary}30`,
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} customers`, 'Count']}
                />
                <Bar dataKey="count" fill={COLORS.success} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* Data Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {amountRanges.map((range, index) => (
            <div
              key={index}
              className="rounded-lg p-4 text-center transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: `${COLORS.primary}08`,
                border: `1px solid ${COLORS.primary}15`,
              }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>{range.label}</p>
              <p className="text-3xl font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{range.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: isDarkMode ? `${COLORS.primary}12` : 'white',
          border: `1px solid ${COLORS.primary}20`,
          boxShadow: `0 8px 32px ${COLORS.primary}10`,
        }}
      >
        <h3 className="text-lg font-bold mb-6 flex items-center space-x-2" style={{ color: COLORS.primary }}>
          <TrendingUp className="w-5 h-5" style={{ color: COLORS.danger }} />
          <span>Top Priority Accounts - Outstanding Trend</span>
        </h3>
        
        {/* Line Chart */}
        {topCustomers.length > 0 ? (
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topCustomers.map((customer) => ({
                  name: customer.name.substring(0, 10),
                  outstanding: Number(customer.outstanding_amount),
                  fullName: customer.name,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.primary}20`} />
                <XAxis dataKey="name" stroke={`${COLORS.primary}60`} />
                <YAxis stroke={`${COLORS.primary}60`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? COLORS.dark : 'white',
                    border: `1px solid ${COLORS.primary}30`,
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`₹${(value || 0).toLocaleString()}`, 'Outstanding']}
                />
                <Bar dataKey="outstanding" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* Data List */}
        <div className="space-y-3">
          {topCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-gray-50/50"
              style={{
                backgroundColor: `${COLORS.primary}05`,
                border: `1px solid ${COLORS.primary}15`,
              }}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  }}
                >
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>{customer.name}</p>
                  <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>{customer.days_overdue} days overdue</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: isDarkMode ? '#e6eef8' : COLORS.dark }}>₹{Number(customer.outstanding_amount).toLocaleString()}</p>
                <p className="text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>Risk: {customer.risk_score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}10)`,
          border: `1px solid ${COLORS.primary}20`,
        }}
      >
        <h3 className="font-bold mb-2 flex items-center space-x-2" style={{ color: COLORS.primary }}>
          <AlertCircle className="w-5 h-5" style={{ color: COLORS.primary }} />
          <span>AI Recommendations</span>
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: isDarkMode ? '#b8c5d0' : COLORS.secondary }}>
          <li>• Focus agent resources on {highRiskCustomers.length} high-risk accounts for maximum recovery</li>
          <li>• Implement automated reminders for {lowRiskCustomers.length} low-risk customers to reduce operational costs</li>
          <li>• Implement automated reminders for {lowRiskCustomers.length} low-risk customers to reduce operational costs</li>
          <li>
            <button
              onClick={async () => {
                try {
                  // Example: send a test reminder to the first low-risk customer with email
                  const target = lowRiskCustomers.find(c => c.email) || customers[0];
                  if (!target || !target.email) return alert('No customer with email found to send reminder');

                  const subject = `Payment Reminder: ₹${Number(target.outstanding_amount).toLocaleString()}`;
                  const text = `Hi ${target.name},\n\nThis is a friendly reminder that your outstanding balance of ₹${Number(target.outstanding_amount).toLocaleString()} is overdue by ${target.days_overdue} days. Please make a payment or contact us to arrange a plan.\n\nThanks,\nPayments Team`;

                  await sendEmailReminder({ to: target.email, subject, text });
                  alert('Reminder sent');
                } catch (err: any) {
                  alert('Failed to send reminder: ' + (err.message || err));
                }
              }}
              className="ml-2 px-3 py-1 rounded-lg bg-green-500 text-white"
            >
              Send Test Email Reminder
            </button>
          </li>
          <li>• Expected recovery improvement: 20-30% with AI-driven prioritization</li>
          <li>• Estimated cost reduction: 30-40% through intelligent automation</li>
        </ul>
      </div>
    </div>
  );
}
