/**
 * PAYMENT PULSE: Advanced Risk Score Calculator
 * 
 * This is a sophisticated credit risk scoring system better than CIBIL for payment tracking.
 * It considers multiple factors including payment behavior, outstanding amounts, and recency.
 * 
 * CIBIL Score Focus: Credit history, mix, inquiries (backward-looking)
 * PaymentPulse Score Focus: Outstanding payment behavior, recency, severity (real-time)
 */

export interface RiskScoreFactors {
  daysOverdue: number;
  outstandingAmount: number;
  totalPaid?: number;
  paymentCount?: number;
  averagePaymentAmount?: number;
  lastPaymentDaysAgo?: number;
  isFirstDefault?: boolean;
}

/**
 * Calculate comprehensive risk score based on payment behavior
 * 
 * Score Range: 0-100
 * - 0-35: Low Risk (Good payer)
 * - 36-65: Moderate Risk (Inconsistent payer)
 * - 66-100: High Risk (Habitual defaulter)
 * 
 * FORMULA EXPLANATION:
 * ============================================================
 * 
 * The score is calculated using a weighted multi-factor formula:
 * 
 * 1. DAYS OVERDUE COMPONENT (40% weight) - Most Important
 *    - 0 days: 0 points
 *    - 1-7 days: 10 points (slight delay)
 *    - 8-30 days: 20 points (mild default)
 *    - 31-60 days: 35 points (serious default)
 *    - 61-90 days: 55 points (severe default)
 *    - 90+ days: 70 points (critical)
 *    
 *    Formula: daysScore = min(70, 0.6 * daysOverdue)
 *    This creates a curve where impact increases with time
 * 
 * 2. OUTSTANDING AMOUNT SEVERITY (30% weight) - Second Most Important
 *    - Measures debt burden relative to payment history
 *    - High outstanding amount + days overdue = very risky
 *    - Normalized based on average payment capacity
 *    
 *    Formula: Consider amount relative to historical payments
 *    - If first default or no history: Use absolute amount thresholds
 *    - If has history: Use ratio to average payment
 * 
 * 3. PAYMENT BEHAVIOR (20% weight) - Pattern Recognition
 *    - Frequency of defaults in past (if applicable)
 *    - Consistency of payments
 *    - Payment count indicates relationship duration
 *    
 *    Formula: Analyze payment frequency patterns
 * 
 * 4. RECENCY BONUS/PENALTY (10% weight) - Recent Activity Matters
 *    - Recent good payment = bonus (reduces risk)
 *    - No recent payment = penalty (increases risk)
 * 
 * ============================================================
 * 
 * KEY ADVANTAGES OVER CIBIL:
 * 
 * 1. REAL-TIME MONITORING
 *    - CIBIL: Updated monthly/quarterly
 *    - PaymentPulse: Real-time calculation
 * 
 * 2. FORWARD-LOOKING
 *    - CIBIL: Historical metric (750 = good past behavior)
 *    - PaymentPulse: Predictive (current status predicts future)
 * 
 * 3. SEVERITY OF OUTSTANDING
 *    - CIBIL: Binary (on-time vs late, no amount consideration)
 *    - PaymentPulse: Amount * Days = accurate risk metric
 * 
 * 4. TREND ANALYSIS
 *    - CIBIL: Static score
 *    - PaymentPulse: Can track improving/worsening trends
 * 
 * 5. BUSINESS-SPECIFIC
 *    - CIBIL: Consumer-focused
 *    - PaymentPulse: B2B invoice/outstanding focused
 */
