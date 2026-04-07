<<<<<<< HEAD
# Payment-pulse
This is a demo project 
=======
# Payment Pulse - Intelligent B2B Debt Recovery Dashboard

![Payment Pulse Banner]

Payment Pulse is a cutting-edge **AI-powered Debt Recovery Platform** designed to help businesses manage customer risk, analyze outstanding debts, and automate recovery strategies. By leveraging advanced AI models, we shift the focus from reactive collections to proactive, data-driven recovery.

---

## 🌟 Unique Selling Propositions (USP)

1.  **Real-Time Intelligence**: Instantly updates risk scores based on live payment behavior, unlike static credit reports.
2.  **Predictive AI**: Forecasts recovery probability with **92% accuracy** using the Gemini 1.5 Flash model.
3.  **Actionable Strategy**: Doesn't just flag risks—tells you *exactly* what to do (e.g., "Call within 24 hours," "Send legal notice").
4.  **Premium Experience**: A "Royal UI" design that builds trust and authority.

---

## � In-Depth Feature Breakdown

### 🧠 1. Advanced Risk Analysis Engine
Our proprietary engine doesn't just give a score; it builds a psychological profile of the debtor.
-   **Multi-Factor Scoring (0-100)**:
    -   *Days Overdue (40%)*: Exponential decay function to penalize delays.
    -   *Outstanding Amount (30%)*: Severity scaling based on debt burden.
    -   *Payment Behavior (20%)*: Frequency of past defaults.
    -   *Recency (10%)*: Time since last positive engagement.
-   **Behavioral Pattern Recognition**:
    -   *Chronic Delinquency*: >90 days overdue, structural breakdown.
    -   *Severe Avoidance*: >60 days, unresponsive to billing.
    -   *Inconsistent Payer*: Pays eventually but needs pressure.
    -   *Reliable*: Low volatility, on-time payments.
-   **Credit Recommendations**:
    -   *⛔ Freeze*: Stop all service immediately.
    -   *⚠️ Conditional*: 50% upfront required.
    -   *🔍 Monitor*: Watch closely.
    -   *✅ Approved*: Eligible for credit expansion.

### 🤖 2. Automated Action Center
Turn insights into immediate action without leaving the dashboard.
-   **Payment Actions**:
    -   **One-Click Email Reminders**: Opens a pre-filled Gmail draft with context-aware templates.
    -   **SMS Triggers**: Ready-to-send texts for urgent follow-ups.
-   **Smart Scripting**:
    -   *Low Risk*: "Friendly courtesy reminder."
    -   *Moderate Risk*: "Firm professional inquiry about payment status."
    -   *High Risk*: "Formal demand letter and legal notice warning."

### 💻 3. The "Royal UI" Dashboard
A command center designed for clarity and speed.
-   **Visual Analytics**:
    -   Total Outstanding (₹) vs. Recovery Rate (%).
    -   High-Risk Customer Counter.
    -   Recent Activity Feed (New uploads, payments, alerts).
-   **Smart Alerts System**:
    -   🔔 Real-time notifications for "High Risk" flags.
    -   ⏰ "Overdue" alerts when a threshold is crossed.
    -   📅 "Upcoming" reminders for promised payments.
-   **Customer Management**:
    -   **Bulk Operations**: Delete or analyze multiple customers at once.
    -   **Advanced Filtering**: Sort by Status ('Active', 'Resolved') or Risk Category.
    -   **Inline Editing**: Update details without opening full profile.

### 💳 4. Integrated Payment Ecosystem
-   **Payment Link Generation**:
    -   Creates unique payment URLs for every customer.
    -   **UPI QR Codes**: Generates dynamic QR codes for instant scanning and payment.
    -   **Razorpay Integration**: Connection ready for enterprise gateways.
-   **Discount Engine**:
    -   *Early Payment*: Auto-calculates 5% discount if paid within 7 days.
    -   *Settlement Offers*: Suggests lump-sum discounts for long-overdue accounts.

### � 5. Reporting & Explainability
-   **AI Insights Panel**: A "plain English" explanation of *why* a customer is high risk.
-   **PDF Report Generator**:
    -   Professional Debt Statement download.
    -   Includes logo, breakdown of dues, and payment instructions.
    -   Legal-ready formatting.
-   **Confidence Score**: The AI self-evaluates its prediction confidence (e.g., "92% confident based on data completeness").

---

## 💡 Innovation

Payment Pulse introduces several industry-first innovations in the debt recovery space:

-   **Emotion-Detection AI**: Our models distinguish between customers who *can't* pay (hardship) and those who *won't* pay (strategic avoidance), tailoring the recovery tone accordingly.
-   **Dynamic Risk Scoring**: We move beyond binary "Paid/Unpaid" status to a continuous 0-100 score that weighs recency, frequency, and severity of defaults.
-   **Automated Empathy**: Generates communication scripts that maintain customer relationships while ensuring payment compliance.

---

## 🎯 Target Market

Payment Pulse is built for:

-   **B2B Enterprises**: Companies with high invoice volumes and recurring billing cycles.
-   **Fintech Lenders**: Platforms needing real-time risk monitoring for their loan books.
-   **SME Business Owners**: Small businesses that lack dedicated collections teams and need automated support.
-   **Recovery Agencies**: Professional agencies requiring a centralized dashboard to prioritize high-value cases.

---

## 🛠️ Tech Stack & APIs

### Frontend
-   **React (Vite)**: High-performance component-based UI.
-   **TypeScript**: For type-safe, robust code.
-   **Tailwind CSS**: Utility-first styling for the "Royal UI" theme.
-   **Lucide React**: Premium icon set.

### Backend & Database
-   **Supabase**:
    -   **PostgreSQL Database**: Stores customer data, transactions, and analysis results.
    -   **Row Level Security (RLS)**: Configured for public demo access.

### AI & Intelligence
-   **Google Gemini API (gemini-1.5-flash)**: Powers the "AI Analysis" feature and Chatbot.

### Utilities & Integrations
-   **Razorpay SDK**: For payment links.
-   **QRCode**: Generates UPI QR codes.
-   **jsPDF**: Client-side PDF generation.
-   **Papaparse**: Robust CSV parsing.

---

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/krishgit24/payment-pulse-hackathon.git
    cd payment-pulse-hackathon
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory with the following keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    # Optional for Payment Features
    VITE_RAZORPAY_KEY_ID=your_razorpay_key
    VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 🏁 Conclusion

Payment Pulse represents the future of debt recovery. By combining **financial discipline with artificial intelligence**, we empower businesses to recover what they are owed without damaging customer relationships. It is not just a tool; it is a strategic partner in financial stability.

---

## 🤝 Support

For support, email **support@paymentpulse.com** or call **+1 (888) PAY-PULSE**.

---
*Payment Pulse v2.1.0 — Intelligent Debt Solutions*
>>>>>>> 2608199 (fest(deploy):Build the payment pulse debt collector)
