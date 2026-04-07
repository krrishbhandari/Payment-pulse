import Razorpay from 'razorpay';
import QRCode from 'qrcode';

// Payment Gateway Configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key';
const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'rzp_test_secret';

interface PaymentLinkOptions {
    customerId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    amount: number;
    description: string;
    daysOverdue: number;
}

interface PaymentLinkResponse {
    paymentLink: string;
    shortUrl: string;
    qrCode: string;
    paymentId: string;
    upiLink: string;
}

/**
 * Generate Payment Link using Razorpay
 */
export async function generatePaymentLink(options: PaymentLinkOptions): Promise<PaymentLinkResponse> {
    try {
        // For demo purposes, we'll create a mock payment link
        // In production, you'd use actual Razorpay API

        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Generate UPI payment link
        const upiId = 'paymentpulse@paytm'; // Your UPI ID
        const upiLink = generateUPILink({
            upiId,
            name: 'Payment Pulse',
            amount: options.amount,
            transactionNote: `Payment for ${options.customerName}`,
            transactionRef: paymentId,
        });

        // Generate QR Code for UPI
        const qrCode = await QRCode.toDataURL(upiLink);

        // Create payment page URL (you'd host this)
        const paymentLink = `https://paymentpulse.app/pay/${paymentId}`;
        const shortUrl = `https://pay.pp/${paymentId.substr(-8)}`;

        return {
            paymentLink,
            shortUrl,
            qrCode,
            paymentId,
            upiLink,
        };
    } catch (error) {
        console.error('Error generating payment link:', error);
        throw new Error('Failed to generate payment link');
    }
}

/**
 * Generate UPI Payment Link
 */
function generateUPILink(params: {
    upiId: string;
    name: string;
    amount: number;
    transactionNote: string;
    transactionRef: string;
}): string {
    const { upiId, name, amount, transactionNote, transactionRef } = params;

    // UPI deep link format
    const upiParams = new URLSearchParams({
        pa: upiId, // Payee address
        pn: name, // Payee name
        am: amount.toString(), // Amount
        tn: transactionNote, // Transaction note
        tr: transactionRef, // Transaction reference
        cu: 'INR', // Currency
    });

    return `upi://pay?${upiParams.toString()}`;
}

/**
 * Create Razorpay Payment Link (Production)
 */
export async function createRazorpayPaymentLink(options: PaymentLinkOptions): Promise<any> {
    // This is for production use with actual Razorpay credentials
    const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    try {
        const paymentLink = await razorpay.paymentLink.create({
            amount: options.amount * 100, // Amount in paise
            currency: 'INR',
            description: options.description,
            customer: {
                name: options.customerName,
                email: options.customerEmail,
                contact: options.customerPhone,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            callback_url: 'https://paymentpulse.app/payment-success',
            callback_method: 'get',
        });

        return paymentLink;
    } catch (error) {
        console.error('Razorpay error:', error);
        throw error;
    }
}

/**
 * Calculate Early Payment Discount
 */
export function calculateDiscount(amount: number, daysOverdue: number): number {
    // Incentive structure
    if (daysOverdue <= 7) return amount * 0.05; // 5% discount
    if (daysOverdue <= 15) return amount * 0.03; // 3% discount
    if (daysOverdue <= 30) return amount * 0.01; // 1% discount
    return 0; // No discount after 30 days
}

/**
 * Generate Payment Plan Options
 */
export function generatePaymentPlanOptions(amount: number, daysOverdue: number) {
    const plans = [];

    // Full payment with discount
    const discount = calculateDiscount(amount, daysOverdue);
    if (discount > 0) {
        plans.push({
            type: 'full_payment',
            name: 'Pay Full Amount Now',
            amount: amount - discount,
            discount: discount,
            installments: 1,
            description: `Save ₹${discount.toFixed(2)} by paying now!`,
        });
    }

    // 2 installments
    plans.push({
        type: '2_installments',
        name: 'Pay in 2 Installments',
        amount: amount,
        discount: 0,
        installments: 2,
        installmentAmount: amount / 2,
        description: `₹${(amount / 2).toFixed(2)} now, ₹${(amount / 2).toFixed(2)} in 15 days`,
    });

    // 3 installments (for amounts > ₹5000)
    if (amount > 5000) {
        plans.push({
            type: '3_installments',
            name: 'Pay in 3 Installments',
            amount: amount,
            discount: 0,
            installments: 3,
            installmentAmount: amount / 3,
            description: `₹${(amount / 3).toFixed(2)} per month for 3 months`,
        });
    }

    return plans;
}

/**
 * Verify Payment Status (webhook handler)
 */
export async function verifyPaymentStatus(_paymentId: string, _signature: string): Promise<boolean> {
    // Implement Razorpay signature verification
    // This ensures the payment notification is genuine
    try {
        // In production, verify using Razorpay's webhook signature
        return true;
    } catch (error) {
        console.error('Payment verification failed:', error);
        return false;
    }
}

export default {
    generatePaymentLink,
    createRazorpayPaymentLink,
    calculateDiscount,
    generatePaymentPlanOptions,
    verifyPaymentStatus,
};