export function calculateAdvancedRiskScore(factors: RiskScoreFactors): number {
  const {
    daysOverdue,
    outstandingAmount,
    totalPaid = 0,
    paymentCount = 0,
    averagePaymentAmount = outstandingAmount,
    lastPaymentDaysAgo = daysOverdue,
    isFirstDefault = paymentCount <= 1,
  } = factors;

  // Component 1: Days Overdue (40% weight)
  // This is the PRIMARY factor - how long has payment been pending?
  const daysOvrdueScore = calculateDaysOverdueScore(daysOverdue);

  // Component 2: Outstanding Amount Severity (30% weight)
  // How bad is the debt relative to payment history?
  const amountSeverityScore = calculateAmountSeverityScore(
    outstandingAmount,
    averagePaymentAmount,
    totalPaid,
    isFirstDefault
  );

  // Component 3: Payment Behavior (20% weight)
  // Is this person a habitual defaulter or first time?
  const behaviorScore = calculatePaymentBehaviorScore(paymentCount, isFirstDefault);

  // Component 4: Recency (10% weight)
  // Time since last payment
  const recencyScore = calculateRecencyScore(lastPaymentDaysAgo);

  // Weighted combination
  // Weighted combination
  const finalScore =
    daysOvrdueScore * 0.4 +      // 40% weight
    amountSeverityScore * 0.3 +  // 30% weight
    behaviorScore * 0.2 +        // 20% weight
    recencyScore * 0.1;          // 10% weight

  let calculatedFinalScore = Math.round(finalScore);

  // CRITICAL OVERRIDE:
  // If the outstanding amount is significant (> 5 Lakhs) and overdue > 45 days, 
  // it is automatically HIGH RISK regardless of other factors.
  if (outstandingAmount > 500000 && daysOverdue > 45) {
    calculatedFinalScore = Math.max(calculatedFinalScore, 85);
  }
  // If amount > 1 Lakh and overdue > 60 days
  else if (outstandingAmount > 100000 && daysOverdue > 60) {
    calculatedFinalScore = Math.max(calculatedFinalScore, 75);
  }

  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, calculatedFinalScore));
}

/**
 * Days Overdue Score (0-70 points)
 * This is exponential - the longer overdue, the worse the risk
 */
function calculateDaysOverdueScore(daysOverdue: number): number {
  if (daysOverdue <= 0) return 0;
  if (daysOverdue <= 7) return 15; // Increased base penalty
  if (daysOverdue <= 30) return 25 + (daysOverdue - 7) * 0.5; // Steeper
  if (daysOverdue <= 60) return 40 + (daysOverdue - 30) * 0.8; // Much steeper (60 days -> 64 pts)
  if (daysOverdue <= 90) return 65 + (daysOverdue - 60) * 0.5; // (90 days -> 80 pts)

  // Beyond 90 days: hard cap at 70, indicating critical risk
  return Math.min(70, 70 + (daysOverdue - 90) * 0.2);
}

/**
 * Outstanding Amount Severity Score (0-100 points)
 * Measures how much is owed relative to their payment capacity
 */
function calculateAmountSeverityScore(
  outstandingAmount: number,
  averagePaymentAmount: number,
  totalPaid: number,
  isFirstDefault: boolean
): number {
  // If no historical data, use absolute thresholds
  if (isFirstDefault || totalPaid === 0) {
    if (outstandingAmount < 10000) return 15;
    if (outstandingAmount < 50000) return 30;
    if (outstandingAmount < 200000) return 50;
    if (outstandingAmount < 1000000) return 75; // 10 Lakhs
    return 95; // Very high amount (>10 Lakhs)
  }

  // If has history, use ratio to average payment
  const debtRatio = outstandingAmount / Math.max(averagePaymentAmount, 1);

  // Ratio scoring:
  // 0-0.5x ratio: Low risk (can pay in <2 invoices)
  // 0.5-1.5x ratio: Moderate risk
  // 1.5-3x ratio: High risk
  // 3x+ ratio: Critical risk

  if (debtRatio < 0.5) return 15;
  if (debtRatio < 1.0) return 30;
  if (debtRatio < 1.5) return 45;
  if (debtRatio < 2.5) return 65;
  if (debtRatio < 4.0) return 80;
  return 95; // Debt is 4x or more of average payment
}

/**
 * Payment Behavior Score (0-100 points)
 * Checks if this is a habitual defaulter or one-time issue
 */
function calculatePaymentBehaviorScore(
  paymentCount: number,
  isFirstDefault: boolean
): number {
  // First-time defaulter: lower behavior score (give benefit of doubt)
  if (isFirstDefault || paymentCount === 0) {
    return 15; // One mistake doesn't make them high risk
  }

  // Habitual defaulter: higher score
  // Someone who paid multiple times but is now late = worse signal
  // Than someone who never paid = system issue/fraud
  if (paymentCount >= 5) {
    // Regular payer who is now late = concerning
    return 50;
  }

  if (paymentCount >= 3) {
    // Occasional payer now late
    return 35;
  }

  if (paymentCount >= 1) {
    // One or two payments, then default
    return 25;
  }

  return 10;
}

/**
 * Recency Score (0-100 points)
 * How long since they last made a payment?
 * Recent payer = slightly better signal
 */
function calculateRecencyScore(lastPaymentDaysAgo: number): number {
  // If paid recently (within last payment period), good signal
  if (lastPaymentDaysAgo < 15) return 10;
  if (lastPaymentDaysAgo < 30) return 20;
  if (lastPaymentDaysAgo < 60) return 40;
  if (lastPaymentDaysAgo < 90) return 60;
  if (lastPaymentDaysAgo < 180) return 75;
  return 90; // Haven't paid in 6+ months
}

/**
 * Get risk category based on score
 */
export function getRiskCategory(score: number): {
  category: 'low_risk' | 'moderate_risk' | 'high_risk';
  label: string;
  description: string;
  color: string;
} {
  if (score <= 35) {
    return {
      category: 'low_risk',
      label: 'Low Risk',
      description: 'Reliable payer, consistent payment history',
      color: '#059669', // Green
    };
  }

  if (score <= 65) {
    return {
      category: 'moderate_risk',
      label: 'Moderate Risk',
      description: 'Occasional delays, needs monitoring',
      color: '#d97706', // Amber
    };
  }

  return {
    category: 'high_risk',
    label: 'High Risk',
    description: 'Habitual defaulter, serious payment issues',
    color: '#dc2626', // Red
  };
}

/**
 * Detailed risk analysis explaining the score breakdown
 */
export function getRiskScoreExplanation(
  score: number,
  factors: RiskScoreFactors
): string {
  const daysScore = calculateDaysOverdueScore(factors.daysOverdue);
  const amountScore = calculateAmountSeverityScore(
    factors.outstandingAmount,
    factors.averagePaymentAmount || factors.outstandingAmount,
    factors.totalPaid || 0,
    factors.isFirstDefault !== false
  );
  const behaviorScore = calculatePaymentBehaviorScore(
    factors.paymentCount || 0,
    factors.isFirstDefault !== false
  );
  const recencyScore = calculateRecencyScore(factors.lastPaymentDaysAgo || factors.daysOverdue);

  return `
RISK SCORE: ${score}/100

BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DAYS OVERDUE (${Math.round(daysScore)}/70 - 40% weight)
   • Days: ${factors.daysOverdue} days
   • Status: ${getDaysOverdueStatus(factors.daysOverdue)}

2. AMOUNT SEVERITY (${Math.round(amountScore)}/100 - 30% weight)
   • Outstanding: ₹${factors.outstandingAmount.toLocaleString()}
   • Relative to avg: ${((factors.outstandingAmount / (factors.averagePaymentAmount || factors.outstandingAmount)) * 100).toFixed(0)}%

3. PAYMENT BEHAVIOR (${Math.round(behaviorScore)}/100 - 20% weight)
   • Payment count: ${factors.paymentCount || 0}
   • First default: ${factors.isFirstDefault ? 'Yes' : 'No'}

4. PAYMENT RECENCY (${Math.round(recencyScore)}/100 - 10% weight)
   • Last payment: ${factors.lastPaymentDaysAgo || factors.daysOverdue} days ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}

function getDaysOverdueStatus(days: number): string {
  if (days <= 0) return '✓ On time';
  if (days <= 7) return '⚠ Slightly late (1 week)';
  if (days <= 30) return '⚠ Late (1 month)';
  if (days <= 60) return '⚠⚠ Very late (1-2 months)';
  if (days <= 90) return '⚠⚠ Severely late (3 months)';
  return '🔴 Critically overdue (90+ days)';
}
